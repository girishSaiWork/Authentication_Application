import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { client } from "./db/connectDB.js"
import authRoutes from "./routes/auth_route.js"
import User from "./models/user_model.js"
import path from 'path'
import { fileURLToPath } from 'url'

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables first
dotenv.config({ path: path.join(__dirname, '.env') });

// Validate required environment variables
const requiredEnvVars = ['PORT', 'FRONTEND_URL', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    throw new Error('Missing required environment variables');
}

const app = express()
const PORT = process.env.PORT || 5000

// Log environment variables (for debugging)
console.log('Server starting with configuration:');
console.log('Frontend URL:', process.env.FRONTEND_URL);
console.log('Node Environment:', process.env.NODE_ENV);
console.log('Port:', PORT);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Development CORS configuration
if (process.env.NODE_ENV === 'development') {
    app.use(cors({
        origin: true, // Allow all origins in development
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
        exposedHeaders: ['Set-Cookie']
    }));
    console.log('CORS configured for development - allowing all origins');
} else {
    // Production CORS configuration
    const corsOptions = {
        origin: process.env.FRONTEND_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
        exposedHeaders: ['Set-Cookie']
    };
    app.use(cors(corsOptions));
    console.log('CORS configured for production - restricted to:', process.env.FRONTEND_URL);
}

// Pre-flight OPTIONS handler
app.options('*', cors());

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