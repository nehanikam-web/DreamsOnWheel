import api, { safe } from './api';

export const fetchCars = (params) => safe(api.get('/cars', { params }));
export const fetchCar = (id) => safe(api.get(`/cars/${id}`));
export const fetchAvailability = () => safe(api.get('/cars/availability'));
export const createCar = (body) => safe(api.post('/cars', body));
export const editCar = (id, body) => safe(api.put(`/cars/${id}`, body));
export const setCarAvailability = (id, available) => safe(api.patch(`/cars/${id}/availability`, { available }));
export const removeCar = (id) => safe(api.delete(`/cars/${id}`));

// Admin image upload: returns { url, path }
export const uploadCarImage = (file) => {
  const form = new FormData();
  form.append('image', file);
  return safe(api.post('/uploads/car-image', form));
};
