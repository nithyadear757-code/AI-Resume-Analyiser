import { useEffect, useState } from 'react';
import { calculateLeaveDays, toInputDate, toUtcDay } from '../utils/dateUtils.js';

const EMPTY_FORM = {
  employeeName: '',
  employeeId: '',
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: '',
};

// Frontend validation. Returns an object like { employeeName: 'message' }
function validate(form) {
  const errors = {};
  if (!form.employeeName.trim()) errors.employeeName = 'Employee name is required';
  if (!form.employeeId.trim()) errors.employeeId = 'Employee ID is required';
  if (!form.leaveType) errors.leaveType = 'Please select a leave type';
  if (!form.startDate) errors.startDate = 'Start date is required';
  if (!form.endDate) errors.endDate = 'End date is required';
  if (form.startDate && form.endDate) {
    const s = toUtcDay(form.startDate);
    const e = toUtcDay(form.endDate);
    if (s === null) errors.startDate = 'Start date is not a valid date';
    else if (e === null) errors.endDate = 'End date is not a valid date';
    else if (e < s) errors.endDate = 'End date cannot be earlier than start date';
  }
  if (!form.reason.trim()) errors.reason = 'Reason is required';
  return errors;
}

function LeaveForm({ editingLeave, onSubmit, onCancelEdit, submitting, serverError }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // When the user clicks Edit, fill the form with that leave's data
  useEffect(() => {
    if (editingLeave) {
      setForm({
        employeeName: editingLeave.employeeName,
        employeeId: editingLeave.employeeId,
        leaveType: editingLeave.leaveType,
        startDate: toInputDate(editingLeave.startDate),
        endDate: toInputDate(editingLeave.endDate),
        reason: editingLeave.reason,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingLeave]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the error of the field being edited
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const ok = await onSubmit({
      ...form,
      employeeName: form.employeeName.trim(),
      employeeId: form.employeeId.trim(),
      reason: form.reason.trim(),
    });
    if (ok && !editingLeave) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  };

  const days = calculateLeaveDays(form.startDate, form.endDate);

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>{editingLeave ? 'Edit Leave Request' : 'Submit Leave Request'}</h2>

      {serverError && (
        <div className="alert alert-error" role="alert">
          {serverError}
        </div>
      )}

      <div className="form-grid">
        <div className="field">
          <label htmlFor="employeeName">Employee Name</label>
          <input
            id="employeeName"
            name="employeeName"
            type="text"
            value={form.employeeName}
            onChange={handleChange}
            className={errors.employeeName ? 'invalid' : ''}
          />
          {errors.employeeName && <span className="error-text">{errors.employeeName}</span>}
        </div>

        <div className="field">
          <label htmlFor="employeeId">Employee ID</label>
          <input
            id="employeeId"
            name="employeeId"
            type="text"
            value={form.employeeId}
            onChange={handleChange}
            className={errors.employeeId ? 'invalid' : ''}
          />
          {errors.employeeId && <span className="error-text">{errors.employeeId}</span>}
        </div>

        <div className="field">
          <label htmlFor="leaveType">Leave Type</label>
          <select
            id="leaveType"
            name="leaveType"
            value={form.leaveType}
            onChange={handleChange}
            className={errors.leaveType ? 'invalid' : ''}
          >
            <option value="">Select leave type</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Earned Leave">Earned Leave</option>
          </select>
          {errors.leaveType && <span className="error-text">{errors.leaveType}</span>}
        </div>

        <div className="field">
          <label>Total Leave Days</label>
          <div className="days-preview">{days > 0 ? `${days} ${days === 1 ? 'day' : 'days'}` : '-'}</div>
        </div>

        <div className="field">
          <label htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            className={errors.startDate ? 'invalid' : ''}
          />
          {errors.startDate && <span className="error-text">{errors.startDate}</span>}
        </div>

        <div className="field">
          <label htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            className={errors.endDate ? 'invalid' : ''}
          />
          {errors.endDate && <span className="error-text">{errors.endDate}</span>}
        </div>

        <div className="field full">
          <label htmlFor="reason">Reason</label>
          <textarea
            id="reason"
            name="reason"
            rows="3"
            value={form.reason}
            onChange={handleChange}
            className={errors.reason ? 'invalid' : ''}
          />
          {errors.reason && <span className="error-text">{errors.reason}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : editingLeave ? 'Update Leave' : 'Submit Leave'}
        </button>
        {editingLeave && (
          <button className="btn btn-secondary" type="button" onClick={onCancelEdit}>
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
}

export default LeaveForm;
