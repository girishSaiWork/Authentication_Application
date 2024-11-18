import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user_model.js";
import { getVerificationCode } from "../utils/getVerificationCode.js";
import { generateJWTTokenAndSetCookie } from "../utils/generateJWTTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendResetPasswordEmail, sendPasswordResetSuccessEmail } from "../mailtrap/emails.js";

const register = async (req, res) => {
    console.log('Register request body:', req.body);

    if (!req.body) {
        return res.status(400).json({
            success: false,
            message: "Request body is missing"
        });
    }

    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            throw new Error("All fields are required");
        }

        const userAlreadyExists = await User.findOne({ email });
        console.log("User exists check:", { email, exists: !!userAlreadyExists });
        
        if (userAlreadyExists) {
            return res.status(400).json({
                success: false, 
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = getVerificationCode();
        
        console.log("Creating user with:", { 
            name, 
            email,
            verificationCode,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
        });

        const user = await User.create({ 
            name, 
            email, 
            password: hashedPassword,
            verificationToken: verificationCode,
            verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours
        });

        console.log("User created:", user);

        // JWT token
        const token = generateJWTTokenAndSetCookie(user.id, res);
        console.log("JWT token generated:", token);

        try {
            await sendVerificationEmail(user.email, verificationCode);
            console.log("Verification email sent");
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            // Continue with registration even if email fails
        }

        return res.status(201).json({
            success: true, 
            message: "User created successfully", 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                is_verified: user.is_verified
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(400).json({
            success: false, 
            message: error.message || "Registration failed"
        });
    }
};

const login = async (req, res) => {
    console.log('Login request body:', req.body);
    
    const { email, password } = req.body;
    try {
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Request body is missing"
            });
        }

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });
        console.log("User found:", { email, found: !!user });
        
        if (!user) {
            return res.status(400).json({
                success: false, 
                message: "User not found"
            });
        }

        // For the existing user with plain text password
        let isPasswordCorrect;
        if (user.password === 'password') {
            // Handle the plain text password case
            isPasswordCorrect = password === 'password';
            if (isPasswordCorrect) {
                // Update the password to be hashed
                const hashedPassword = await bcrypt.hash(password, 10);
                await User.updatePassword(user.id, hashedPassword);
                console.log("Updated plain text password to hash");
            }
        } else {
            // Normal password comparison
            isPasswordCorrect = await bcrypt.compare(password, user.password);
        }

        console.log("Password check:", { correct: isPasswordCorrect });

        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false, 
                message: "Invalid password"
            });
        }

        const token = generateJWTTokenAndSetCookie(user.id, res);
        console.log("JWT token generated:", token);

        // Update lastLogin
        const updatedUser = await User.updateLastLogin(user.id);
        console.log("Last login updated");

        return res.status(200).json({
            success: true, 
            message: "Login successful",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                is_verified: updatedUser.is_verified,
                last_login: updatedUser.last_login
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(400).json({
            success: false, 
            message: error.message || "Login failed"
        });
    }
};

const logout = async (req, res) => {
    res.cookie("authtoken", "", { maxAge: 0 });
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

const forgotPassword = async (req, res) => {
    console.log('Forgot password request:', req.body);
    
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        await User.updateResetPasswordToken(email, resetToken, resetTokenExpires);
        
        try {
            await sendResetPasswordEmail(email, resetToken);
            console.log("Reset password email sent");
        } catch (emailError) {
            console.error("Failed to send reset password email:", emailError);
            throw new Error("Failed to send reset password email");
        }

        res.status(200).json({
            success: true,
            message: "Password reset email sent"
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to process forgot password request"
        });
    }
};

const resetPassword = async (req, res) => {
    console.log('Reset password request:', req.body);
    
    try {
        const { token, password } = req.body;
        const user = await User.findByResetToken(token);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.updatePassword(user.id, hashedPassword);
        
        try {
            await sendPasswordResetSuccessEmail(user.email);
            console.log("Password reset success email sent");
        } catch (emailError) {
            console.error("Failed to send password reset success email:", emailError);
            // Continue even if email fails
        }

        res.status(200).json({
            success: true,
            message: "Password reset successful"
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to reset password"
        });
    }
};

const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {
        console.log('Received verification code:', code);
        console.log('Current time:', new Date());

        const user = await User.findByVerificationToken(code);

        console.log('Found user:', user);

        if (!user) {
            return res.status(400).json({
                success: false, message: "Invalid or expired verification code"
            });
        }

        // update the user's email verification status
        const updatedUser = await User.verifyUser(user.id);

        console.log('Updated user:', updatedUser);

        await sendWelcomeEmail(updatedUser.email, updatedUser.name);

        return res.status(200).json({
            success: true, 
            message: "Email verified successfully",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                is_verified: updatedUser.is_verified
            }
        });
        
    } catch (error) {
        console.error('Error in verifyEmail function:', error);
        return res.status(400).json({
            success: false, message: error.message
        });
    }
}

const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                is_verified: user.is_verified
            }
        });
    } catch (error) {
        console.error('Check auth error:', error);
        res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
};

export { register, login, logout, forgotPassword, resetPassword, checkAuth, verifyEmail };
