import { Link } from 'react-router-dom';
import { OFFERS } from '../data/seed';
import { useApp } from '../context/AppContext';

export default function OfferCards({ limit }) {
  const { notify } = useApp();
  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      notify(`Code ${code} copied`);
    } catch {
      notify(`Use code ${code} at checkout`);
    }
  };
  return (
    <div className="grid-4">
      {OFFERS.slice(0, limit || OFFERS.length).map((o) => (
        <div className="offer-card" key={o.code}>
          <span className="badge badge-accent" style={{ alignSelf: 'flex-start' }}>{o.tag}</span>
          <h3>{o.title}</h3>
          <p>{o.text}</p>
          <div className="offer-code">
            {o.code}
            <button onClick={() => copy(o.code)}>Copy</button>
          </div>
          <Link to="/cars" className="link">Book a car</Link>
        </div>
      ))}
    </div>
  );
}
