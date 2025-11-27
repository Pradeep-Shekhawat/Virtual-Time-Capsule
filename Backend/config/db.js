const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// build pool config either from DATABASE_URL or from individual vars
function makePoolConfig() {
  if (process.env.DATABASE_URL) {
    // DATABASE_URL format: mysql://user:pass@host:port/dbname
    try {
      const url = new URL(process.env.DATABASE_URL);
      const [user, password] = (url.username || url.password) ? [url.username, url.password] : [null, null];
      const database = url.pathname ? url.pathname.replace(/^\//, '') : undefined;

      const cfg = {
        host: url.hostname,
        port: url.port ? Number(url.port) : 3306,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
        queueLimit: 0,
        connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT) || 10000,
      };

      // Optional SSL: set DB_SSL=true in env to enable (some hosts require)
      if (process.env.DB_SSL === 'true') {
        cfg.ssl = { rejectUnauthorized: false };
      }

      console.log('DB: using DATABASE_URL (parsed) host=', cfg.host, 'db=', cfg.database);
      return cfg;
    } catch (err) {
      console.error('DB: invalid DATABASE_URL format', err);
      throw err;
    }
  }

  // fallback to separate environment variables (local dev)
  const cfg = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT),
    queueLimit: 0,
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT)
  };

  // Optional SSL for local override
  if (process.env.DB_SSL === 'true') {
    cfg.ssl = { rejectUnauthorized: false };
  }

  console.log('DB: using individual DB_* env vars host=', cfg.host, 'db=', cfg.database);
  return cfg;
}

const poolConfig = makePoolConfig();
const pool = mysql.createPool(poolConfig);

async function initializeDatabase() {
  try {
    const conn = await pool.getConnection();

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS capsules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        capsule_type ENUM('private','public') NOT NULL,
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS access_tokens (
        token VARCHAR(255) PRIMARY KEY,
        capsule_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME DEFAULT NULL,
        FOREIGN KEY (capsule_id) REFERENCES capsules(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
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

// Log pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

module.exports = {
  pool,
  initializeDatabase
};
