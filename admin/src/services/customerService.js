// Customer-facing extras: wishlist, reviews, coupons, notifications, contact form.
import api, { safe } from './api';

export const fetchWishlist = () => safe(api.get('/wishlist'));
export const toggleWishlistCar = (carNo) => safe(api.post(`/wishlist/toggle/${carNo}`));
export const mergeWishlist = (carIds) => safe(api.post('/wishlist/merge', { carIds }));

export const fetchReviews = (car) => safe(api.get('/reviews', { params: car ? { car } : {} }));
export const createReview = (body) => safe(api.post('/reviews', body));

export const fetchCoupons = () => safe(api.get('/coupons'));
export const validateCouponCode = (code, days) => safe(api.post('/coupons/validate', { code, days }));

export const fetchNotifications = () => safe(api.get('/notifications'));
export const markNotificationsRead = () => safe(api.patch('/notifications/read-all'));

export const sendContactMessage = (body) => safe(api.post('/contact', body));
