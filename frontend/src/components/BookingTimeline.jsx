import { Check, X } from 'lucide-react';

const FLOW = ['Pending', 'Approved', 'Active', 'Completed'];
const LABELS = { Pending: 'Booking placed', Approved: 'Approved', Active: 'Car picked up', Completed: 'Completed' };

export default function BookingTimeline({ status }) {
  const cancelled = status === 'Cancelled';
  const idx = FLOW.indexOf(status);
  return (
    <div className="timeline" aria-label={`Booking status: ${status}`}>
      {cancelled ? (
        <>
          <div className="tl-step done"><div className="tl-dot"><Check size={16} /></div>Booking placed</div>
          <div className="tl-step cancelled done"><div className="tl-dot"><X size={16} /></div>Cancelled</div>
        </>
      ) : (
        FLOW.map((s, i) => (
          <div key={s} className={`tl-step ${i <= idx ? 'done' : ''}`}>
            <div className="tl-dot">{i <= idx ? <Check size={16} /> : i + 1}</div>
            {LABELS[s]}
          </div>
        ))
      )}
    </div>
  );
}
