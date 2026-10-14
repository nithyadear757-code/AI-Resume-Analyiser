const mongoose = require('mongoose');
const Leave = require('../models/Leave');
const { LEAVE_TYPES, STATUSES } = Leave;
const { isValidDate, isDateRangeValid } = require('../utils/dateUtils');

// Small helper to create an error with a status code
const httpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';

// Checks the ID format and loads the leave, or throws 400 / 404
const findLeaveOrFail = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, 'Invalid leave ID');
  }
  const leave = await Leave.findById(id);
  if (!leave) throw httpError(404, 'Leave request not found');
  return leave;
};

// Validates the fields of a leave. Throws 400 with a clear message.
const validateLeaveData = (data) => {
  if (isBlank(data.employeeName)) throw httpError(400, 'Employee name is required');
  if (isBlank(data.employeeId)) throw httpError(400, 'Employee ID is required');
  if (isBlank(data.leaveType)) throw httpError(400, 'Leave type is required');
  if (!LEAVE_TYPES.includes(data.leaveType)) {
    throw httpError(400, 'Leave type must be Casual Leave, Sick Leave or Earned Leave');
  }
  if (isBlank(data.startDate)) throw httpError(400, 'Start date is required');
  if (isBlank(data.endDate)) throw httpError(400, 'End date is required');
  if (!isValidDate(data.startDate)) throw httpError(400, 'Start date is not a valid date');
  if (!isValidDate(data.endDate)) throw httpError(400, 'End date is not a valid date');
  if (!isDateRangeValid(data.startDate, data.endDate)) {
    throw httpError(400, 'End date cannot be earlier than start date');
  }
  if (isBlank(data.reason)) throw httpError(400, 'Reason is required');
};

// Turns "2026-10-15" into a UTC Date so it is stored the same everywhere
const toStoredDate = (value) => new Date(String(value).slice(0, 10) + 'T00:00:00.000Z');

// POST /leaves
const createLeave = async (req, res, next) => {
  try {
    const body = req.body || {};
    validateLeaveData(body);

    // Status is always Pending for new requests, whatever the client sends
    const leave = await Leave.create({
      employeeName: body.employeeName,
      employeeId: body.employeeId,
      leaveType: body.leaveType,
      startDate: toStoredDate(body.startDate),
      endDate: toStoredDate(body.endDate),
      reason: body.reason,
      status: 'Pending',
    });

    res.status(201).json({ message: 'Leave request created successfully', data: leave });
  } catch (err) {
    next(err);
  }
};

// GET /leaves  and  GET /leaves?status=Pending
const getLeaves = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status !== undefined && req.query.status !== '') {
      if (!STATUSES.includes(req.query.status)) {
        throw httpError(400, 'Status must be Pending, Approved or Rejected');
      }
      filter.status = req.query.status;
    }
    const leaves = await Leave.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Leave requests fetched successfully',
      count: leaves.length,
      data: leaves,
    });
  } catch (err) {
    next(err);
  }
};

// GET /leaves/:id
const getLeaveById = async (req, res, next) => {
  try {
    const leave = await findLeaveOrFail(req.params.id);
    res.status(200).json({ message: 'Leave request fetched successfully', data: leave });
  } catch (err) {
    next(err);
  }
};

// PUT /leaves/:id  (edit fields and/or change status)
const updateLeave = async (req, res, next) => {
  try {
    const leave = await findLeaveOrFail(req.params.id);
    const body = req.body || {};

    if (Object.keys(body).length === 0) {
      throw httpError(400, 'Request body cannot be empty');
    }

    // Merge old values with the new ones, then validate the final result
    const merged = {
      employeeName: body.employeeName !== undefined ? body.employeeName : leave.employeeName,
      employeeId: body.employeeId !== undefined ? body.employeeId : leave.employeeId,
      leaveType: body.leaveType !== undefined ? body.leaveType : leave.leaveType,
      startDate:
        body.startDate !== undefined ? body.startDate : leave.startDate.toISOString().slice(0, 10),
      endDate:
        body.endDate !== undefined ? body.endDate : leave.endDate.toISOString().slice(0, 10),
      reason: body.reason !== undefined ? body.reason : leave.reason,
    };

    let newStatus = leave.status;
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        throw httpError(400, 'Status must be Pending, Approved or Rejected');
      }
      newStatus = body.status;
    }

    validateLeaveData(merged);

    // Rule: a request with invalid dates can never be approved
    if (newStatus === 'Approved' && !isDateRangeValid(merged.startDate, merged.endDate)) {
      throw httpError(400, 'Cannot approve a leave request with invalid dates');
    }

    leave.employeeName = merged.employeeName;
    leave.employeeId = merged.employeeId;
    leave.leaveType = merged.leaveType;
    leave.startDate = toStoredDate(merged.startDate);
    leave.endDate = toStoredDate(merged.endDate);
    leave.reason = merged.reason;
    leave.status = newStatus;

    await leave.save();
    res.status(200).json({ message: 'Leave request updated successfully', data: leave });
  } catch (err) {
    next(err);
  }
};

// DELETE /leaves/:id
const deleteLeave = async (req, res, next) => {
  try {
    const leave = await findLeaveOrFail(req.params.id);
    await leave.deleteOne();
    res.status(200).json({ message: 'Leave request deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createLeave, getLeaves, getLeaveById, updateLeave, deleteLeave };
