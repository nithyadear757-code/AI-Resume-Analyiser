import { useEffect, useMemo, useState } from 'react';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import Filters from './components/Filters.jsx';
import { createTask, deleteTask, getErrorMessage, getTasks, updateTask } from './services/taskService.js';

const getTaskId = (task) => task.id || task._id;

function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadTasks = async () => {
    setLoading(true);
    setPageError('');
    try {
      setTasks(await getTasks());
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setFormError('');
    try {
      if (editingTask) {
        const updated = await updateTask(getTaskId(editingTask), formData);
        setTasks((previous) =>
          previous.map((task) => (getTaskId(task) === getTaskId(updated) ? updated : task))
        );
        setEditingTask(null);
        setSuccessMessage('Task updated successfully');
      } else {
        const created = await createTask(formData);
        setTasks((previous) => [created, ...previous]);
        setSuccessMessage('Task created successfully');
      }
      return true;
    } catch (error) {
      setFormError(getErrorMessage(error));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (task, status) => {
    const id = getTaskId(task);
    setBusyId(id);
    setPageError('');
    try {
      const updated = await updateTask(id, { status });
      setTasks((previous) =>
        previous.map((item) => (getTaskId(item) === getTaskId(updated) ? updated : item))
      );
      setSuccessMessage(`Task marked ${status.toLowerCase()}`);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"? This action cannot be undone.`)) return;

    const id = getTaskId(task);
    setBusyId(id);
    setPageError('');
    try {
      await deleteTask(id);
      setTasks((previous) => previous.filter((item) => getTaskId(item) !== id));
      if (editingTask && getTaskId(editingTask) === id) setEditingTask(null);
      setSuccessMessage('Task deleted successfully');
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const handleEdit = (task) => {
    setFormError('');
    setEditingTask(task);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch = !query || task.title.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const pendingCount = tasks.filter((task) => task.status === 'Pending').length;
  const inProgressCount = tasks.filter((task) => task.status === 'In Progress').length;
  const completedCount = tasks.filter((task) => task.status === 'Completed').length;

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="header-copy">
          <p className="eyebrow">STUDENT WORKSPACE</p>
          <h1>Task Manager<span>.</span></h1>
          <p className="header-subtitle">A little structure goes a long way. Keep your studies moving.</p>
        </div>
        <div className="header-mark" aria-hidden="true"><span>TM</span></div>
      </header>

      {successMessage && <div className="alert alert-success" role="status">{successMessage}</div>}
      {pageError && (
        <div className="alert alert-error" role="alert">
          {pageError}
          <button className="link-btn" onClick={loadTasks}>Retry</button>
        </div>
      )}

      <section className="overview" aria-label="Task summary">
        <div className="overview-label">
          <span className="eyebrow">YOUR OVERVIEW</span>
          <strong>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</strong>
        </div>
        <div className="stat">
          <span className="stat-dot pending-dot" />
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="stat">
          <span className="stat-dot progress-dot" />
          <span>In progress</span>
          <strong>{inProgressCount}</strong>
        </div>
        <div className="stat">
          <span className="stat-dot completed-dot" />
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </div>
      </section>

      <div className="main-layout">
        <aside className="form-column">
          <TaskForm
            editingTask={editingTask}
            onSubmit={handleSubmit}
            onCancelEdit={() => {
              setFormError('');
              setEditingTask(null);
            }}
            submitting={submitting}
            serverError={formError}
          />
          <p className="form-note"><span>*</span> Required fields. Tasks are saved to your database.</p>
        </aside>

        <section className="tasks-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">STAY ON TRACK</p>
              <h2>Your tasks <span>({visibleTasks.length})</span></h2>
            </div>
            <span className="task-total">{tasks.length} total</span>
          </div>

          <Filters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
          />

          <TaskList
            tasks={visibleTasks}
            totalCount={tasks.length}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            busyId={busyId}
          />
        </section>
      </div>
      <footer className="app-footer">One task at a time. You have got this.</footer>
    </main>
  );
}

export default App;
