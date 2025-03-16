const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
};

const pool = mysql.createPool(poolConfig);

async function initializeDatabase() {
  try {
    const conn = await pool.getConnection();

    // Create capsules table if not exists
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS capsules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        capsule_type ENUM('private', 'public') NOT NULL,
        capsule_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        unlock_date DATE NOT NULL,
        message TEXT NOT NULL,
        public_preview TEXT,
        password_hash VARCHAR(255),
        media_url VARCHAR(255),
        is_opened BOOLEAN DEFAULT FALSE,
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT chk_capsule_name_length CHECK (LENGTH(capsule_name) >= 3)
      )
    `);

    // Create access_tokens table if not exists
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS access_tokens (
        token VARCHAR(255) PRIMARY KEY,
        capsule_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 30 DAY),
        FOREIGN KEY (capsule_id) REFERENCES capsules(id) ON DELETE CASCADE
      )
    `);

    conn.release();
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Critical database initialization error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Log any unexpected pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

module.exports = {
  pool,
  initializeDatabase
};