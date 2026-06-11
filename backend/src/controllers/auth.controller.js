// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const { generateToken, generateRefreshToken } = require('../utils/jwt.util');
const { ErrorFactory } = require('../utils/errors.util');
const { validatePasswordStrength } = require('../utils/password.util');

// Factor de costo para el hashing de contraseñas con bcrypt.
const BCRYPT_SALT_ROUNDS = 10;

// Contraseña por defecto de los usuarios MOCK que aún no han cambiado su
// contraseña (sus hashes de ejemplo no son válidos). Al cambiar la contraseña
// se almacena un hash bcrypt real y esta compatibilidad deja de aplicar.
const LEGACY_MOCK_PASSWORD = 'Password123!';

/**
 * Verifica una contraseña en texto plano contra el registro de un usuario.
 * Soporta los hashes bcrypt reales (generados al cambiar la contraseña) y,
 * como respaldo, la contraseña MOCK por defecto de los usuarios sembrados.
 * @param {string} plainPassword - Contraseña ingresada por el usuario.
 * @param {Object} user - Registro del usuario (de MOCK_USERS).
 * @returns {Promise<boolean>}
 */
const verifyUserPassword = async (plainPassword, user) => {
  if (user.passwordChanged && user.password) {
    return bcrypt.compare(plainPassword, user.password);
  }
  // Respaldo para usuarios MOCK sin un hash válido todavía.
  return plainPassword === LEGACY_MOCK_PASSWORD;
};

// Simulación de base de datos (reemplazar con Prisma/BD real)
const MOCK_USERS = [
  {
    id: 'mthr_alumno01',
    nombre: 'Gerardo y Ximena',
    email: 'padres@ejemplo.com',
    password: '$2a$10$X2YZ3ABC...', // "Password123!" hasheado
    rol: 'padres'
  },
  {
    id: 'tchr_12345',
    nombre: 'María González',
    email: 'docente@escuela.edu.mx',
    password: '$2a$10$X2YZ3ABC...',  // "Password123!" hasheado
    rol: 'docente',
  },
  {
    id: 'stdnt_alumno01',
    nombre: 'Emma Hernandez',
    email: 'alumno@ejemplo.com',
    password: '$2a$10$X2YZ3ABC...',  // "Password123!" hasheado
    rol: 'alumno',
    padresId: 'mthr_alumno01'
  },
  // --- NUEVOS USUARIOS ---
  {
    id: 'mthr_alumno02',
    nombre: 'Laura y Roberto',
    email: 'padres2@ejemplo.com',
    password: '$2a$10$X2YZ3ABC...', // "Password123!" hasheado
    rol: 'padres'
  },
  {
    id: 'stdnt_alumno02',
    nombre: 'Mateo Rodríguez',
    email: 'alumno2@ejemplo.com',
    password: '$2a$10$X2YZ3ABC...', // "Password123!" hasheado
    rol: 'alumno',
    padresId: 'mthr_alumno02'
  },
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

    // Verificar contraseña: usa el hash bcrypt si el usuario ya cambió su
    // contraseña, o la contraseña MOCK por defecto en caso contrario.
    const isValidPassword = await verifyUserPassword(password, user);

    if (!isValidPassword) {
      throw ErrorFactory.unauthorized('Credenciales inválidas');
    }

    // Generar tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre // <-- AÑADIDO: Incluir el nombre en el token
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
        rol: user.rol,
        ...((user.rol === 'alumno' || user.rol === 'padres') && { alumnoAsociado: user.rol === 'padres' ? MOCK_USERS.find(u => u.padresId === user.id)?.id : user.id })
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
      rol: user.rol,
      nombre: user.nombre // El nombre viene en el payload del refresh token
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

/**
 * @description Obtener lista de usuarios por rol
 * @route GET /api/v1/auth/users
 * @access Docente
 */
const getUsersByRol = async (req, res, next) => {
  try {
    const { rol } = req.query;
    if (!rol) {
      throw ErrorFactory.badRequest('El parámetro "rol" es requerido');
    }

    const usuariosFiltrados = MOCK_USERS.filter(u => u.rol === rol).map(({ password, ...user }) => user); // Excluir password

    res.status(200).json({ items: usuariosFiltrados });
  } catch (error) {
    next(error);
  }
};

/**
 * Cambio de contraseña con verificación de seguridad.
 * Requiere un usuario autenticado (req.user proviene de authenticateToken).
 *
 * Verificaciones de seguridad:
 *  1. Re-autenticación: se valida la contraseña actual antes de permitir el cambio.
 *  2. Confirmación: la contraseña nueva y su confirmación deben coincidir.
 *  3. Política de fortaleza: longitud, mayúsculas, minúsculas, número y especial.
 *  4. La contraseña nueva debe ser distinta de la actual.
 *
 * @route POST /api/v1/auth/change-password
 * @access Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { contrasenaActual, contrasenaNueva, contrasenaConfirmacion } = req.body;

    // 1. Validación de campos requeridos
    if (!contrasenaActual || !contrasenaNueva || !contrasenaConfirmacion) {
      throw ErrorFactory.badRequest('Todos los campos son requeridos', [
        !contrasenaActual && { campo: 'contrasenaActual', error: 'Campo requerido' },
        !contrasenaNueva && { campo: 'contrasenaNueva', error: 'Campo requerido' },
        !contrasenaConfirmacion && { campo: 'contrasenaConfirmacion', error: 'Campo requerido' }
      ].filter(Boolean));
    }

    // 2. La confirmación debe coincidir con la contraseña nueva
    if (contrasenaNueva !== contrasenaConfirmacion) {
      throw ErrorFactory.badRequest('Las contraseñas no coinciden', [
        { campo: 'contrasenaConfirmacion', error: 'No coincide con la contraseña nueva' }
      ]);
    }

    // Buscar al usuario autenticado (MOCK - reemplazar con DB)
    const user = MOCK_USERS.find(u => u.id === req.user.id);
    if (!user) {
      throw ErrorFactory.notFound('Usuario');
    }

    // 3. Verificación de seguridad: re-autenticar con la contraseña actual
    const esContrasenaActualValida = await verifyUserPassword(contrasenaActual, user);
    if (!esContrasenaActualValida) {
      throw ErrorFactory.unauthorized('La contraseña actual es incorrecta');
    }

    // 4. La contraseña nueva no puede ser igual a la actual
    if (contrasenaActual === contrasenaNueva) {
      throw ErrorFactory.badRequest('La contraseña nueva debe ser distinta de la actual', [
        { campo: 'contrasenaNueva', error: 'Debe ser diferente de la contraseña actual' }
      ]);
    }

    // 5. Validar la política de fortaleza de la contraseña nueva
    const incumplimientos = validatePasswordStrength(contrasenaNueva);
    if (incumplimientos.length > 0) {
      throw ErrorFactory.badRequest('La contraseña no cumple con la política de seguridad', incumplimientos);
    }

    // 6. Hashear y almacenar la nueva contraseña (MOCK en memoria)
    user.password = await bcrypt.hash(contrasenaNueva, BCRYPT_SALT_ROUNDS);
    user.passwordChanged = true;

    res.status(200).json({
      mensaje: 'Contraseña actualizada correctamente'
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
  getUsersByRol,
  changePassword,
  MOCK_USERS, // Exportar para que otros controladores puedan usarlo
};
