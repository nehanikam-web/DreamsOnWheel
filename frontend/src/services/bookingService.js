import api, { safe } from './api';

export const quoteBooking = (body) => safe(api.post('/bookings/quote', body));
export const createBooking = (body) => safe(api.post('/bookings', body));
export const fetchMyBookings = () => safe(api.get('/bookings/my'));
export const fetchAllBookings = () => safe(api.get('/bookings'));
export const fetchBooking = (id) => safe(api.get(`/bookings/${id}`));
export const trackBooking = (id, phone) => safe(api.get(`/bookings/track/${encodeURIComponent(id)}`, { params: { phone } }));
export const cancelBooking = (id) => safe(api.patch(`/bookings/${id}/cancel`));
export const updateBookingStatus = (id, status) => safe(api.patch(`/bookings/${id}/status`, { status }));
export const completeBooking = (id) => safe(api.patch(`/bookings/${id}/complete`));
export const assignBookingDriver = (id, driverId) => safe(api.patch(`/bookings/${id}/driver`, { driverId: driverId || null }));
