const express = require('express');
const multer = require('multer');
const { authUser } = require('../middlewares/auth.middleware');
const { aiRateLimiter } = require('../middlewares/aiRateLimiter');
const { matchResumeController } = require('../controllers/matchController');

const router = express.Router();

// Memory storage — accepts both resume and JD as optional file uploads (5 MB each)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

// POST /api/match/analyze
// Fields: resume (file, required), jobDescription (file, optional), jobDescriptionText (text, optional)
router.post(
    '/analyze',
    authUser,
    aiRateLimiter,
    upload.fields([
        { name: 'resume',          maxCount: 1 },
        { name: 'jobDescription',  maxCount: 1 },
    ]),
    matchResumeController
);

module.exports = router;
