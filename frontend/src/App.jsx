import { useEffect, useMemo, useState } from 'react';
import LeaveForm from './components/LeaveForm.jsx';
import LeaveList from './components/LeaveList.jsx';
import Filters from './components/Filters.jsx';
import {
  getLeaves,
  createLeave,
  updateLeave,
  deleteLeave,
  getErrorMessage,
} from './services/leaveService.js';

function App() {
  const [leaves, setLeaves] = useState([]);
  const [editingLeave, setEditingLeave] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadLeaves = async () => {
    setLoading(true);
    setPageError('');
    try {
      setLeaves(await getLeaves());
    } catch (err) {
      setPageError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  // Hide the green success message after 3 seconds
  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setFormError('');
    try {
      if (editingLeave) {
        const updated = await updateLeave(editingLeave._id, formData);
        setLeaves((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
        setEditingLeave(null);
        setSuccessMessage('Leave request updated successfully');
      } else {
        const created = await createLeave(formData);
        setLeaves((prev) => [created, ...prev]);
        setSuccessMessage('Leave request submitted successfully');
      }
      return true;
    } catch (err) {
      setFormError(getErrorMessage(err));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (leave, status) => {
    setBusyId(leave._id);
    setPageError('');
    try {
      const updated = await updateLeave(leave._id, { status });
      setLeaves((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
      setSuccessMessage(`Leave request ${status.toLowerCase()}`);
    } catch (err) {
      setPageError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (leave) => {
    const ok = window.confirm(
      `Are you sure you want to delete the leave request of ${leave.employeeName}?`
    );
    if (!ok) return;

    setBusyId(leave._id);
    setPageError('');
    try {
      await deleteLeave(leave._id);
      setLeaves((prev) => prev.filter((l) => l._id !== leave._id));
      if (editingLeave && editingLeave._id === leave._id) setEditingLeave(null);
      setSuccessMessage('Leave request deleted successfully');
    } catch (err) {
      setPageError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleEdit = (leave) => {
    setFormError('');
    setEditingLeave(leave);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormError('');
    setEditingLeave(null);
  };

  // Search + filters are applied on the already loaded list
  const visibleLeaves = useMemo(() => {
    const text = search.trim().toLowerCase();
    return leaves.filter((l) => {
      const matchesSearch =
        text === '' ||
        l.employeeName.toLowerCase().includes(text) ||
        l.employeeId.toLowerCase().includes(text);
      const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
      const matchesType = typeFilter === 'All' || l.leaveType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leaves, search, statusFilter, typeFilter]);

  return (
    <div className="container">
      <header className="app-header">
        <h1>Employee Leave Management System</h1>
        <p>Submit, review and track employee leave requests</p>
      </header>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {pageError && (
        <div className="alert alert-error" role="alert">
          {pageError}
          <button className="link-btn" onClick={loadLeaves}>
            Retry
          </button>
        </div>
      )}

      <LeaveForm
        editingLeave={editingLeave}
        onSubmit={handleSubmit}
        onCancelEdit={handleCancelEdit}
        submitting={submitting}
        serverError={formError}
      />

      <section>
        <h2 className="section-title">
          Leave Requests{' '}
          <span className="muted">
            ({visibleLeaves.length} of {leaves.length})
          </span>
        </h2>

        <Filters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
        />

        <LeaveList
          leaves={visibleLeaves}
          totalCount={leaves.length}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          busyId={busyId}
        />
      </section>
    </div>
  );
}

export default App;
