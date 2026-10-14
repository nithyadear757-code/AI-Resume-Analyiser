const TASK_STATUSES = ['Pending', 'In Progress', 'Completed'];
const TASK_PRIORITIES = ['Low', 'Medium', 'High'];

const normalizeChoice = (value, choices) => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return choices.find((choice) => choice.toLowerCase() === normalized) || null;
};

const toTaskDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};

module.exports = { TASK_STATUSES, TASK_PRIORITIES, normalizeChoice, toTaskDate };
