const mongoose = require('mongoose');
const userModel = require('../models/user.model');
const ResumeScan = require('../models/resumeScan.model');
const InterviewSession = require('../models/interviewSession.model');

/**
 * GET /api/dashboard/overview
 * Consolidates user profile, last uploaded resume ATS score, active interview progress, and quick stats.
 */
async function getDashboardOverviewController(req, res) {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, message: 'Unauthorized or invalid user ID' });
        }

        const user = await userModel.findById(userId).select('username email');
        const lastResumeScan = await ResumeScan.findOne({ userId }).sort({ createdAt: -1 });

        // Prefer active in-progress session, or fallback to the latest session
        let activeSession = await InterviewSession.findOne({ userId, status: 'in-progress' }).sort({ updatedAt: -1 });
        if (!activeSession) {
            activeSession = await InterviewSession.findOne({ userId }).sort({ updatedAt: -1 });
        }

        const totalInterviews = await InterviewSession.countDocuments({ userId });
        const completedInterviews = await InterviewSession.countDocuments({ userId, status: 'completed' });
        const inProgressInterviews = await InterviewSession.countDocuments({ userId, status: 'in-progress' });

        const completedList = await InterviewSession.find({
            userId,
            status: 'completed',
            overallScore: { $ne: null },
        }).select('overallScore');

        const averageInterviewScore = completedList.length > 0
            ? Math.round(completedList.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / completedList.length)
            : null;

        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user?._id,
                    username: user?.username || 'User',
                    email: user?.email || '',
                },
                lastResumeScan: lastResumeScan ? {
                    id: lastResumeScan._id,
                    fileName: lastResumeScan.fileName,
                    fileSize: lastResumeScan.fileSize,
                    atsScore: lastResumeScan.atsScore,
                    status: lastResumeScan.status,
                    summary: lastResumeScan.summary,
                    strengths: lastResumeScan.strengths || [],
                    improvements: lastResumeScan.improvements || [],
                    scannedAt: lastResumeScan.createdAt,
                } : null,
                activeInterview: activeSession ? {
                    sessionId: activeSession._id,
                    title: activeSession.title,
                    companyName: activeSession.companyName,
                    interviewType: activeSession.interviewType,
                    difficulty: activeSession.difficulty,
                    totalQuestions: activeSession.totalQuestions,
                    currentIndex: activeSession.currentIndex,
                    answeredCount: activeSession.questions.filter(
                        q => q.evaluation && typeof q.evaluation.score === 'number'
                    ).length,
                    progressPercentage: Math.round(
                        (activeSession.questions.filter(
                            q => q.evaluation && typeof q.evaluation.score === 'number'
                        ).length / (activeSession.totalQuestions || 1)) * 100
                    ),
                    status: activeSession.status,
                    overallScore: activeSession.overallScore,
                    lastActiveAt: activeSession.lastActiveAt || activeSession.updatedAt,
                } : null,
                stats: {
                    totalInterviews,
                    completedInterviews,
                    inProgressInterviews,
                    averageInterviewScore,
                },
            },
        });
    } catch (error) {
        console.error('Error in getDashboardOverviewController:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to load dashboard overview.',
            error: error.message,
        });
    }
}

module.exports = {
    getDashboardOverviewController,
};
