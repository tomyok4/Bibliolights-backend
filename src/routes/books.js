import express from 'express';
import { auth } from '../middleware/auth.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import BookRequest from '../models/BookRequest.js';

const router = express.Router();

// Get all books
router.get('/', auth, async (req, res) => {
  try {
    const books = await Book.find().select('-downloads');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get book details
router.get('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select('-downloads');
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

// Download book
router.get('/:id/download', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.currentRequests >= book.requestLimit) {
      return res.status(403).json({ message: 'Book request limit reached' });
    }

    book.downloads.push({ user: req.user.userId });
    book.currentRequests += 1;
    await book.save();

    res.json({ downloadUrl: book.fileUrl });
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

// Request a new book
router.post('/request', auth, async (req, res) => {
  try {
    const { bookName, author, notes } = req.body;
    const bookRequest = new BookRequest({
      user: req.user.userId,
      bookName,
      author,
      notes
    });
    await bookRequest.save();
    res.status(201).json(bookRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as default };