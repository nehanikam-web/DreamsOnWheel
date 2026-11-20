import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, CalendarCheck, Car, ExternalLink, LayoutDashboard, LogOut, Menu, MessageSquareText, Settings, UserCog, Users } from 'lucide-react';
import Logo from '../components/Logo';
import { useApp } from '../context/AppContext';
import '../styles/admin.css';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/cars', label: 'Manage Cars', icon: Car },
  { to: '/bookings', label: 'Manage Bookings', icon: CalendarCheck },
  { to: '/customers', label: 'Manage Customers', icon: Users },
  { to: '/drivers', label: 'Manage Drivers', icon: UserCog },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/reviews', label: 'Manage Reviews', icon: MessageSquareText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { logout, adminProfile } = useApp();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const current = NAV.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <aside className={`admin-side ${open ? 'open' : ''}`}>
        <Logo to="/" light />
        <div className="admin-tag">Admin Panel</div>
        <nav className="admin-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)}>
              <n.icon size={18} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-side-foot">
          <a href={SITE_URL} target="_blank" rel="noreferrer"><ExternalLink size={18} /> View website</a>
          <button onClick={handleLogout}><LogOut size={18} /> Logout</button>
        </div>
      </aside>
      {open && <div className="admin-scrim" onClick={() => setOpen(false)} />}

      <div className="admin-main">
        <header className="admin-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="icon-btn admin-menu-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
            <h1>{current?.label || 'Admin'}</h1>
          </div>
          <div className="admin-top-right">
            <div className="admin-user">
              <span className="avatar">{adminProfile.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</span>
              <span className="name">{adminProfile.name}</span>
            </div>
          </div>
        </header>
        <div className="admin-content"><Outlet /></div>
      </div>
    </div>
  );
}
