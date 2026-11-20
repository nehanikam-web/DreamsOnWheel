import api, { safe } from './api';

export const registerUser = (body) => safe(api.post('/auth/register', body));
export const loginUser = (body) => safe(api.post('/auth/login', body));
export const loginAdmin = (body) => safe(api.post('/auth/admin/login', body));
export const fetchMe = () => safe(api.get('/auth/me'));
export const updateMyProfile = (body) => safe(api.put('/auth/profile', body));
export const changeMyPassword = (body) => safe(api.put('/auth/password', body));
export const logoutUser = () => safe(api.post('/auth/logout'));
