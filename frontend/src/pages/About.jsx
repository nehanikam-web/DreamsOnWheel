import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import SectionHeading from '../components/SectionHeading';
import IconByName from '../components/IconByName';
import CarImage from '../components/CarImage';
import { WHY_US } from '../data/seed';
import { useApp } from '../context/AppContext';

export default function About() {
  const { cars, publicStats } = useApp();
  return (
    <>
      <PageHeader title="About Us" subtitle="A Solapur-based car rental company built around clear pricing and well-kept cars." crumbs={[{ label: 'About Us' }]} />

      <section className="section">
        <div className="container about-split">
          <CarImage src="https://loremflickr.com/900/700/car,garage?lock=31" alt="DreamsOnWheel fleet" />
          <div>
            <span className="eyebrow">Our story</span>
            <h2 style={{ marginBottom: 14 }}>Rentals that feel straightforward</h2>
            <p>DreamsOnWheel started with a simple idea: renting a car should not involve guesswork. You should know what you will pay, what you will drive and who to call if something goes wrong.</p>
            <p>Today we serve customers across Maharashtra and major cities in India with self drive cars for weekends and holidays, and chauffeur driven cars for business, weddings and outstation travel.</p>
            <p>Every car is inspected, cleaned and insured before it leaves our pickup point, and every driver is verified and trained.</p>
            <Link to="/cars" className="btn btn-primary mt">Explore our fleet</Link>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="stat-row">
            <div className="stat"><strong>{cars.length}</strong>Cars in the fleet</div>
            <div className="stat"><strong>12</strong>Car brands</div>
            <div className="stat"><strong>{publicStats.drivers}</strong>Professional drivers</div>
            <div className="stat"><strong>12</strong>Pickup points</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading center title="What we stand for" />
          <div className="grid-4">
            {WHY_US.map((w) => (
              <div className="feature" key={w.title}>
                <div className="feature-icon"><IconByName name={w.icon} /></div>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
