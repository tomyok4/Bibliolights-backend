import express from 'express';
import { auth } from '../middleware/auth.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import BookRequest from '../models/BookRequest.js';

const router = express.Router();

// Get all books
router.get('/', auth, async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get book details
router.get('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add/remove book from favorites
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const bookId = req.params.id;

    const index = user.favoriteBooks.indexOf(bookId);
    if (index === -1) {
      user.favoriteBooks.push(bookId);
    } else {
      user.favoriteBooks.splice(index, 1);
    }

    await user.save();
    res.json({ favoriteBooks: user.favoriteBooks });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Solicitar un libro existente
router.post('/:id/request', auth, async (req, res) => {
  try {
    const { selectedDeliveryTime, notes } = req.body;
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Validar que el tiempo de entrega seleccionado sea válido
    if (!book.deliveryTimes.includes(selectedDeliveryTime)) {
      return res.status(400).json({ 
        message: 'Invalid delivery time. Please select from available options.' 
      });
    }

    // Calcular fecha estimada de entrega
    const daysToAdd = parseInt(selectedDeliveryTime);
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + daysToAdd);

    const request = new BookRequest({
      user: req.user.userId,
      book: book._id,
      selectedDeliveryTime,
      price: book.price,
      notes,
      estimatedDeliveryDate,
      status: 'pending'
    });

    await request.save();

    // Incrementar el contador de solicitudes del libro
    book.currentRequests += 1;
    await book.save();

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's favorite books
router.get('/user/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('favoriteBooks');
    res.json(user.favoriteBooks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's book requests
router.get('/user/requests', auth, async (req, res) => {
  try {
    const requests = await BookRequest.find({ user: req.user.userId })
      .populate('book')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Solicitar un libro nuevo (que no está en el sistema)
router.post('/request-new', auth, async (req, res) => {
  try {
    const { bookName, author, notes } = req.body;
    const bookRequest = new BookRequest({
      user: req.user.userId,
      bookName,
      author,
      notes,
      status: 'pending'
    });
    await bookRequest.save();
    res.status(201).json(bookRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as default };