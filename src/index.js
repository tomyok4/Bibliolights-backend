import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

// Seguridad: encabezados HTTP
app.use(helmet());

// Configuración de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'], // Agrega tu dominio de frontend aquí (si usas Railway, cambia la URL)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600,
};
app.use(cors(corsOptions));

// Limitar las solicitudes por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita a 100 solicitudes por IP
  message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Limitar las solicitudes de autenticación
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // Limita a 5 intentos por hora
  message: 'Demasiados intentos de inicio de sesión, por favor intente más tarde.',
});

app.use(express.json()); // Para analizar el cuerpo de la solicitud como JSON

// Rutas con limitaciones de tasa específicas
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth', authRoutes); // Rutas de autenticación
app.use('/api/books', bookRoutes); // Rutas de libros
app.use('/api/admin', adminRoutes); // Rutas de administración

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '¡Algo salió mal!' });
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/bibliolights-users')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
