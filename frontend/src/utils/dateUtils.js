// Same logic as the backend. Works with "YYYY-MM-DD" strings and UTC math,
// so the browser's timezone can never shift a date by one day.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toUtcDay(value) {
  if (!value || typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const time = Date.UTC(year, month - 1, day);
  const check = new Date(time);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return time;
}

// Counts both the start and the end date. Returns 0 for invalid input.
export function calculateLeaveDays(start, end) {
  const s = toUtcDay(start);
  const e = toUtcDay(end);
  if (s === null || e === null || e < s) return 0;
  return Math.round((e - s) / MS_PER_DAY) + 1;
}

// "2026-10-15T00:00:00.000Z" -> "15 Oct 2026"
export function formatDate(value) {
  const t = toUtcDay(typeof value === 'string' ? value : '');
  if (t === null) return '-';
  return new Date(t).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// For createdAt (a real timestamp) show local date and time
export function formatDateTime(value) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// "2026-10-15T00:00:00.000Z" -> "2026-10-15" (for <input type="date">)
export function toInputDate(value) {
  return typeof value === 'string' ? value.slice(0, 10) : '';
}
