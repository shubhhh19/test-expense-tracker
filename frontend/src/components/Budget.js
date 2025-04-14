import { toast } from 'react-toastify';
import api from '../utils/api';

// Remove the outdated API_BASE_URL
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const fetchBudgets = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to view budgets');
      return;
    }
    const response = await api.get('/api/budgets');
    if (response.data.success) {
      setBudgets(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching budgets:', error);
    toast.error('Failed to fetch budgets: Network Error');
  } finally {
    setLoading(false);
  }
}; 