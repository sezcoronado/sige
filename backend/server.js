// server.js - Servidor principal del backend SIGE
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Importar rutas
const authRoutes = require('./src/routes/auth.routes');
const carteraRoutes = require('./src/routes/cartera.routes');
const transaccionesRoutes = require('./src/routes/transacciones.routes');
const tareasRoutes = require('./src/routes/tareas.routes');
const mensajesRoutes = require('./src/routes/mensajes.routes');
const calendarioRoutes = require('./src/routes/calendario.routes');
const finanzasRoutes = require('./src/routes/finanzas.routes');
const nominaRoutes = require('./src/routes/nomina.routes');

// Importar middleware de errores
const { errorHandler, notFoundHandler } = require('./src/middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARES GLOBALES
// ========================================

// Seguridad
app.use(helmet());

// CORS - Permitir requests desde el frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========================================
// HEALTH CHECK
// ========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ========================================
// RUTAS DE LA API
// ========================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cartera', carteraRoutes);
app.use('/api/v1/transacciones', transaccionesRoutes);
app.use('/api/v1/tareas', tareasRoutes);
app.use('/api/v1/mensajes', mensajesRoutes);
app.use('/api/v1/calendario', calendarioRoutes);
app.use('/api/v1/finanzas', finanzasRoutes);
app.use('/api/v1/nomina', nominaRoutes);

// ========================================
// MANEJO DE ERRORES
// ========================================
app.use(notFoundHandler);
app.use(errorHandler);

// ========================================
// INICIAR SERVIDOR
// ========================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor SIGE corriendo en http://localhost:${PORT}`);
  console.log(`📚 API disponible en http://localhost:${PORT}/api/v1`);
  console.log(`🏥 Health check en http://localhost:${PORT}/api/health`);
});

module.exports = app;
