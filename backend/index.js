import dotenv from "dotenv"
import express from "express"
import { client } from "./db/connectDB.js"
import authRoutes from "./routes/auth_route.js"

dotenv.config()
const app = express()
const PORT = process.env.PORT || 6000


// app.get("/", (req, res) => {
//     res.send("Hi... Finally working on Java Script and web dev")
// })


app.use("/app/auth", authRoutes)

app.listen(PORT, () => {
    client();
    console.log("Server is running on port : ", PORT)
});