import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import IconByName from '../components/IconByName';
import { SERVICES } from '../data/seed';
import { DRIVER_RATE_BY_TYPE } from '../data/cars';
import { inr } from '../utils/pricing';

export default function Services() {
  return (
    <>
      <PageHeader title="Our Services" subtitle="Self drive, chauffeur driven and corporate rentals." crumbs={[{ label: 'Services' }]} />
      <div className="container" style={{ padding: '40px 20px 64px' }}>
        <div className="grid-3">
          {SERVICES.map((s) => (
            <div className="feature" key={s.title}>
              <div className="feature-icon"><IconByName name={s.icon} /></div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>

        <div className="panel mt" style={{ marginTop: 32 }}>
          <h3>Driver charges (per day)</h3>
          <p className="muted" style={{ marginBottom: 14 }}>Added to the car rental when you choose "With Driver". Covers up to 10 hours and 250 km a day.</p>
          <div className="stat-row">
            {Object.entries(DRIVER_RATE_BY_TYPE).map(([type, rate]) => (
              <div className="stat" key={type}><strong>{inr(rate)}</strong>{type}</div>
            ))}
          </div>
        </div>

        <div className="row-between mt" style={{ marginTop: 28 }}>
          <p className="muted">Need a long-term or corporate plan?</p>
          <Link to="/contact" className="btn btn-primary">Talk to us</Link>
        </div>
      </div>
    </>
  );
}
