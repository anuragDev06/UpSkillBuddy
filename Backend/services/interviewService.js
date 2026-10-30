const { GoogleGenAI } = require('@google/genai');
const { extractTextFromFile } = require('./atsService');

// ─────────────────────────────────────────────────────────────────────────────
// Gemini client — reads key from .env
// ─────────────────────────────────────────────────────────────────────────────
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = 'gemini-2.0-flash-lite';

// ─────────────────────────────────────────────────────────────────────────────
// Generate interview questions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates tailored mock interview questions based on resume + JD + settings.
 *
 * @param {string}  resumeText      - Extracted resume text
 * @param {string}  jobDescription  - Job description text
 * @param {Object}  settings        - { interviewType, difficulty, questionCount, companyName }
 * @returns {Promise<Object>}  { sessionId, questions[], totalQuestions, config }
 */
async function generateQuestions(resumeText, jobDescription, settings) {
    const { interviewType, difficulty, questionCount, companyName } = settings;

    const companyLine = companyName ? `The company is: ${companyName}.` : '';

    const prompt = `You are an expert technical interviewer conducting a ${interviewType} interview at ${difficulty} level.
${companyLine}

Based on the candidate's resume and the job description below, generate exactly ${questionCount} interview questions.

Rules:
- Questions must be highly specific to the candidate's background and the job requirements.
- Difficulty: ${difficulty} (entry=basic concepts, mid=applied knowledge, senior=deep expertise + trade-offs).
- Type: ${interviewType} (technical=coding/system design/algorithms, behavioral=STAR-format situational, hr=goals/culture/compensation, mixed=blend of both).
- Each question should be unique and non-repetitive.
- Return ONLY a valid JSON object, no markdown, no extra text.

Schema:
{
  "questions": [
    {
      "id": <integer starting at 1>,
      "question": <string>,
      "type": <"technical" | "behavioral" | "hr">,
      "hint": <string: a brief hint about what a good answer should cover, shown after the user submits>,
      "difficulty": <"easy" | "medium" | "hard">
    }
  ]
}

Resume:
${resumeText.trim()}

Job Description:
${jobDescription.trim()}`;

    const response = await genAI.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json', temperature: 0.7 },
    });

    const rawText = response.text ?? response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error('Gemini returned an unexpected format when generating questions. Please try again.');
    }

    const questions = (parsed.questions || []).slice(0, questionCount).map((q, i) => ({
        id: q.id ?? i + 1,
        question: q.question ?? '',
        type: q.type ?? interviewType,
        hint: q.hint ?? '',
        difficulty: q.difficulty ?? difficulty,
    }));

    return {
        questions,
        totalQuestions: questions.length,
        config: { interviewType, difficulty, companyName: companyName || null },
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Evaluate a single answer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evaluates the candidate's answer to a single interview question.
 *
 * @param {string} question     - The interview question that was asked
 * @param {string} answer       - The candidate's answer
 * @param {string} questionType - "technical" | "behavioral" | "hr"
 * @param {string} difficulty   - "entry" | "mid" | "senior"
 * @returns {Promise<Object>}   { score, grade, feedback, strengths[], improvements[], modelAnswer }
 */
async function evaluateAnswer(question, answer, questionType, difficulty) {
    if (!answer?.trim()) {
        return {
            score: 0,
            grade: 'F',
            feedback: 'No answer provided.',
            strengths: [],
            improvements: ['Please provide a detailed answer.'],
            modelAnswer: '',
        };
    }

    const prompt = `You are an expert interviewer evaluating a candidate's answer to an interview question.

Question: ${question}
Candidate's Answer: ${answer.trim()}
Question Type: ${questionType}
Difficulty: ${difficulty}

Evaluate the answer and return ONLY a valid JSON object — no markdown, no extra text.

Schema:
{
  "score": <integer 0-10>,
  "grade": <"A" | "B" | "C" | "D" | "F">,
  "feedback": <string: 2-3 sentence overall assessment>,
  "strengths": [<string>, ...],
  "improvements": [<string>, ...],
  "modelAnswer": <string: a concise ideal answer the candidate can learn from>
}

Scoring: 9-10=A (excellent), 7-8=B (good), 5-6=C (average), 3-4=D (poor), 0-2=F (unacceptable).
Be specific, constructive, and encouraging.`;

    const response = await genAI.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json', temperature: 0.3 },
    });

    const rawText = response.text ?? response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error('Gemini returned an unexpected format while evaluating. Please try again.');
    }

    return {
        score: typeof parsed.score === 'number' ? parsed.score : 0,
        grade: parsed.grade || 'F',
        feedback: parsed.feedback || 'Could not evaluate the answer.',
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        modelAnswer: parsed.modelAnswer || '',
    };
}

module.exports = { generateQuestions, evaluateAnswer, extractTextFromFile };
