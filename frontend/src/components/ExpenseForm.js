import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../services/api';

const ExpenseForm = ({ categories, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    amount: initialData?.amount || '',
    description: initialData?.description || '',
    date: initialData?.date ? new Date(initialData.date) : new Date(),
    categoryId: initialData?.categoryId || '',
    note: initialData?.note || '',
    isRecurring: initialData?.isRecurring || false,
    recurringFrequency: initialData?.recurringFrequency || 'monthly'
  });

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isRecurring' ? checked : value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setReceipt(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date.toISOString().split('T')[0]);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('note', formData.note);
      formDataToSend.append('isRecurring', formData.isRecurring);
      formDataToSend.append('recurringFrequency', formData.recurringFrequency);
      
      if (receipt) {
        formDataToSend.append('receipt', receipt);
      }

      if (initialData) {
        await api.put(`/expenses/${initialData.id}`, formDataToSend);
      } else {
        await api.post('/expenses', formDataToSend);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving expense:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {initialData ? 'Edit Expense' : 'Add New Expense'}
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            fullWidth
          />

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            fullWidth
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={formData.date}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
            >
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isRecurring}
                onChange={handleChange}
                name="isRecurring"
              />
            }
            label="Recurring Expense"
          />

          {formData.isRecurring && (
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                name="recurringFrequency"
                value={formData.recurringFrequency}
                onChange={handleChange}
                required
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          )}

          <Button
            variant="contained"
            component="label"
            fullWidth
          >
            Upload Receipt
            <input
              type="file"
              hidden
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
          </Button>
          {receipt && (
            <Typography variant="body2">
              Selected file: {receipt.name}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Saving...' : initialData ? 'Update Expense' : 'Add Expense'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ExpenseForm; 