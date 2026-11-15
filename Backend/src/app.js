const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer');

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g., mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const authRouter      = require('../routes/auth.routes');
const atsRouter       = require('../routes/ats.routes');
const matchRouter     = require('../routes/match.routes');
const interviewRouter = require('../routes/interview.routes');
const dashboardRouter = require('../routes/dashboard.routes');

app.use('/api/auth',      authRouter);
app.use('/api/ats',       atsRouter);
app.use('/api/match',     matchRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/dashboard', dashboardRouter);

// Centralized error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                message: 'The uploaded file exceeds the 5MB size limit.',
                code: 'FILE_TOO_LARGE',
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload error.',
            code: err.code || 'FILE_UPLOAD_ERROR',
        });
    }

    if (err) {
        console.error('Unhandled application error:', err);
        const statusCode = err.statusCode || err.status || 500;
        return res.status(statusCode).json({
            success: false,
            message: err.message || 'An unexpected error occurred.',
            code: err.code || 'INTERNAL_SERVER_ERROR',
        });
    }

    next();
});

module.exports = app;
