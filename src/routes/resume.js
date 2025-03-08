const express = require("express");
const multer = require("multer");
const Resume = require("../models/Resume");
const { analyzeResume } = require("../utils/resumeAnalyzer");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage

router.post("/analyze", upload.single("resume"), authMiddleware, async (req, res) => {
    console.log("Request received at /resume/analyze"); // Debugging
  try {
    const { userId } = req.user; // Extract from token middleware
    console.log("userId",userId);
    const resumeFile = req.file;

    if (!resumeFile) return res.status(400).json({ error: "No file uploaded" });

    // Analyze Resume using AI (e.g., OpenAI, spaCy, or BERT)
    const analysis = await analyzeResume(resumeFile);

    // Save to DB
    const resume = new Resume({ userId, ...analysis });
    await resume.save();

    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: "Error analyzing resume" });
  }
});

module.exports = router;