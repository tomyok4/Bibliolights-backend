# Sistema de Gestión de Libros de Programación

## 📚 Descripción
Sistema de gestión para una biblioteca de libros de programación y tecnología. Permite a los usuarios explorar un catálogo de libros, solicitar préstamos con fechas estimadas de entrega y mantener una lista de favoritos. Los administradores pueden gestionar el inventario, procesar solicitudes y controlar los límites de préstamos.

## 🛠 Tecnologías Utilizadas
- **Backend**: Node.js + Express
- **Base de Datos**: MongoDB
- **Autenticación**: JWT
- **Validación**: Express Validator
- **Seguridad**: 
  - Bcrypt para encriptación
  - Helmet para headers HTTP
  - Rate limiting para prevención de ataques
  - CORS configurado

## 🚀 Características Principales
- **Catálogo de Libros**: Exploracion de libros con detalles completos
- **Sistema de Solicitudes**: Proceso de préstamo con fechas estimadas de entrega
- **Gestión de Favoritos**: Los usuarios podran marcar libros como favoritos
- **Panel de Administración**: 
  - Gestión de inventario
  - Procesamiento de solicitudes
  - Control de límites de préstamos
- **Autenticación Segura**: 
  - Registro y login de usuarios
  - Recuperación de contraseña
  - Roles de usuario y admin

## 💻 Instalación y Uso

### Prerrequisitos
- Node.js v14 o superior
- MongoDB
- npm o yarn

### Configuración
1. Clonar el repositorio:
```bash
git clone [https://github.com/Enzo-cam/bibliolights-backend]
cd bibliolights-backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear archivo `.env` con:
```
MONGODB_URI=tu_uri_de_mongodb
JWT_SECRET=tu_secret_key
PORT=3000
FRONTEND_URL=http://localhost:3000
```

4. Iniciar el servidor:
```bash
npm run dev     # desarrollo
npm start       # producción
```

## 🔑 Variables de Entorno Requeridas
- `MONGODB_URI`: URI de conexión a MongoDB
- `JWT_SECRET`: Clave secreta para JWT
- `PORT`: Puerto del servidor (opcional, default: 3000)
- `FRONTEND_URL`: URL(s) permitida(s) para CORS

## 📝 Endpoints Principales
- `POST /api/auth/register`: Registro de usuarios
- `POST /api/auth/login`: Login de usuarios
- `GET /api/books`: Obtener catálogo de libros
- `POST /api/books/:id/request`: Solicitar un libro
- `GET /api/admin/requests`: Ver solicitudes (admin)
- `POST /api/admin/books`: Agregar nuevo libro (admin)

## 👥 Roles de Usuario
- **Usuario Regular**: 
  - Ver catálogo
  - Solicitar libros
  - Gestionar favoritos
- **Administrador**:
  - Gestión completa de libros
  - Procesamiento de solicitudes
  - Control de límites

## 🔒 Seguridad
- Contraseñas hasheadas con bcrypt
- Protección contra ataques de fuerza bruta
- Headers de seguridad con Helmet
- Validación de datos en todos los endpoints
- Rate limiting configurado

## 📦 Despliegue
El proyecto está configurado y ha sido desplegado  en Railway.
