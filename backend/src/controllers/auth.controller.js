// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const { generateToken, generateRefreshToken } = require('../utils/jwt.util');
const { ErrorFactory } = require('../utils/errors.util');

// Simulación de base de datos (reemplazar con Prisma/BD real)
const MOCK_USERS = [
  {
    id: 'mthr_alumno01',
    nombre: 'Gerardo y Ximena',
    email: 'padres@ejemplo.com',
    password: '$2a$10$X2YZ3ABC...',  // "Password123!" hasheado
    rol: 'padres'
  },
  {
    id: 'tchr_12345',
    nombre: 'María González',
    email: 'docente@escuela.edu.mx',
    password: '$2a$10$X2YZ3ABC...',  // "Password123!" hasheado
    rol: 'docente'
  },
  {
    id: 'stdnt_alumno01',
    nombre: 'Emma Hernandez',
    email: 'alumno@ejemplo.com',
    password: '$2a$10$X2YZ3ABC...',  // "Password123!" hasheado
    rol: 'alumno'
  }
];

/**
 * Login - Iniciar sesión
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validación de campos
    if (!username || !password) {
      throw ErrorFactory.badRequest('Email y contraseña son requeridos', [
        { campo: !username ? 'username' : 'password', error: 'Campo requerido' }
      ]);
    }

    // Buscar usuario (MOCK - reemplazar con DB)
    const user = MOCK_USERS.find(u => u.email === username);
    
    if (!user) {
      throw ErrorFactory.unauthorized('Credenciales inválidas');
    }

    // Verificar contraseña (en producción usar bcrypt.compare)
    // const isValidPassword = await bcrypt.compare(password, user.password);
    const isValidPassword = password === 'Password123!'; // MOCK

    if (!isValidPassword) {
      throw ErrorFactory.unauthorized('Credenciales inválidas');
    }

    // Generar tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      rol: user.rol
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Respuesta exitosa
    res.status(200).json({
      token,
      refreshToken,
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN) || 1800,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout - Cerrar sesión
 */
const logout = async (req, res, next) => {
  try {
    // En una implementación real, agregar el token a una lista negra
    // o eliminar del caché de tokens válidos

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Token - Renovar token de acceso
 */
const refreshToken = async (req, res, next) => {
  try {
    const user = req.user; // Ya viene del middleware authenticateToken

    const tokenPayload = {
      id: user.id,
      email: user.email,
      rol: user.rol
    };

    const newToken = generateToken(tokenPayload);

    res.status(200).json({
      token: newToken,
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN) || 1800
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User - Obtener usuario autenticado
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Buscar usuario en BD (MOCK)
    const user = MOCK_USERS.find(u => u.id === userId);

    if (!user) {
      throw ErrorFactory.notFound('Usuario');
    }

    res.status(200).json({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  refreshToken,
  getCurrentUser,
  MOCK_USERS, // Exportar para que otros controladores puedan usarlo
};
