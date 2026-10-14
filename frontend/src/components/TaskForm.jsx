import { useEffect, useState } from 'react';
import { isValidDate, toInputDate } from '../utils/dateUtils.js';

const EMPTY_FORM = { title: '', description: '', priority: 'Medium', dueDate: '' };

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Title is required';
  if (form.title.trim().length > 120) errors.title = 'Title cannot exceed 120 characters';
  if (!form.description.trim()) errors.description = 'Description is required';
  if (form.description.trim().length > 2000) {
    errors.description = 'Description cannot exceed 2000 characters';
  }
  if (!form.priority) errors.priority = 'Please select a priority';
  if (!form.dueDate) errors.dueDate = 'Due date is required';
  else if (!isValidDate(form.dueDate)) errors.dueDate = 'Enter a valid due date';
  return errors;
}

function TaskForm({ editingTask, onSubmit, onCancelEdit, submitting, serverError }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        dueDate: toInputDate(editingTask.dueDate),
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingTask]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    if (errors[name]) setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formErrors = validate(form);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    const saved = await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      dueDate: form.dueDate,
    });
    if (saved && !editingTask) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  };

  return (
    <form className="card form-card" onSubmit={handleSubmit} noValidate>
      <div className="form-heading">
        <div>
          <p className="eyebrow">{editingTask ? 'MAKE CHANGES' : 'GET STARTED'}</p>
          <h2>{editingTask ? 'Edit task' : 'Create a task'}</h2>
        </div>
        <span className="form-icon" aria-hidden="true">{editingTask ? 'Edit' : '+'}</span>
      </div>

      {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}

      <div className="form-grid">
        <div className="field full">
          <label htmlFor="title">Task title <span className="required">*</span></label>
          <input
            id="title"
            name="title"
            type="text"
            maxLength="120"
            placeholder="e.g. Finish the biology assignment"
            value={form.title}
            onChange={handleChange}
            className={errors.title ? 'invalid' : ''}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="field full">
          <label htmlFor="description">Description <span className="required">*</span></label>
          <textarea
            id="description"
            name="description"
            rows="3"
            maxLength="2000"
            placeholder="Add a few details about what needs to be done..."
            value={form.description}
            onChange={handleChange}
            className={errors.description ? 'invalid' : ''}
            aria-invalid={Boolean(errors.description)}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="field">
          <label htmlFor="priority">Priority <span className="required">*</span></label>
          <select
            id="priority"
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className={errors.priority ? 'invalid' : ''}
            aria-invalid={Boolean(errors.priority)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          {errors.priority && <span className="error-text">{errors.priority}</span>}
        </div>

        <div className="field">
          <label htmlFor="dueDate">Due date <span className="required">*</span></label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
            className={errors.dueDate ? 'invalid' : ''}
            aria-invalid={Boolean(errors.dueDate)}
          />
          {errors.dueDate && <span className="error-text">{errors.dueDate}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : editingTask ? 'Save changes' : 'Add task'}
        </button>
        {editingTask && (
          <button className="btn btn-secondary" type="button" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
