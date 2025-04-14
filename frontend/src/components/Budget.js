import { toast } from 'react-toastify';
import { fetchBudgets } from '../services/apiService';

// Remove the outdated API_BASE_URL
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const fetchBudgetsData = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to view budgets');
      return;
    }
    const response = await fetchBudgets();
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