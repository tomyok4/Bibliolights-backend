import express from 'express';
import Order from '../models/Order.js';
import { auth } from '../middleware/auth.js';  // Middleware de autenticación
import User from '../models/User.js';  // Para verificar si el usuario es admin

const router = express.Router();

// Crear un nuevo pedido
router.post('/create', auth, async (req, res) => {
  try {
    const { books, userEmail, totalAmount } = req.body;

    // Verificar que los datos estén presentes
    if (!books || books.length === 0) {
      return res.status(400).json({ message: 'No se han proporcionado libros para el pedido.' });
    }

    if (!userEmail) {
      return res.status(400).json({ message: 'El email del usuario es requerido.' });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'El monto total es inválido.' });
    }

    // Crear un nuevo pedido con la fecha actual de creación
    const order = new Order({
      books,
      userEmail,
      totalAmount,
      orderDate: new Date(),  // Fecha de la orden
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

// Actualizar el estado de un pedido (solo admin puede actualizar)
router.put('/update/:id', async (req, res) => {
  try {
    const { orderStatus, trackingUrl } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus, trackingUrl },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.json(order); // Retorna el pedido actualizado
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el pedido' });
  }
});

export default router;

