import mongoose from 'mongoose';

const bookRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  selectedDeliveryTime: {
    type: String,
    required: true,
    enum: ['3 días', '5 días', '7 días', '10 días']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'delivered'],
    default: 'pending'
  },
  price: {
    type: Number,
    required: true
  },
  notes: String,
  requestDate: {
    type: Date,
    default: Date.now
  },
  estimatedDeliveryDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('BookRequest', bookRequestSchema);