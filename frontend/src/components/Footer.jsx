import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { settings } = useApp();
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo light />
          <p className="footer-text">{settings.tagline}. Self drive and chauffeur driven cars across Maharashtra and major Indian cities.</p>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/services">Services</Link>
          <Link to="/offers">Offers</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div>
          <h4>Rent a Car</h4>
          <Link to="/cars">Explore Cars</Link>
          <Link to="/compare">Compare Cars</Link>
          <Link to="/track">Track Booking</Link>
          <Link to="/profile">My Bookings</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <p className="footer-line"><MapPin size={15} /> {settings.address}</p>
          <p className="footer-line"><Phone size={15} /> {settings.phone}</p>
          <p className="footer-line"><Mail size={15} /> {settings.email}</p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.</span>
          <span>*****</span>
        </div>
      </div>
    </footer>
  );
}
