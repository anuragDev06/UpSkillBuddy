const config = require('./config');
const { validateUploadedFile, getFileExtension, hasValidPdfSignature, hasValidDocxSignature } = require('./fileValidator');
const { parseResumeFile, extractTextFromFile, createServiceError } = require('./resumeParser');
const { normalizeResumeText, getTextMetrics } = require('./textNormalizer');
const { analyzeResumeStructure } = require('./resumeValidator');
const { classifyResume, calculateConfidenceScore } = require('./resumeClassifier');
const { classifyWithGemini } = require('./geminiClassifier');

/**
 * Executes the complete multi-layer production resume validation pipeline.
 *
 * Pipeline sequence:
 * 1. File payload & format validation (magic bytes, size, integrity).
 * 2. Document text extraction (handling PDF, DOCX, TXT, and scanned PDFs).
 * 3. Text normalization (whitespace, line boundaries, structure preservation).
 * 4. Extracted-text quality validation (length, repetition, unreadable chars).
 * 5. Anti-cheat and non-resume detection (tutorials, assignments, keyword-only, contact-only).
 * 6. Contextual section and content detection (contact, education, experience, projects, skills).
 * 7. Profile matching (Fresher, Experienced, Career Switcher, Academic).
 * 8. Weighted confidence scoring (0 - 100).
 * 9. Preliminary classification (VALID, UNCERTAIN, INVALID).
 * 10. Secondary AI classification with Gemini ONLY when UNCERTAIN.
 *
 * @param {Object} [file] - Multer file object
 * @param {string} [rawResumeText] - Pasted plain text resume
 * @returns {Promise<Object>} Pipeline result
 */
async function validateResumePipeline(file, rawResumeText = '') {
    let textToValidate = normalizeResumeText(rawResumeText);

    // Step 1 & 2: If a file is uploaded, validate file integrity and extract text
    if (file) {
        const parseResult = await parseResumeFile(file);
        if (!parseResult.success) {
            return {
                status: 'INVALID_RESUME',
                code: parseResult.code || 'TEXT_EXTRACTION_FAILED',
                message: parseResult.message || 'Failed to extract readable text from the uploaded file.',
                statusCode: parseResult.statusCode || 422,
                isScanned: Boolean(parseResult.isScanned),
            };
        }
        textToValidate = normalizeResumeText(parseResult.text);
    }

    // Step 3 & 4: Normalize and validate extracted-text quality
    if (!textToValidate) {
        return {
            status: 'INVALID_RESUME',
            code: 'EMPTY_DOCUMENT',
            message: 'The resume content is empty or contains no readable text.',
            statusCode: 400,
        };
    }

    // Step 5, 6, 7: Contextual section & content analysis
    const structuralAnalysis = analyzeResumeStructure(textToValidate);
    if (!structuralAnalysis.isValidQuality) {
        return {
            status: 'INVALID_RESUME',
            code: structuralAnalysis.code || 'INVALID_RESUME',
            message: structuralAnalysis.message || 'Document does not meet resume quality standards.',
            statusCode: structuralAnalysis.statusCode || 422,
        };
    }

    // Step 8 & 9: Preliminary weighted classification
    const classification = classifyResume(structuralAnalysis);

    if (classification.status === 'VALID') {
        return {
            status: 'VALID_RESUME',
            normalizedText: textToValidate,
            score: classification.score,
            breakdown: classification.breakdown,
            detectedSections: classification.detectedSections,
            detectedProfile: classification.detectedProfile,
            classificationMethod: 'RULE_BASED',
            reasons: classification.reasons,
        };
    }

    if (classification.status === 'INVALID') {
        return {
            status: 'INVALID_RESUME',
            code: classification.code || 'INVALID_RESUME',
            message: classification.message || 'The document does not exhibit sufficient characteristics of a genuine resume.',
            statusCode: classification.statusCode || 422,
            score: classification.score,
            reasons: classification.reasons,
        };
    }

    // Step 10: State is UNCERTAIN -> invoke Gemini as secondary classifier
    const geminiResult = await classifyWithGemini(textToValidate);

    if (geminiResult.isValid && geminiResult.isResume) {
        return {
            status: 'VALID_RESUME',
            normalizedText: textToValidate,
            score: classification.score,
            classificationMethod: 'GEMINI_SECONDARY',
            confidence: geminiResult.confidence,
            detectedSections: geminiResult.detectedSections,
            reasons: geminiResult.reasons,
        };
    }

    return {
        status: 'INVALID_RESUME',
        code: 'INVALID_RESUME',
        message: geminiResult.message || 'The document was determined not to be a genuine resume.',
        statusCode: geminiResult.statusCode || 422,
        classificationMethod: 'GEMINI_SECONDARY',
        confidence: geminiResult.confidence,
        reasons: geminiResult.reasons,
    };
}

module.exports = {
    config,
    validateUploadedFile,
    getFileExtension,
    hasValidPdfSignature,
    hasValidDocxSignature,
    parseResumeFile,
    extractTextFromFile,
    createServiceError,
    normalizeResumeText,
    getTextMetrics,
    analyzeResumeStructure,
    classifyResume,
    calculateConfidenceScore,
    classifyWithGemini,
    validateResumePipeline,
};
