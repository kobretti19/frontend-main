import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
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
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const brandsAPI = {
  getAll: () => api.get('/brands'),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const colorsAPI = {
  getAll: () => api.get('/colors'),
  create: (data) => api.post('/colors', data),
  update: (id, data) => api.put(`/colors/${id}`, data),
  delete: (id) => api.delete(`/colors/${id}`),
};

export const partsCategoriesAPI = {
  getAll: () => api.get('/parts-categories'),
  create: (data) => api.post('/parts-categories', data),
  update: (id, data) => api.put(`/parts-categories/${id}`, data),
  delete: (id) => api.delete(`/parts-categories/${id}`),
};

export const partsAPI = {
  getAll: () => api.get('/parts'),
  getDetailed: () => api.get('/parts/detailed'),
  getInventory: () => api.get('/parts/inventory'),
  create: (data) => api.post('/parts', data),
  update: (id, data) => api.put(`/parts/${id}`, data),
  delete: (id) => api.delete(`/parts/${id}`),
};

export const partsColorsAPI = {
  getAll: () => api.get('/parts-colors'),
  getLowStock: () => api.get('/parts-colors/low-stock'),
  getByPart: (partId) => api.get(`/parts-colors/part/${partId}`),
  create: (data) => api.post('/parts-colors', data),
  update: (id, data) => api.put(`/parts-colors/${id}`, data),
  updateQuantity: (id, data) => api.patch(`/parts-colors/${id}/quantity`, data),
  delete: (id) => api.delete(`/parts-colors/${id}`),
};

export const equipmentAPI = {
  getAll: () => api.get('/equipment'),
  getDetailed: () => api.get('/equipment/detailed'),
  getInventory: () => api.get('/equipment/inventory'),
  getLowStock: () => api.get('/equipment/low-stock'),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
};

export const inventoryAPI = {
  getTransactions: () => api.get('/inventory/transactions'),
  getByPartColor: (partColorId) =>
    api.get(`/inventory/transactions/${partColorId}`),
  createTransaction: (data) => api.post('/inventory/transactions', data),
  getStats: () => api.get('/inventory/stats'),
};


// Orders API
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getMyOrders: () => api.get('/orders/my-orders'),
  getStats: () => api.get('/orders/stats'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  updateOrderItems: (orderId, payload) =>
    api.put(`/orders/${orderId}/items`, payload),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Stock API
export const stockAPI = {
  getMovements: () => api.get('/stock/movements'),
  getLevels: () => api.get('/stock/levels'),
  getAlerts: () => api.get('/stock/alerts'),
  addStock: (data) => api.post('/stock/add', data),
  adjustStock: (data) => api.post('/stock/adjust', data),
};

// Equipment Templates API
export const equipmentTemplatesAPI = {
  getAll: () => api.get('/equipment-templates'),
  getById: (id) => api.get(`/equipment-templates/${id}`),
  create: (data) => api.post('/equipment-templates', data),
  createFromEquipment: (data) => api.post('/equipment-templates/from-equipment', data),
  update: (id, data) => api.put(`/equipment-templates/${id}`, data),
  delete: (id) => api.delete(`/equipment-templates/${id}`),
};

export default api;
