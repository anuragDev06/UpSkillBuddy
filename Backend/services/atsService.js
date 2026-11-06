const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenAI } = require('@google/genai');

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const RESUME_VALIDATION_RULES = {
    maxFileSize: MAX_FILE_SIZE_BYTES,
    minWords: 40,
    validThreshold: 70,
    needsReviewThreshold: 45,
    weights: {
        contact: 16,
        headings: 12,
        education: 15,
        skills: 15,
        experience: 18,
        projects: 10,
        summary: 10,
        structure: 14,
        length: 8,
    },
    headings: {
        summary: ['summary', 'profile', 'professional summary', 'career objective', 'objective', 'about'],
        experience: ['experience', 'work experience', 'employment history', 'professional experience', 'internships', 'internship'],
        education: ['education', 'academic background', 'qualifications', 'degree', 'education background'],
        skills: ['skills', 'technical skills', 'core competencies', 'competencies', 'expertise'],
        projects: ['projects', 'project work', 'selected projects', 'personal projects', 'academic projects'],
    },
};

function createServiceError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
}

function normalizeResumeText(rawText) {
    if (typeof rawText !== 'string') {
        return '';
    }

    return rawText
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\u00a0/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .trim();
}

function getFileExtension(file) {
    const fileName = file?.originalname || file?.name || '';
    const extension = fileName.split('.').pop();
    return extension ? extension.toLowerCase() : '';
}

function detectFileFormat(file) {
    const mimetype = (file?.mimetype || '').toLowerCase();
    const extension = getFileExtension(file);

    if (mimetype === 'application/pdf' || extension === 'pdf') return 'pdf';
    if (
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        extension === 'docx'
    ) return 'docx';
    if (mimetype.startsWith('text/') || extension === 'txt') return 'txt';

    return null;
}

function looksLikeBinaryBuffer(buffer) {
    if (!buffer || buffer.length === 0) {
        return true;
    }

    const sample = buffer.subarray(0, Math.min(buffer.length, 1024));
    let printable = 0;
    let suspicious = 0;

    for (const byte of sample) {
        if (byte === 0 || byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126)) {
            printable += 1;
        } else if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
            suspicious += 1;
        }
    }

    return sample.length > 0 && suspicious / sample.length > 0.2 && printable / sample.length < 0.85;
}

function hasValidPdfSignature(buffer) {
    return buffer && buffer.length >= 5 && buffer.slice(0, 5).toString('ascii') === '%PDF-';
}

function hasValidDocxSignature(buffer) {
    if (!buffer || buffer.length < 4) return false;
    if (buffer.slice(0, 2).toString('ascii') !== 'PK') return false;

    const hasXmlMarker = buffer.includes(Buffer.from('[Content_Types].xml'));
    const hasWordMarker = buffer.includes(Buffer.from('word/document.xml'));
    return hasXmlMarker || hasWordMarker;
}

function validateUploadedResumeFile(file) {
    if (!file || !file.buffer) {
        return {
            isValid: false,
            code: 'EMPTY_DOCUMENT',
            message: 'No resume file was uploaded.',
            statusCode: 400,
        };
    }

    const format = detectFileFormat(file);
    if (!format) {
        return {
            isValid: false,
            code: 'INVALID_FILE_TYPE',
            message: 'Unsupported file type. Please upload a PDF, DOCX, or TXT resume.',
            statusCode: 415,
        };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            isValid: false,
            code: 'FILE_TOO_LARGE',
            message: 'The uploaded resume exceeds the 5MB size limit.',
            statusCode: 413,
        };
    }

    if (format === 'pdf' && !hasValidPdfSignature(file.buffer)) {
        return {
            isValid: false,
            code: 'CORRUPTED_DOCUMENT',
            message: 'The uploaded PDF file appears to be corrupted or unreadable.',
            statusCode: 422,
        };
    }

    if (format === 'docx' && !hasValidDocxSignature(file.buffer)) {
        return {
            isValid: false,
            code: 'CORRUPTED_DOCUMENT',
            message: 'The uploaded DOCX file appears to be corrupted or unreadable.',
            statusCode: 422,
        };
    }

    if (format === 'txt' && looksLikeBinaryBuffer(file.buffer)) {
        return {
            isValid: false,
            code: 'CORRUPTED_DOCUMENT',
            message: 'The uploaded TXT file does not contain readable text.',
            statusCode: 422,
        };
    }

    return { isValid: true, format };
}

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

    const words = normalizedText.split(/\s+/).filter(Boolean);
    if (words.length < 10) {
        return {
            isValid: false,
            code: 'EMPTY_DOCUMENT',
            message: 'The resume content is too short to be a meaningful resume.',
            statusCode: 400,
        };
    }

    const nonTextCharacters = normalizedText.replace(/[A-Za-z0-9\s.,;:'"()\-\/\[\]@+&%#\n]/g, '').length;
    const readabilityRatio = nonTextCharacters / Math.max(normalizedText.length, 1);
    if (readabilityRatio > 0.35) {
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
        wordCount: words.length,
    };
}

function collectHeadingMatches(text) {
    const matches = {};
    for (const [section, variations] of Object.entries(RESUME_VALIDATION_RULES.headings)) {
        matches[section] = variations.some((variation) => {
            const pattern = new RegExp(`(^|\\n|\\s)${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:?\\s*(\\n|$)`, 'i');
            return pattern.test(text);
        });
    }
    return matches;
}

function validateResumeText(resumeText) {
    const normalizedText = normalizeResumeText(resumeText);
    if (!normalizedText) {
        return {
            status: 'INVALID_RESUME',
            score: 0,
            message: 'The resume content is empty.',
            code: 'EMPTY_DOCUMENT',
        };
    }

    const lowerText = normalizedText.toLowerCase();
    const words = normalizedText.split(/\s+/).filter(Boolean);
    const headingMatches = collectHeadingMatches(lowerText);
    const headingCount = Object.values(headingMatches).filter(Boolean).length;

    const hasEmail = /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/i.test(lowerText);
    const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(lowerText);
    const hasLinkedIn = /(linkedin\.com|github\.com|portfolio|behance\.net|dribbble\.com)/i.test(lowerText);
    const hasLocation = /\b(city|location|based in|india|us[a]?|canada|bengaluru|bangalore|delhi|mumbai|pune|hyderabad|chennai|new york|san francisco|london)\b/i.test(lowerText);
    const hasSummary = headingMatches.summary || /\b(summary|profile|about me|professional summary|objective)\b/i.test(lowerText);
    const hasExperience = headingMatches.experience || /(work(ed|ing)?|intern(ship|ships)|experience|company|role|job)/i.test(lowerText);
    const hasEducation = headingMatches.education || /(b\.tech|btech|be\b|b\.e\.|b\.sc|m\.tech|mba|degree|university|college|engineering)/i.test(lowerText);
    const skillsMatches = [
        'javascript', 'react', 'node', 'python', 'java', 'sql', 'aws', 'docker', 'kubernetes', 'html', 'css', 'typescript',
        'mongodb', 'postgresql', 'express', 'nextjs', 'redux', 'tailwind', 'git', 'github', 'rest api', 'api', 'agile', 'problem solving'
    ].filter((skill) => lowerText.includes(skill));
    const hasSkills = skillsMatches.length >= 2 || headingMatches.skills;
    const hasProjects = headingMatches.projects || /\b(projects?|portfolio|built|developed|implemented|created)\b/i.test(lowerText);
    const hasTimeline = /(20\d{2}|19\d{2}|present|current|experience|internship)/i.test(lowerText);
    const hasBulletList = /(?:^|\n)\s*(?:[-*•]|\d+\.|\d+\))\s+/m.test(normalizedText);

    let score = 0;
    score += (hasEmail || hasPhone || hasLocation || hasLinkedIn ? RESUME_VALIDATION_RULES.weights.contact : 0);
    score += (headingCount > 0 ? Math.min(headingCount * RESUME_VALIDATION_RULES.weights.headings, 24) : 0);
    score += hasEducation ? RESUME_VALIDATION_RULES.weights.education : 0;
    score += hasSkills ? RESUME_VALIDATION_RULES.weights.skills : 0;
    score += hasExperience ? RESUME_VALIDATION_RULES.weights.experience : 0;
    score += hasProjects ? RESUME_VALIDATION_RULES.weights.projects : 0;
    score += hasSummary ? RESUME_VALIDATION_RULES.weights.summary : 0;
    score += (headingCount >= 2 || hasBulletList ? RESUME_VALIDATION_RULES.weights.structure : 0);
    score += (words.length >= 120 ? RESUME_VALIDATION_RULES.weights.length : 0);

    const strongSignals = [
        hasSummary,
        hasExperience,
        hasEducation,
        hasSkills,
        hasProjects,
        hasEmail || hasPhone || hasLocation || hasLinkedIn,
    ].filter(Boolean).length;

    const isResumeLike = strongSignals >= 2 && (headingCount >= 1 || hasTimeline || hasBulletList || words.length >= 40);

    if (score >= RESUME_VALIDATION_RULES.validThreshold && isResumeLike) {
        return {
            status: 'VALID_RESUME',
            score,
            message: 'Resume validation passed. The document appears to be a valid resume.',
            normalizedText,
        };
    }

    if (score >= RESUME_VALIDATION_RULES.needsReviewThreshold && words.length >= 20 && strongSignals >= 1) {
        return {
            status: 'NEEDS_REVIEW',
            score,
            message: 'The document is readable but needs manual review before ATS scoring.',
            normalizedText,
        };
    }

    return {
        status: 'INVALID_RESUME',
        score,
        message: 'The provided content does not appear to be a resume or is too incomplete to score.',
        normalizedText,
    };
}

async function validateResumeInput(file, resumeText) {
    let selectedText = normalizeResumeText(resumeText || '');

    if (file) {
        const fileValidation = validateUploadedResumeFile(file);
        if (!fileValidation.isValid) {
            return {
                status: 'INVALID_RESUME',
                code: fileValidation.code,
                message: fileValidation.message,
                statusCode: fileValidation.statusCode,
            };
        }

        try {
            selectedText = normalizeResumeText(await extractTextFromFile(file));
        } catch (error) {
            return {
                status: 'INVALID_RESUME',
                code: error.code || 'TEXT_EXTRACTION_FAILED',
                message: 'The uploaded resume could not be read safely.',
                statusCode: 422,
            };
        }
    }

    const extractionValidation = validateExtractedText(selectedText);
    if (!extractionValidation.isValid) {
        return {
            status: 'INVALID_RESUME',
            code: extractionValidation.code,
            message: extractionValidation.message,
            statusCode: extractionValidation.statusCode,
        };
    }

    return validateResumeText(extractionValidation.normalizedText);
}

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
        throw createServiceError('TEXT_EXTRACTION_FAILED', 'Invalid file payload or missing file buffer.');
    }

    const { buffer, originalname, mimetype } = file;
    const extension = originalname ? originalname.split('.').pop().toLowerCase() : '';

    try {
        if (mimetype === 'application/pdf' || extension === 'pdf') {
            let pdfText = '';
            if (typeof pdfParse === 'function') {
                const pdfData = await pdfParse(buffer);
                pdfText = pdfData.text || '';
            } else if (pdfParse && typeof pdfParse.default === 'function') {
                const pdfData = await pdfParse.default(buffer);
                pdfText = pdfData.text || '';
            } else {
                throw createServiceError('TEXT_EXTRACTION_FAILED', 'PDF parsing library missing expected parse function.');
            }
            return pdfText;
        }

        if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            extension === 'docx'
        ) {
            const result = await mammoth.extractRawText({ buffer });
            return result.value || '';
        }

        if (mimetype.startsWith('text/') || extension === 'txt') {
            const text = buffer.toString('utf-8');
            return text;
        }

        throw createServiceError('INVALID_FILE_TYPE', 'Unsupported file format. Please upload a PDF, DOCX, or TXT file.');
    } catch (error) {
        if (error && error.code) {
            throw error;
        }

        throw createServiceError('TEXT_EXTRACTION_FAILED', 'Unable to read the uploaded resume file safely.');
    }
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
    validateUploadedResumeFile,
    validateExtractedText,
    validateResumeText,
    validateResumeInput,
    RESUME_VALIDATION_RULES,
};
