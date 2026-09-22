const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const env = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { UPLOAD_ROOT } = require('./services/storage/localStorageAdapter');

const createApp = () => {
  const app = express();

  // Behind a load balancer this makes req.ip (and therefore rate limiting) accurate.
  app.set('trust proxy', 1);

  // crossOriginResourcePolicy is relaxed so the app can load uploaded media from
  // a different origin than the one serving the API.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: env.cors.origins.includes('*') ? true : env.cors.origins,
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (!env.isProduction) app.use(morgan('dev'));

  // Submission media. In production this is served by object storage + CDN instead.
  app.use('/uploads', express.static(UPLOAD_ROOT, { maxAge: '1d', index: false }));

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
