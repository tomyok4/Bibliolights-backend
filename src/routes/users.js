import express from 'express';
import { auth } from '../middleware/auth.js'; // Asegúrate de que tienes middleware de autenticación
import User from '../models/User.js';

const router = express.Router();

// Ruta para obtener el usuario por su email (agregado para obtener el userId)
router.get('/user', auth, async (req, res) => {
  const { email } = req.query; // Tomamos el email desde los parámetros de la consulta

  try {
    const user = await User.findOne({ email }); // Buscamos el usuario por email

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      userId: user._id, // Devolvemos el userId
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      city: user.city,
      country: user.country,
      phoneNumber: user.phoneNumber,
      dob: user.dob,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Ruta para actualizar la información del usuario
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, address, city, country, phoneNumber, dob } = req.body;

    // Buscamos el usuario por su ID
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Actualizamos los campos del usuario
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (address) user.address = address;
    if (city) user.city = city;
    if (country) user.country = country;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (dob) user.dob = dob;

    // Guardamos los cambios
    await user.save();

    // Devolvemos la respuesta
    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as default };
