const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenAI } = require('@google/genai');

// ─────────────────────────────────────────────────────────────────────────────
// Gemini Client — initialised once using the key from .env
// ─────────────────────────────────────────────────────────────────────────────
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Extract plain text from an uploaded file buffer based on MIME type or file extension.
 * Supports PDF, DOCX, and plain TXT files.
 *
 * @param {Object} file - Multer file object containing buffer, originalname, and mimetype
 * @returns {Promise<string>} Parsed plain text content
 */
async function extractTextFromFile(file) {
    if (!file || !file.buffer) {
        throw new Error('Invalid file payload or missing file buffer.');
    }

    const { buffer, originalname, mimetype } = file;
    const extension = originalname ? originalname.split('.').pop().toLowerCase() : '';

    // PDF
    if (mimetype === 'application/pdf' || extension === 'pdf') {
        let pdfText = '';
        if (typeof pdfParse === 'function') {
            const pdfData = await pdfParse(buffer);
            pdfText = pdfData.text || '';
        } else if (pdfParse && typeof pdfParse.default === 'function') {
            const pdfData = await pdfParse.default(buffer);
            pdfText = pdfData.text || '';
        } else {
            throw new Error('PDF parsing library missing expected parse function.');
        }
        return pdfText;
    }

    // DOCX
    if (
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        extension === 'docx'
    ) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
    }

    // Plain text
    if (mimetype.startsWith('text/') || extension === 'txt') {
        return buffer.toString('utf-8');
    }

    throw new Error('Unsupported file format. Please upload a PDF, DOCX, or TXT file.');
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

    const model = 'gemini-3.6-flash';

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

    const rawText = response.text ?? response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    let parsed;
    try {
        // Strip any accidental markdown code fences before parsing
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
                score: data.breakdown?.formatting?.score ?? 0,
                max: 15,
                details: data.breakdown?.formatting?.details ?? [],
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
};
