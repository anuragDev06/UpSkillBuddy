const config = require('./config');

/**
 * Extracts and normalizes the lowercase extension from a Multer file object.
 * @param {Object} file
 * @returns {string}
 */
function getFileExtension(file) {
    const fileName = file?.originalname || file?.name || '';
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

/**
 * Checks if a buffer begins with the PDF magic bytes "%PDF-".
 * @param {Buffer} buffer
 * @returns {boolean}
 */
function hasValidPdfSignature(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 5) return false;
    return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
}

/**
 * Checks if a buffer has ZIP magic bytes and contains Office Open XML Word markers.
 * @param {Buffer} buffer
 * @returns {boolean}
 */
function hasValidDocxSignature(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 4) return false;
    // Standard ZIP signature 'PK\x03\x04' or 'PK'
    if (buffer[0] !== 0x50 || buffer[1] !== 0x4B) return false;

    // Verify presence of OpenXML / Word package markers
    const hasXmlMarker = buffer.includes(Buffer.from('[Content_Types].xml'));
    const hasWordMarker = buffer.includes(Buffer.from('word/'));
    return hasXmlMarker || hasWordMarker;
}

/**
 * Checks if a buffer appears to be non-text binary data disguised as plain text.
 * @param {Buffer} buffer
 * @returns {boolean}
 */
function looksLikeBinaryBuffer(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) return true;

    const sample = buffer.subarray(0, Math.min(buffer.length, 2048));
    let suspicious = 0;

    for (const byte of sample) {
        if (byte === 0) {
            // Null byte is a strong indicator of binary content
            return true;
        }
        // Printable ASCII: 32-126, plus TAB (9), LF (10), CR (13)
        const isPrintable = (byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13;
        // Common UTF-8 multi-byte leading/continuation bytes: 128-255
        const isExtended = byte >= 128 && byte <= 255;

        if (!isPrintable && !isExtended) {
            suspicious++;
        }
    }

    return sample.length > 0 && suspicious / sample.length > 0.15;
}

/**
 * Validates an uploaded resume file prior to content extraction.
 *
 * Performs multi-layer checks:
 * 1. Payload existence & 0-byte buffer.
 * 2. File size limit enforcement.
 * 3. File extension and MIME type allowlist.
 * 4. File signature / magic bytes verification.
 * 5. Document structural integrity.
 *
 * @param {Object} file - Multer file object
 * @returns {Object} Validation result { isValid, format, code, message, statusCode }
 */
function validateUploadedFile(file) {
    if (!file || !file.buffer) {
        return {
            isValid: false,
            code: 'EMPTY_DOCUMENT',
            message: 'Please upload a valid resume file.',
            statusCode: 400,
        };
    }

    if (file.buffer.length === 0) {
        return {
            isValid: false,
            code: 'EMPTY_DOCUMENT',
            message: 'The uploaded file is empty (0 bytes).',
            statusCode: 400,
        };
    }

    if (file.size > config.maxFileSizeBytes || file.buffer.length > config.maxFileSizeBytes) {
        return {
            isValid: false,
            code: 'FILE_TOO_LARGE',
            message: 'The uploaded resume exceeds the 5MB size limit.',
            statusCode: 413,
        };
    }

    const extension = getFileExtension(file);
    const mimetype = (file.mimetype || '').toLowerCase();

    // Determine target format
    let format = null;
    if (extension === 'pdf' || mimetype === 'application/pdf') {
        format = 'pdf';
    } else if (
        extension === 'docx' ||
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimetype === 'application/msword'
    ) {
        format = 'docx';
    } else if (extension === 'txt' || mimetype.startsWith('text/')) {
        format = 'txt';
    }

    if (!format || !config.allowedExtensions.includes(extension)) {
        return {
            isValid: false,
            code: 'INVALID_FILE_TYPE',
            message: 'Unsupported file format. Please upload a PDF, DOCX, or TXT resume.',
            statusCode: 415,
        };
    }

    // Magic bytes & deep integrity checks
    if (format === 'pdf') {
        if (!hasValidPdfSignature(file.buffer)) {
            return {
                isValid: false,
                code: 'CORRUPTED_DOCUMENT',
                message: 'The uploaded PDF file is corrupted, malformed, or has an invalid file signature.',
                statusCode: 422,
            };
        }
    } else if (format === 'docx') {
        if (!hasValidDocxSignature(file.buffer)) {
            return {
                isValid: false,
                code: 'CORRUPTED_DOCUMENT',
                message: 'The uploaded DOCX file is corrupted, malformed, or not a genuine Word document.',
                statusCode: 422,
            };
        }
    } else if (format === 'txt') {
        if (looksLikeBinaryBuffer(file.buffer)) {
            return {
                isValid: false,
                code: 'CORRUPTED_DOCUMENT',
                message: 'The uploaded TXT file contains binary or unreadable content.',
                statusCode: 422,
            };
        }
    }

    return {
        isValid: true,
        format,
    };
}

module.exports = {
    getFileExtension,
    hasValidPdfSignature,
    hasValidDocxSignature,
    looksLikeBinaryBuffer,
    validateUploadedFile,
};
