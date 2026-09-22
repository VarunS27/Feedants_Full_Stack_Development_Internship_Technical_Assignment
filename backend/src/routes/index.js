const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./authRoutes');
const competitionRoutes = require('./competitionRoutes');
const uploadRoutes = require('./uploadRoutes');
const { sendSuccess } = require('../utils/http');

const router = express.Router();

router.get('/health', (_req, res) =>
  sendSuccess(res, {
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    serverTime: new Date().toISOString(),
  })
);

router.use('/auth', authRoutes);
router.use('/competitions', competitionRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;
