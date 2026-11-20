import { useState } from 'react';

// Shows a car photo; if the URL fails, falls back to a neutral placeholder with the car name.
export default function CarImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`car-img-fallback ${className}`} role="img" aria-label={alt}>
        <svg viewBox="0 0 64 32" width="64" height="32" aria-hidden="true">
          <path d="M6 22l4-10a4 4 0 0 1 3.7-2.5h36.6A4 4 0 0 1 54 12l4 10v6h-6v-3H12v3H6z" fill="currentColor" opacity=".35" />
          <circle cx="16" cy="23" r="3.5" fill="currentColor" opacity=".6" />
          <circle cx="48" cy="23" r="3.5" fill="currentColor" opacity=".6" />
        </svg>
        <span>{alt}</span>
      </div>
    );
  }

  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
