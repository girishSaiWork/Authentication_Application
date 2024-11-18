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
    try {
        console.log('Login request received:', {
            email: req.body?.email,
            headers: {
                origin: req.headers?.origin,
                'content-type': req.headers?.['content-type']
            }
        });
        
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });
        console.log("User lookup result:", { 
            email, 
            found: !!user,
            verified: user?.isVerified,
            userId: user?.id
        });
        
        if (!user) {
            return res.status(400).json({
                success: false, 
                message: "Invalid email or password"
            });
        }

        // Check verification status
        if (user.isVerified !== true) {
            console.log('User not verified:', {
                userId: user.id,
                email: user.email,
                verificationStatus: user.isVerified
            });
            return res.status(400).json({
                success: false,
                message: "Please verify your email before logging in"
            });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        console.log("Password verification:", { correct: isPasswordCorrect });
        
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false, 
                message: "Invalid email or password"
            });
        }

        try {
            // Update last login time
            await User.updateLastLogin(user.id);
            console.log('Updated last login time for user:', user.id);

            // Get updated user data
            const updatedUser = await User.findOne({ email });
            
            // Generate JWT token and set cookie
            const token = await generateJWTTokenAndSetCookie(updatedUser, res);
            console.log('Login successful, token generated');

            return res.status(200).json({
                success: true,
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    isVerified: updatedUser.isVerified,
                    last_login: updatedUser.last_login
                }
            });
        } catch (tokenError) {
            console.error('Error in login process:', tokenError);
            return res.status(500).json({
                success: false,
                message: "Login failed - Please try again"
            });
        }
    } catch (error) {
        console.error("Login error:", error.message || error);
        return res.status(500).json({
            success: false,
            message: "Login failed - Please try again"
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
        console.log('Starting email verification process');
        console.log('Received verification code:', code);
        console.log('Current time:', new Date());

        const user = await User.findByVerificationToken(code);
        console.log('User lookup result:', {
            found: !!user,
            userId: user?.id,
            email: user?.email,
            currentVerificationStatus: user?.is_verified
        });

        if (!user) {
            console.log('No user found with verification token:', code);
            return res.status(400).json({
                success: false, 
                message: "Invalid or expired verification code"
            });
        }

        // update the user's email verification status
        const updatedUser = await User.verifyUser(user.id);
        console.log('User verification update result:', {
            userId: updatedUser.id,
            email: updatedUser.email,
            newVerificationStatus: updatedUser.is_verified,
            verificationToken: updatedUser.verification_token
        });

        if (!updatedUser.is_verified) {
            console.error('Failed to update user verification status');
            return res.status(500).json({
                success: false,
                message: "Failed to verify email. Please try again."
            });
        }

        try {
            await sendWelcomeEmail(updatedUser.email, updatedUser.name);
            console.log('Welcome email sent successfully');
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Continue even if welcome email fails
        }

        return res.status(200).json({
            success: true, 
            message: "Email verified successfully",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                isVerified: updatedUser.is_verified
            }
        });
    } catch (error) {
        console.error('Email verification error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to verify email"
        });
    }
};

const resendVerification = async (req, res) => {
    console.log('Resend verification request:', req.body);

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        // Generate new verification code
        const verificationCode = getVerificationCode();
        const verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

        // Update user with new verification token
        await User.updateVerificationToken(
            user.id,
            verificationCode,
            verificationTokenExpires
        );

        // Send new verification email
        await sendVerificationEmail(user.email, verificationCode);

        res.status(200).json({
            success: true,
            message: "Verification email sent successfully"
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to resend verification email"
        });
    }
};

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
                isVerified: user.isVerified,
                lastLogin: user.last_login
            }
        });
    } catch (error) {
        console.error('Check auth error:', error);
        res.status(500).json({
            success: false,
            message: "Authentication check failed"
        });
    }
};

const checkVerificationStatus = async (req, res) => {
    try {
        const { email } = req.query;
        console.log('Checking verification status for:', email);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            isVerified: user.isVerified
        });
    } catch (error) {
        console.error('Check verification status error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to check verification status"
        });
    }
};

export { 
    register, 
    login, 
    logout, 
    forgotPassword,
    resetPassword,
    verifyEmail,
    checkAuth,
    checkVerificationStatus,
    resendVerification 
};
