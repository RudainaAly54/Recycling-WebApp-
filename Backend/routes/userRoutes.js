// import express from 'express'
// import userAuth from '../middleware/userAuth.js';
// import { getUserData } from '../controllers/userController.js';
// const userRouter=express.Router();
// userRouter.get('/data',userAuth,getUserData);
// export default userRouter;
import express from "express";
import userModel from "../models/userModel.js"; // لو عندك موديل user من MongoDB

const router = express.Router();

// لو عايز ترجع اليوزرز من MongoDB
router.get("/", async (req, res) => {
  try {
    const users = await userModel.find().select("name email role createdAt");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// لو عايز بيانات تجريبية بس
// router.get("/", (req, res) => {
//   res.json([
//     { id: 1, name: "Ali", email: "ali@example.com" },
//     { id: 2, name: "Sara", email: "sara@example.com" },
//   ]);
// });

export default router;
