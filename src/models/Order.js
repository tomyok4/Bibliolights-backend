import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  books: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book', // Referencia al modelo de libro
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      total: {
        type: Number,
        required: true
      },
    }
  ],
  userEmail: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['en proceso', 'aceptado', 'esperando pago', 'pago confirmado', 'enviado'],
    default: 'en proceso'
  },
  trackingUrl: {
    type: String,
    default: ''
  },
  orderDate: {
    type: Date,
    default: Date.now // Guarda la fecha en que se creó el pedido
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
