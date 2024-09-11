import bcrypt from "bcryptjs";
import User from "../models/user_model.js";

const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if(!name || !email || !password) {
            throw new Error("All fields are required");
        }

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({
            success: false, message: "User aleardy exists"
        });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = getVerificationCode();
        const user = new User.create({ 
            name, 
            email, 
            password: hashedPassword ,
            verificationToken: verificationCode,
            verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24) // 1 day or 24 hours
        })
        
        await user.save();

        //jwt token
        generateJWTTokenAndSetCookie(user._id, res);

        return res.status(201).json({
            success: true, message: "User created successfully", user
        });
    }
    catch (error) {
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
