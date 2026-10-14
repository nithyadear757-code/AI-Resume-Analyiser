import StatusBadge from './StatusBadge.jsx';
import { calculateLeaveDays, formatDate, formatDateTime } from '../utils/dateUtils.js';

function LeaveCard({ leave, onEdit, onDelete, onStatusChange, busy }) {
  const days = calculateLeaveDays(leave.startDate, leave.endDate);

  return (
    <div className={`card leave-card leave-${leave.status.toLowerCase()}`}>
      <div className="leave-header">
        <div>
          <h3>{leave.employeeName}</h3>
          <p className="muted">ID: {leave.employeeId}</p>
        </div>
        <StatusBadge status={leave.status} />
      </div>

      <dl className="leave-details">
        <div>
          <dt>Leave type</dt>
          <dd>{leave.leaveType}</dd>
        </div>
        <div>
          <dt>Start date</dt>
          <dd>{formatDate(leave.startDate)}</dd>
        </div>
        <div>
          <dt>End date</dt>
          <dd>{formatDate(leave.endDate)}</dd>
        </div>
        <div>
          <dt>Total leave days</dt>
          <dd>
            <strong>
              {days} {days === 1 ? 'day' : 'days'}
            </strong>
          </dd>
        </div>
        <div className="full">
          <dt>Reason</dt>
          <dd>{leave.reason}</dd>
        </div>
        <div className="full">
          <dt>Created</dt>
          <dd>{formatDateTime(leave.createdAt)}</dd>
        </div>
      </dl>

      <div className="actions">
        <button
          className="btn btn-approve"
          disabled={busy || leave.status === 'Approved'}
          onClick={() => onStatusChange(leave, 'Approved')}
        >
          Approve
        </button>
        <button
          className="btn btn-reject"
          disabled={busy || leave.status === 'Rejected'}
          onClick={() => onStatusChange(leave, 'Rejected')}
        >
          Reject
        </button>
        <button className="btn btn-edit" disabled={busy} onClick={() => onEdit(leave)}>
          Edit
        </button>
        <button className="btn btn-delete" disabled={busy} onClick={() => onDelete(leave)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default LeaveCard;
