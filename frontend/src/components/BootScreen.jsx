// Shown while the first data load runs, or when the backend cannot be reached.
export default function BootScreen({ error, onRetry }) {
  return (
    <div className="boot-screen" role={error ? 'alert' : 'status'}>
      <div className="boot-card">
        <span className="boot-logo">DreamsOn<b>Wheel</b></span>
        {error ? (
          <>
            <h1>We could not reach the server</h1>
            <p>{error}</p>
            <p className="boot-hint">Make sure the backend is running (<code>npm run dev</code> inside the <code>backend</code> folder) and MongoDB is connected.</p>
            <button className="btn btn-primary" onClick={onRetry}>Try again</button>
          </>
        ) : (
          <>
            <div className="spinner" aria-hidden="true" />
            <p>Loading cars and bookings...</p>
          </>
        )}
      </div>
    </div>
  );
}
