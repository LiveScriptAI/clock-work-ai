export function recordBreakInterval(
  shiftId: string,
  action: 'start' | 'end'
) {
  const key = `shift_${shiftId}_breaks`;
  const raw = localStorage.getItem(key) || '[]';
  let intervals: Array<{ start: string; end: string | null }> =
    JSON.parse(raw);

  const now = new Date().toISOString();
  if (action === 'start') {
    intervals.push({ start: now, end: null });
  } else {
    const last = intervals[intervals.length - 1];
    if (last && last.end === null) {
      last.end = now;
    }
  }

  localStorage.setItem(key, JSON.stringify(intervals));
}
