require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const http = require('http');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const apiLimiter = require('./middleware/rateLimiter');
const initWebSocket = require('./websocket/liveQuotes');

// Routes
const predictRoutes = require('./routes/predict');
const historyRoutes = require('./routes/history');
const compareRoutes = require('./routes/compare');
const alertsRoutes = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect Database
connectDB();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use('/api', apiLimiter);

// Setup HTTP Server & WebSockets
const server = http.createServer(app);
initWebSocket(server);

// API Routes
app.get('/api/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  res.json({
    status: 'ok',
    mongo: mongoState === 1 ? 'connected' : 'disconnected',
    python: 'reachable'
  });
});

app.use('/api/predict', predictRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/holding-report', require('./routes/holdingReport'));

// Error Handling
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Node Server running on port ${PORT}`);
});
