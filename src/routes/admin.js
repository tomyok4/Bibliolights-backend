import express from 'express';
import { auth, adminAuth } from '../middleware/auth.js';
import Book from '../models/Book.js';
import BookRequest from '../models/BookRequest.js';

const router = express.Router();

// Add new book
router.post('/books', [auth, adminAuth], async (req, res) => {
  try {
    const { title, author, description, fileUrl, requestLimit } = req.body;
    const book = new Book({
      title,
      author,
      description,
      fileUrl,
      requestLimit: requestLimit || 100,
      currentRequests: 0
    });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update book
router.put('/books/:id', [auth, adminAuth], async (req, res) => {
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

// Get download statistics with user details
router.get('/books/:id/stats', [auth, adminAuth], async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('downloads.user', 'email');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({
      downloads: book.downloads,
      currentRequests: book.currentRequests,
      requestLimit: book.requestLimit
    });
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

export { router as default };