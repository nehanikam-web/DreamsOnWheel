import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import SectionHeading from '../components/SectionHeading';
import CarCard from '../components/CarCard';
import Faq from '../components/Faq';
import OfferCards from '../components/OfferCards';
import IconByName from '../components/IconByName';
import { Stars } from '../components/Rating';
import { useApp } from '../context/AppContext';
import { SERVICES, TESTIMONIALS, WHY_US } from '../data/seed';

const HERO_IMG = 'https://images.pexels.com/photos/40600935/pexels-photo-40600935.jpeg';

export default function Home() {
  const { cars, recent, getCar } = useApp();
  const popular = [...cars].filter((c) => c.available).sort((a, b) => b.rating * b.reviews - a.rating * a.reviews).slice(0, 6);
  const recentCars = recent.map(getCar).filter(Boolean).slice(0, 4);

  return (
    <>
      <section className="hero">
        <img className="hero-img" src={HERO_IMG} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <div className="hero-shade" />
        <div className="container hero-inner">
          <h1>Find Your Perfect Ride.</h1>
          <p>Comfortable and affordable car rentals for city drives, family trips and business travel. Choose self drive or book a car with a professional driver.</p>
          <div className="hero-actions">
            <Link to="/cars" className="btn btn-primary btn-lg">Explore Cars</Link>
            <Link to="/offers" className="btn btn-outline btn-lg">View Offers</Link>
          </div>
          <div className="hero-points">
            <span><CheckCircle2 size={16} /> {cars.length}+ cars</span>
            <span><CheckCircle2 size={16} /> 12 brands</span>
            <span><CheckCircle2 size={16} /> Free cancellation up to 24 hrs</span>
          </div>
        </div>
      </section>

      <div className="container search-wrap"><SearchBar /></div>

      <section className="section">
        <div className="container">
          <div className="row-between">
            <SectionHeading eyebrow="Popular Cars" title="Most booked by our customers" text="Well-reviewed cars that are ready to rent." />
            <Link to="/cars" className="btn btn-outline">View all cars</Link>
          </div>
          <div className="car-grid">
            {popular.map((c) => <CarCard key={c.id} car={c} />)}
          </div>
        </div>
      </section>

      {recentCars.length > 0 && (
        <section className="section alt" style={{ paddingTop: 44, paddingBottom: 44 }}>
          <div className="container">
            <SectionHeading title="Recently viewed" />
            <div className="car-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {recentCars.map((c) => <CarCard key={c.id} car={c} />)}
            </div>
          </div>
        </section>
      )}

      <section className="section alt">
        <div className="container">
          <SectionHeading center eyebrow="Why DreamsOnWheel" title="Why Choose DreamsOnWheel?" text="Simple booking, clear pricing and well-maintained cars." />
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

      <section className="section">
        <div className="container">
          <SectionHeading center eyebrow="Services" title="Our Services" text="Whatever the trip, we have a car and a plan for it." />
          <div className="grid-3">
            {SERVICES.map((s) => (
              <div className="feature" key={s.title}>
                <div className="feature-icon"><IconByName name={s.icon} /></div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="row-between">
            <SectionHeading eyebrow="Special Offers" title="Current offers" text="Apply these codes at checkout." />
            <Link to="/offers" className="btn btn-outline">All offers</Link>
          </div>
          <OfferCards />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading center eyebrow="Testimonials" title="What our customers say" />
          <div className="grid-3">
            {TESTIMONIALS.slice(0, 3).map((t) => (
              <figure className="quote" key={t.name} style={{ margin: 0 }}>
                <Stars value={t.rating} />
                <p>{t.text}</p>
                <figcaption className="quote-who">
                  <span className="avatar">{t.name.split(' ').map((n) => n[0]).join('')}</span>
                  <span><strong>{t.name}</strong><small>{t.city}</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHeading center eyebrow="FAQ" title="Frequently asked questions" />
          <Faq />
        </div>
      </section>

      <section className="cta-band">
        <div className="container row-between">
          <div>
            <h2>Ready to hit the road?</h2>
            <p>Pick a car and book in under three minutes.</p>
          </div>
          <Link to="/cars" className="btn btn-primary btn-lg">Browse Cars</Link>
        </div>
      </section>
    </>
  );
}
