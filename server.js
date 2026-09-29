require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const adminRoutes = require('./routes/adminRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177'
].filter(Boolean); // Filter out undefined values if any are missing

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Root endpoint for testing
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'NCFM API is running',
  });
});

// Mount routes
app.use('/api/admin', adminRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`NCFM API running on port ${PORT}`);
});

module.exports = app;
