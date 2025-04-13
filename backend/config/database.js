const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Use DATABASE_URL if available (production/Neon), otherwise use individual parameters
if (process.env.DATABASE_URL) {
    // For production with Neon
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Use in case of certificate issues
            }
        },
        logging: process.env.NODE_ENV === 'production' ? false : console.log
    });
} else {
    // For local development
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: 'postgres',
            logging: console.log
        }
    );
}

// Test the connection and create database if it doesn't exist
const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
};

initializeDatabase();

module.exports = sequelize; 