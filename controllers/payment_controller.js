import axios from "axios";
import crypto from "crypto";
import { OrderModel } from "../models/order_model.js";
import { BusModel } from "../models/bus_model.js";
import { UserModel } from "../models/user_model.js";
import { BookingModel } from "../models/booking_model.js";

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
        },
      },
      {
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      }
    );

    const authorizationUrl = response.data.data.authorization_url;

    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the isBooked status of the selected seats
    const updatePromises = selectedSeats.map(async (seatNumber) => {
      try {
        // Log for debugging
        console.log(`Updating seat number: ${seatNumber} for busId: ${busId}`);

        // Update seat status
        const updateResult = await BusModel.updateOne(
          { _id: busId, "seats.number": seatNumber },
          { $set: { "seats.$.isBooked": true, "seats.$.userId": user._id } }
        );

        if (updateResult.nModified === 0) {
          console.warn(`No seats updated for seat number: ${seatNumber}`);
        } else {
          console.log(
            `Seat updated successfully for seat number: ${seatNumber}`
          );
        }
      } catch (error) {
        console.error(`Error updating seat number: ${seatNumber}`, error);
        throw error; // Re-throw to ensure Promise.all catches it
      }
    });

    await Promise.all(updatePromises);

    // Create booking entry with optional dependants and guest fields
    const bookingData = {
      seats: selectedSeats,
      user: user._id,
      bus: busId, // Include the chosen busId
      ...(dependants && { dependants }), // Include dependants if present
      ...(guest && { guest }), // Include guest if present
    };

    const booking = await BookingModel.create(bookingData);

    res.json({ authorizationUrl, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    // Parse the request body as JSON
    const body = req.body.toString();
    const jsonData = JSON.parse(body);

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET)
      .update(body, "utf-8")
      .digest("hex");

    if (hash == req.headers["x-paystack-signature"]) {
      const event = jsonData.event;

      // Handle different Paystack events based on the `event` field
      if (event === "charge.success") {
        const newOrder = new OrderModel({
          seatNumber: jsonData.data.seatNumber,
          status: jsonData.data.metadata.status,
          totalAmount: jsonData.data.requested_amount,
          paymentStatus: jsonData.data.gateway_response,
        });

        await newOrder.save();

        res.status(200).send("Success");
        console.log("Order saved to database");
      } else {
        // Handle other Paystack events if needed
        console.log("Received Paystack event:", event);
        res.status(200).send("Event not handled");
      }
    } else {
      // Invalid signature, ignore the webhook event
      console.log("Invalid Paystack signature");
      res.status(400).send("Invalid signature");
    }
  } catch (error) {
    console.error("Error processing Paystack webhook:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
