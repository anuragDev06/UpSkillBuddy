const request = require('supertest');
const app = require('../src/app');
const userModel = require('../models/user.model');
const tokenBlackListModel = require('../models/blacklist.model');

// Mock Mongoose models so tests run isolated from database connection
jest.mock('../models/user.model');
jest.mock('../models/blacklist.model');

describe('Auth API Controller Endpoints - Unit & Validation Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        test('should return 400 error when required fields are missing', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'testuser' }); // missing email & password

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Please provide all required fields');
        });

        test('should return 400 error if username already exists', async () => {
            userModel.findOne.mockResolvedValue({ username: 'existinguser', email: 'other@example.com' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'existinguser',
                    email: 'newemail@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('User with this username already exists');
        });

        test('should return 400 error if email already exists', async () => {
            userModel.findOne.mockResolvedValue({ username: 'differentuser', email: 'existing@example.com' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'newuser',
                    email: 'existing@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('User already exists with this email');
        });
    });

    describe('POST /api/auth/login', () => {
        test('should return 400 error if user does not exist', async () => {
            userModel.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid email or password');
        });
    });

    describe('GET /api/auth/logout', () => {
        test('should clear auth cookie and return 200 success response', async () => {
            tokenBlackListModel.create.mockResolvedValue({});

            const res = await request(app)
                .get('/api/auth/logout');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Logout successfully');
        });
    });

});
