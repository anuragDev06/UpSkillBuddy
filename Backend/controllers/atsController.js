const atsService = require('../services/atsService');

/**
 * Controller to process resume file or text input and return ATS score evaluation
 */
async function scanResumeController(req, res) {
    try {
        let resumeText = '';

        if (req.file) {
            resumeText = await atsService.extractTextFromFile(req.file);
        } else if (req.body && req.body.resumeText) {
            resumeText = req.body.resumeText;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Please upload a resume file (PDF, DOCX, TXT) or provide plain text resume content.'
            });
        }

        if (!resumeText || !resumeText.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Could not extract text from the provided file. Ensure the file contains readable text.'
            });
        }

        const analysis = await atsService.calculateAtsScore(resumeText);

        return res.status(200).json({
            success: true,
            message: 'Resume scanned and ATS score calculated successfully.',
            data: analysis
        });

    } catch (error) {
        console.error('Error in scanResumeController:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'An error occurred while processing the resume.'
        });
    }
}

module.exports = {
    scanResumeController
};
