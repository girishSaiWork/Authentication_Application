import express from "express"
import { register, login, logout } from "../controllers/auth_controller.js"

const router = express.Router()

export default router;

router.get("/register", register)
router.get("/login", login)
router.get("/logout", logout)