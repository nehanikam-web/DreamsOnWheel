import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// Admin panel: only a signed-in admin gets through, everyone else goes to the admin login.
export default function ProtectedRoute({ children }) {
  const { isAdmin } = useApp();
  const location = useLocation();
  return isAdmin ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
