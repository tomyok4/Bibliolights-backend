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
      details = new UserDetails({ 
        userId: req.user._id, 
        firstName: firstName ?? null, 
        lastName: lastName ?? null, 
        address: address ?? null, 
        city: city ?? null, 
        country: country ?? null, 
        phoneNumber: phoneNumber ?? null, 
        dob: dob ?? null 
      });
    } else {
      // Actualizar los detalles existentes
      details.firstName = firstName ?? null;  // Asignar null si no se proporciona un valor
      details.lastName = lastName ?? null;    // Asignar null si no se proporciona un valor
      details.address = address ?? null;      // Asignar null si no se proporciona un valor
      details.city = city ?? null;            // Asignar null si no se proporciona un valor
      details.country = country ?? null;      // Asignar null si no se proporciona un valor
      details.phoneNumber = phoneNumber ?? null; // Asignar null si no se proporciona un valor
      details.dob = dob ?? null;              // Asignar null si no se proporciona un valor
    }

    await details.save();
    res.status(200).json(details);
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as default };
