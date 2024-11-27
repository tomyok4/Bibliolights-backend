import express from 'express';
import { auth } from '../middleware/auth.js';  // Autenticación, si es necesario para ciertas rutas
import Book from '../models/Book.js';
import User from '../models/User.js';
import BookRequest from '../models/BookRequest.js';

const router = express.Router();

// Obtener todos los libros (sin autenticación necesaria)
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();  // Obtiene todos los libros
    res.json(books);  // Devuelve los libros
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener detalles de un libro específico
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);  // Busca el libro por ID
    if (!book) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }
    res.json(book);  // Devuelve el libro
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Agregar o quitar un libro de favoritos (requiere autenticación)
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);  // Obtiene al usuario autenticado
    const bookId = req.params.id;  // ID del libro

    const index = user.favoriteBooks.indexOf(bookId);
    if (index === -1) {
      user.favoriteBooks.push(bookId);  // Si no está en favoritos, lo agrega
    } else {
      user.favoriteBooks.splice(index, 1);  // Si ya está, lo elimina
    }

    await user.save();
    res.json({ favoriteBooks: user.favoriteBooks });  // Devuelve la lista de favoritos
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Solicitar un libro existente (requiere autenticación)
router.post('/:id/request', auth, async (req, res) => {
  try {
    const { selectedDeliveryTime, notes } = req.body;  // Obtiene los datos del cuerpo
    const book = await Book.findById(req.params.id);  // Busca el libro por ID
    
    if (!book) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }

    // Validar que el tiempo de entrega seleccionado sea válido
    if (!book.deliveryTimes.includes(selectedDeliveryTime)) {
      return res.status(400).json({ 
        message: 'Tiempo de entrega inválido. Selecciona una opción disponible.' 
      });
    }

    // Calcular la fecha estimada de entrega
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

    await request.save();  // Guarda la solicitud

    // Incrementar el contador de solicitudes del libro
    book.currentRequests += 1;
    await book.save();

    res.status(201).json(request);  // Devuelve la solicitud creada
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener los libros favoritos de un usuario (requiere autenticación)
router.get('/user/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('favoriteBooks');
    res.json(user.favoriteBooks);  // Devuelve los libros favoritos del usuario
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener las solicitudes de libros de un usuario (requiere autenticación)
router.get('/user/requests', auth, async (req, res) => {
  try {
    const requests = await BookRequest.find({ user: req.user.userId })
      .populate('book')
      .sort('-createdAt');
    res.json(requests);  // Devuelve las solicitudes del usuario
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Solicitar un libro nuevo (que no está en el sistema) (requiere autenticación)
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
    await bookRequest.save();  // Guarda la solicitud de libro nuevo
    res.status(201).json(bookRequest);  // Devuelve la solicitud creada
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta para agregar un libro (requiere autenticación y permisos de admin)
router.post('/', auth, async (req, res) => {
  try {
    const { title, author, description, coverImage, price, deliveryTimes, quantity } = req.body;

    const book = new Book({
      title,
      author,
      description,
      coverImage,
      price,
      deliveryTimes,
      quantity
    });

    await book.save();
    res.status(201).json(book);  // Devuelve el libro recién agregado
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as default };
