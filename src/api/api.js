import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Parts API (simplified - includes color, category, supplier)
export const partsAPI = {
  getAll: () => api.get('/parts'),
  getById: (id) => api.get(`/parts/${id}`),
  getLowStock: () => api.get('/parts/low-stock'),
  getColors: () => api.get('/parts/colors'),
  getCategories: () => api.get('/parts/categories'),
  getSuppliers: () => api.get('/parts/suppliers'),
  getByCategory: (category) =>
    api.get(`/parts/category/${encodeURIComponent(category)}`),
  getByColor: (color) => api.get(`/parts/color/${encodeURIComponent(color)}`),
  getBySupplier: (supplier) =>
    api.get(`/parts/supplier/${encodeURIComponent(supplier)}`),
  create: (data) => api.post('/parts', data),
  update: (id, data) => api.put(`/parts/${id}`, data),
  updateQuantity: (id, data) => api.patch(`/parts/${id}/quantity`, data),
  delete: (id) => api.delete(`/parts/${id}`),
};

// Equipment API (simplified - brand/category are columns)
export const equipmentAPI = {
  getAll: () => api.get('/equipment'),
  getById: (id) => api.get(`/equipment/${id}`),
  getBrands: () => api.get('/equipment/brands'),
  getCategories: () => api.get('/equipment/categories'),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
  addPart: (equipmentId, data) =>
    api.post(`/equipment/${equipmentId}/parts`, data),
  removePart: (equipmentId, partId) =>
    api.delete(`/equipment/${equipmentId}/parts/${partId}`),
  produce: (equipmentId) => api.post(`/equipment/${equipmentId}/produce`),
};

// Equipment Templates API
export const equipmentTemplatesAPI = {
  getAll: () => api.get('/equipment-templates'),
  getById: (id) => api.get(`/equipment-templates/${id}`),
  create: (data) => api.post('/equipment-templates', data),
  createFromEquipment: (data) =>
    api.post('/equipment-templates/from-equipment', data),
  createEquipment: (templateId, data) =>
    api.post(`/equipment-templates/${templateId}/create-equipment`, data),
  update: (id, data) => api.put(`/equipment-templates/${id}`, data),
  delete: (id) => api.delete(`/equipment-templates/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getStats: () => api.get('/orders/stats'),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Stock API
export const stockAPI = {
  getMovements: () => api.get('/stock/movements'),
  getMovementsByPart: (partId) => api.get(`/stock/movements/${partId}`),
  getLevels: () => api.get('/stock/levels'),
  getAlerts: () => api.get('/stock/alerts'),
  getSummary: () => api.get('/stock/summary'),
  addStock: (data) => api.post('/stock/add', data),
  adjustStock: (data) => api.post('/stock/adjust', data),
};

export default api;
