import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Ruta para obtener el usuario por su email (agregado para obtener el userId)
router.get('/user', auth, async (req, res) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      userId: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Ruta para actualizar la información del usuario
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // Usamos req.user ya que contiene el usuario

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // No hay campos adicionales que actualizar en esta versión del modelo
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as default };

