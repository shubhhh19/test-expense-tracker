// Production-safe database setup script
require('dotenv').config({ path: '.env.production' });
const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const User = require('./models/User');
const Category = require('./models/Category');

// Default categories to create
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

async function setupProductionDatabase() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Create enum type for category
        console.log('Creating enum type...');
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

        // Sync all models WITHOUT force (never drop tables in production)
        console.log('Syncing models safely (without dropping tables)...');
        await sequelize.sync({ force: false, alter: true });
        console.log('Models synchronized.');

        // Create test user if no users exist
        const userCount = await User.count();
        if (userCount === 0) {
            console.log('Creating demo user...');
            const user = await User.create({
                firstName: 'Demo',
                lastName: 'User',
                email: 'demo@example.com',
                password: 'password123',
                isEmailVerified: true
            });
            console.log(`Demo user created with ID: ${user.id}`);

            // Create default categories for the demo user
            console.log('Creating default categories...');
            const categories = DEFAULT_CATEGORIES.map(cat => ({
                ...cat,
                userId: user.id
            }));
            await Category.bulkCreate(categories);
            console.log('Default categories created.');
        } else {
            console.log(`Found ${userCount} existing users. Skipping demo user creation.`);
        }

        console.log('Production database setup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error setting up production database:', error);
        process.exit(1);
    }
}

setupProductionDatabase(); 