const express = require("express");
const app = express();


const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./src/config/database");
const { connect } = require("mongoose");
const session = require("express-session");
require("dotenv").config();

app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend origin
    credentials: true, // Allow cookies and authentication headers
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"], // Explicitly allow PATCH
    allowedHeaders: ["Content-Type", "Authorization"], // Ensure content-type is allowed
  })
);
app.use(express.json()); // Middleware to parse JSON
app.use(cookieParser());

const authRouter = require("./src/routes/auth");
const resumeRouter = require("./src/routes/resume");
const userRouter = require("./src/routes/user");

app.use("/",authRouter);
app.use("/resume", resumeRouter);
app.use("/user", userRouter);

connectDB().then(() => {
  console.log("Database connected");
  app.listen(7777, () => {
    console.log("Server started on http://localhost:7777");
  });
}).catch((err)=>{
    console.error("Database cannot be connected...!!", err.message);
});

