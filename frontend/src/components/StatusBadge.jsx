const TONES = {
  Pending: 'warn', Approved: 'info', Active: 'accent', Completed: 'ok', Cancelled: 'bad',
  Available: 'ok', Rented: 'bad', Unavailable: 'bad', Inactive: 'muted', 'On Duty': 'info',
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${TONES[status] || 'muted'}`}>{status}</span>;
}
