import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
  },
  todo: [
    {
      title: {
        type: String,
      },
      completed: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

const TaskModal = mongoose.model("Task", taskSchema);

export default TaskModal;
