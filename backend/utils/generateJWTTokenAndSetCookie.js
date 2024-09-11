import jwt from "jsonwebtoken";

export const generateJWTTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "6h" });


    res.cookie("authtoken", token, {
        httpOnly: true, //accessible to web server only not to javascript
        secure: process.env.NODE_ENV !== "development", //use cookie in http or https only 
        sameSite: "strict", //cross-site cookie 
        maxAge: 6 * 60 * 60 * 1000 //6 hours
    });

    return token;
}

