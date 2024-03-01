// routes/taskRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  completeTask,
  welcome,
} from "../controllers/taskController.js";
import { userAuthenticate } from "../middleware/userAuthMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/create", userAuthenticate, createTask);
router.get("/get", userAuthenticate, getTasks);
router.put("/edit/:Id", userAuthenticate, updateTask);
router.delete("/delete/:Id", userAuthenticate, deleteTask);
router.put("/complete/:Id", userAuthenticate, completeTask);

router.get("/test", welcome);
export default router;
