const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createCapsule,
  getPublicCapsules,
  getOpenableCapsuleByEmail
} = require('../controllers/capsuleController');
const { validateCapsule } = require('../middleware/validateCapsule');

// Create a new capsule (with optional file upload)
router.post('/', upload.single('mediaFile'), validateCapsule, createCapsule);

// Retrieve public capsules with optional filters
router.get('/public', getPublicCapsules);

// Open a capsule if unlock date has passed
router.post('/open', getOpenableCapsuleByEmail);

module.exports = router;