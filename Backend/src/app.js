const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');



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


app.use('/api/auth',      authRouter);
app.use('/api/ats',       atsRouter);
app.use('/api/match',     matchRouter);
app.use('/api/interview', interviewRouter);




module.exports = app;