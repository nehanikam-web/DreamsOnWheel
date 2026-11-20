import { Star } from 'lucide-react';

export default function Rating({ value, count, size = 14 }) {
  return (
    <span className="rating" title={`${value} out of 5`}>
      <Star size={size} fill="currentColor" strokeWidth={0} />
      <strong>{Number(value).toFixed(1)}</strong>
      {count !== undefined && <span className="muted">({count})</span>}
    </span>
  );
}

export function Stars({ value, size = 16 }) {
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} strokeWidth={0} fill={i <= Math.round(value) ? 'currentColor' : '#d4d8df'} />
      ))}
    </span>
  );
}
