import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the backend root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Validate required environment variables
const requiredEnvVars = [
    'POSTGRES_USER',
    'POSTGRES_HOST',
    'POSTGRES_DB',
    'POSTGRES_PASSWORD',
    'POSTGRES_PORT'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    throw new Error('Missing required environment variables');
}

// Log database configuration (without sensitive info)
console.log('Database Configuration:', {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT
});

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    // Add some connection settings
    connectionTimeoutMillis: 5000, // 5 seconds
    idleTimeoutMillis: 30000 // 30 seconds
});

// Test database connection
const client = async () => {
    let testClient;
    try {
        testClient = await pool.connect();
        console.log('Successfully connected to PostgreSQL database');
        return true;
    } catch (error) {
        console.error('Database connection error:', error.message);
        console.error('Please check your database credentials and make sure PostgreSQL is running.');
        throw error;
    } finally {
        if (testClient) {
            testClient.release();
        }
    }
};

// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    if (err.message.includes('password') || err.message.includes('authentication')) {
        console.error('Authentication failed. Please check your database credentials.');
    }
});

export { pool as default, client };