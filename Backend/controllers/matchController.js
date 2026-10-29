const { analyzeMatch, extractTextFromFile } = require('../services/matchService');

/**
 * Controller to compare a resume against a job description and return a
 * Gemini-powered match score report.
 *
 * Accepts multipart/form-data with:
 *   - resume        (File)   — required
 *   - jobDescription (File)  — optional; used when jdMode === "file"
 *   - jobDescriptionText (string) — optional; used when jdMode === "text"
 */
async function matchResumeController(req, res) {
    try {
        // ── Extract resume text ───────────────────────────────────────────────
        if (!req.files?.resume?.[0]) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a resume file (PDF, DOCX, or TXT).',
            });
        }

        const resumeText = await extractTextFromFile(req.files.resume[0]);

        if (!resumeText?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Could not extract text from the resume. Ensure the file contains readable content.',
            });
        }

        // ── Extract job description text ──────────────────────────────────────
        let jobDescriptionText = '';

        if (req.files?.jobDescription?.[0]) {
            // JD uploaded as a file
            jobDescriptionText = await extractTextFromFile(req.files.jobDescription[0]);
        } else if (req.body?.jobDescriptionText?.trim()) {
            // JD pasted as plain text
            jobDescriptionText = req.body.jobDescriptionText;
        }

        if (!jobDescriptionText?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a job description (paste text or upload a file).',
            });
        }

        // ── Run analysis ──────────────────────────────────────────────────────
        const analysis = await analyzeMatch(resumeText, jobDescriptionText);

        return res.status(200).json({
            success: true,
            message: 'Resume match analysis completed successfully.',
            data: analysis,
        });

    } catch (error) {
        console.error('Error in matchResumeController:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'An error occurred while analyzing the match.',
        });
    }
}

module.exports = { matchResumeController };
