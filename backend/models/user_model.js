import pool from "../db/connectDB.js";
import dotenv from 'dotenv';

dotenv.config();

const User = {
  findOne: async (condition) => {
    const query = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
    const values = [condition.email];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  create: async (userData) => {
    const { name, email, password, verificationToken, verificationTokenExpires } = userData;
    const query = `
      INSERT INTO users (
        name, 
        email, 
        password, 
        verification_token, 
        verification_token_expires_at,
        created_at,
        updated_at
      ) 
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
      RETURNING *
    `;
    const values = [name, email, password, verificationToken, verificationTokenExpires];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  findByVerificationToken: async (token) => {
    const query = 'SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires_at > NOW() LIMIT 1';
    const values = [token];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  verifyUser: async (userId) => {
    const query = `
      UPDATE users 
      SET 
        is_verified = true, 
        verification_token = NULL, 
        verification_token_expires_at = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `;
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  updateLastLogin: async (userId) => {
    const query = `
      UPDATE users 
      SET 
        last_login = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `;
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  updateResetPasswordToken: async (email, resetToken, resetTokenExpires) => {
    const query = `
      UPDATE users 
      SET 
        reset_password_token = $2, 
        reset_password_token_expires_at = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE email = $1 
      RETURNING *
    `;
    const values = [email, resetToken, resetTokenExpires];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  findByResetToken: async (token) => {
    const query = 'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_token_expires_at > NOW() LIMIT 1';
    const values = [token];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  updatePassword: async (userId, newPassword) => {
    const query = `
      UPDATE users 
      SET 
        password = $2, 
        reset_password_token = NULL, 
        reset_password_token_expires_at = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `;
    const values = [userId, newPassword];
    const result = await pool.query(query, values);
    return result.rows[0];
  },
};

export default User;