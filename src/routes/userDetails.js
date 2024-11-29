// src/routes/userDetails.js

import express from 'express';
import { auth } from '../middleware/auth.js';
import UserDetails from '../models/UserDetails.js';

const router = express.Router();

// Ruta para obtener los detalles del usuario
router.get('/details', auth, async (req, res) => {
  try {
    const details = await UserDetails.findOne({ userId: req.user._id });

    if (!details) {
      return res.status(404).json({ message: 'User details not found' });
    }

    res.json(details);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Ruta para actualizar los detalles del usuario
router.put('/details', auth, async (req, res) => {
  try {
    const { firstName, lastName, address, city, country, phoneNumber, dob } = req.body;

    let details = await UserDetails.findOne({ userId: req.user._id });

    if (!details) {
      // Crear nuevos detalles si no existen
      details = new UserDetails({ userId: req.user._id, firstName, lastName, address, city, country, phoneNumber, dob });
    } else {
      // Actualizar los detalles existentes
      details.firstName = firstName || details.firstName;
      details.lastName = lastName || details.lastName;
      details.address = address || details.address;
      details.city = city || details.city;
      details.country = country || details.country;
      details.phoneNumber = phoneNumber || details.phoneNumber;
      details.dob = dob || details.dob;
    }

    await details.save();
    res.status(200).json(details);
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as default };
