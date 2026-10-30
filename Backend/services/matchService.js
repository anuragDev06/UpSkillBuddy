const { GoogleGenAI } = require('@google/genai');
const { extractTextFromFile } = require('./atsService');

// ─────────────────────────────────────────────────────────────────────────────
// Gemini client — shared singleton, reads key from .env
// ─────────────────────────────────────────────────────────────────────────────
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = 'gemini-2.0-flash-lite';

// ─────────────────────────────────────────────────────────────────────────────
// Prompt — instructs Gemini to return strict JSON matching the frontend shape
// ─────────────────────────────────────────────────────────────────────────────
const MATCH_PROMPT = `You are an expert resume-to-job-description match analyzer.
Compare the provided resume and job description, then return ONLY a valid JSON object — no markdown, no extra text.

The JSON must follow this exact schema:
{
  "matchScore": <integer 0-100>,
  "verdict": <"Excellent Match" | "Good Match" | "Moderate Match" | "Weak Match" | "Poor Match">,
  "summary": <string: 2-3 sentence overall compatibility assessment>,
  "breakdown": {
    "skills": {
      "score": <integer 0-35>,
      "max": 35,
      "matched": [<string>, ...],
      "missing": [<string>, ...]
    },
    "experience": {
      "score": <integer 0-25>,
      "max": 25,
      "details": <string>
    },
    "education": {
      "score": <integer 0-15>,
      "max": 15,
      "details": <string>
    },
    "keywords": {
      "score": <integer 0-15>,
      "max": 15,
      "matched": [<string>, ...],
      "missing": [<string>, ...]
    },
    "roleAlignment": {
      "score": <integer 0-10>,
      "max": 10,
      "details": <string>
    }
  },
  "strengths": [<string>, ...],
  "gaps": [<string>, ...],
  "recommendations": [<string>, ...]
}

Scoring guidelines:
- skills (max 35): How well the candidate's technical and soft skills match the JD requirements.
- experience (max 25): Relevance and level of work experience.
- education (max 15): Alignment of qualifications with JD requirements.
- keywords (max 15): Presence of important JD keywords/phrases in the resume (ATS keyword matching).
- roleAlignment (max 10): Overall title, industry, and career trajectory alignment.
- matchScore must equal the sum of all breakdown scores.
- verdict: 85-100=Excellent Match, 70-84=Good Match, 50-69=Moderate Match, 30-49=Weak Match, 0-29=Poor Match.
- strengths: 3-5 specific reasons the candidate is a good fit.
- gaps: 3-5 specific areas where the candidate falls short.
- recommendations: 3-5 actionable tips to improve the match score.`;

/**
 * Analyzes how well a resume matches a job description using Gemini.
 *
 * @param {string} resumeText      - Extracted plain text of the resume
 * @param {string} jobDescription  - Plain text of the job description
 * @returns {Promise<Object>} Structured match report for the frontend
 */
async function analyzeMatch(resumeText, jobDescription) {
    if (!resumeText?.trim()) {
        throw new Error('Resume text is empty or could not be extracted.');
    }
    if (!jobDescription?.trim()) {
        throw new Error('Job description text is empty.');
    }

    const userMessage = [
        MATCH_PROMPT,
        '\n\n--- RESUME ---\n',
        resumeText.trim(),
        '\n\n--- JOB DESCRIPTION ---\n',
        jobDescription.trim(),
    ].join('');

    const response = await genAI.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
        },
    });

    const rawText = response.text ?? response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    let parsed;
    try {
        const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error('Gemini returned an unexpected response format. Please try again.');
    }

    return normalizeResult(parsed);
}

/**
 * Ensures every required field exists, filling in safe defaults for anything
 * missing so the frontend never receives undefined values.
 *
 * @param {Object} data - Parsed Gemini JSON response
 * @returns {Object} Normalized match report
 */
function normalizeResult(data) {
    return {
        matchScore: typeof data.matchScore === 'number' ? data.matchScore : 0,
        verdict: data.verdict || 'Poor Match',
        summary: data.summary || 'Analysis could not be completed.',
        breakdown: {
            skills: {
                score: data.breakdown?.skills?.score ?? 0,
                max: 35,
                matched: data.breakdown?.skills?.matched ?? [],
                missing: data.breakdown?.skills?.missing ?? [],
            },
            experience: {
                score: data.breakdown?.experience?.score ?? 0,
                max: 25,
                details: data.breakdown?.experience?.details ?? '',
            },
            education: {
                score: data.breakdown?.education?.score ?? 0,
                max: 15,
                details: data.breakdown?.education?.details ?? '',
            },
            keywords: {
                score: data.breakdown?.keywords?.score ?? 0,
                max: 15,
                matched: data.breakdown?.keywords?.matched ?? [],
                missing: data.breakdown?.keywords?.missing ?? [],
            },
            roleAlignment: {
                score: data.breakdown?.roleAlignment?.score ?? 0,
                max: 10,
                details: data.breakdown?.roleAlignment?.details ?? '',
            },
        },
        strengths: data.strengths ?? [],
        gaps: data.gaps ?? [],
        recommendations: data.recommendations ?? [],
    };
}

module.exports = {
    analyzeMatch,
    extractTextFromFile, // re-exported for convenience in the controller
};
