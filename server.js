import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import todoRoute from "./routes/todoRoute.js"

dotenv.config();
const app = express();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.options("*", cors());

// databse connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("database connected.....");
  })
  .catch((error) => {
    console.log(error, "database disconnected.....");
  });

//ROUTING

app.use("/api/v2", todoRoute);

//Server connection
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server connected PORT ${PORT}`);
});


