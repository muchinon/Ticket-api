import axios from "axios";
import crypto from "crypto";
import { OrderModel } from "../models/order_model.js";
import { BusModel } from "../models/bus_model.js";
import { UserModel } from "../models/user_model.js";
import { BookingModel } from "../models/booking_model.js";
import { transporter } from "../config/mail.js";

export const createPayment = async (req, res) => {
  try {
    const {
      email,
      amount,
      seats: selectedSeats,
      busId,
      dependants,
      guest,
    } = req.body;

    const secret = process.env.PAYSTACK_SECRET;

    // Initialize payment with Paystack
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: email,
        amount: amount * 100, // Paystack expects amount in kobo
        metadata: {
          seats: selectedSeats,
          userId: req.session?.user?.id || req?.user?.id,
          busId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      }
    );

    const authorizationUrl = response.data.data.authorization_url;

    // Create a new booking
    const userId = req.session?.user?.id || req?.user?.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const bus = await BusModel.findById(busId);
    if (!bus) {
      return res.status(404).send("Bus not found");
    }

    const seatsToBook = bus.seats.filter((seat) =>
      selectedSeats.includes(seat.number)
    );

    if (seatsToBook.some((seat) => seat.isBooked)) {
      return res
        .status(400)
        .send("One or more selected seats are not available");
    }

    // Mark the seats as booked
    seatsToBook.forEach((seat) => {
      seat.isBooked = true;
      seat.userId = userId;
    });

    const newBooking = await BookingModel.create({
      dependants,
      guest,
      seats: selectedSeats,
      user: userId,
      bus: busId,
    });

    user.bookings.push(newBooking._id); // Push the new booking ID into the user's bookings array
    await user.save(); // Save the user document

    await bus.save(); // Save the bus document

    res.status(201).json({
      message: "Payment initialized and booking created",
      authorizationUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const event = req.body.event;

    if (event === "charge.success") {
      const { metadata, requested_amount, gateway_response } = req.body.data;

      if (!metadata || !metadata.userId || !metadata.busId || !metadata.seats) {
        console.log("Missing metadata in webhook");
        return res.status(400).send("Missing metadata in webhook");
      }

      const { userId, busId, seats } = metadata;

      // Create and save the new order
      const newOrder = await OrderModel.create({
        user: userId,
        bus: busId,
        seatNumber: seats, // Adjust as necessary
        status: "confirmed",
        totalAmount: requested_amount / 100,
        paymentStatus: gateway_response,
        paymentDate: new Date(),
      });

      // Retrieve user details
      const user = await UserModel.findById(userId);

      if (!user) {
        console.log("User not found");
        return res.status(404).send("User not found");
      }

      // Send email to the user with order details
      await transporter.sendMail({
        to: user.email,
        subject: "Order Confirmation",
        text: `
          Dear ${user.firstName},

          Your order has been confirmed with the following details:
          Seat Number(s): ${seats}
          Total Amount: ${newOrder.totalAmount}
          Order ID: ${newOrder._id}
          Bus ID: ${busId}
          Payment Status: ${gateway_response}
          Payment Date: ${newOrder.paymentDate.toISOString()}

          Thank you for your purchase!

          Best regards,
          Ticketty
        `,
      });

      console.log("Order saved to database and email sent:", newOrder);
      return res.status(200).send("Success");
    }

    console.log("Received Paystack event:", event);
    return res.status(200).send("Event not handled");
  } catch (error) {
    console.error("Error processing Paystack webhook:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};
