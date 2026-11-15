/**
 * Text Normalization and Metric Utilities
 * Cleans extracted resume text while preserving structural section boundaries,
 * lists, and line structures necessary for resume parsing.
 */

/**
 * Normalizes raw extracted text from resumes.
 *
 * 1. Unifies carriage returns (\r\n, \r -> \n).
 * 2. Removes non-breaking and zero-width spaces.
 * 3. Normalizes multiple horizontal spaces to a single space while keeping newlines.
 * 4. Collapses excessive blank lines (3+ to 2) to preserve section spacing.
 * 5. Normalizes bullet glyphs to standard dashes for consistent parser recognition.
 * 6. Trims leading and trailing whitespace.
 *
 * @param {string} rawText
 * @returns {string}
 */
function normalizeResumeText(rawText) {
    if (typeof rawText !== 'string') return '';

    return rawText
        // Replace carriage returns
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Remove zero-width spaces, byte order marks, and non-breaking spaces
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\u00A0/g, ' ')
        // Normalize various bullet point characters to standard '-'
        .replace(/^[ \t]*[•▪▫●★▶►✓✔–—][ \t]*/gm, '- ')
        // Collapse multiple spaces or tabs on a single line to a single space
        .replace(/[^\S\n]+/g, ' ')
        // Trim trailing space from each line
        .replace(/[ \t]+$/gm, '')
        // Collapse 3 or more consecutive newlines into 2
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Calculates quantitative textual metrics used by subsequent validation layers.
 *
 * @param {string} text - Normalized text
 * @returns {Object} { wordCount, charCount, lineCount, uniqueWordRatio, unreadableCharRatio }
 */
function getTextMetrics(text) {
    if (!text || typeof text !== 'string') {
        return {
            wordCount: 0,
            charCount: 0,
            lineCount: 0,
            uniqueWordCount: 0,
            lexicalDiversity: 0,
            unreadableCharRatio: 0,
        };
    }

    const words = text.split(/\s+/).filter(Boolean);
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    // Filter lowercased words with letters/digits for lexical diversity
    const cleanWords = words
        .map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
        .filter((w) => w.length > 1);

    const uniqueWords = new Set(cleanWords);
    const lexicalDiversity = words.length > 0 ? uniqueWords.size / words.length : 0;

    // Characters outside standard printable ASCII, common punctuation, symbols, and formatting
    const unreadableCharacters = text.replace(
        /[A-Za-z0-9\s.,;:'"()\-–—\/\[\]@+&%#$*!?=<>{}|~`\n]/g,
        ''
    ).length;

    const unreadableCharRatio = text.length > 0 ? unreadableCharacters / text.length : 0;

    return {
        wordCount: words.length,
        charCount: text.length,
        lineCount: lines.length,
        uniqueWordCount: uniqueWords.size,
        lexicalDiversity,
        unreadableCharRatio,
        words,
        lines,
    };
}

module.exports = {
    normalizeResumeText,
    getTextMetrics,
};
