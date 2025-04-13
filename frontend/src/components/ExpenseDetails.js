import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Chip
} from '@mui/material';
import { format } from 'date-fns';

const ExpenseDetails = ({ expense, onEdit, onDelete }) => {
  const handleViewReceipt = () => {
    window.open(expense.receipt, '_blank');
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Expense Details
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={onEdit}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={onDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Amount: ${expense.amount}
          </Typography>
          {expense.isRecurring && (
            <Chip
              label={`Recurring: ${expense.recurringFrequency}`}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        <Typography variant="body1">
          <strong>Description:</strong> {expense.description}
        </Typography>

        <Typography variant="body1">
          <strong>Date:</strong> {format(new Date(expense.date), 'MMM dd, yyyy')}
        </Typography>

        <Typography variant="body1">
          <strong>Category:</strong> {expense.Category?.name}
        </Typography>

        {expense.note && (
          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Note:</strong>
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                {expense.note}
              </Typography>
            </Paper>
          </Box>
        )}

        {expense.receipt && (
          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Receipt:</strong>
            </Typography>
            <Button
              variant="outlined"
              onClick={handleViewReceipt}
            >
              View Receipt
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ExpenseDetails; 