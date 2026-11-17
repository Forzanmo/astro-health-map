// Builds the Express app. Exported so tests can start it on any port.
const express = require('express');
const cors = require('cors');
const { clientUrls } = require('./config');
const { sessionMiddleware } = require('./middleware/session');
const { notFound, errorHandler } = require('./middleware/errors');
const apiRoutes = require('./routes/api');
const { streamRoute } = require('./routes/stream');

function createApp() {
  const app = express();
  app.use(cors({
    origin: clientUrls,                                   // exact origins only
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Session-Id']
  }));
  app.use(express.json({ limit: '256kb' }));
  app.get('/health', (req, res) => res.type('text/plain').send('ok'));
  app.get('/api/v1/stream', sessionMiddleware, streamRoute);
  app.use('/api/v1', sessionMiddleware, apiRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
