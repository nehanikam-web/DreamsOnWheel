// Admin-only endpoints plus public site settings.
import api, { safe } from './api';

export const fetchSettings = () => safe(api.get('/settings'));
export const saveSettings = (body) => safe(api.put('/settings', body));
export const fetchPublicStats = () => safe(api.get('/stats/public'));

export const fetchAdminStats = () => safe(api.get('/admin/stats'));
export const fetchAdminReports = () => safe(api.get('/admin/reports'));
export const fetchCustomers = () => safe(api.get('/admin/customers'));
export const setCustomerStatus = (id, status) => safe(api.patch(`/admin/customers/${id}/status`, { status }));

export const fetchDrivers = () => safe(api.get('/drivers'));
export const createDriver = (body) => safe(api.post('/drivers', body));
export const editDriver = (id, body) => safe(api.put(`/drivers/${id}`, body));
export const removeDriver = (id) => safe(api.delete(`/drivers/${id}`));

export const deleteReviewById = (id) => safe(api.delete(`/reviews/${id}`));
