function Filters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
}) {
  return (
    <div className="filters">
      <div className="field search-field">
        <label htmlFor="search">Search tasks</label>
        <input
          id="search"
          type="search"
          placeholder="Search by task title..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="statusFilter">Status</label>
        <select id="statusFilter" value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="priorityFilter">Priority</label>
        <select id="priorityFilter" value={priorityFilter} onChange={(event) => onPriorityChange(event.target.value)}>
          <option value="All">All priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
    </div>
  );
}

export default Filters;
