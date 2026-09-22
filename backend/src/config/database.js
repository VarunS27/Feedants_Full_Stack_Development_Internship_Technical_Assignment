const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

/**
 * Connection pool is sized for a multi-instance deployment: each process keeps a
 * bounded pool so a fleet of API containers cannot exhaust MongoDB connections.
 */
const connectDatabase = async (uri = env.mongoUri) => {
  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB error', err));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  await mongoose.connect(uri, {
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 20),
    minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 2),
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  return mongoose.connection;
};

const disconnectDatabase = async () => {
  await mongoose.connection.close();
};

module.exports = { connectDatabase, disconnectDatabase };
