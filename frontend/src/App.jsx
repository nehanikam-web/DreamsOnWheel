import { Route, Routes } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import SiteLayout from './components/SiteLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';

import Home from './pages/Home';
import CarListing from './pages/CarListing';
import CarDetails from './pages/CarDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import Invoice from './pages/Invoice';
import TrackBooking from './pages/TrackBooking';
import Profile from './pages/Profile';
import Compare from './pages/Compare';
import Offers from './pages/Offers';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';


export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public website */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<CarListing />} />
          <Route path="/cars/:id" element={<CarDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/track" element={<TrackBooking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Customer area */}
          <Route path="/book/:carId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/booking/confirmation/:id" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
          <Route path="/invoice/:id" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toast />
    </>
  );
}
