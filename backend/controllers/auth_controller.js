import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user_model.js";
import { getVerificationCode } from "../utils/getVerificationCode.js";
import { generateJWTTokenAndSetCookie } from "../utils/generateJWTTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail , sendResetPasswordEmail} from "../mailtrap/emails.js";

const register = async (req, res) => {
    // console.log('Request body:', req.body);

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
        console.log("User already exists:", userAlreadyExists);
        if (userAlreadyExists) {
            return res.status(400).json({
                success: false, message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = getVerificationCode();
        const user = await User.create({ 
            name, 
            email, 
            password: hashedPassword,
            verificationToken: verificationCode,
            verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24) // 1 day or 24 hours
        });

        // JWT token
        generateJWTTokenAndSetCookie(user.id, res);

        await sendVerificationEmail(user.email, verificationCode);

        return res.status(201).json({
            success: true, 
            message: "User created successfully", 
            user: {
                ...user,
                password: undefined
            }
        });
    }
    catch (error) {
        console.error('Error in register function:', error);
        return res.status(400).json({
            success: false, message: error.message
        });
    }
}

export const verifyEmail = async (req, res) => {
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
                ...updatedUser,
                password: undefined
            }
        });
        
    } catch (error) {
        console.error('Error in verifyEmail function:', error);
        return res.status(400).json({
            success: false, message: error.message
        });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if req.body exists
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Request body is missing"
            });
        }

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false, message: "User not found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false, message: "Invalid password"
            });
        }

        generateJWTTokenAndSetCookie(user.id, res);

        // Update lastLogin
        const updatedUser = await User.updateLastLogin(user.id);

        return res.status(200).json({
            success: true, 
            message: "Login successful",
            user: {
                ...updatedUser,
                password: undefined
            }
        });
        
    }
    catch (error) {
        console.error('Error in login function:', error);
        return res.status(400).json({
            success: false, message: error.message
        });
    }
}

const logout = async (req, res) => {
    res.clearCookie("authtoken")
    res.status(200).json({
        success: true,
        message: "Logout successful"
    })
}

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false, message: "User not found"
            });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 1); // 1 hour

        // Update user with reset password token and expiration
        const updatedUser = await User.updateResetPasswordToken(email, resetToken, resetTokenExpires);

        await sendResetPasswordEmail(updatedUser.email, resetToken);

        return res.status(200).json({
            success: true, 
            message: "Password reset email sent",
            user: {
                ...updatedUser,
                password: undefined
            }
        });
    }
    catch (error) {
        console.error('Error in forgotPassword function:', error);
        return res.status(400).json({
            success: false, message: error.message
        });
    }
}

export { register, login, logout, forgotPassword }
