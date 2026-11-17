const atsService = require('../services/atsService');
const mongoose = require('mongoose');
const ResumeScan = require('../models/resumeScan.model');

/**
 * Formats error message to prevent leaking raw technical or internal AI model errors to users.
 */
function formatSafeErrorMessage(error) {
    if (!error) {
        return "There's some technical error at our end. Try again later.";
    }

    const statusCode = error.statusCode || 500;
    const rawMessage = typeof error === 'string' ? error : (error.message || '');
    const trimmed = rawMessage.trim();

    // Known user-facing validation errors from resume validation pipeline (4xx)
    const isValidationCode = [
        'EMPTY_DOCUMENT',
        'INVALID_FORMAT',
        'FILE_TOO_LARGE',
        'CORRUPT_DOCUMENT',
        'NOT_A_RESUME',
        'INVALID_RESUME',
        'RATE_LIMIT_EXCEEDED'
    ].includes(error.code);

    const isTechnicalSignature = (
        trimmed.startsWith('{') ||
        trimmed.startsWith('[') ||
        /(503|500|unavailable|high demand|spikes in demand|overloaded|resource_exhausted|rate limit|quota|gemini|axioserror|econnrefused)/i.test(trimmed)
    );

    if (statusCode >= 400 && statusCode < 500 && isValidationCode && !isTechnicalSignature && trimmed) {
        return trimmed;
    }

    return "There's some technical error at our end. Try again later.";
}

/**
 * Controller to process resume file or text input and return ATS score evaluation
 */
async function scanResumeController(req, res) {
    try {
        const hasUploadedFile = Boolean(req.file);
        const rawResumeText = req.body && typeof req.body.resumeText === 'string' ? req.body.resumeText : '';

        if (!hasUploadedFile && !rawResumeText.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a resume file (PDF, DOCX, TXT) or provide plain text resume content.',
                code: 'EMPTY_DOCUMENT',
            });
        }

        const validation = typeof atsService.validateResumeInput === 'function'
            ? await atsService.validateResumeInput(req.file, rawResumeText)
            : { status: 'VALID_RESUME', normalizedText: rawResumeText };

        if (validation.status !== 'VALID_RESUME') {
            return res.status(validation.statusCode || 422).json({
                success: false,
                message: validation.message || 'The provided resume is not valid for ATS scoring.',
                code: validation.code || 'INVALID_RESUME',
            });
        }

        const analysis = await atsService.calculateAtsScore(validation.normalizedText || rawResumeText);

        // Persist scan history for authenticated user
        const userId = req.user?.id || req.user?._id;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            try {
                await ResumeScan.create({
                    userId,
                    fileName: req.file ? req.file.originalname : 'Pasted_Resume.txt',
                    fileSize: req.file ? req.file.size : Buffer.byteLength(rawResumeText, 'utf8'),
                    atsScore: typeof analysis.totalScore === 'number' ? analysis.totalScore : 0,
                    status: analysis.status || 'Average',
                    summary: analysis.summary || '',
                    breakdown: analysis.breakdown || {},
                    skillsFound: analysis.skillsFound || { technical: [], soft: [] },
                    strengths: analysis.strengths || [],
                    improvements: analysis.improvements || [],
                });
            } catch (saveErr) {
                console.error('Failed to save ResumeScan to database:', saveErr);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Resume scanned and ATS score calculated successfully.',
            data: analysis,
        });

    } catch (error) {
        console.error('Error in scanResumeController:', error);
        const rawMessage = error && error.message ? String(error.message).trim() : '';
        const isUnavailable = /(503|unavailable|high demand|spikes in demand)/i.test(rawMessage);
        const statusCode = isUnavailable ? 503 : (error && error.statusCode ? error.statusCode : 500);
        const code = error && error.code && !rawMessage.startsWith('{') ? error.code : 'TECHNICAL_ERROR';

        return res.status(statusCode).json({
            success: false,
            message: formatSafeErrorMessage(error),
            code,
        });
    }
}

module.exports = {
    scanResumeController,
};
