import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, role) => api.post('/auth/register', { email, password, role }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.patch(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const branchesAPI = {
  getAll: () => api.get('/branchs'),
  getById: (id) => api.get(`/branchs/${id}`),
  create: (data) => api.post('/branchs', data),
  update: (id, data) => api.patch(`/branchs/${id}`, data),
  delete: (id) => api.delete(`/branchs/${id}`),
};

export const transactionsAPI = {
  getAll: () => api.get('/transactions'),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  getDailyReport: () => api.get('/transactions/daily-report'),
};

export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  create: (data) => api.post('/payments', data),
  getByTransaction: (transactionId) => api.get(`/payments/transaction/${transactionId}`),
};

export const debtsAPI = {
  getAll: () => api.get('/debt'),
  getById: (id) => api.get(`/debt/${id}`),
  create: (data) => api.post('/debt', data),
  update: (id, data) => api.patch(`/debt/${id}`, data),
};

export const reportsAPI = {
  getDailyReport: () => api.get('/reports/daily'),
  getWeeklyReport: () => api.get('/reports/weekly'),
  getMonthlyReport: () => api.get('/reports/monthly'),
  getYearlyReport: () => api.get('/reports/yearly'),
};

export default api;
