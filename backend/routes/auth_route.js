import express from "express"
import { 
    register, 
    login, 
    logout, 
    verifyEmail, 
    forgotPassword, 
    resetPassword, 
    checkAuth,
    checkVerificationStatus,
    resendVerification
} from "../controllers/auth_controller.js"
import { verifyToken } from "../middleware/verifyToken.js"

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/verify-email', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/resend-verification', resendVerification)
router.get('/verification-status', checkVerificationStatus)

// Protected routes (require authentication)
router.use(verifyToken)
router.get('/check-auth', checkAuth)
router.post('/logout', logout)

export default router
