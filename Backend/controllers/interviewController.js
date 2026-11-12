const {
    generateQuestions,
    evaluateAnswer,
    extractTextFromFile,
} = require('../services/interviewService');
const mongoose = require('mongoose');
const InterviewSession = require('../models/interviewSession.model');

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

        // ── Persist session in DB for authenticated user ─────────────────────────
        const userId = req.user?.id || req.user?._id;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            try {
                const formattedTitle = `${settings.interviewType.charAt(0).toUpperCase() + settings.interviewType.slice(1)} Interview`;
                const newSession = await InterviewSession.create({
                    userId,
                    title: formattedTitle,
                    companyName: settings.companyName || '',
                    interviewType: settings.interviewType,
                    difficulty: settings.difficulty,
                    totalQuestions: session.totalQuestions,
                    currentIndex: 0,
                    status: 'in-progress',
                    questions: session.questions.map((q, idx) => ({
                        id: q.id ?? idx + 1,
                        question: q.question,
                        type: q.type || settings.interviewType,
                        difficulty: q.difficulty || settings.difficulty,
                        hint: q.hint || '',
                        userAnswer: '',
                        evaluation: null,
                    })),
                    overallScore: null,
                    lastActiveAt: new Date(),
                });
                session.sessionId = newSession._id;
            } catch (dbErr) {
                console.error('Failed to save interview session to DB:', dbErr);
            }
        }

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
 *   - sessionId     (string, optional)
 *   - questionIndex (number, optional)
 */
async function evaluateAnswerController(req, res) {
    try {
        const { question, answer, questionType = 'technical', difficulty = 'mid', sessionId, questionIndex } = req.body;

        if (!question?.trim()) {
            return res.status(400).json({ success: false, message: 'Question is required.' });
        }
        if (!answer?.trim()) {
            return res.status(400).json({ success: false, message: 'Answer is required.' });
        }

        const evaluation = await evaluateAnswer(question, answer, questionType, difficulty);

        // ── Persist evaluation to session if sessionId is provided ──────────────
        const userId = req.user?.id || req.user?._id;
        if (sessionId && userId && mongoose.Types.ObjectId.isValid(userId) && mongoose.Types.ObjectId.isValid(sessionId)) {
            try {
                const session = await InterviewSession.findOne({ _id: sessionId, userId });
                if (session) {
                    const idx = typeof questionIndex === 'number' && questionIndex >= 0
                        ? questionIndex
                        : session.questions.findIndex(q => q.question === question);

                    if (idx !== -1 && session.questions[idx]) {
                        session.questions[idx].userAnswer = answer;
                        session.questions[idx].evaluation = evaluation;
                        session.currentIndex = Math.min(idx + 1, session.totalQuestions - 1);
                    }

                    // Check if all questions have evaluations
                    const answeredCount = session.questions.filter(
                        q => q.evaluation && typeof q.evaluation.score === 'number'
                    ).length;

                    if (answeredCount >= session.totalQuestions) {
                        session.status = 'completed';
                        const totalScore = session.questions.reduce((sum, q) => sum + (q.evaluation?.score || 0), 0);
                        session.overallScore = Math.round((totalScore / (session.totalQuestions * 10)) * 100);
                    }

                    session.lastActiveAt = new Date();
                    await session.save();
                }
            } catch (dbErr) {
                console.error('Failed to update interview session in DB:', dbErr);
            }
        }

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

/**
 * GET /api/interview/session/:id
 * Fetches an interview session by ID for resuming
 */
async function getSessionController(req, res) {
    try {
        const userId = req.user?.id || req.user?._id;
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid session ID provided.',
            });
        }

        const session = await InterviewSession.findOne({ _id: id, userId });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Interview session not found.',
            });
        }

        return res.status(200).json({
            success: true,
            data: session,
        });
    } catch (error) {
        console.error('Error in getSessionController:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve interview session.',
        });
    }
}

module.exports = {
    startInterviewController,
    evaluateAnswerController,
    getSessionController,
};
