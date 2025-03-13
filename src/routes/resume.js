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

    const jobDescription=req.body.jobDescription;


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

// added
// Get statistics data
router.get('/stats', async (req, res) => {
  try {
    const totalResumes = await Resume.countDocuments();

    const scoreDistribution = await Resume.aggregate([
      {
        $group: {
          _id: { $ceil: { $divide: ["$score", 10] } }, // Group by score range (1-10, 11-20, etc.)
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const readabilityDistribution = await Resume.aggregate([
      {
        $group: {
          _id: {
            $cond: {
              if: { $lte: ["$readabilityScore", 40] },
              then: "Low",
              else: {
                $cond: {
                  if: { $lte: ["$readabilityScore", 70] },
                  then: "Medium",
                  else: "High"
                }
              }
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    

    const atsFriendlyCount = await Resume.aggregate([
      {
        $group: {
          _id: "$atsFriendly",
          count: { $sum: 1 }
        }
      }
    ]);

    const topMissingKeywords = await Resume.aggregate([
      { $unwind: "$missingKeywords" },
      { $group: { _id: "$missingKeywords", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const topGrammarIssues = await Resume.aggregate([
      { $unwind: "$grammarIssues" },
      { $group: { _id: "$grammarIssues", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalResumes,
      scoreDistribution,
      readabilityDistribution,
      atsFriendlyCount,
      topMissingKeywords,
      topGrammarIssues
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;