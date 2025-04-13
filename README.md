# Expense Tracker Application

A full-stack expense tracking application with user authentication, budget management, and real-time notifications.

## Features

- User Authentication
  - Email registration with verification
  - Login with email and password
  - Password reset functionality
  - Profile management with profile picture upload

- Expense Management
  - Add, edit, and delete expenses
  - Categorize expenses
  - Track expense history
  - View expense statistics

- Budget Management
  - Create and manage budgets
  - Set budget limits
  - Receive budget alerts
  - Track budget progress

- Notifications
  - Real-time budget alerts
  - Email notifications
  - Toast notifications for important updates

## Tech Stack

### Frontend
- React.js
- Material-UI
- React Router
- React Context API
- Axios
- React Toastify
- Formik
- Yup

### Backend
- Node.js
- Express.js
- Sequelize ORM
- MySQL
- JWT Authentication
- Nodemailer
- Multer (for file uploads)

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd expense-tracker
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```env
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=expense_tracker
JWT_SECRET=your_jwt_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
FRONTEND_URL=http://localhost:3000
```

5. Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

## Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE expense_tracker;
```

2. Run database migrations:
```bash
cd backend
npx sequelize-cli db:migrate
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/verify-email - Verify email
- POST /api/auth/forgot-password - Request password reset
- POST /api/auth/reset-password - Reset password
- GET /api/auth/me - Get current user
- PUT /api/auth/me - Update user profile

### Expenses
- GET /api/expenses - Get all expenses
- POST /api/expenses - Create new expense
- PUT /api/expenses/:id - Update expense
- DELETE /api/expenses/:id - Delete expense

### Budgets
- GET /api/budgets - Get all budgets
- POST /api/budgets - Create new budget
- PUT /api/budgets/:id - Update budget
- DELETE /api/budgets/:id - Delete budget
- GET /api/budgets/alerts - Get budget alerts
- GET /api/budgets/notifications - Get notifications

## Dependencies

### Backend Dependencies
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "express-validator": "^7.0.1",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "mysql2": "^3.2.0",
    "nodemailer": "^6.9.1",
    "sequelize": "^6.31.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "sequelize-cli": "^6.5.2"
  }
}
```

### Frontend Dependencies
```json
{
  "dependencies": {
    "@emotion/react": "^11.10.6",
    "@emotion/styled": "^11.10.6",
    "@mui/icons-material": "^5.11.16",
    "@mui/material": "^5.13.0",
    "axios": "^1.4.0",
    "formik": "^2.2.9",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.1",
    "react-scripts": "5.0.1",
    "react-toastify": "^9.1.2",
    "yup": "^1.1.1"
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 