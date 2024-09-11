import dotenv from "dotenv"
import express from "express"
import { client } from "./db/connectDB.js"
import authRoutes from "./routes/auth_route.js"
import User from "./models/user_model.js"

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

// Add this line before your routes
app.use(express.json());

// app.get("/", (req, res) => {
//     res.send("Hi... Finally working on Java Script and web dev")
// })


app.use("/application/auth", authRoutes)

app.listen(PORT, () => {
    client();
    console.log("Server is running on port : ", PORT)
});