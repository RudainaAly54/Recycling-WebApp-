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
// server.js
// server.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/mongodb.js";

// Routes
import authRouter from "./routes/authRoutes.js";
import postsRouter from "./routes/postsRoutes.js";
import usersRouter from "./routes/userRoutes.js"; // 👈 استدعاء user routes

const app = express();
dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// connect to DB
connectDB();

// use routes
app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", usersRouter); // 👈 هنا بتضيف users

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
