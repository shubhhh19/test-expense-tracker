import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert
} from '@mui/material';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const ExpenseForm = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data || []);
        if (response.data?.length > 0) {
          setCategory(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const validateForm = () => {
    if (!description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (!category) {
      setError('Please select a category');
      return false;
    }
    if (!date) {
      setError('Please select a date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const expenseData = {
        description: description.trim(),
        amount: parseFloat(amount),
        date: date, // Already in YYYY-MM-DD format from the date input
        categoryId: category,
        isRecurring: false,
        recurringFrequency: null
      };

      await api.post('/expenses', expenseData);

      toast.success('Expense added successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error adding expense:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add expense';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Add Expense
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            required
            disabled={isLoading}
            error={!!error && error.includes('Description')}
          />
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            margin="normal"
            required
            disabled={isLoading}
            error={!!error && error.includes('amount')}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              inputProps: { min: "0", step: "0.01" }
            }}
          />
          <FormControl fullWidth margin="normal" error={!!error && error.includes('category')}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={isLoading || categories.length === 0}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            margin="normal"
            required
            disabled={isLoading}
            error={!!error && error.includes('date')}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Adding Expense...' : 'Add Expense'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ExpenseForm; 