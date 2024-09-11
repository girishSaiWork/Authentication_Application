import pg from "pg";
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  // Your PostgreSQL connection details should be here
  // It's better to load these from environment variables
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

// Log connection details (remove in production)
console.log('DB Connection Details:', {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  port: process.env.POSTGRES_PORT,
  // Don't log the password
});

const User = {
  findOne: async (condition) => {
    const query = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
    const values = [condition.email];
    const result = await pool.query(query, values);
    return result.rows[0];
  },
  create: async (userData) => {
    const { name, email, password, verificationToken, verificationTokenExpires } = userData;
    const query = 'INSERT INTO users (name, email, password, verification_token, verification_token_expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [name, email, password, verificationToken, verificationTokenExpires];
    const result = await pool.query(query, values);
    return result.rows[0];
  },
  // Add more methods as needed
};

export default User;