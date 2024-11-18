import jwt from "jsonwebtoken";

export const generateJWTTokenAndSetCookie = async (user, res) => {
    try {
        console.log('Generating JWT token for user:', {
            id: user.id,
            email: user.email,
            isVerified: user.isVerified
        });

        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email,
                isVerified: user.isVerified 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN || "6h" }
        );

        console.log('Setting auth cookie...');
        res.cookie("authtoken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 6 * 60 * 60 * 1000 // 6 hours
        });

        console.log('JWT token generated and cookie set successfully');
        return token;
    } catch (error) {
        console.error('Error generating JWT token:', error);
        throw new Error('Failed to generate authentication token');
    }
}
