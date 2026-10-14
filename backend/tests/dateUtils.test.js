const assert = require('assert');
const { calculateLeaveDays, isDateRangeValid } = require('../utils/dateUtils');

assert.strictEqual(calculateLeaveDays('2026-10-15', '2026-10-15'), 1);
assert.strictEqual(calculateLeaveDays('2026-10-15', '2026-10-17'), 3);
assert.strictEqual(calculateLeaveDays('2026-10-17', '2026-10-15'), 0);
assert.strictEqual(calculateLeaveDays('2026-02-31', '2026-03-02'), 0);
assert.strictEqual(calculateLeaveDays('abc', '2026-03-02'), 0);
assert.strictEqual(calculateLeaveDays('2026-12-30', '2027-01-02'), 4);
assert.strictEqual(calculateLeaveDays(new Date('2026-10-15T00:00:00.000Z'), new Date('2026-10-17T00:00:00.000Z')), 3);
assert.strictEqual(isDateRangeValid('2026-10-15', '2026-10-14'), false);
assert.strictEqual(isDateRangeValid('2026-10-15', '2026-10-15'), true);
console.log('All date utility tests passed');
