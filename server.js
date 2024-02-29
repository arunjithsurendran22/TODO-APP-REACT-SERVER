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
const allowedOrigins = ['https://todo-app-react-blond.vercel.app/', 'http://localhost:3000']; // Add your frontend URL here
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.options("*", cors());

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Database connected.....");
  })
  .catch((error) => {
    console.log(error, "Database disconnected.....");
  });

// Routing
app.use("/api/v2", todoRoute);

// Server connection
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server connected PORT ${PORT}`);
});
