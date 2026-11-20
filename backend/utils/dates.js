const DAY = 86400000;

// 'YYYY-MM-DD' -> Date at UTC midnight (null if invalid)
exports.parseDay = (iso) => {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(iso + 'T00:00:00.000Z');
  return Number.isNaN(d.getTime()) ? null : d;
};
exports.toISO = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
exports.todayUTC = () => new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z');
// Whole rental days, minimum 1 (same rule as the frontend).
exports.rentalDays = (from, to) => Math.max(1, Math.ceil((to - from) / DAY));
