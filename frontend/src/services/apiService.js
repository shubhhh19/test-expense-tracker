import api from './api';

// Wrapper to ensure all API calls have the /api prefix
export const fetchCategories = () => api.get('/api/categories');
export const fetchBudgets = () => api.get('/api/budgets');
export const fetchExpenses = () => api.get('/api/expenses');
export const fetchDashboard = () => api.get('/api/dashboard');
export const fetchAnalyticsTrend = (months) => api.get('/api/analytics/trend', { params: { months } });
export const fetchAnalyticsSummary = (startDate, endDate) => api.get('/api/analytics/summary', { params: { startDate, endDate } });
export const fetchAnalyticsBudget = (startDate, endDate) => api.get('/api/analytics/budget-analysis', { params: { startDate, endDate } });

// Category operations
export const createCategory = (data) => api.post('/api/categories', data);
export const updateCategory = (id, data) => api.put(`/api/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/api/categories/${id}`);

// Budget operations
export const createBudget = (data) => api.post('/api/budgets', data);
export const updateBudget = (id, data) => api.put(`/api/budgets/${id}`, data);
export const deleteBudget = (id) => api.delete(`/api/budgets/${id}`);

// Expense operations
export const createExpense = (data) => api.post('/api/expenses', data);
export const updateExpense = (id, data) => api.put(`/api/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/api/expenses/${id}`); 