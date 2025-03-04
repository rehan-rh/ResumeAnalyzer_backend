const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./src/config/database");
const { connect } = require("mongoose");

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

app.use("/",authRouter);

connectDB().then(() => {
  console.log("Database connected");
  app.listen(7777, () => {
    console.log("Server started on http://localhost:7777");
  });
}).catch((err)=>{
    console.error("Database cannot be connected...!!", err.message);
});

