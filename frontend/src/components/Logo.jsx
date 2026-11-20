import { Link } from 'react-router-dom';

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className={`logo ${light ? 'logo-light' : ''}`} aria-label="DreamsOnWheel home">
      <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill={light ? '#ffffff' : '#0f1b33'} />
        <path d="M6 19l2-6a2 2 0 0 1 2-1.4h12a2 2 0 0 1 2 1.4l2 6v4h-3v-2H9v2H6z" fill={light ? '#0f1b33' : '#ffffff'} />
        <circle cx="10.5" cy="18.5" r="1.5" fill="#f97316" />
        <circle cx="21.5" cy="18.5" r="1.5" fill="#f97316" />
      </svg>
      <span>Dreams<b>On</b>Wheel</span>
    </Link>
  );
}
