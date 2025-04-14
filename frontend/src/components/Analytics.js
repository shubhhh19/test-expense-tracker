import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import { fetchAnalyticsTrend, fetchAnalyticsSummary, fetchAnalyticsBudget } from '../services/apiService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    monthlyTrends: [],
    categoryPatterns: [],
    budgetAnalysis: [],
  });
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    totalTransactions: 0,
    averageExpense: 0,
    topCategory: { name: '', amount: 0 },
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to view analytics');
        return;
      }

      // Set date range parameters for API calls
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);
      const startDateStr = startDate.toISOString().split('T')[0];

      const [monthlyTrends, summaryResponse, budgetAnalysis] = await Promise.all([
        fetchAnalyticsTrend(12),
        fetchAnalyticsSummary(startDateStr, endDate),
        fetchAnalyticsBudget(startDateStr, endDate)
      ]);

      console.log('Monthly Trends:', monthlyTrends.data);
      console.log('Summary:', summaryResponse.data);
      console.log('Budget Analysis:', budgetAnalysis.data);

      // Process and set data
      if (monthlyTrends.data.success &&
        summaryResponse.data.success &&
        budgetAnalysis.data.success) {

        // Calculate additional summary statistics
        const summaryData = summaryResponse.data.data;
        const categoryPatterns = summaryData.expensesByCategory || {};

        // Find top category
        let topCategory = { name: '', amount: 0 };
        Object.entries(categoryPatterns).forEach(([name, amount]) => {
          if (amount > topCategory.amount) {
            topCategory = { name, amount };
          }
        });

        // Set state
        setData({
          monthlyTrends: monthlyTrends.data.data || [],
          categoryPatterns,
          budgetAnalysis: budgetAnalysis.data.data || [],
        });

        setSummary({
          totalExpenses: summaryData.totalExpenses || 0,
          totalTransactions: summaryData.totalTransactions || 0,
          averageExpense: summaryData.totalExpenses / Math.max(1, summaryData.totalTransactions),
          topCategory,
        });
      } else {
        toast.error('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Analytics data error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const monthlyTrendsData = {
    labels: Array.isArray(data.monthlyTrends)
      ? data.monthlyTrends.map(item =>
        new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      )
      : [],
    datasets: [
      {
        label: 'Monthly Expenses',
        data: Array.isArray(data.monthlyTrends)
          ? data.monthlyTrends.map(item => item.total)
          : [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const monthlyTrendsOptions = {
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
            return `Expenses: $${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    }
  };

  const categoryPatternsData = {
    labels: data.categoryPatterns && typeof data.categoryPatterns === 'object'
      ? Object.keys(data.categoryPatterns)
      : [],
    datasets: [
      {
        label: 'Expenses by Category',
        data: data.categoryPatterns && typeof data.categoryPatterns === 'object'
          ? Object.values(data.categoryPatterns)
          : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const categoryPatternsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  const budgetAnalysisData = {
    labels: Array.isArray(data.budgetAnalysis)
      ? data.budgetAnalysis.map(item => item.category)
      : [],
    datasets: [
      {
        label: 'Budget Amount',
        data: Array.isArray(data.budgetAnalysis)
          ? data.budgetAnalysis.map(item => item.budgetedAmount)
          : [],
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
      },
      {
        label: 'Actual Spending',
        data: Array.isArray(data.budgetAnalysis)
          ? data.budgetAnalysis.map(item => item.actualSpent)
          : [],
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
      },
    ],
  };

  const budgetAnalysisOptions = {
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
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: $${value.toLocaleString()}`;
          },
          afterBody: function (context) {
            const index = context[0].dataIndex;
            if (Array.isArray(data.budgetAnalysis) && data.budgetAnalysis[index]) {
              const item = data.budgetAnalysis[index];
              const percentage = item.percentageUsed.toFixed(1);
              const remaining = item.remainingAmount.toFixed(2);
              return [
                `Percentage Used: ${percentage}%`,
                `Remaining: $${remaining}`
              ];
            }
            return [];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Category'
        }
      }
    }
  };

  // Generate textual summaries
  const generateMonthlyTrendsSummary = () => {
    if (!Array.isArray(data.monthlyTrends) || data.monthlyTrends.length === 0) {
      return "No monthly expense data available.";
    }

    const latestMonth = data.monthlyTrends[data.monthlyTrends.length - 1];
    const previousMonth = data.monthlyTrends[data.monthlyTrends.length - 2];

    if (!latestMonth || !previousMonth) {
      return `Current month expenses: $${latestMonth?.total.toLocaleString() || 0}`;
    }

    const change = latestMonth.total - previousMonth.total;
    const percentChange = ((change / previousMonth.total) * 100).toFixed(1);
    const direction = change >= 0 ? 'increased' : 'decreased';

    return `Your expenses have ${direction} by ${Math.abs(percentChange)}% compared to last month. Current month expenses: $${latestMonth.total.toLocaleString()}`;
  };

  const generateCategoryPatternsSummary = () => {
    if (!data.categoryPatterns || Object.keys(data.categoryPatterns).length === 0) {
      return "No category data available.";
    }

    if (summary.topCategory.name) {
      const percentage = ((summary.topCategory.amount / summary.totalExpenses) * 100).toFixed(1);
      return `Your highest spending category is ${summary.topCategory.name} at $${summary.topCategory.amount.toLocaleString()} (${percentage}% of total expenses).`;
    }

    return "Explore your spending distribution across different categories.";
  };

  const generateBudgetAnalysisSummary = () => {
    if (!Array.isArray(data.budgetAnalysis) || data.budgetAnalysis.length === 0) {
      return "No budget data available. Set up budgets to track your spending.";
    }

    const overBudgetItems = data.budgetAnalysis.filter(item => item.percentageUsed > 100);

    if (overBudgetItems.length > 0) {
      const categories = overBudgetItems.map(item => item.category).join(', ');
      return `You are over budget in ${overBudgetItems.length} categories: ${categories}. Consider adjusting your spending in these areas.`;
    }

    return "You're staying within budget across all categories. Keep up the good work!";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analytics
      </Typography>

      {/* Main Analytics Introduction */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Your Financial Overview
        </Typography>
        <Typography variant="body1" paragraph>
          This dashboard provides a comprehensive view of your spending habits and budget management. Use these insights to make informed financial decisions and identify areas where you can optimize your spending.
        </Typography>
        <Typography variant="body1">
          Based on your data, {summary.topCategory.name ? `your highest spending area is ${summary.topCategory.name}` : "you haven't recorded enough transactions to establish spending patterns yet"}.
          {data.budgetAnalysis.length > 0 ?
            (data.budgetAnalysis.some(item => item.percentageUsed > 100) ?
              " You have exceeded your budget in at least one category - review the details below to adjust your spending." :
              " You're staying within your budget across all categories - great job!") :
            " Set up budget targets to track your spending against goals."}
        </Typography>
      </Paper>

      {/* Summary Cards */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Key Metrics
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        These cards summarize your overall financial activity. The total expenses show your cumulative spending, while transactions count indicates how frequently you're spending. The top category highlights where most of your money is going.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h4">${summary.totalExpenses.toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">
                From {data.monthlyTrends.length} months of data
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {summary.totalExpenses > 5000 ?
                  "This is a significant amount. Consider reviewing your largest expenses." :
                  "Your spending appears to be moderate. Continue monitoring to maintain this level."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Transactions
              </Typography>
              <Typography variant="h4">{summary.totalTransactions}</Typography>
              <Typography variant="body2" color="text.secondary">
                Average: ${summary.averageExpense.toFixed(2)} per transaction
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {summary.averageExpense > 1000 ?
                  "Your average transaction is quite high. Focus on reducing larger expenses." :
                  "Your average transaction size is reasonable. Watch for frequent small purchases that can add up."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Top Category
              </Typography>
              <Typography variant="h4">{summary.topCategory.name || 'None'}</Typography>
              <Typography variant="body2" color="text.secondary">
                ${summary.topCategory.amount.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {summary.topCategory.name ?
                  `This category accounts for approximately ${((summary.topCategory.amount / summary.totalExpenses) * 100).toFixed(1)}% of your total spending. ${((summary.topCategory.amount / summary.totalExpenses) * 100) > 50 ? "Consider diversifying your expenses." : "Your spending appears well-distributed."}` :
                  "Add more transactions to see your spending patterns by category."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Expense Trends
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {generateMonthlyTrendsSummary()}
            </Typography>
            <Typography variant="body1" paragraph>
              This section breaks down your spending by month, allowing you to track spending trends over time. Months with higher than usual spending may indicate one-time large purchases or opportunities to cut back. The percentage change shows how your spending compares to the previous month.
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Monthly breakdown */}
            <Box sx={{ p: 2 }}>
              {data.monthlyTrends.length > 0 ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Monthly Breakdown
                    </Typography>
                  </Grid>

                  {data.monthlyTrends.map((month, index) => {
                    const date = new Date(month.month);
                    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    const isLatest = index === data.monthlyTrends.length - 1;

                    // Calculate percent change from previous month
                    let changeText = '';
                    if (index > 0) {
                      const prevMonth = data.monthlyTrends[index - 1];
                      const change = month.total - prevMonth.total;
                      const percentChange = ((change / prevMonth.total) * 100).toFixed(1);
                      const direction = change >= 0 ? 'up' : 'down';
                      changeText = `${direction === 'up' ? '▲' : '▼'} ${Math.abs(percentChange)}%`;
                    }

                    return (
                      <Grid item xs={12} sm={6} md={4} key={monthName}>
                        <Paper
                          elevation={isLatest ? 3 : 1}
                          sx={{
                            p: 2,
                            borderLeft: isLatest ? '4px solid #4caf50' : 'none',
                            bgcolor: isLatest ? 'rgba(76, 175, 80, 0.08)' : 'inherit'
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight={isLatest ? 'bold' : 'regular'}>
                            {monthName}
                            {isLatest && ' (Current)'}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="h5">${month.total.toLocaleString()}</Typography>
                            {changeText && (
                              <Typography
                                variant="body2"
                                color={changeText.includes('▲') ? 'error.main' : 'success.main'}
                              >
                                {changeText}
                              </Typography>
                            )}
                          </Box>
                          {index > 0 && (
                            <Typography variant="body2" sx={{ mt: 1, fontSize: '0.75rem' }}>
                              {changeText.includes('▲') ?
                                `Increased from previous month. Check for unusual expenses.` :
                                `Decreased from previous month. Good job controlling expenses!`}
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Typography variant="body1" align="center">
                  No monthly expense data available
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Category
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {generateCategoryPatternsSummary()}
            </Typography>
            <Typography variant="body1" paragraph>
              This chart visualizes how your spending is distributed across different categories. Larger segments represent areas where you spend more money. Understanding your spending distribution can help identify areas where you might want to cut back or reallocate funds.
              {Object.keys(data.categoryPatterns).length > 0 &&
                ` Categories representing more than 30% of your spending may need closer examination.`}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 400 }}>
              <Doughnut data={categoryPatternsData} options={categoryPatternsOptions} />
            </Box>
            {Object.keys(data.categoryPatterns).length > 1 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Analysis:</strong> Your spending is {Object.keys(data.categoryPatterns).length > 3 ? 'diversified' : 'concentrated in a few categories'}.
                  {summary.topCategory.name && ((summary.topCategory.amount / summary.totalExpenses) * 100) > 40 ?
                    ` ${summary.topCategory.name} dominates your expenses at ${((summary.topCategory.amount / summary.totalExpenses) * 100).toFixed(1)}%.` :
                    ' No single category dominates your spending excessively.'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Budget Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {generateBudgetAnalysisSummary()}
            </Typography>
            <Typography variant="body1" paragraph>
              This comparison shows how your actual spending aligns with your budget goals for each category. Blue bars represent your budgeted amounts, while red bars show what you've actually spent. When red bars exceed blue bars, you've gone over budget in that category.
              {data.budgetAnalysis.length > 0 && ' Look for categories where you consistently stay under budget - you might be able to reallocate those funds.'}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 400 }}>
              <Bar data={budgetAnalysisData} options={budgetAnalysisOptions} />
            </Box>
            {data.budgetAnalysis.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Insight:</strong> {data.budgetAnalysis.every(item => item.percentageUsed <= 100) ?
                    'You\'re maintaining spending within your budget limits across all categories.' :
                    `You've exceeded your budget in ${data.budgetAnalysis.filter(item => item.percentageUsed > 100).length} out of ${data.budgetAnalysis.length} categories.`}
                  {data.budgetAnalysis.some(item => item.percentageUsed < 70) && ' Some categories are significantly under budget, which could allow for reallocation of funds.'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Analytics;