// Reusable date helpers. We work with "YYYY-MM-DD" strings and UTC math
// so the user's timezone can never shift a date by one day.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Accepts a Date or a string like "2026-10-15" or "2026-10-15T00:00:00.000Z".
// Returns a UTC midnight timestamp (number) or null if invalid.
function toUtcDay(value) {
  if (value === undefined || value === null || value === '') return null;

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  }

  if (typeof value !== 'string') return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const time = Date.UTC(year, month - 1, day);
  const check = new Date(time);

  // Reject impossible dates like 2026-02-31
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return time;
}

function isValidDate(value) {
  return toUtcDay(value) !== null;
}

// Returns number of leave days, counting BOTH start and end dates.
// Returns 0 if either date is invalid or end is before start.
function calculateLeaveDays(start, end) {
  const s = toUtcDay(start);
  const e = toUtcDay(end);
  if (s === null || e === null || e < s) return 0;
  return Math.round((e - s) / MS_PER_DAY) + 1;
}

// True only when both dates are valid and end >= start.
function isDateRangeValid(start, end) {
  const s = toUtcDay(start);
  const e = toUtcDay(end);
  return s !== null && e !== null && e >= s;
}

module.exports = { toUtcDay, isValidDate, calculateLeaveDays, isDateRangeValid };
