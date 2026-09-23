const createApp = require('./app');
const env = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const logger = require('./utils/logger');

const autoSeed = require('./seed/autoSeed');

const start = async () => {
  await connectDatabase();
  await autoSeed();

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`Feedants API listening on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    // Do not let a hung connection block the container forever.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, () => shutdown(signal)));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', reason);
  });
};

start().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
