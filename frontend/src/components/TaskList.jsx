import TaskCard from './TaskCard.jsx';

function TaskList({ tasks, totalCount, loading, onEdit, onDelete, onStatusChange, busyId }) {
  if (loading) return <p className="info">Loading your tasks...</p>;
  if (totalCount === 0) {
    return <div className="empty-state"><span aria-hidden="true">+</span><h3>Your task list is clear</h3><p>Add a task above to start planning.</p></div>;
  }
  if (tasks.length === 0) {
    return <div className="empty-state"><span aria-hidden="true">?</span><h3>No matching tasks</h3><p>Try changing your search or filters.</p></div>;
  }

  return (
    <div className="task-grid">
      {tasks.map((task) => (
        <TaskCard
          key={task.id || task._id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          busy={busyId === (task.id || task._id)}
        />
      ))}
    </div>
  );
}

export default TaskList;
