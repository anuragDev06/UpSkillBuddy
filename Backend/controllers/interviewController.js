const {
    generateQuestions,
    evaluateAnswer,
    extractTextFromFile,
} = require('../services/interviewService');

/**
 * POST /api/interview/start
 *
 * Accepts multipart/form-data:
 *   - resume              (File, required)
 *   - jobDescription      (File, optional)
 *   - jobDescriptionText  (string, optional)
 *   - interviewType       (string, required)
 *   - difficulty          (string, required)
 *   - questionCount       (string/number, required)
 *   - companyName         (string, optional)
 */
async function startInterviewController(req, res) {
    try {
        // ── Resume ─────────────────────────────────────────────────────────────
        if (!req.files?.resume?.[0]) {
            return res.status(400).json({ success: false, message: 'Please upload a resume file.' });
        }

        const resumeText = await extractTextFromFile(req.files.resume[0]);
        if (!resumeText?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Could not extract text from the resume. Ensure it contains readable content.',
            });
        }

        // ── Job Description ────────────────────────────────────────────────────
        let jobDescriptionText = '';
        if (req.files?.jobDescription?.[0]) {
            jobDescriptionText = await extractTextFromFile(req.files.jobDescription[0]);
        } else if (req.body?.jobDescriptionText?.trim()) {
            jobDescriptionText = req.body.jobDescriptionText;
        }

        if (!jobDescriptionText?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a job description (paste text or upload a file).',
            });
        }

        // ── Settings ───────────────────────────────────────────────────────────
        const settings = {
            interviewType: req.body.interviewType || 'technical',
            difficulty:    req.body.difficulty    || 'mid',
            questionCount: Math.min(Math.max(parseInt(req.body.questionCount, 10) || 5, 3), 15),
            companyName:   req.body.companyName   || '',
        };

        // ── Generate ───────────────────────────────────────────────────────────
        const session = await generateQuestions(resumeText, jobDescriptionText, settings);

        return res.status(200).json({
            success: true,
            message: 'Interview session created successfully.',
            data: session,
        });

    } catch (error) {
        console.error('Error in startInterviewController:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate interview questions.',
        });
    }
}

/**
 * POST /api/interview/evaluate
 *
 * Body (JSON):
 *   - question      (string, required)
 *   - answer        (string, required)
 *   - questionType  (string, optional, default "technical")
 *   - difficulty    (string, optional, default "mid")
 */
async function evaluateAnswerController(req, res) {
    try {
        const { question, answer, questionType = 'technical', difficulty = 'mid' } = req.body;

        if (!question?.trim()) {
            return res.status(400).json({ success: false, message: 'Question is required.' });
        }
        if (!answer?.trim()) {
            return res.status(400).json({ success: false, message: 'Answer is required.' });
        }

        const evaluation = await evaluateAnswer(question, answer, questionType, difficulty);

        return res.status(200).json({
            success: true,
            message: 'Answer evaluated successfully.',
            data: evaluation,
        });

    } catch (error) {
        console.error('Error in evaluateAnswerController:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to evaluate the answer.',
        });
    }
}

module.exports = { startInterviewController, evaluateAnswerController };
