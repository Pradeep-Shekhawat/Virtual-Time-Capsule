const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const capsuleRoutes = require('./routes/capsules');
const { initializeDatabase, pool } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
const app = express();

// Basic security
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// Serve uploaded media
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Capsule routes
app.use('/api/capsules', capsuleRoutes);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Function to delete capsules whose unlock_date is before today
async function deleteExpiredCapsules() {
  try {
    const [result] = await pool.execute(
      `DELETE FROM capsules WHERE unlock_date < CURDATE()`
    );
    console.log(`Deleted ${result.affectedRows} expired capsules`);
  } catch (error) {
    console.error('Error deleting expired capsules:', error);
  }
}

// Initialize DB, remove expired capsules, then start server
(async () => {
  await initializeDatabase();
  await deleteExpiredCapsules();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})().catch((err) => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});