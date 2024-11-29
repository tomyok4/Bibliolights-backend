// src/models/UserDetails.js
import mongoose from 'mongoose';

const userDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Relación con el modelo User
    required: true,
  },
  firstName: {
    type: String,
    default: null, // Permitir que sea null
  },
  lastName: {
    type: String,
    default: null, // Permitir que sea null
  },
  address: {
    type: String,
    default: null, // Permitir que sea null
  },
  city: {
    type: String,
    default: null, // Permitir que sea null
  },
  country: {
    type: String,
    default: null, // Permitir que sea null
  },
  phoneNumber: {
    type: String,
    default: null, // Permitir que sea null
  },
  dob: {
    type: Date,
    default: null, // Permitir que sea null
  },
}, { timestamps: true });

export default mongoose.model('UserDetails', userDetailsSchema);
