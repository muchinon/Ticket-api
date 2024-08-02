import express from "express";
import expressOasGenerator from "@mickeymond/express-oas-generator";
import session from "express-session";
import MongoStore from "connect-mongo";
import { dbConnection } from "./config/db.js";
import { userRouter } from "./routes/user_route.js";

import { bookingRouter } from "./routes/booking_route.js";
import mongoose from "mongoose";

const app = express();

dbConnection();

expressOasGenerator.handleResponses(app, {
  alwaysServeDocs: true,
  tags: ["auth", "bookings"],
  mongooseModels: mongoose.modelNames(),
});

// middlewares
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
    }),
  })
);

// routes
app.use(userRouter);
app.use(bookingRouter);

expressOasGenerator.handleRequests();
app.use((req, res) => res.redirect("/api-docs/"));

const port = process.env.PORT || 2900;
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
