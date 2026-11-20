import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';

import AdminLogin from './pages/AdminLogin';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import ManageCars from './pages/ManageCars';
import ManageBookings from './pages/ManageBookings';
import ManageCustomers from './pages/ManageCustomers';
import ManageDrivers from './pages/ManageDrivers';
import ManageReviews from './pages/ManageReviews';
import Reports from './pages/Reports';
import AdminSettings from './pages/AdminSettings';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="cars" element={<ManageCars />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="customers" element={<ManageCustomers />} />
          <Route path="drivers" element={<ManageDrivers />} />
          <Route path="reviews" element={<ManageReviews />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  );
}
