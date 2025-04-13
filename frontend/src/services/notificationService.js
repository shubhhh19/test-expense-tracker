import { toast } from 'react-toastify';
import api from './api';

class NotificationService {
  constructor() {
    this.checkInterval = 5 * 60 * 1000; // 5 minutes
    this.intervalId = null;
    console.log('NotificationService initialized');
  }

  start() {
    const token = localStorage.getItem('token');
    console.log('Starting notification service...', { hasToken: !!token });
    
    if (!token) {
      console.log('No authentication token found, notification service will not start');
      return;
    }

    this.checkNotifications();
    this.intervalId = setInterval(() => this.checkNotifications(), this.checkInterval);
    console.log('Notification service started, checking every', this.checkInterval / 1000, 'seconds');
  }

  stop() {
    console.log('Stopping notification service...');
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Notification service stopped');
    } else {
      console.log('Notification service was not running');
    }
  }

  async checkNotifications() {
    try {
      console.log('Checking notifications...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No authentication token found during check, skipping');
        return;
      }

      // Check budget alerts
      console.log('Fetching budget alerts...');
      const alertsResponse = await api.get('/budgets/alerts');
      console.log('Budget alerts response:', alertsResponse.data);
      
      if (alertsResponse.data.success && alertsResponse.data.data.length > 0) {
        console.log('Found', alertsResponse.data.data.length, 'budget alerts');
        alertsResponse.data.data.forEach(alert => {
          this.showAlert(alert);
        });
      } else {
        console.log('No budget alerts found');
      }

      // Check notifications
      console.log('Fetching notifications...');
      const notificationsResponse = await api.get('/budgets/notifications');
      console.log('Notifications response:', notificationsResponse.data);
      
      if (notificationsResponse.data.success && notificationsResponse.data.data.length > 0) {
        console.log('Found', notificationsResponse.data.data.length, 'notifications');
        notificationsResponse.data.data.forEach(notification => {
          if (!notification.isRead) {
            this.showNotification(notification);
          }
        });
      } else {
        console.log('No notifications found');
      }
    } catch (error) {
      console.error('Error checking notifications:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  }

  showAlert(alert) {
    console.log('Showing alert:', alert);
    if (alert.isExceeded) {
      toast.error(alert.message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.warning(alert.message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }

  showNotification(notification) {
    console.log('Showing notification:', notification);
    if (notification.type === 'budget_exceeded') {
      toast.error(notification.message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.warning(notification.message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }
}

const notificationService = new NotificationService();
export default notificationService; 