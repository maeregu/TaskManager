const Task = require("../models/task");
const asyncHandler = require("../utils/asyncHandler");

// GET all tasks
exports.getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

// CREATE task
exports.createTask = asyncHandler(async (req, res) => {
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";

  if (!title) {
    const error = new Error("Title is required");
    error.statusCode = 400;
    throw error;
  }

  const task = new Task({ title });
  const saved = await task.save();
  res.status(201).json(saved);
});

// UPDATE task
exports.updateTask = asyncHandler(async (req, res) => {
  const updates = {};

  if ("title" in req.body) {
    if (typeof req.body.title !== "string" || !req.body.title.trim()) {
      const error = new Error("Title is required");
      error.statusCode = 400;
      throw error;
    }

    updates.title = req.body.title.trim();
  }

  if ("completed" in req.body) {
    if (typeof req.body.completed !== "boolean") {
      const error = new Error("Completed must be a boolean value");
      error.statusCode = 400;
      throw error;
    }

    updates.completed = req.body.completed;
  }

  const task = await Task.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  res.json(task);
});

// DELETE task
exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(204).send();
});
