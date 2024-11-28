import express from 'express';
import Order from '../models/Order.js';
import { auth } from '../middleware/auth.js';  // Middleware de autenticación

const router = express.Router();

// Crear un nuevo pedido
router.post('/create', auth, async (req, res) => {
  try {
    const { items } = req.body; // Los items vienen del carrito

    // Verificar que los datos estén presentes
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No se han proporcionado libros para el pedido.' });
    }

    // Asegurarnos de que el email del usuario esté disponible
    const userEmail = req.user.email; // Usamos el email del usuario autenticado
    if (!userEmail) {
      return res.status(400).json({ message: 'El email del usuario es necesario para crear el pedido.' });
    }

    // Calcular el total de cada libro y el monto total de la orden
    let totalAmount = 0;
    const booksWithTotal = items.map(item => {
      const total = item.price * item.quantity; // Calcular el total de cada libro
      totalAmount += total; // Sumar al total de la orden
      return { ...item, total }; // Devolver el libro con su total
    });

    // Crear el nuevo pedido
    const order = new Order({
      userEmail,       // Email del usuario autenticado
      books: booksWithTotal,  // Libros con todos los detalles y el total
      totalAmount,     // Monto total de la compra
      orderDate: new Date(), // Fecha del pedido
    });

    // Guardar el pedido en la base de datos
    await order.save();

    res.status(201).json(order); // Responder con la orden creada
  } catch (error) {
    console.error("Error en la creación de la orden:", error);
    res.status(500).json({ message: 'Error al crear el pedido. ' + error.message });
  }
});

// Obtener todos los pedidos (solo accesible por administradores)
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId); // Obtener el usuario actual

    // Verificamos si el usuario es administrador
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden ver todos los pedidos.' });
    }

    // Si es admin, obtenemos todos los pedidos
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los pedidos' });
  }
});

// Obtener los pedidos de un usuario (solo el usuario autenticado puede ver sus propios pedidos)
router.get('/user', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userEmail: req.user.email }); // Filtramos por el email del usuario actual

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No se encontraron pedidos para este usuario.' });
    }

    res.json(orders); // Retorna los pedidos encontrados
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los pedidos' });
  }
});

export default router;
