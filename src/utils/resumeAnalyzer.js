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
      - No additional text or explanation—return **only** valid JSON.
      - Return the JSON response with the following fields:
        - **score**: Represents ATS score.
        - **missingKeywords**: Keywords missed in the resume to make it effective.
        - **suggestedJobs**: Related jobs for the given resume.
        - **readabilityScore**: Represents readability of the resume.
        - **grammarIssues**: Mention those words which are mispelt in the resume in string format along with a message.
        - **atsFriendly**: Whether the resume is ATS-friendly ('true' or 'false').
        - **detailedDescription**: End-to-end summary of the resume.
      -And lastly rate the section wise score out of 10 for each secion in the resume, give me with the key sectionWiseScore and the value in the key-value pairs of section name and the score. 

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
        sectionScores = parsedData.sectionWiseScore || {};
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

// Function to analyze resume using Google Gemini AI
async function jobMatcher(fileBuffer, mimeType, jobRole) {
  try {
    // Extract text from the uploaded resume
    const resumeText = await extractTextFromResume(fileBuffer, mimeType);
    console.log("Extracted Resume Text:", resumeText);

    // Define a structured prompt
    const prompt = `
      Analyze the following resume and provide insights:
      - Missing skills for the given job role: ${jobRole}
      - Suggested jobs for the given resume
      - Exclusive skill comparison for the given resume with the job role: '${jobRole} without any table just with pointers'
      - No additional text or explanation—return **only** valid JSON.
      - Return the JSON response with the following fields:
        - **missingSkills**: Keywords missed in the resume to make it effective.
        - **suggestedJobs**: Related jobs for the given resume.
        - **detailedDescription**: End-to-end summary of the matching between the profile(resume) and the job role of ${jobRole} in a string format.

      Resume:
      """${resumeText}"""
    `;

    // Dynamically import Google Generative AI
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent([prompt]);
    const analysis = result.response.text();

    // Create a duplicate for parsing
    let final_analysis = analysis;
    try {
        // Create a duplicate variable for parsing
        const duplicateResponse = analysis.replace(/```json|```/g, "").trim();
    
        // Extract JSON content from the duplicate response
        const parsedData = JSON.parse(duplicateResponse);
    
        console.log(parsedData);
        final_analysis = parsedData;
    } catch (error) {
        console.error("Error parsing the analysis report:", error);
    }
    

    return {
      extractedText: resumeText,
      analysis: final_analysis,
    };
  } catch (error) {
    console.error("Error matching jobs for the given resume at resumeAnalyzer.js:", error);
    throw error;
  }
}

// Function to analyze resume and generate interview-style questions
async function taketest(fileBuffer, mimeType) {
  try {

    console.log("inside the utils function!");

    // 1. Extract text from the uploaded resume
    const resumeText = await extractTextFromResume(fileBuffer, mimeType);
    console.log("Extracted Resume Text:", resumeText);



    // 2. Prepare the prompt for question generation
    const prompt = `
You are a senior technical interviewer and HR expert.

Analyze the following resume and generate a structured set of interview questions to evaluate the candidate's skills and communication.

Resume:
"""${resumeText}"""

Instructions:
1. Identify top technical skills (like programming languages, tools, frameworks, etc.) and prepare:
   - 3 MCQs to test knowledge of those skills.
   - 2 descriptive questions (like explain a concept, solve a small problem, etc.)

2. Identify soft skills or behavioral cues (like communication, teamwork, leadership, etc.) and prepare:
   - 2 situational questions to test soft skills.

Format the result as JSON like this:

\`\`\`json
{
  "mcq": [
    {
      "question": "Which of the following is true about React hooks?",
      "options": ["They replace Redux", "They allow use of state in functional components", "They are only for class components", "None of the above"],
      "answer": "They allow use of state in functional components"
    }
  ],
  "descriptive": [
    {
      "question": "Explain how promises work in JavaScript and give a real-world example."
    }
  ],
  "softSkills": [
    {
      "question": "Tell us about a time you had to resolve a team conflict. What was your approach?"
    }
  ]
}
\`\`\`
Only return valid JSON inside code block. No extra text.
`;

    // 3. Import Google Generative AI & get model
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

    await sleep(1000);


    // 4. Generate content from Gemini
    const result = await model.generateContent([prompt]);
    const responseText = result.response.text();

    // 5. Extract JSON from Gemini response
    let questions = [];
    try {
      const jsonOnly = responseText.replace(/```json|```/g, "").trim();
      questions = JSON.parse(jsonOnly);
      console.log("Generated Questions:", questions);
    } catch (err) {
      console.error("Error parsing questions JSON:", err);
    }


    console.log('questions:-')
    console.log(questions);

    return {
      // extractedText: resumeText,
      questions: questions,
    };
  } catch (error) {
    console.error("Error generating test questions from resume at taketest():", error);
    throw error;
  }
}


//test evaluation

async function evaluateAnswers(mcqAnswers, descriptiveAnswers, softSkillAnswers) {
  let mcqScore = 0;
  const mcqDetails = [];

  console.log("evaluatre anlyser");
  console.log(mcqAnswers);
  console.log(descriptiveAnswers);
  console.log(softSkillAnswers);

  // ✅ Evaluate MCQs locally
  mcqAnswers.forEach(({ question, selectedAnswer, correctAnswer }) => {
    const isCorrect = selectedAnswer === correctAnswer;
    if (isCorrect) mcqScore++;
    mcqDetails.push({ question, selectedAnswer, correctAnswer, isCorrect });
  });

  const totalMcq = mcqAnswers.length;

    // 🧠 AI-based feedback with retry delay
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));


  // Sequential Gemini API calls to avoid 429 error
  const descriptiveFeedback = await getGeminiFeedback(descriptiveAnswers, "technical");
  await sleep(1000); // wait 10s before next call

  const softSkillFeedback = await getGeminiFeedback(softSkillAnswers, "softskills");
  await sleep(1000); // wait 10s before next call

  const mentorAdvice = await getMentorLevelFeedback(descriptiveAnswers, softSkillAnswers);


  console.log('evaluate');
  console.log(descriptiveFeedback)
  console.log(softSkillFeedback);
  console.log(mentorAdvice);



  return {
    sectionScores: {
      mcq: { score: mcqScore, total: totalMcq, details: mcqDetails },
      descriptive: descriptiveFeedback,
      softSkills: softSkillFeedback,
    },
    mentorAnalysis: mentorAdvice,
  };
}

// 🧠 Feedback per section (technical or soft skills)
async function getGeminiFeedback(answers, type) {
 
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

 
  const joinedAnswers = answers.map((a, i) => `Q${i + 1}: ${a.question}\nA: ${a.answer}`).join("\n\n");

  const prompt = `
    Analyze the following ${type === "technical" ? "technical" : "soft skill"} answers.

    Return ONLY valid JSON with the structure:
    {
      "feedbackSummary": "Overall summary",
      "strengths": ["point1", "point2"],
      "weaknesses": ["point1", "point2"],
      "suggestions": ["tip1", "tip2"]
    }

    Answers:
    """${joinedAnswers}"""
  `;


    // 3. Import Google Generative AI & get model
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });


    await sleep(1000); // ⏳ Wait 1s before calling Gemini to avoid rate limit


  const result = await model.generateContent([prompt]);
  const rawText = result.response.text();

  try {
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    
    
    console.log(`cleanText: ${cleanText}`);

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to parse Gemini feedback JSON:", error);
    return { error: "Failed to parse Gemini response", raw: rawText };
  }
}

// 🧑‍🏫 Mentor-like holistic analysis
async function getMentorLevelFeedback(descriptiveAnswers, softSkillAnswers) {
 
 
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

 
  const techText = descriptiveAnswers.map((a, i) => `Q${i + 1}: ${a.question}\nA: ${a.answer}`).join("\n\n");
  const softText = softSkillAnswers.map((a, i) => `Q${i + 1}: ${a.question}\nA: ${a.answer}`).join("\n\n");

  const prompt = `
    You're a professional mentor.

    Based on the following answers (technical and soft skills), give a high-level personalized feedback covering:
    - Overall Confidence Level (Low / Medium / High)
    - Strongest Skills
    - Areas Needing Improvement
    - Suggestions to Improve Interview Readiness
    - Final Mentor Advice

    Format:
    {
      "confidenceLevel": "High",
      "strongAreas": ["point1", "point2"],
      "improvementAreas": ["point1", "point2"],
      "mentorAdvice": "detailed paragraph summary"
    }

    Technical:
    """${techText}"""

    Soft Skills:
    """${softText}"""
  `;


    // 3. Import Google Generative AI & get model
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    await sleep(1000); // ⏳ Wait 1s before calling Gemini to avoid rate limit


  const result = await model.generateContent([prompt]);
  const rawText = result.response.text();

  try {
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    
    console.log('cleaned');
    console.log(cleaned);
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Mentor feedback parsing error:", error);
    return { error: "Failed to parse mentor response", raw: rawText };
  }
}

module.exports = { analyzeResume, jobMatcher, taketest, evaluateAnswers };