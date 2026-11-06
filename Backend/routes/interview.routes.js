const express = require('express');
const multer = require('multer');
const { authUser } = require('../middlewares/auth.middleware');
const { aiRateLimiter } = require('../middlewares/aiRateLimiter');
const { startInterviewController, evaluateAnswerController } = require('../controllers/interviewController');

const router = express.Router();

// Memory storage — resume and optional JD file (5 MB each)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

// POST /api/interview/start  — generate questions
router.post(
    '/start',
    authUser,
    aiRateLimiter,
    upload.fields([
        { name: 'resume',         maxCount: 1 },
        { name: 'jobDescription', maxCount: 1 },
    ]),
    startInterviewController
);

// POST /api/interview/evaluate  — score one answer
router.post('/evaluate', authUser, aiRateLimiter, evaluateAnswerController);

module.exports = router;
