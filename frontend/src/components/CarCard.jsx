import { Link, useNavigate } from 'react-router-dom';
import { Fuel, GitCompare, Heart, Settings2, Users } from 'lucide-react';
import CarImage from './CarImage';
import Rating from './Rating';
import { useApp } from '../context/AppContext';
import { inr } from '../utils/pricing';

export default function CarCard({ car, query = '' }) {
  const { wishlist, toggleWishlist, compare, toggleCompare, isCurrentlyRented } = useApp();
  const navigate = useNavigate();
  const liked = wishlist.includes(car.id);
  const comparing = compare.includes(car.id);
  const rented = isCurrentlyRented(car.id);
  const available = car.available && !rented;

  return (
    <article className={`car-card ${available ? '' : 'is-unavailable'}`}>
      <div className="car-card-media">
        <Link to={`/cars/${car.id}`} aria-label={`View ${car.brand} ${car.name}`}>
          <CarImage src={car.images[0]} alt={`${car.brand} ${car.name}`} />
        </Link>
        <span className="chip chip-type">{car.type}</span>
        <span className={`chip chip-avail ${available ? 'ok' : 'bad'}`}>{available ? 'Available' : 'Rented'}</span>
        <div className="card-tools">
          <button className={`tool-btn ${liked ? 'on' : ''}`} onClick={() => toggleWishlist(car.id)} aria-label="Favourite" aria-pressed={liked}>
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button className={`tool-btn ${comparing ? 'on' : ''}`} onClick={() => toggleCompare(car.id)} aria-label="Compare" aria-pressed={comparing}>
            <GitCompare size={16} />
          </button>
        </div>
      </div>

      <div className="car-card-body">
        <div className="car-card-head">
          <div>
            <span className="brand">{car.brand}</span>
            <h3>{car.name}</h3>
          </div>
          <Rating value={car.rating} count={car.reviews} />
        </div>

        <ul className="spec-row">
          <li><Fuel size={15} /> {car.fuel}</li>
          <li><Settings2 size={15} /> {car.transmission}</li>
          <li><Users size={15} /> {car.seats} Seats</li>
        </ul>

        <div className="car-card-foot">
          <div className="price"><strong>{inr(car.price)}</strong><span> / day</span></div>
          <div className="btn-pair">
            <Link to={`/cars/${car.id}${query}`} className="btn btn-outline btn-sm">View Details</Link>
            <button className="btn btn-primary btn-sm" disabled={!available} onClick={() => navigate(`/book/${car.id}${query}`)}>
              Book Now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
