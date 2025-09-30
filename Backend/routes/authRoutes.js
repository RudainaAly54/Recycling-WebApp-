// import express from 'express'
// import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, verifyEmail } from '../controllers/authController.js';
// import userAuth from '../middleware/userAuth.js';
// const authRouter=express.Router();
// authRouter.post('/register',register)
// authRouter.post('/login',login)
// authRouter.post('/logout',logout)
// authRouter.post('/send-verify-otp',userAuth,sendVerifyOtp)
// authRouter.post('/verify-account',userAuth,verifyEmail)
// authRouter.get('/is-auth',userAuth,isAuthenticated)
// authRouter.post('/send-reset-otp',sendResetOtp)
// authRouter.post('/reset-password',resetPassword)

// export default authRouter;
// //API endpoints
// routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
import userModel from "../models/userModel.js"; // 👈 عشان نستخدمه في Route التأكيد

const router = express.Router();

// ========== Public Routes ==========
router.post("/register", register);
router.post("/login", login);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);

// ========== Protected Routes ==========
router.post("/logout", userAuth, logout);
router.post("/send-verify-otp", userAuth, sendVerifyOtp);
router.post("/verify-account", userAuth, verifyEmail);
router.get("/is-auth", userAuth, isAuthenticated);

// ========== Debug Route (مؤقت للتأكد من اليوزرز) ==========
router.get("/all-users", async (req, res) => {
  try {
    const users = await userModel.find().select("name email role createdAt");
    res.json({ success: true, users });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default router;
