// src/models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  favoriteBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
  }],
  // Nuevos campos para el perfil de usuario
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  dob: {  // Date of Birth (fecha de nacimiento)
    type: Date,
    default: null
  }
}, { timestamps: true });

// Pre-save hook para encriptar la contraseña
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export default mongoose.model('User', userSchema);
