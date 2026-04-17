import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Expenses
export const getExpenses = () => api.get('/expenses');
export const addExpense = (data) => api.post('/expenses', data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// AI Routes
export const getAIInsights = (expenses) => api.post('/ai/insights', { expenses });
export const chatWithAI = (message, expenses) => api.post('/ai/chat', { message, expenses });
export const getSpendingPersonality = (expenses) => api.post('/ai/personality', { expenses });
export const getPrediction = (expenses) => api.post('/ai/predict', { expenses });

// Budget
export const getBudget = () => api.get('/budget');
export const setBudget = (data) => api.post('/budget', data);

export default api;
