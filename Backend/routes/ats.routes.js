const express = require('express');
const multer = require('multer');
const { scanResumeController } = require('../controllers/atsController');

const router = express.Router();

// Memory storage for multer file uploads (5MB max size)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Endpoint for resume scanning
router.post('/scan', upload.single('resume'), scanResumeController);

module.exports = router;
