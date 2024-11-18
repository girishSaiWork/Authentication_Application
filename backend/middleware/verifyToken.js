import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    try {
        // Get token from cookie or Authorization header
        let token = req.cookies?.authtoken;

        // Fallback to Authorization header
        if (!token && req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            console.log('No token found in request');
            return res.status(401).json({ 
                success: false, 
                message: "Access denied. Please login." 
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { id: decoded.userId };
            next();
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError.message);
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false, 
                    message: "Token expired. Please login again." 
                });
            }
            return res.status(401).json({ 
                success: false, 
                message: "Invalid token. Please login again." 
            });
        }
    } catch (error) {
        console.error('Error in verifyToken middleware:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};