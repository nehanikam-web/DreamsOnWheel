import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// Customer area: needs a signed-in customer. (The admin panel is a separate app in /admin.)
export default function ProtectedRoute({ children }) {
  const { user } = useApp();
  const location = useLocation();
  return user ? children : <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
}
