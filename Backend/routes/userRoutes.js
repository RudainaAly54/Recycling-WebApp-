// import express from 'express'
// import userAuth from '../middleware/userAuth.js';
// import { getUserData } from '../controllers/userController.js';
// const userRouter=express.Router();
// userRouter.get('/data',userAuth,getUserData);
// export default userRouter;
import express from "express";
import userAuth from "../middleware/userAuth.js";
import roleAuth from "../middleware/roleAuth.js";
import { getUserData } from "../controllers/userController.js";

const userRouter = express.Router();

// 🔒 Only Admin can access
userRouter.get("/admin", userAuth, roleAuth("admin"), (req, res) => {
  res.json({ success: true, message: "Welcome Admin" });
});

// 🔒 Both Admin & User can access
userRouter.get("/user", userAuth, roleAuth("admin", "user"), (req, res) => {
  res.json({ success: true, message: "Welcome User" });
});

// 🔒 Authenticated users can fetch their data
userRouter.get("/data", userAuth, getUserData);

export default userRouter;
