import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { client } from "./db/connectDB.js"
import authRoutes from "./routes/auth_route.js"
import User from "./models/user_model.js"

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5175'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
};

// Apply CORS with options
app.use(cors(corsOptions));

// Health check
app.get("/", (req, res) => {
    res.json({ message: "Authentication API is running" });
});

// Routes
app.use("/api/auth", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message || err);
    
    // Handle CORS errors specifically
    if (err.message && err.message.includes('CORS')) {
        return res.status(403).json({
            success: false,
            message: 'CORS error: Origin not allowed'
        });
    }
    
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        });
    }

    // Handle other errors
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// Start server
app.listen(PORT, async () => {
    try {
        await client();
        console.log(`Server is running on http://localhost:${PORT}`);
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
});