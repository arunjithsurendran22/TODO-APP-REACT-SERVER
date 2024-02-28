import TaskModal from "../models/Task.js";
import { hashPassword, comparePassword } from "../helper/auth.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const accessTokenUserSecret = process.env.USER_JWT_SECRET;
const refreshTokenUserSecret = process.env.USER_REFRESH_TOKEN_SECRET;

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const role = "user";

    // Validate input fields
    if (!email) {
      return res.json({ message: "Email is required" });
    }
    if (!password || password.length < 6) {
      return res.json({
        message: "Password is required and must be 6 characters minimum",
      });
    }

    // Check if email already registered
    const existingEmail = await TaskModal.findOne({ email });

    if (existingEmail) {
      return res.json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create a new user
    const user = await TaskModal.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(200).json({ message: "Registered Successfully", user });
  } catch (error) {
    next(error);
    console.log(error, "error for register");
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.json({ message: "Email is required" });
    }
    if (!password || password.length < 6) {
      return res.json({
        message: "Password is required and must be at least 6 characters long",
      });
    }

    // Check if the user is already registered
    const existingUser = await TaskModal.findOne({ email });

    if (!existingUser) {
      return res.json({ message: "User not found" });
    }

    // Check if the password is a match
    const passwordMatch = await comparePassword(
      password,
      existingUser.password
    );

    if (!passwordMatch) {
      return res.json({ message: "Invalid password" });
    }

    // Generate JWT Token
    const accessTokenUser = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
        role: "user",
      },
      accessTokenUserSecret,
      { expiresIn: "1d" }
    );

    // Generate Refresh Token
    const refreshTokenUser = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
        role: "user",
      },
      refreshTokenUserSecret,
      { expiresIn: "30d" }
    );

    // Set the token as a cookie in the response
    res.cookie("accessTokenUser", accessTokenUser, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    // Set the access token in the response header
    res.setHeader("authorization", `Bearer ${accessTokenUser}`);

    return res.status(200).json({
      message: "User Login successful",
      _id: existingUser._id,
      email: existingUser.email,
      accessTokenUser: accessTokenUser,
      refreshTokenUser: refreshTokenUser,
    });
  } catch (error) {
    next(error);
    console.log(error, "login failed");
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.userId; // Assuming userId is obtained from authentication middleware

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find the task associated with the userId
    const task = await TaskModal.findById(userId);

    if (!task) {
      return res.status(404).json({ message: "Task not found for the user" });
    }

    // Create a new task associated with the userId
    const newTask = {
      title,
    };

    task.todo.push(newTask);
    await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
const getTasks = async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Find all tasks associated with the userId
    const tasks = await TaskModal.findById(userId);

    const todos = tasks.todo;
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { Id } = req.params;
    const userId = req.userId;
    const { title, completed } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userData = await TaskModal.findById(userId);

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the task with the given ID in the user's todo list
    const taskToUpdate = userData.todo.find(
      (task) => task._id.toString() === Id
    );

    if (!taskToUpdate) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update the task properties
    if (title) {
      taskToUpdate.title = title;
    }
    if (completed !== undefined) {
      taskToUpdate.completed = completed;
    }

    // Save the updated user data
    await userData.save();

    res.json({
      message: "Task updated successfully",
      updatedTask: taskToUpdate,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { Id } = req.params; 
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userData = await TaskModal.findById(userId);

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the task with the given ID in the user's todo list
    const taskIndex = userData.todo.findIndex(
      (task) => task._id.toString() === Id
    );

    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Remove the task from the todo array
    userData.todo.splice(taskIndex, 1);

    // Save the updated user data
    await userData.save();

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const completeTask = async (req, res) => {
  const { Id } = req.params; // Extract task id from request parameters
  const userId =req.userId
  try {
    // Find the task by id
    const task = await TaskModal.findById(userId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Toggle the completion status
    task.todo.forEach(todoItem => {
      if (todoItem._id.toString() === Id) {
        todoItem.completed = !todoItem.completed;
      }
    });

    // Save the updated task
    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error toggling task completion:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export {
  registerUser,
  loginUser,
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  completeTask,
};
