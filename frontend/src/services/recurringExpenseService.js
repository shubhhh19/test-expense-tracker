import api from './api';

class RecurringExpenseService {
  async processRecurringExpenses() {
    try {
      const response = await api.post('/expenses/process-recurring');
      return response.data;
    } catch (error) {
      console.error('Error processing recurring expenses:', error);
      throw error;
    }
  }

  async getRecurringExpenses() {
    try {
      const response = await api.get('/expenses', {
        params: {
          isRecurring: true
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
      throw error;
    }
  }
}

export default new RecurringExpenseService(); 