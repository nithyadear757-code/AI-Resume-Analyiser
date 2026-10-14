import StatusBadge from './StatusBadge.jsx';
import { formatDate, formatDateTime, getLocalDateString, toInputDate } from '../utils/dateUtils.js';

function TaskCard({ task, onEdit, onDelete, onStatusChange, busy }) {
  const dueDate = toInputDate(task.dueDate);
  const overdue = task.status !== 'Completed' && dueDate < getLocalDateString();
  const dueToday = task.status !== 'Completed' && dueDate === getLocalDateString();

  return (
    <article className={`card task-card status-${task.status.toLowerCase().replace(/\s+/g, '-')} ${overdue ? 'is-overdue' : ''}`}>
      <div className="task-topline">
        <div className="task-badges">
          <StatusBadge status={task.status} />
          <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
            <span aria-hidden="true">●</span> {task.priority} priority
          </span>
        </div>
        {overdue && <span className="due-flag overdue-flag">Overdue</span>}
        {!overdue && dueToday && <span className="due-flag today-flag">Due today</span>}
      </div>

      <h3>{task.title}</h3>
      <p className="task-description">{task.description}</p>

      <div className="task-meta">
        <div>
          <span className="meta-label">Due date</span>
          <strong className={overdue ? 'overdue-text' : ''}>{formatDate(task.dueDate)}</strong>
        </div>
        <div>
          <span className="meta-label">Created</span>
          <strong>{formatDateTime(task.createdAt)}</strong>
        </div>
      </div>

      <div className="task-actions">
        <label className="status-control">
          <span className="visually-hidden">Change status for {task.title}</span>
          <select
            value={task.status}
            onChange={(event) => onStatusChange(task, event.target.value)}
            disabled={busy}
            aria-label={`Status for ${task.title}`}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </label>
        <button className="btn btn-quiet" disabled={busy} onClick={() => onEdit(task)}>Edit</button>
        <button className="btn btn-danger-quiet" disabled={busy} onClick={() => onDelete(task)}>Delete</button>
      </div>
    </article>
  );
}

export default TaskCard;
