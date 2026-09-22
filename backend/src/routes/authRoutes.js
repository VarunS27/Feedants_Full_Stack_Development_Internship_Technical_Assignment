const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiters');
const { signupSchema, loginSchema, languageSchema } = require('../validators/schemas');

const router = express.Router();

router.post('/signup', authLimiter, validate({ body: signupSchema }), authController.signup);
router.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);
router.get('/me', authenticate, authController.me);
router.patch(
  '/me/language',
  authenticate,
  validate({ body: languageSchema }),
  authController.setLanguage
);

module.exports = router;
