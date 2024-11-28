import express from 'express';
import Order from '../models/Order.js';
import { auth } from '../middleware/auth.js';  // Middleware de autenticación
import User from '../models/User.js';  // Para verificar si el usuario es admin

const router = express.Router();

// Crear un nuevo pedido
router.post('/create', auth, async (req, res) => {
  try {
    const { items } = req.body; // "items" es el array de productos del carrito

    // Verificar que los datos estén presentes
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No se han proporcionado libros para el pedido.' });
    }

    // Calcular el total de cada libro y el monto total de la orden
    let totalAmount = 0;
    const booksWithTotal = items.map(item => {
      const total = item.price * item.quantity; // Total por libro
      totalAmount += total; // Sumar el total de cada libro al monto total
      return { ...item, total }; // Añadir el campo total a cada libro
    });

    // Crear el nuevo pedido
    const order = new Order({
      userEmail: req.user.email, // Correo del usuario autenticado
      books: booksWithTotal,     // Libros con sus detalles y total
      totalAmount,               // Monto total de la compra
      orderDate: new Date(),     // Fecha actual del pedido
    });

    // Guardar el pedido en la base de datos
    await order.save();

    res.status(201).json(order); // Respuesta con el pedido creado
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el pedido' });
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

