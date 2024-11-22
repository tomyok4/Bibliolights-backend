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
  fileUrl: {
    type: String,
    required: true,
  },
  requestLimit: {
    type: Number,
    default: 100,
    required: true
  },
  currentRequests: {
    type: Number,
    default: 0
  },
  downloads: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    downloadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, { timestamps: true });

export default mongoose.model('Book', bookSchema);