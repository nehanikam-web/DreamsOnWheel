import { useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import Rating from '../components/Rating';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/pricing';

export default function ManageReviews() {
  const { reviews, getCar, deleteReview, notify } = useApp();
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return reviews.filter((r) => {
      const car = getCar(r.carId);
      return !s || `${r.name} ${r.text} ${car?.brand || ''} ${car?.name || ''}`.toLowerCase().includes(s);
    });
  }, [reviews, q, getCar]);

  const confirmDelete = async () => {
    const res = await deleteReview(toDelete.id);
    notify(res.ok ? 'Review deleted' : res.error, res.ok ? 'success' : 'error');
    setToDelete(null);
  };

  return (
    <>
      <div className="toolbar">
        <div className="search-input">
          <Search size={16} />
          <input type="search" placeholder="Search by customer, car or text" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search reviews" />
        </div>
        <span className="muted">{list.length} review{list.length === 1 ? '' : 's'}</span>
      </div>

      <div className="card">
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Customer</th><th>Car</th><th>Rating</th><th>Review</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map((r) => {
                const car = getCar(r.carId);
                return (
                  <tr key={r.id}>
                    <td>{formatDate(r.date)}</td>
                    <td>{r.name}</td>
                    <td>{car ? `${car.brand} ${car.name}` : 'Removed'}</td>
                    <td><Rating value={r.rating} /></td>
                    <td style={{ maxWidth: 360 }}>{r.text}</td>
                    <td><button className="mini-btn bad" onClick={() => setToDelete(r)}><Trash2 size={13} /> Delete</button></td>
                  </tr>
                );
              })}
              {list.length === 0 && <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 32 }}>No reviews found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {toDelete && (
        <Modal
          title="Delete this review?"
          onClose={() => setToDelete(null)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setToDelete(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete review</button>
          </>}
        >
          <p>The review by <strong>{toDelete.name}</strong> will be removed and the car's average rating updated.</p>
        </Modal>
      )}
    </>
  );
}
