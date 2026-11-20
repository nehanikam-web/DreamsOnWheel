import { Check } from 'lucide-react';

export default function AuthSide({ title, text }) {
  return (
    <div className="auth-side">
      <img src="https://loremflickr.com/1000/1200/car,road?lock=21" alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      <h2>{title}</h2>
      <p>{text}</p>
      <ul>
        <li><Check size={16} /> Self drive and chauffeur options</li>
        <li><Check size={16} /> Transparent pricing with GST included</li>
        <li><Check size={16} /> Track every booking in one place</li>
      </ul>
    </div>
  );
}
