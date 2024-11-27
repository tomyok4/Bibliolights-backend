import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  description: String,
  coverImage: {
    type: String,
    required: true 
  },
  price: {
    type: Number,
    required: true
  },
  deliveryTimes: {
    type: [String],
    enum: ['3 días', '5 días', '7 días', '10 días'],
    required: true
  },
  currentRequests: {
    type: Number,
    default: 0
  },
  quantity: { // Nueva propiedad para la cantidad de libros
    type: Number,
    required: true,
    default: 0 // Valor por defecto, si no se especifica
  }
}, { timestamps: true });

export default mongoose.model('Book', bookSchema);