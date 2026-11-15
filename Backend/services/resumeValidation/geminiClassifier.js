const { GoogleGenAI } = require('@google/genai');
const config = require('./config');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const CLASSIFIER_MODEL = process.env.GEMINI_CLASSIFIER_MODEL || 'gemini-3.5-flash-lite';

const GEMINI_CLASSIFIER_PROMPT = `You are a strict document classifier for an Applicant Tracking System (ATS).
Your task is to determine whether the provided document text is a genuine candidate resume or curriculum vitae (CV), or an ordinary non-resume document.

Accept genuine resumes and CVs, including:
- Fresh graduates / entry-level candidates (education, projects, technical skills, contact info; work experience is NOT required)
- Experienced industry professionals (work history, achievements, skills, education)
- Career switchers (summary, portfolio projects, transferable skills)
- Academic researchers (academic qualifications, publications, research projects)

REJECT documents that are:
- Programming tutorials, guides, or documentation (e.g., React/Node tutorials, how-to guides)
- College assignments, homework, problem sets, or exams
- Documents containing only technical keywords without real personal background
- Documents containing only personal contact details without skills or experience
- Random essays, articles, blog posts, code snippets, or business invoices

Return ONLY a valid JSON object matching this exact schema — no markdown fences, no surrounding commentary:
{
  "isResume": <boolean>,
  "confidence": <number between 0.0 and 1.0>,
  "documentType": <"resume" | "tutorial" | "assignment" | "documentation" | "keyword_list" | "other">,
  "detectedSections": [<string>, ...],
  "reasons": [<string>, ...]
}`;

/**
 * Validates the parsed Gemini classification response against the required schema.
 *
 * @param {any} data
 * @returns {boolean}
 */
function isValidGeminiSchema(data) {
    if (!data || typeof data !== 'object') return false;
    if (typeof data.isResume !== 'boolean') return false;
    if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) return false;
    if (typeof data.documentType !== 'string') return false;
    if (!Array.isArray(data.detectedSections)) return false;
    if (!Array.isArray(data.reasons)) return false;
    return true;
}

/**
 * Invokes Gemini as a secondary classifier for borderline or ambiguous documents.
 * Only called when preliminary rule-based classification returns UNCERTAIN.
 *
 * @param {string} resumeText - Normalized resume text
 * @returns {Promise<Object>} { isValid, isResume, confidence, detectedSections, reasons, message, statusCode }
 */
async function classifyWithGemini(resumeText) {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is not configured for secondary resume classification.');
        return {
            isValid: false,
            isResume: false,
            confidence: 0,
            reasons: ['Gemini API key is not configured.'],
            message: 'Document structure is ambiguous and could not be verified as a valid resume.',
            statusCode: 422,
        };
    }

    // Limit text sample size for classification efficiency and cost optimization
    const textSample = resumeText.slice(0, 4000);

    try {
        const response = await genAI.models.generateContent({
            model: CLASSIFIER_MODEL,
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: GEMINI_CLASSIFIER_PROMPT },
                        { text: `\n\nDocument text to classify:\n\n${textSample}` },
                    ],
                },
            ],
            config: {
                responseMimeType: 'application/json',
                temperature: 0.1,
            },
        });

        const rawText = response?.text ?? response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch {
            return {
                isValid: false,
                isResume: false,
                confidence: 0,
                reasons: ['Gemini returned malformed JSON.'],
                message: 'The document structure is ambiguous and could not be verified as a valid resume.',
                statusCode: 422,
            };
        }

        if (!isValidGeminiSchema(parsed)) {
            return {
                isValid: false,
                isResume: false,
                confidence: 0,
                reasons: ['Gemini response failed schema validation.'],
                message: 'The document structure is ambiguous and could not be verified as a valid resume.',
                statusCode: 422,
            };
        }

        const isAccepted = parsed.isResume && parsed.confidence >= config.thresholds.geminiConfidenceMin;

        return {
            isValid: isAccepted,
            isResume: parsed.isResume,
            confidence: parsed.confidence,
            documentType: parsed.documentType,
            detectedSections: parsed.detectedSections,
            reasons: parsed.reasons,
            message: isAccepted
                ? 'Resume verified successfully via secondary classification.'
                : (parsed.reasons?.[0] || 'The document was determined not to be a genuine resume.'),
            statusCode: isAccepted ? 200 : 422,
        };
    } catch (error) {
        console.error('Error invoking Gemini secondary resume classifier:', error?.message || error);
        // Fail securely: do not let API errors allow unverified documents into the ATS pipeline
        return {
            isValid: false,
            isResume: false,
            confidence: 0,
            reasons: ['Secondary classification service error.'],
            message: 'The document structure is ambiguous and could not be verified as a valid resume. Please ensure it includes standard resume sections.',
            statusCode: 422,
        };
    }
}

module.exports = {
    classifyWithGemini,
    isValidGeminiSchema,
    GEMINI_CLASSIFIER_PROMPT,
};
