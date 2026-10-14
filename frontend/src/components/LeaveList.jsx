import LeaveCard from './LeaveCard.jsx';

function LeaveList({ leaves, totalCount, loading, onEdit, onDelete, onStatusChange, busyId }) {
  if (loading) {
    return <p className="info">Loading leave requests...</p>;
  }

  if (totalCount === 0) {
    return <p className="info">No leave requests yet. Submit the first one using the form.</p>;
  }

  if (leaves.length === 0) {
    return <p className="info">No leave requests match your search or filters.</p>;
  }

  return (
    <div className="leave-grid">
      {leaves.map((leave) => (
        <LeaveCard
          key={leave._id}
          leave={leave}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          busy={busyId === leave._id}
        />
      ))}
    </div>
  );
}

export default LeaveList;
