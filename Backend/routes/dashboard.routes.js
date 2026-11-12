const express = require('express');
const { authUser } = require('../middlewares/auth.middleware');
const { getDashboardOverviewController } = require('../controllers/dashboardController');

const router = express.Router();

// GET /api/dashboard/overview — Authenticated overview for user dashboard
router.get('/overview', authUser, getDashboardOverviewController);

module.exports = router;
