import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    monthlyExpenses: 0,
    monthlyBudget: 0,
    recentExpenses: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login to view dashboard');
          return;
        }
        const response = await api.get('/api/dashboard');

        console.log('Dashboard data:', response.data);

        if (response.data.success) {
          setStats(response.data.data);
        } else {
          toast.error(response.data.message || 'Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Dashboard data error:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const chartData = {
    labels: Array.isArray(stats.recentExpenses)
      ? stats.recentExpenses.map(expense =>
        new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      )
      : [],
    datasets: [
      {
        label: 'Daily Expenses',
        data: Array.isArray(stats.recentExpenses)
          ? stats.recentExpenses.map(expense => expense.amount)
          : [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Amount: $${context.parsed.y.toLocaleString()}`;
          },
          title: function (context) {
            return context[0].label;
          }
        }
      },
      title: {
        display: true,
        text: 'Expense Trend',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)'
        },
        ticks: {
          callback: function (value) {
            return '$' + value.toLocaleString();
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const budgetProgress = (stats.monthlyExpenses / stats.monthlyBudget) * 100;
  const isOverBudget = budgetProgress > 100;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/expenses/new')}
          sx={{ borderRadius: 2 }}
        >
          Add Expense
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard>
            <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6" color="text.secondary">
                Total Expenses
              </Typography>
              <Typography variant="h4">
                ${stats.totalExpenses.toLocaleString()}
              </Typography>
            </Box>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard>
            <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
            <Box>
              <Typography variant="h6" color="text.secondary">
                Monthly Budget
              </Typography>
              <Typography variant="h4">
                ${stats.monthlyBudget.toLocaleString()}
              </Typography>
            </Box>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard>
            <TrendingDownIcon
              sx={{
                fontSize: 40,
                color: isOverBudget ? 'error.main' : 'success.main'
              }}
            />
            <Box>
              <Typography variant="h6" color="text.secondary">
                Monthly Expenses
              </Typography>
              <Typography
                variant="h4"
                color={isOverBudget ? 'error.main' : 'inherit'}
              >
                ${stats.monthlyExpenses.toLocaleString()}
              </Typography>
            </Box>
          </StatCard>
        </Grid>

        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Expense Trend
            </Typography>
            <Box sx={{ height: 400 }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 