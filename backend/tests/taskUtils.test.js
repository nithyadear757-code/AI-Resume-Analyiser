const assert = require('assert');
const {
  TASK_STATUSES,
  TASK_PRIORITIES,
  normalizeChoice,
  toTaskDate,
} = require('../utils/taskUtils');

assert.deepStrictEqual(TASK_STATUSES, ['Pending', 'In Progress', 'Completed']);
assert.deepStrictEqual(TASK_PRIORITIES, ['Low', 'Medium', 'High']);
assert.strictEqual(normalizeChoice('pending', TASK_STATUSES), 'Pending');
assert.strictEqual(normalizeChoice('IN PROGRESS', TASK_STATUSES), 'In Progress');
assert.strictEqual(normalizeChoice('urgent', TASK_PRIORITIES), null);
assert.strictEqual(toTaskDate('2026-10-14').toISOString(), '2026-10-14T00:00:00.000Z');
assert.strictEqual(toTaskDate('2024-02-29').toISOString(), '2024-02-29T00:00:00.000Z');
assert.strictEqual(toTaskDate('2026-02-29'), null);
assert.strictEqual(toTaskDate('2026-13-01'), null);
assert.strictEqual(toTaskDate('not-a-date'), null);
console.log('All task utility tests passed');
