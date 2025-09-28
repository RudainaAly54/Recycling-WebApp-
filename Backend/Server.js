// import express from "express";
// import cors from "cors";
// import 'dotenv/config';
// import dotenv from "dotenv";
// dotenv.config();
// import cookieParser from "cookie-parser";
// import connectDB from './config/mongodb.js';
// import authRouter from './routes/authRoutes.js';
// import userRouter from './routes/userRoutes.js';

// const app = express();
// const port = process.env.PORT || 5000;

// connectDB();
// const allowedOrigins=['http://localhost:5173']
// // Middleware
// app.use(express.json());
// app.use(cookieParser());
// app.use(cors({origin:allowedOrigins, credentials: true }));

// // Routes
// app.use('/api/auth', authRouter);
// app.use('/api/user', userRouter);

// app.get('/', (req, res) => res.send("API working fine"));

// app.listen(port, () => console.log(`server started on port ${port}`));
// Server.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/mongodb.js"; // merged DB connect file
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// connect database
connectDB();

// CORS setup
const allowedOrigins = ["http://localhost:5173"];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => res.send("✅ API working fine"));

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
