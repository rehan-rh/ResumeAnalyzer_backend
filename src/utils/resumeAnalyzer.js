const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
// const OpenAI = require("openai");
// import { GoogleGenerativeAI } from "@google/generative-ai";


// Initialize OpenAI API with your API key
// const openai = new OpenAI({
// //   apiKey: process.env.OPENAI_API_KEY, // Store this in an .env file
//     apiKey: ""
// });

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to extract text from the resume
async function extractTextFromResume(filePath, mimeType) {
  try {
    if (mimeType === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text;
    } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const docData = await mammoth.extractRawText({ path: filePath });
      return docData.value;
    } else {
      throw new Error("Unsupported file format. Please upload a PDF or DOCX.");
    }
  } catch (error) {
    console.error("Error extracting text:", error);
    throw error;
  }
}

// Function to analyze resume using OpenAI
async function analyzeResume(file, jobRole) {
  try {
    // Dynamically import Google Generative AI
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    // Extract text from the uploaded resume
    const resumeText = await extractTextFromResume(file.path, file.mimetype);
    console.log(resumeText);

    // Define a structured prompt
    const prompt = `
      Analyze the following resume and provide insights:
      - Matching jobs for the given resume
      - Missing skills for different matching jobs
      - Suggested jobs for the given resume
      - Readability score for the given resume
      - ATS (Applicant Tracking System) compatibility
      - Exclusive skill comparision for the given resume with the job role '''${jobRole}'''

      Resume:
      """${resumeText}"""
    `;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log(genAI);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent([prompt]);
    console.log(result);
    const analysis = await result.response.text();
    console.log(analysis);
    return {
      extractedText: resumeText,
      analysis: analysis,
      score: Math.floor(Math.random() * 50) + 50, // Randomized score (50-100)
      atsFriendly: analysis.toLowerCase().includes("ats friendly"),
    };
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
}

module.exports = { analyzeResume };