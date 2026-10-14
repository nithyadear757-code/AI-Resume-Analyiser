const mongoose = require('mongoose');
const { isDateRangeValid, calculateLeaveDays } = require('../utils/dateUtils');

const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Earned Leave'];
const STATUSES = ['Pending', 'Approved', 'Rejected'];

const leaveSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true,
    },
    leaveType: {
      type: String,
      required: [true, 'Leave type is required'],
      enum: {
        values: LEAVE_TYPES,
        message: 'Leave type must be Casual Leave, Sick Leave or Earned Leave',
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: 'Status must be Pending, Approved or Rejected',
      },
      default: 'Pending',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// totalDays is calculated automatically and sent with every response
leaveSchema.virtual('totalDays').get(function () {
  return calculateLeaveDays(this.startDate, this.endDate);
});

// Keeps the database consistent: bad date ranges can never be saved
leaveSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate && !isDateRangeValid(this.startDate, this.endDate)) {
    this.invalidate('endDate', 'End date cannot be earlier than start date');
  }
  next();
});

module.exports = mongoose.model('Leave', leaveSchema);
module.exports.LEAVE_TYPES = LEAVE_TYPES;
module.exports.STATUSES = STATUSES;
