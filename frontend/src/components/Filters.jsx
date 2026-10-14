function Filters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
}) {
  return (
    <div className="card filters">
      <div className="field">
        <label htmlFor="search">Search by employee name or ID</label>
        <input
          id="search"
          type="text"
          placeholder="e.g. Priya or EMP001"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="statusFilter">Status</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="typeFilter">Leave type</label>
        <select id="typeFilter" value={typeFilter} onChange={(e) => onTypeChange(e.target.value)}>
          <option value="All">All</option>
          <option value="Casual Leave">Casual Leave</option>
          <option value="Sick Leave">Sick Leave</option>
          <option value="Earned Leave">Earned Leave</option>
        </select>
      </div>
    </div>
  );
}

export default Filters;
