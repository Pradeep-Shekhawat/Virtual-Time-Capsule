const { body, validationResult } = require('express-validator');

const validateCapsule = [
  body('capsuleName')
    .notEmpty().withMessage('Capsule name is required')
    .isLength({ min: 3 }).withMessage('Capsule name must be at least 3 characters long')
    .trim().escape(),
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('unlockDate')
    .notEmpty().withMessage('Unlock date is required')
    .isISO8601().withMessage('Unlock date must be a valid date')
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (inputDate <= today) {
        throw new Error('Unlock date must be in the future');
      }
      return true;
    }),
  body('message')
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10 }).withMessage('Message must be at least 10 characters long')
    .trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateCapsule };