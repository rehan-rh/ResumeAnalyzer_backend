const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// Function to extract text from a resume (PDF or DOCX)
async function extractTextFromResume(fileBuffer, mimeType) {
  try {
    if (mimeType === "application/pdf") {
      const pdfData = await pdfParse(fileBuffer);
      return pdfData.text;
    } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const docData = await mammoth.extractRawText({ buffer: fileBuffer });
      return docData.value;
    } else {
      throw new Error("Unsupported file format. Please upload a PDF or DOCX.");
    }
  } catch (error) {
    console.error("Error extracting text:", error);
    throw error;
  }
}

// Function to analyze resume using Google Gemini AI
async function analyzeResume(fileBuffer, mimeType, jobRole) {
  try {
    // Extract text from the uploaded resume
    const resumeText = await extractTextFromResume(fileBuffer, mimeType);
    console.log("Extracted Resume Text:", resumeText);

    // Define a structured prompt
    const prompt = `
      Analyze the following resume and provide insights:
      - Matching jobs for the given resume
      - Missing skills for different matching jobs
      - Suggested jobs for the given resume
      - Readability score for the given resume
      - ATS (Applicant Tracking System) compatibility
      - Exclusive skill comparison for the given resume with the job role: '${jobRole} without any table just with pointers'
      - No additional text or explanation—return **only** valid JSON.
      - Return the JSON response with the following fields:
        - **score**: Represents ATS score.
        - **missingKeywords**: Keywords missed in the resume to make it effective.
        - **suggestedJobs**: Related jobs for the given resume.
        - **readabilityScore**: Represents readability of the resume.
        - **grammarIssues**: Brief message if there are any grammar mistakes.
        - **atsFriendly**: Whether the resume is ATS-friendly ('true' or 'false').
        - **detailedDescription**: End-to-end summary of the resume.
      -And lastly rate the section wise score out of 10 for each secion in the resume. 

      Resume:
      """${resumeText}"""
    `;

    // Dynamically import Google Generative AI
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent([prompt]);
    const analysis = result.response.text();
    // console.log(analysis);

    // Create a duplicate for parsing

    let sectionScores = {};
    let final_analysis = analysis;
    try {
        // Create a duplicate variable for parsing
        const duplicateResponse = analysis.replace(/```json|```/g, "").trim();
    
        // Extract JSON content from the duplicate response
        const parsedData = JSON.parse(duplicateResponse);
    
        // Extract sectionScores safely
        sectionScores = parsedData.sectionScores || {};
        console.log(parsedData);
        final_analysis = parsedData;
    } catch (error) {
        console.error("Error parsing section scores:", error);
    }
    

// Extract section-wise scores


    return {
      extractedText: resumeText,
      analysis: final_analysis,
      score: Math.floor(Math.random() * 50) + 50, // Randomized score (50-100)
      atsFriendly: analysis.toLowerCase().includes("ats friendly"),
      sectionScores,
     
    };
  } catch (error) {
    console.error("Error analyzing resume at resumeAnalyzer.js:", error);
    throw error;
  }
}

module.exports = { analyzeResume };