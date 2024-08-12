export const getAllBuses = async (req, res, next) => {
  try {
    const allBuses = await BusModel.find();
    res.status(200).send(allBuses);
  } catch (error) {
    next(error);
  }
};
