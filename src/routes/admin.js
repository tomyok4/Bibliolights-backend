import express from 'express';
import {body} from 'express-validator';
import { auth, adminAuth } from '../middleware/auth.js';
import Book from '../models/Book.js';
import BookRequest from '../models/BookRequest.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const bookValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ max: 200 })
    .withMessage('El título no puede exceder los 200 caracteres'),
    
  body('author')
    .trim()
    .notEmpty()
    .withMessage('El autor es requerido')
    .isLength({ max: 100 })
    .withMessage('El nombre del autor no puede exceder los 100 caracteres'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder los 2000 caracteres'),
    
  body('coverImage')
    .trim()
    .notEmpty()
    .withMessage('La URL de la imagen es requerida')
    .isURL()
    .withMessage('Debe ser una URL válida'),
    
  body('price')
    .isNumeric()
    .withMessage('El precio debe ser un número')
    .custom(value => {
      if (value <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }
      return true;
    }),
    
  body('deliveryTimes')
    .isArray()
    .withMessage('Los tiempos de entrega deben ser un array')
    .custom(value => {
      const validTimes = ['3 días', '5 días', '7 días', '10 días'];
      if (!value.every(time => validTimes.includes(time))) {
        throw new Error('Tiempos de entrega inválidos');
      }
      return true;
    })
];

router.post('/books', [auth, adminAuth, validate(bookValidation)], async (req, res) => {
  try {
    const { title, author, description, price, deliveryTimes, coverImage } = req.body;
    const book = new Book({
      title,
      author,
      description,
      price,
      deliveryTimes,
      coverImage
    });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/books/:id', [auth, adminAuth, validate(bookValidation)], async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete book
router.delete('/books/:id', [auth, adminAuth], async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request limit
router.put('/books/:id/limit', [auth, adminAuth], async (req, res) => {
  try {
    const { requestLimit } = req.body;
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { requestLimit },
      { new: true }
    );
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all book requests
router.get('/requests', [auth, adminAuth], async (req, res) => {
  try {
    const requests = await BookRequest.find()
      .populate('user', 'email')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update book request status
router.put('/requests/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BookRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'email');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/make-admin', [auth, adminAuth], async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { isAdmin: true },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
export { router as default };