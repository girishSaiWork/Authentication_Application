import dotenv from "dotenv"
import express from "express"
import { client } from "./db/connectDB.js"
import authRoutes from "./routes/auth_route.js"


const app = express()
dotenv.config()

app.get("/", (req, res) => {
    res.send("Hi... Finally working on Java Script and web dev")
})


app.use("/app/auth", authRoutes)

app.listen(3000, () => {
    client();
    console.log("Server is running.....")
});