import jwt from 'jsonwebtoken';

// Middleware de autenticación general
export const auth = (req, res, next) => {
  try {
    // Verificar si el token está en el header 'Authorization'
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;  // Guardar el payload decodificado en req.user
    next();  // Continuar al siguiente middleware o controlador
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware de autenticación de administrador
export const adminAuth = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();  // Continuar si es administrador
};
