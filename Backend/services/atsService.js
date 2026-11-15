const { GoogleGenAI } = require('@google/genai');
const {
    config,
    validateUploadedFile,
    parseResumeFile,
    extractTextFromFile,
    normalizeResumeText,
    getTextMetrics,
    analyzeResumeStructure,
    classifyResume,
    validateResumePipeline,
} = require('./resumeValidation');

// ─────────────────────────────────────────────────────────────────────────────
// Gemini Client — initialized once using the key from .env
// ─────────────────────────────────────────────────────────────────────────────
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MAX_FILE_SIZE_BYTES = config.maxFileSizeBytes;

const RESUME_VALIDATION_RULES = {
    maxFileSize: MAX_FILE_SIZE_BYTES,
    minWords: config.minWordCount,
    validThreshold: config.thresholds.valid,
    needsReviewThreshold: config.thresholds.uncertain,
    weights: config.weights,
    headings: config.headings,
};

function createServiceError(code, message, statusCode = 422) {
    const error = new Error(message);
    error.code = code;
    error.statusCode = statusCode;
    return error;
}

/**
 * Validates an uploaded resume file for size, format, signatures, and integrity.
 * Backward-compatible adapter.
 *
 * @param {Object} file - Multer file object
 * @returns {Object} { isValid, format, code, message, statusCode }
 */
function validateUploadedResumeFile(file) {
    return validateUploadedFile(file);
}

/**
 * Validates the quality of extracted text.
 * Backward-compatible adapter.
 *
 * @param {string} resumeText
 * @returns {Object}
 */
function validateExtractedText(resumeText) {
    const normalizedText = normalizeResumeText(resumeText);

    if (!normalizedText) {
        return {
            isValid: false,
            code: 'EMPTY_DOCUMENT',
            message: 'The resume is empty or contains no readable text.',
            statusCode: 400,
        };
    }

    const metrics = getTextMetrics(normalizedText);

    if (metrics.wordCount < 10) {
        return {
            isValid: false,
            code: 'EMPTY_DOCUMENT',
            message: 'The resume content is too short to be a meaningful resume.',
            statusCode: 400,
        };
    }

    if (metrics.unreadableCharRatio > config.maxUnreadableRatio) {
        return {
            isValid: false,
            code: 'INVALID_RESUME',
            message: 'The extracted document contains mostly unreadable text and does not appear to be a resume.',
            statusCode: 422,
        };
    }

    return {
        isValid: true,
        normalizedText,
        wordCount: metrics.wordCount,
    };
}

/**
 * Validates resume text structure and content without file upload.
 * Backward-compatible adapter.
 *
 * @param {string} resumeText
 * @returns {Promise<Object>}
 */
async function validateResumeText(resumeText) {
    const result = await validateResumePipeline(null, resumeText);
    return result;
}

/**
 * Main validation entrypoint that runs the complete multi-layer pipeline:
 * File integrity -> Text extraction -> Quality -> Contextual Structure -> Weighted Scoring -> AI Secondary.
 *
 * @param {Object} [file] - Multer file object
 * @param {string} [resumeText] - Pasted plain text resume
 * @returns {Promise<Object>} Validation result
 */
async function validateResumeInput(file, resumeText) {
    return validateResumePipeline(file, resumeText);
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt sent to Gemini — asks for a strict JSON response matching the
// shape the frontend (ATSscore.jsx) expects.
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume analyzer.
Analyze the provided resume text and return ONLY a valid JSON object — no markdown, no extra text.

The JSON must follow this exact schema:
{
  "totalScore": <integer 0-100>,
  "status": <"Excellent" | "Good" | "Average" | "Poor" | "Critical">,
  "summary": <string: 2-3 sentence overall assessment>,
  "breakdown": {
    "contactInfo": {
      "score": <integer 0-15>,
      "max": 15,
      "details": [<string>, ...]
    },
    "sections": {
      "score": <integer 0-25>,
      "max": 25,
      "details": [<string>, ...]
    },
    "skills": {
      "score": <integer 0-25>,
      "max": 25,
      "count": <integer>
    },
    "impactAndVerbs": {
      "score": <integer 0-20>,
      "max": 20,
      "verbsCount": <integer>,
      "metricsCount": <integer>
    },
    "formatting": {
      "score": <integer 0-15>,
      "max": 15,
      "details": [<string>, ...]
    }
  },
  "skillsFound": {
    "technical": [<string>, ...],
    "soft": [<string>, ...]
  },
  "strengths": [<string>, ...],
  "improvements": [<string>, ...]
}

Scoring guidelines:
- contactInfo (max 15): Award points for name, email, phone, LinkedIn, location.
- sections (max 25): Award points for well-defined sections (Summary, Experience, Education, Skills, Projects, Certifications).
- skills (max 25): Award points for quantity and relevance of technical and soft skills.
- impactAndVerbs (max 20): Award points for strong action verbs and quantified metrics/achievements.
- formatting (max 15): Award points for clean structure, consistent formatting, and ATS-friendly layout.
- totalScore must equal the sum of all breakdown scores.
- status should reflect totalScore: 85-100=Excellent, 70-84=Good, 50-69=Average, 30-49=Poor, 0-29=Critical.`;

/**
 * Sends the extracted resume text to Gemini for ATS analysis and returns a
 * structured evaluation report matching the frontend's expected shape.
 *
 * @param {string} resumeText - Raw plain text of the resume
 * @returns {Promise<Object>} Structured ATS analysis result for the frontend
 */
async function calculateAtsScore(resumeText) {
    if (!resumeText || !resumeText.trim()) {
        return buildEmptyResult('No readable text content found in resume.');
    }

    const model = process.env.GEMINI_ATS_MODEL || 'gemini-3.6-flash';

    const response = await genAI.models.generateContent({
        model,
        contents: [
            {
                role: 'user',
                parts: [
                    { text: SYSTEM_PROMPT },
                    { text: `\n\nResume text to analyze:\n\n${resumeText.trim()}` },
                ],
            },
        ],
        config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
        },
    });

    const rawText = (typeof response?.text === 'function' ? response.text() : response?.text) ?? response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    let parsed;
    try {
        const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error('Gemini returned an unexpected response format. Please try again.');
    }

    return normalizeResult(parsed, resumeText);
}

/**
 * Ensures every required field exists in the Gemini response, filling in safe
 * defaults for anything missing so the frontend never receives undefined values.
 *
 * @param {Object} data     - Parsed Gemini JSON response
 * @param {string} rawText  - Original resume text (for fallback word count)
 * @returns {Object} Normalized ATS report
 */
function normalizeResult(data, rawText) {
    const wordCount = rawText.trim().split(/\s+/).filter(Boolean).length;
    let formattingScore = data.breakdown?.formatting?.score ?? 0;
    const formattingDetails = [...(data.breakdown?.formatting?.details ?? [])];

    if (wordCount < 200 && formattingScore >= 15) {
        formattingScore = Math.max(formattingScore - 5, 5);
        if (!formattingDetails.some(d => d.includes('too short'))) {
            formattingDetails.unshift('Resume content is relatively brief/too short (under 200 words).');
        }
    }

    return {
        totalScore: typeof data.totalScore === 'number' ? data.totalScore : 0,
        status: data.status || 'Pending',
        summary: data.summary || `Resume parsed with ${wordCount} words.`,
        breakdown: {
            contactInfo: {
                score: data.breakdown?.contactInfo?.score ?? 0,
                max: 15,
                details: data.breakdown?.contactInfo?.details ?? [],
            },
            sections: {
                score: data.breakdown?.sections?.score ?? 0,
                max: 25,
                details: data.breakdown?.sections?.details ?? [],
            },
            skills: {
                score: data.breakdown?.skills?.score ?? 0,
                max: 25,
                count: data.breakdown?.skills?.count ?? 0,
            },
            impactAndVerbs: {
                score: data.breakdown?.impactAndVerbs?.score ?? 0,
                max: 20,
                verbsCount: data.breakdown?.impactAndVerbs?.verbsCount ?? 0,
                metricsCount: data.breakdown?.impactAndVerbs?.metricsCount ?? 0,
            },
            formatting: {
                score: formattingScore,
                max: 15,
                details: formattingDetails,
            },
        },
        skillsFound: {
            technical: data.skillsFound?.technical ?? [],
            soft: data.skillsFound?.soft ?? [],
        },
        strengths: data.strengths ?? [],
        improvements: data.improvements ?? [],
    };
}

/**
 * Returns a minimal empty result object (used when input is blank).
 * @param {string} reason
 */
function buildEmptyResult(reason) {
    return {
        totalScore: 0,
        status: 'Critical',
        summary: reason,
        breakdown: {
            contactInfo: { score: 0, max: 15, details: [] },
            sections: { score: 0, max: 25, details: [] },
            skills: { score: 0, max: 25, count: 0 },
            impactAndVerbs: { score: 0, max: 20, verbsCount: 0, metricsCount: 0 },
            formatting: { score: 0, max: 15, details: [] },
        },
        skillsFound: { technical: [], soft: [] },
        strengths: [],
        improvements: ['Provide readable resume text or upload a valid file.'],
    };
}

module.exports = {
    extractTextFromFile,
    calculateAtsScore,
    validateUploadedResumeFile,
    validateExtractedText,
    validateResumeText,
    validateResumeInput,
    validateResumePipeline,
    RESUME_VALIDATION_RULES,
    createServiceError,
    normalizeResumeText,
    getTextMetrics,
    analyzeResumeStructure,
    classifyResume,
};
