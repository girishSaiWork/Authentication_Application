import jwt from "jsonwebtoken";

export const generateJWTTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "6h" });
}
