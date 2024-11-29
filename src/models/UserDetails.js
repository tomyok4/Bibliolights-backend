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
    default: '',
  },
  lastName: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  country: {
    type: String,
    default: '',
  },
  phoneNumber: {
    type: String,
    default: '',
  },
  dob: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

export default mongoose.model('UserDetails', userDetailsSchema);
