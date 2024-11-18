import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
});

// Test database connection
const client = async () => {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL database');
        client.release();
    } catch (error) {
        console.error('Database connection error:', error.message);
        throw error;
    }
};

// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    process.exit(-1);
});

export { pool as default, client };