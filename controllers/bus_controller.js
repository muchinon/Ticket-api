import { BusModel } from "../models/bus_model.js";

export const getAllBuses = async (req, res, next) => {
  try {
    const buses = await BusModel.find();
    res.status(200).send(buses);
  } catch (error) {
    next(error);
  }
};

export const searchBuses = async (req, res, next) => {
  try {
    // Get query params
    const { limit = 10, skip = 0, filter = "{}" } = req.query;

    // Get all recipes from database
    const allBuses = await BusModel.find(JSON.parse(filter))
      .limit(limit)
      .skip(skip);

    // Return response
    res.status(200).json(allBuses);
  } catch (error) {
    next(error);
  }
};

export const getBusDetails = async (req, res, next) => {
  try {
    const bus = await BusModel.findById(req.params.busId);
    if (!bus) {
      return res.status(404).send("Bus not found");
    }
    res.status(200).send(bus);
  } catch (error) {
    next(error);
  }
};

export const getBusSeats = async (req, res, next) => {
  try {
    const bus = await BusModel.findById(req.params.busId);
    if (!bus) {
      return res.status(404).send("Bus not found");
    }
    res.status(200).send({ seats: bus.seats });
  } catch (error) {
    next(error);
  }
};
