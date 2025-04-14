const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

const sequelize = require('./config/database');

// Import models
const User = require('./models/User');
const Category = require('./models/Category');
const Expense = require('./models/Expense');
const Budget = require('./models/Budget');
const Notification = require('./models/Notification');

// Import routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const budgetRoutes = require('./routes/budgets');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://expense-tracker8887735.netlify.app'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Add a root route to confirm API is working
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Expense Tracker API is running',
    endpoints: ['/api/auth', '/api/expenses', '/api/categories', '/api/budgets', '/api/analytics', '/api/dashboard']
  });
});

// Add a route to show API status
app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    message: 'API endpoints are available',
    routes: [
      { path: '/api/auth/register', method: 'POST', description: 'Register a new user' },
      { path: '/api/auth/login', method: 'POST', description: 'Login user' },
      { path: '/api/auth/me', method: 'GET', description: 'Get current user' }
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl}`,
        suggestion: 'Check the API documentation for correct endpoints'
    });
});

const PORT = process.env.PORT || 5001;

// Default categories that will be created for each user
const DEFAULT_CATEGORIES = [
    { name: 'Food & Dining', type: 'expense', description: 'Restaurants, groceries, and food delivery', icon: '🍽️' },
    { name: 'Transportation', type: 'expense', description: 'Public transit, fuel, car maintenance', icon: '🚗' },
    { name: 'Housing', type: 'expense', description: 'Rent, utilities, maintenance', icon: '🏠' },
    { name: 'Entertainment', type: 'expense', description: 'Movies, games, hobbies', icon: '🎮' },
    { name: 'Shopping', type: 'expense', description: 'Clothing, electronics, personal items', icon: '🛍️' },
    { name: 'Healthcare', type: 'expense', description: 'Medical expenses, medications, insurance', icon: '⚕️' },
    { name: 'Education', type: 'expense', description: 'Tuition, books, courses', icon: '📚' },
    { name: 'Bills & Utilities', type: 'expense', description: 'Phone, internet, electricity', icon: '📱' },
    { name: 'Salary', type: 'income', description: 'Regular employment income', icon: '💰' },
    { name: 'Investments', type: 'income', description: 'Stock dividends, interest, capital gains', icon: '📈' },
    { name: 'Freelance', type: 'income', description: 'Contract work and side gigs', icon: '💻' },
    { name: 'Gifts', type: 'income', description: 'Money received as gifts', icon: '🎁' }
];

const initializeDatabase = async () => {
    try {
        // First authenticate database connection
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Create enum type for category type if it doesn't exist
        try {
            await sequelize.query(`                DO $$ BEGIN
                    CREATE TYPE "public"."enum_categories_type" AS ENUM ('expense', 'income');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);
            console.log('Category enum type created or already exists');
        } catch (error) {
            console.log('Error creating enum type:', error.message);
        }

        // Sync all models - don't use force: true in production
        try {
            const force = process.env.NODE_ENV !== 'production';
            console.log(`Syncing models with force=${force}`);
            await sequelize.sync({ force });
            console.log('All models synchronized successfully');
        } catch (error) {
            console.error('Error synchronizing models:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

// Function to create default categories for a new user
const createDefaultCategories = async (userId) => {
    try {
        const now = new Date();
        const categories = DEFAULT_CATEGORIES.map(cat => ({
            ...cat,
            userId,
            createdAt: now,
            updatedAt: now
        }));

        await Category.bulkCreate(categories);
        console.log(`Default categories created for user ${userId}`);
    } catch (error) {
        console.error('Error creating default categories:', error);
        throw error;
    }
};

const startServer = async () => {
    try {
        // Only force sync in development
        if (process.env.NODE_ENV !== 'production') {
            await initializeDatabase();
        } else {
            // In production, just authenticate and create enum type if needed
            await sequelize.authenticate();
            console.log('Database connection established successfully.');
            
            try {
                await sequelize.query(`
                    DO $$ BEGIN
                        CREATE TYPE "public"."enum_categories_type" AS ENUM ('expense', 'income');
                    EXCEPTION
                        WHEN duplicate_object THEN null;
                    END $$;
                `);
                console.log('Category enum type created or already exists');
            } catch (error) {
                console.log('Error creating enum type:', error.message);
            }
            
            // Sync without force: true in production
            await sequelize.sync();
            console.log('All models synchronized successfully');
        }
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        // Export createDefaultCategories so it can be used in auth routes
        app.locals.createDefaultCategories = createDefaultCategories;
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};

startServer();
