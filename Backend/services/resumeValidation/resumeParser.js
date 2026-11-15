const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { validateUploadedFile } = require('./fileValidator');

/**
 * Creates a standard service error carrying error code and HTTP status code.
 * @param {string} code
 * @param {string} message
 * @param {number} statusCode
 * @returns {Error}
 */
function createServiceError(code, message, statusCode = 422) {
    const error = new Error(message);
    error.code = code;
    error.statusCode = statusCode;
    return error;
}

/**
 * Checks whether a PDF buffer likely represents a scanned/image-based document
 * where text extraction yields near-zero characters despite multiple pages or image streams.
 *
 * @param {Buffer} buffer - PDF binary buffer
 * @param {number} extractedTextLength - Length of text extracted from pdf-parse
 * @param {number} numPages - Page count reported by pdf-parse
 * @returns {boolean}
 */
function isScannedOrImagePdf(buffer, extractedTextLength, numPages) {
    // If the PDF has pages but virtually no text (< 30 characters)
    if (numPages >= 1 && extractedTextLength < 30) {
        const bufferStr = buffer.toString('latin1');
        const hasImageMarkers =
            bufferStr.includes('/Image') ||
            bufferStr.includes('/DCTDecode') ||
            bufferStr.includes('/JPXDecode') ||
            bufferStr.includes('/JBIG2Decode') ||
            bufferStr.includes('/XObject');

        if (hasImageMarkers || numPages > 0) {
            return true;
        }
    }
    return false;
}

/**
 * Safely extracts raw text from an uploaded resume file (PDF, DOCX, or TXT).
 *
 * Distinguishes:
 * - Empty / corrupted files.
 * - Unsupported file formats.
 * - Scanned / image-based PDFs (requesting text-based PDF instead of misclassifying as corrupted).
 * - Text extraction successes.
 *
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} { success, text, code, message, statusCode, isScanned }
 */
async function parseResumeFile(file) {
    const fileValidation = validateUploadedFile(file);
    if (!fileValidation.isValid) {
        return {
            success: false,
            code: fileValidation.code,
            message: fileValidation.message,
            statusCode: fileValidation.statusCode,
        };
    }

    const { format } = fileValidation;
    const { buffer } = file;

    try {
        if (format === 'pdf') {
            let pdfData;
            try {
                if (typeof pdfParse === 'function') {
                    pdfData = await pdfParse(buffer);
                } else if (pdfParse && typeof pdfParse.default === 'function') {
                    pdfData = await pdfParse.default(buffer);
                } else {
                    throw createServiceError(
                        'TEXT_EXTRACTION_FAILED',
                        'PDF parsing library missing expected parse function.',
                        500
                    );
                }
            } catch (pdfErr) {
                if (pdfErr.code) throw pdfErr;
                return {
                    success: false,
                    code: 'CORRUPTED_DOCUMENT',
                    message: 'The uploaded PDF file is corrupted or could not be read safely.',
                    statusCode: 422,
                };
            }

            const extractedText = (pdfData?.text || '').trim();
            const numPages = pdfData?.numpages || 1;

            if (isScannedOrImagePdf(buffer, extractedText.length, numPages)) {
                return {
                    success: false,
                    isScanned: true,
                    code: 'SCANNED_DOCUMENT_NOT_SUPPORTED',
                    message: 'Scanned or image-only PDF detected. Please upload a text-based PDF or paste your resume text.',
                    statusCode: 422,
                };
            }

            return {
                success: true,
                text: extractedText,
                format: 'pdf',
                pageCount: numPages,
            };
        }

        if (format === 'docx') {
            try {
                const result = await mammoth.extractRawText({ buffer });
                const extractedText = (result?.value || '').trim();
                return {
                    success: true,
                    text: extractedText,
                    format: 'docx',
                };
            } catch (docxErr) {
                return {
                    success: false,
                    code: 'CORRUPTED_DOCUMENT',
                    message: 'The uploaded DOCX file could not be parsed safely.',
                    statusCode: 422,
                };
            }
        }

        if (format === 'txt') {
            const extractedText = buffer.toString('utf-8').trim();
            return {
                success: true,
                text: extractedText,
                format: 'txt',
            };
        }

        return {
            success: false,
            code: 'INVALID_FILE_TYPE',
            message: 'Unsupported file format. Please upload a PDF, DOCX, or TXT file.',
            statusCode: 415,
        };
    } catch (err) {
        return {
            success: false,
            code: err.code || 'TEXT_EXTRACTION_FAILED',
            message: err.message || 'Unable to extract text from the uploaded resume file.',
            statusCode: err.statusCode || 422,
        };
    }
}

/**
 * Backward-compatible helper that directly extracts text or throws a service error.
 * Used by matchService and legacy atsService imports.
 *
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} Extracted plain text
 */
async function extractTextFromFile(file) {
    if (!file || !file.buffer) {
        throw createServiceError('TEXT_EXTRACTION_FAILED', 'Invalid file payload or missing file buffer.', 400);
    }

    const parseResult = await parseResumeFile(file);
    if (!parseResult.success) {
        throw createServiceError(
            parseResult.code || 'TEXT_EXTRACTION_FAILED',
            parseResult.message || 'Failed to extract text from resume file.',
            parseResult.statusCode || 422
        );
    }

    return parseResult.text;
}

module.exports = {
    createServiceError,
    parseResumeFile,
    extractTextFromFile,
    isScannedOrImagePdf,
};
