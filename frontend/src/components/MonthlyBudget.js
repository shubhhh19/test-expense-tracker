import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SchoolIcon from '@mui/icons-material/School';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import FlightIcon from '@mui/icons-material/Flight';
import PetsIcon from '@mui/icons-material/Pets';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { toast } from 'react-toastify';
import api from '../utils/api';

// Map of category icons
const categoryIcons = {
  'Food & Dining': <RestaurantIcon />,
  'Shopping': <ShoppingCartIcon />,
  'Housing': <HomeIcon />,
  'Transportation': <DirectionsCarIcon />,
  'Healthcare': <LocalHospitalIcon />,
  'Education': <SchoolIcon />,
  'Entertainment': <SportsEsportsIcon />,
  'Travel': <FlightIcon />,
  'Pets': <PetsIcon />,
  'Other': <MoreHorizIcon />
};

const BudgetCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme, value }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    backgroundColor: value > 100 ? theme.palette.error.main :
      value > 80 ? theme.palette.warning.main :
        theme.palette.success.main,
  },
}));

function MonthlyBudget() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    period: 'monthly'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      console.log('Fetching budgets...');
      const response = await api.get('/budgets');
      console.log('Budgets response:', response);
      if (response.data && response.data.success) {
        setBudgets(response.data.data);
      } else {
        console.error('Invalid budgets response format:', response);
        toast.error('Failed to load budgets: Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
      console.error('Error details:', error.response || error);
      toast.error('Failed to fetch budgets: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await api.get('/categories');
      console.log('Categories response:', response);
      if (response.data && response.data.success) {
        setCategories(response.data.data);
      } else {
        console.error('Invalid categories response format:', response);
        toast.error('Failed to load categories: Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', error.response || error);
      toast.error('Failed to fetch categories: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenDialog = (budget = null) => {
    setSelectedBudget(budget);
    setFormData({
      amount: budget ? budget.amount : '',
      categoryId: budget ? budget.categoryId : '',
      period: budget ? budget.period : 'monthly'
    });
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBudget(null);
    setFormData({ amount: '', categoryId: '', period: 'monthly' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.amount || !formData.categoryId) {
      setError('Please fill in all fields');
      return;
    }

    try {
      let startDate, endDate;

      if (formData.period === 'yearly') {
        startDate = new Date();
        startDate.setMonth(0, 1); // January 1st
        endDate = new Date();
        endDate.setMonth(11, 31); // December 31st
      } else {
        startDate = new Date();
        startDate.setDate(1); // First day of current month
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Last day of current month
      }

      const budgetData = {
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId,
        period: formData.period,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };

      if (selectedBudget) {
        await api.put(`/budgets/${selectedBudget.id}`, budgetData);
        toast.success('Budget updated successfully');
      } else {
        await api.post('/budgets', budgetData);
        toast.success('Budget added successfully');
      }

      handleCloseDialog();
      fetchBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error(error.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleDelete = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await api.delete(`/budgets/${budgetId}`);
      toast.success('Budget deleted successfully');
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  const getCategoryIcon = (categoryName) => {
    return categoryIcons[categoryName] || <MoreHorizIcon />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Monthly Budgets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Budget
        </Button>
      </Box>

      <Grid container spacing={3}>
        {budgets.map((budget) => (
          <Grid item xs={12} sm={6} md={4} key={budget.id}>
            <BudgetCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getCategoryIcon(budget.category.name)}
                  </ListItemIcon>
                  <Typography variant="h6">
                    {budget.category.name}
                  </Typography>
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => handleOpenDialog(budget)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(budget.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              <Typography variant="h5" sx={{ mb: 1 }}>
                ${parseFloat(budget.amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Spent: ${budget.spent.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
                <ProgressBar
                  variant="determinate"
                  value={Math.min(budget.percentageUsed, 100)}
                />
              </Box>

              <Typography
                variant="body2"
                color={budget.remaining < 0 ? 'error.main' : 'success.main'}
              >
                Remaining: ${budget.remaining.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </BudgetCard>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedBudget ? 'Edit Budget' : 'Add New Budget'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <ListItemIcon>
                      {getCategoryIcon(category.name)}
                    </ListItemIcon>
                    <ListItemText primary={category.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                label="Period"
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              inputProps={{ min: "0", step: "0.01" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedBudget ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MonthlyBudget; 