const request = require('supertest');
const jwt = require('jsonwebtoken');

const makeToken = (userId = 'user-123') => {
    return jwt.sign({ id: userId, username: 'tester' }, process.env.JWT_SECRET || 'test-secret');
};

const loadApp = (rateLimitMax = '5', rateLimitWindowMs = '60000') => {
    jest.resetModules();
    process.env.JWT_SECRET = 'test-secret';
    process.env.AI_RATE_LIMIT_MAX_REQUESTS = String(rateLimitMax);
    process.env.AI_RATE_LIMIT_WINDOW_MS = String(rateLimitWindowMs);
    process.env.AI_RATE_LIMIT_MESSAGE = 'Too many AI requests. Please try again later.';

    jest.doMock('../models/blacklist.model', () => ({
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
    }));

    jest.doMock('../services/atsService', () => ({
        calculateAtsScore: jest.fn().mockResolvedValue({
            totalScore: 86,
            breakdown: { overall: { score: 86 } },
            skillsFound: { technical: ['react', 'node'] },
        }),
        extractTextFromFile: jest.fn().mockResolvedValue('Sample resume text'),
    }));

    jest.doMock('../controllers/interviewController', () => ({
        startInterviewController: jest.fn((req, res) => res.status(200).json({
            success: true,
            message: 'Interview session created successfully.',
            data: { sessionId: 'session-1' },
        })),
        evaluateAnswerController: jest.fn((req, res) => res.status(200).json({
            success: true,
            message: 'Answer evaluated successfully.',
            data: { score: 88 },
        })),
    }));

    return require('../src/app');
};

describe('AI endpoint auth and rate limit behavior', () => {
    test('authenticated requests below the limit can reach the ATS controller', async () => {
        const app = loadApp();
        const atsService = require('../services/atsService');

        const res = await request(app)
            .post('/api/ats/scan')
            .set('Cookie', `token=${makeToken()}`)
            .send({ resumeText: 'Strong React engineer with Node.js background.' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(atsService.calculateAtsScore).toHaveBeenCalledWith('Strong React engineer with Node.js background.');
    });

    test('unauthenticated requests are rejected', async () => {
        const app = loadApp();

        const res = await request(app)
            .post('/api/ats/scan')
            .send({ resumeText: 'A resume' });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBeDefined();
    });

    test('requests over the limit receive HTTP 429 and the expected JSON shape', async () => {
        const app = loadApp(1, 60000);
        const token = makeToken('user-rate-limit');

        const first = await request(app)
            .post('/api/ats/scan')
            .set('Cookie', `token=${token}`)
            .send({ resumeText: 'First request' });

        const second = await request(app)
            .post('/api/ats/scan')
            .set('Cookie', `token=${token}`)
            .send({ resumeText: 'Second request' });

        expect(first.statusCode).toBe(200);
        expect(second.statusCode).toBe(429);
        expect(second.body).toEqual({
            success: false,
            message: 'Too many AI requests. Please try again later.',
        });
        expect(second.headers['ratelimit-limit']).toBe('1');
    });

    test('upload routes reject over-limit requests before Multer/controller processing', async () => {
        const app = loadApp(1, 60000);
        const token = makeToken('user-upload-rate-limit');
        const interviewController = require('../controllers/interviewController');

        const first = await request(app)
            .post('/api/interview/start')
            .set('Cookie', `token=${token}`)
            .attach('resume', Buffer.from('resume content'), { filename: 'resume.txt', contentType: 'text/plain' })
            .field('jobDescriptionText', 'Backend engineer role')
            .field('interviewType', 'technical')
            .field('difficulty', 'mid')
            .field('questionCount', '5');

        const second = await request(app)
            .post('/api/interview/start')
            .set('Cookie', `token=${token}`)
            .attach('resume', Buffer.from('resume content'), { filename: 'resume.txt', contentType: 'text/plain' })
            .field('jobDescriptionText', 'Backend engineer role')
            .field('interviewType', 'technical')
            .field('difficulty', 'mid')
            .field('questionCount', '5');

        expect(first.statusCode).toBe(200);
        expect(second.statusCode).toBe(429);
        expect(second.body.success).toBe(false);
        expect(interviewController.startInterviewController).toHaveBeenCalledTimes(1);
    });
});
