import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import User from '../models/User.js';
import crypto from 'crypto';
import { auth } from '../middleware/auth.js';  // Middleware de autenticación

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Register
router.post('/register', validate(registerValidation), async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', validate(loginValidation), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Request password reset
router.post('/forgot-password', 
  validate([
    body('email').isEmail().normalizeEmail()
  ]), 
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      // Here you would normally send an email with the reset token
      res.json({ message: 'Password reset token generated', resetToken });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
});

// Reset password
router.post('/reset-password',
  validate([
    body('token').notEmpty(),
    body('newPassword')
      .isLength({ min: 6 })
      .matches(/\d/)
      .withMessage('Password must be at least 6 characters and contain a number')
  ]),
  async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: 'Password has been reset' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
});

// Validar token
router.get('/validate', auth, async (req, res) => {
  try {
    // El middleware auth ya asegura que el token es válido
    // y coloca los datos del usuario en req.user
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      valid: true,
      user: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        city: user.city,
        country: user.country,
        phoneNumber: user.phoneNumber,
        dob: user.dob,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Error al validar el token' });
  }
});

export { router as default };
