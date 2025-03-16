const { pool } = require('../config/db');
const { sendConfirmationEmail } = require('../utils/emailService');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

class CapsuleError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Create a new capsule
async function createCapsule(req, res, next) {
  let conn;
  try {
    conn = await pool.getConnection();

    const capsuleData = {
      capsule_type: req.body.capsuleType || 'private',
      capsule_name: req.body.capsuleName?.trim(),
      email: req.body.email?.toLowerCase(),
      unlock_date: req.body.unlockDate,
      message: req.body.message?.trim(),
      public_preview: req.body.publicPreview?.trim() || null,
      media_url: req.file ? `/uploads/${req.file.filename}` : null
    };

    // Basic validations (some are also handled by express-validator)
    if (!capsuleData.capsule_name || capsuleData.capsule_name.length < 3) {
      throw new CapsuleError('Capsule name must be at least 3 characters long');
    }
    if (!capsuleData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new CapsuleError('Invalid email format');
    }

    const unlockDate = new Date(capsuleData.unlock_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(unlockDate) || unlockDate <= today) {
      throw new CapsuleError('Unlock date must be a future date');
    }

    if (!capsuleData.message || capsuleData.message.length < 10) {
      throw new CapsuleError('Message must be at least 10 characters long');
    }

    // File size/type validation if file exists
    if (req.file) {
      const allowedTypes = ['image', 'video', 'audio'];
      const fileType = req.file.mimetype.split('/')[0];
      if (!allowedTypes.includes(fileType)) {
        throw new CapsuleError('Invalid file type. Only images, videos, and audio are allowed');
      }
      if (req.file.size > 5 * 1024 * 1024) {
        throw new CapsuleError('File size cannot exceed 5MB');
      }
    }

    // Password hashing for private capsules
    let passwordHash = null;
    if (capsuleData.capsule_type === 'private') {
      if (!req.body.password) {
        throw new CapsuleError('Password is required for private capsules');
      }
      passwordHash = await bcrypt.hash(req.body.password, 12);
    }

    // Insert the capsule
    const [result] = await conn.execute(
      `INSERT INTO capsules 
       (capsule_type, capsule_name, email, unlock_date, message, public_preview, password_hash, media_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        capsuleData.capsule_type,
        capsuleData.capsule_name,
        capsuleData.email,
        capsuleData.unlock_date,
        capsuleData.message,
        capsuleData.public_preview,
        passwordHash,
        capsuleData.media_url
      ]
    );

    // Generate access token for private capsules
    let accessToken = null;
    if (capsuleData.capsule_type === 'private') {
      accessToken = crypto.randomBytes(32).toString('hex');
      await conn.execute(
        `INSERT INTO access_tokens (token, capsule_id, email) VALUES (?, ?, ?)`,
        [accessToken, result.insertId, capsuleData.email]
      );
    }

    // Send confirmation email
    await sendConfirmationEmail(
      capsuleData.email,
      capsuleData,
      result.insertId,
      accessToken
    );

    res.status(201).json({
      message: 'Capsule created successfully',
      capsuleId: result.insertId
    });
  } catch (error) {
    console.error('Capsule creation error:', error);
    next(error instanceof CapsuleError ? error : new CapsuleError('Failed to create capsule'));
  } finally {
    if (conn) conn.release();
  }
}

// Retrieve public capsules with optional filters
async function getPublicCapsules(req, res, next) {
  let conn;
  try {
    const filter = req.query.filter || 'recent';
    const limitRaw = parseInt(req.query.limit, 10) || 10;
    const limit = Math.min(Math.max(limitRaw, 1), 50);

    conn = await pool.getConnection();

    let query = `
      SELECT id, capsule_name, unlock_date, created_at, public_preview, view_count
      FROM capsules
      WHERE capsule_type = 'public'
    `;

    if (filter === 'year2030' || filter === 'year2050') {
      const year = filter === 'year2030' ? 2030 : 2050;
      query += ` AND YEAR(unlock_date) = ${year} ORDER BY unlock_date ASC`;
    } else if (filter === 'popular') {
      query += ' ORDER BY view_count DESC';
    } else if (filter === 'random') {
      query += ' ORDER BY RAND()';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    query += ` LIMIT ${limit}`;

    const [rows] = await conn.execute(query);
    res.json(rows);
  } catch (error) {
    next(error);
  } finally {
    if (conn) conn.release();
  }
}

// Retrieve a capsule if it's unlocked (and check password if private)
async function getOpenableCapsuleByEmail(req, res, next) {
  let conn;
  try {
    conn = await pool.getConnection();
    const { email, password } = req.body; // Email provided by the user

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Fetch capsules for the given email with unlock_date <= today
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await conn.execute(
      `SELECT id, capsule_type, capsule_name, message, unlock_date, media_url, email, password_hash
       FROM capsules 
       WHERE email = ? AND unlock_date <= ?`,
      [email.toLowerCase(), today]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: 'No capsules available to open for this email yet!' });
    }

    // For simplicity, assume a single capsule per email. If multiple, we might return all.
    const capsule = rows[0];

    if (capsule.capsule_type === 'private') {
      if (!password) {
        return res.status(401).json({ message: 'Password required for private capsule' });
      }
      const isValid = await bcrypt.compare(password, capsule.password_hash);
      if (!isValid) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
    }

    res.json({
      capsule_name: capsule.capsule_name,
      message: capsule.message,
      unlock_date: capsule.unlock_date,
      media_url: capsule.media_url
    });
  } catch (error) {
    next(error);
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  createCapsule,
  getPublicCapsules,
  getOpenableCapsuleByEmail
};