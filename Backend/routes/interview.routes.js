const express = require('express');
const multer = require('multer');
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
    upload.fields([
        { name: 'resume',         maxCount: 1 },
        { name: 'jobDescription', maxCount: 1 },
    ]),
    startInterviewController
);

// POST /api/interview/evaluate  — score one answer
router.post('/evaluate', evaluateAnswerController);

module.exports = router;
