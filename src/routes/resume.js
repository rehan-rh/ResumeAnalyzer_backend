const express = require("express");
const multer = require("multer");
const Resume = require("../models/Resume");
const User = require("../models/User");
const { analyzeResume } = require("../utils/resumeAnalyzer");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
// Configure Multer to store files in memory (not in a folder)
const storage = multer.memoryStorage(); // Store file in RAM instead of disk
const upload = multer({ storage: storage });


router.post("/analyze", upload.single("resume"), authMiddleware, async (req, res) => {
    console.log("Request received at /resume/analyze"); // Debugging
  try {
    const { userId } = req.user; // Extract from token middleware
    console.log("userId",userId);
    const resumeFile = req.file;

    const jobDescription = req.body.jobDescription;


    if (!resumeFile) return res.status(400).json({ error: "No file uploaded" });

    // Extract mimetype and file buffer
    const mimeType = resumeFile.mimetype;  // Example: "application/pdf"
    const fileBuffer = resumeFile.buffer;  // File data in memory
    console.log(mimeType, fileBuffer);
    // Analyze Resume
    const result = await analyzeResume(fileBuffer, mimeType, jobDescription);

    console.log("Type of result:", typeof result);
    console.log("Type of result.analysis:", typeof result.analysis);
    // console.log("Full result:", result);
    // console.log("Full result:", result.analysis);

    // console.log(result.analysis);
    // Save to DB

    console.log(typeof result.extractedText);
    console.log(typeof result.analysis);
    console.log(typeof result.analysis.score);
    console.log(typeof result.analysis.missingKeywords);
    console.log(typeof result.analysis.suggestedJobs);
    console.log(typeof result.analysis.readabilityScore);
    console.log(typeof result.analysis.grammarIssues);
    console.log(typeof result.analysis.atsFriendly);
    console.log(typeof result.sectionScores);
    console.log(result.sectionScores);
    const newResume = new Resume({
      userId,
      file: resumeFile.buffer, // Store PDF as binary data
      contentType: resumeFile.mimetype, // Store MIME type
      extractedText: result.extractedText,
      analysis: result.analysis,
      score: result.analysis.score,
      missingKeywords: result.analysis.missingKeywords,
      suggestedJobs: result.analysis.suggestedJobs,
      readabilityScore: result.analysis.readabilityScore,
      grammarIssues: result.analysis.grammarIssues,
      atsFriendly: result.analysis.atsFriendly,
  });
  await newResume.save(); // Save to Resume collection

  // Update user's resumes array with new Resume ObjectId
  const user = await User.findByIdAndUpdate(
      userId,
      { $push: { resumes: newResume._id } }, // Store ObjectId in user's resumes array
      { new: true }
  );

  // console.log("for verification");
  // console.log(result.sectionScores);

  res.json({ message: "Resume added successfully", resume: newResume, sectionScores: result.sectionScores });
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