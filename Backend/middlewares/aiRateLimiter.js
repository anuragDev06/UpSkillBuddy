const { rateLimit, MemoryStore, ipKeyGenerator } = require('express-rate-limit');

function parsePositiveInteger(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getAiRateLimitConfig() {
    return {
        windowMs: parsePositiveInteger(process.env.AI_RATE_LIMIT_WINDOW_MS, 60 * 1000),
        max: parsePositiveInteger(process.env.AI_RATE_LIMIT_MAX_REQUESTS, 10),
        message: process.env.AI_RATE_LIMIT_MESSAGE || 'Too many AI requests. Please try again later.',
    };
}

function createAiRateLimiter(overrides = {}) {
    const config = { ...getAiRateLimitConfig(), ...overrides };

    return rateLimit({
        store: new MemoryStore(),
        windowMs: config.windowMs,
        max: config.max,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            if (req.user?.id) {
                return `user:${req.user.id}`;
            }
            return `ip:${ipKeyGenerator(req)}`;
        },
        handler: (req, res) => {
            const responseMessage = config.message || 'Too many AI requests. Please try again later.';
            res.status(429).json({
                success: false,
                message: responseMessage,
            });
        },
        message: {
            success: false,
            message: config.message || 'Too many AI requests. Please try again later.',
        },
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
    });
}

const aiRateLimiter = createAiRateLimiter();

module.exports = {
    aiRateLimiter,
    createAiRateLimiter,
    getAiRateLimitConfig,
};
