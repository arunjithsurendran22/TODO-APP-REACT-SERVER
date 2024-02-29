import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import todoRoute from "./routes/todoRoute.js"

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = ['https://todo-app-react-blond.vercel.app/', 'https://todo-app-react-djdewl39g-selfstack.vercel.app/'];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Database connected.....");
  })
  .catch((error) => {
    console.log(error, "Database disconnected.....");
  });

// Route for root endpoint
app.get("/", (req, res) => {
  res.json("Welcome");
});

// Routing
app.use("/api/v2", todoRoute);

// Server connection
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server connected PORT ${PORT}`);
});
