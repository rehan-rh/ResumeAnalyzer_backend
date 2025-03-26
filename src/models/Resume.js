const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  file: { type: Buffer, required: false }, // Resume file location
  extractedText: { type: String, required: true }, // Parsed text from resume,
  analysis: {type: Object, required: true},
  score: { type: Number, default: 0 }, // Overall resume score (0-100)
  missingKeywords: Object, // Important skills missing in resume
  suggestedJobs: Object, // Job suggestions
  readabilityScore: { type: Number, default: 0 }, // Clarity score (0-100)
  grammarIssues: String, // List of grammar/spelling mistakes
  detailedDescription: String,
  atsFriendly: { type: String, default: true }, // Whether resume passes ATS check
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', ResumeSchema);
