const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Resume = require("../models/Resume");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/profile",authMiddleware ,async (req, res) => {
    try {
      const { userId } = req.user;
        console.log(userId);
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
  
      const user = await User.findById(userId).populate("resumes");
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const lastResume = user.resumes.length
        ? await Resume.findById(user.resumes[user.resumes.length - 1])
        : null;
  
      res.json({ user, lastResume });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Server Error" });
    }
  });  

module.exports = router;