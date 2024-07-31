import express from "express";
import { dbConnection } from "./config/db.js";

const app = express();

dbConnection();

app.use(express.json());

const port = process.env.PORT || 2900;
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
