const mongoose = require('mongoose');
const Task = require('../models/Task');
const { TASK_STATUSES, TASK_PRIORITIES, normalizeChoice, toTaskDate } = require('../utils/taskUtils');

const editableFields = new Set(['title', 'description', 'priority', 'status', 'dueDate']);

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

const findTaskOrFail = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, 'Invalid task ID');
  const task = await Task.findById(id);
  if (!task) throw httpError(404, 'Task not found');
  return task;
};

const validateFields = (data) => {
  if (isBlank(data.title)) throw httpError(400, 'Title is required');
  if (String(data.title).trim().length > 120) {
    throw httpError(400, 'Title cannot exceed 120 characters');
  }
  if (isBlank(data.description)) throw httpError(400, 'Description is required');
  if (String(data.description).trim().length > 2000) {
    throw httpError(400, 'Description cannot exceed 2000 characters');
  }
  if (!normalizeChoice(data.priority, TASK_PRIORITIES)) {
    throw httpError(400, 'Priority must be Low, Medium or High');
  }
  if (!toTaskDate(data.dueDate)) throw httpError(400, 'Due date must be a valid YYYY-MM-DD date');
  if (!normalizeChoice(data.status, TASK_STATUSES)) {
    throw httpError(400, 'Status must be Pending, In Progress or Completed');
  }
};

const validateEditableKeys = (body) => {
  const invalidKey = Object.keys(body).find((key) => !editableFields.has(key));
  if (invalidKey) throw httpError(400, `Field "${invalidKey}" cannot be updated`);
  if (Object.keys(body).length === 0) throw httpError(400, 'Request body cannot be empty');
};

const normalizedTaskData = (data) => ({
  title: String(data.title).trim(),
  description: String(data.description).trim(),
  priority: normalizeChoice(data.priority, TASK_PRIORITIES),
  status: normalizeChoice(data.status, TASK_STATUSES),
  dueDate: toTaskDate(data.dueDate),
});

const createTask = async (req, res, next) => {
  try {
    const body = req.body || {};
    const data = {
      ...body,
      priority: body.priority || 'Medium',
      status: body.status || 'Pending',
    };
    validateFields(data);
    const task = await Task.create(normalizedTaskData(data));
    res.status(201).json({ message: 'Task created successfully', data: task });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status !== undefined && req.query.status !== '') {
      const status = normalizeChoice(req.query.status, TASK_STATUSES);
      if (!status) throw httpError(400, 'Status must be Pending, In Progress or Completed');
      filter.status = status;
    }
    if (req.query.priority !== undefined && req.query.priority !== '') {
      const priority = normalizeChoice(req.query.priority, TASK_PRIORITIES);
      if (!priority) throw httpError(400, 'Priority must be Low, Medium or High');
      filter.priority = priority;
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Tasks fetched successfully',
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await findTaskOrFail(req.params.id);
    res.status(200).json({ message: 'Task fetched successfully', data: task });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await findTaskOrFail(req.params.id);
    const body = req.body || {};
    validateEditableKeys(body);

    const currentDueDate = task.dueDate.toISOString().slice(0, 10);
    const merged = {
      title: body.title === undefined ? task.title : body.title,
      description: body.description === undefined ? task.description : body.description,
      priority: body.priority === undefined ? task.priority : body.priority,
      status: body.status === undefined ? task.status : body.status,
      dueDate: body.dueDate === undefined ? currentDueDate : body.dueDate,
    };
    validateFields(merged);
    Object.assign(task, normalizedTaskData(merged));
    await task.save();

    res.status(200).json({ message: 'Task updated successfully', data: task });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await findTaskOrFail(req.params.id);
    await task.deleteOne();
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };
