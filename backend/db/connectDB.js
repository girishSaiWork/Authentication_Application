import pg from 'pg';
import express from 'express';

const { Client } = pg;
export const client = async () => {
    try {
        const connectionString = process.env.POSTGRES_URL; // Ensure this is set correctly
        if (!connectionString) {
            throw new Error('Connection string is not defined');
        }
        
        const client = new Client({
            connectionString: connectionString
        });
        await client.connect();
        console.log('Connected to PostgreSQL');
        return client;
    } catch (error) {
        console.error('Connection error', error.stack);
        return null;
    }
}