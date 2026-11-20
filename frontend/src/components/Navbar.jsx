import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, GitCompare, Heart, LogOut, Menu, Moon, Sun, User, X } from 'lucide-react';
import Logo from './Logo';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/pricing';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/cars', label: 'Explore Cars' },
  { to: '/about', label: 'About Us' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
];

function NotificationMenu() {
  const { notifications, markNotificationsRead } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const toggle = () => {
    if (!open) markNotificationsRead();
    setOpen(!open);
  };

  return (
    <div className="dropdown-wrap" ref={ref}>
      <button className="icon-btn nav-icon" onClick={toggle} aria-label="Notifications">
        <Bell size={19} />
        {unread > 0 && <span className="count-dot">{unread}</span>}
      </button>
      {open && (
        <div className="dropdown notif-dropdown">
          <div className="dropdown-title">Notifications</div>
          {notifications.length === 0 && <p className="muted pad">You have no notifications.</p>}
          {notifications.slice(0, 8).map((n) => (
            <div key={n.id} className="notif-item">
              <p>{n.text}</p>
              <small className="muted">{formatDate(n.date)}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout, theme, setTheme, wishlist, compare } = useApp();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Logo />

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <div className="nav-auth-mobile">
            {user ? (
              <>
                <Link to="/profile" className="btn btn-outline" onClick={() => setOpen(false)}>My Account</Link>
                <button className="btn btn-dark" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </nav>

        <div className="nav-actions">
          
          <Link to="/compare" className="icon-btn nav-icon" aria-label="Compare cars">
            <GitCompare size={19} />
            {compare.length > 0 && <span className="count-dot">{compare.length}</span>}
          </Link>
          <Link to="/profile?tab=favourites" className="icon-btn nav-icon" aria-label="Favourites">
            <Heart size={19} />
            {wishlist.length > 0 && <span className="count-dot">{wishlist.length}</span>}
          </Link>
          {user && <NotificationMenu />}
          <div className="nav-auth-desktop">
            {user ? (
              <>
                <Link to="/profile" className="nav-user"><User size={16} /> {user.name.split(' ')[0]}</Link>
                <button className="icon-btn nav-icon" onClick={handleLogout} aria-label="Logout"><LogOut size={19} /></button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
          </div>
          <button className="icon-btn nav-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
