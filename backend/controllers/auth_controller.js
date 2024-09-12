import bcrypt from "bcryptjs";
import User from "../models/user_model.js";
import { getVerificationCode } from "../utils/getVerificationCode.js";
import { generateJWTTokenAndSetCookie } from "../utils/generateJWTTokenAndSetCookie.js";
import {sendVerificationEmail } from "../mailtrap/emails.js";

const register = async (req, res) => {
    console.log('Request body:', req.body);

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
    // get the verification code from the request body
    const {code} = req.body;
    try{
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpires: { $gt: Date.now() }
        })
        if(!user) {
            return res.status(400).json({
                success: false, message: "Invalid or expired verification code"
            });
        }

        // update the user's email verification status
        user.is_verified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        return res.status(200).json({
            success: true, message: "Email verified successfully",
            user: {
                ...user.__doc,
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
    res.send("Login Route")
}

const logout = async (req, res) => {
    res.send("Logout Route")
}

export { register, login, logout }
