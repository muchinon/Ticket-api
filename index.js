import express from "express";
import expressOasGenerator from "@mickeymond/express-oas-generator";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";
import errorHandler from "errorhandler";
import { dbConnection } from "./config/db.js";
import { userRouter } from "./routes/user_route.js";

import { bookingRouter } from "./routes/booking_route.js";
import { operatorRouter } from "./routes/operator_route.js";
import { busRouter } from "./routes/bus_route.js";
import { paymentRouter } from "./routes/payment_route.js";
import bodyParser from "body-parser";
import { restartServer } from "./restart_server.js";

const app = express();

dbConnection();

expressOasGenerator.handleResponses(app, {
  alwaysServeDocs: true,
  tags: ["users", "operator", "bookings"],
  mongooseModels: mongoose.modelNames(),
});

const PORT = process.env.PORT || 2900;

// middlewares
app.use(
  cors({
    credentials: true,
    origin: "*",
  })
);
app.use(bodyParser.json());
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
app.get("/api/health", (req, res) => {
  res.json({ status: "UP" });
});

// routes
app.use(userRouter);
app.use(operatorRouter);
app.use(bookingRouter);
app.use(busRouter);
app.use(paymentRouter);
expressOasGenerator.handleRequests();
app.use((req, res) => res.redirect("/api-docs/"));
app.use(errorHandler({ log: false }));

const reboot = async () => {
  setInterval(restartServer, process.env.INTERVAL);
};

dbConnection()
  .then(() => {
    app.listen(PORT, () => {
      reboot().then(() => {
        console.log(`Server Restarted`);
      });
      console.log(`Server is connected to Port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(-1);
  });
