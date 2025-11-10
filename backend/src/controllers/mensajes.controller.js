// src/controllers/mensajes.controller.js
const { ErrorFactory } = require('../utils/errors.util');

// Importar usuarios desde el controlador de autenticación para mantener consistencia
const { MOCK_USERS } = require('./auth.controller');

// Mock de mensajes
let MOCK_MENSAJES = [
  {
    id: 'msg_30012',
    remitenteId: 'mthr_alumno01', // ID de padres
    destinatariosIds: ['tchr_12345'], // ID de docente
    asunto: 'Consulta sobre tarea de matemáticas',
    contenido: 'Buenos días, quisiera saber si la tarea debe incluir gráficas o solo los ejercicios resueltos.',
    leido: false,
    fechaEnvio: '2025-11-02T09:15:00Z',
    fechaLectura: null
  },
  {
    id: 'msg_30013',
    remitenteId: 'tchr_12345', // ID de docente
    destinatariosIds: ['mthr_alumno01'], // ID de padres
    asunto: 'Re: Consulta sobre tarea de matemáticas',
    contenido: 'Buen día. La tarea debe incluir tanto los ejercicios como las gráficas correspondientes. Saludos.',
    leido: true,
    fechaEnvio: '2025-11-02T10:30:00Z',
    fechaLectura: '2025-11-02T11:00:00Z'
  },
  // --- NUEVOS MENSAJES ---
  {
    id: 'msg_30014',
    remitenteId: 'mthr_alumno02', // ID padres 2
    destinatariosIds: ['tchr_12345'], // ID de docente
    asunto: 'Justificante de inasistencia - Mateo Rodríguez',
    contenido: 'Buenas tardes, le informo que nuestro hijo Mateo no podrá asistir mañana por una cita médica. Adjuntaremos el justificante a la brevedad.',
    leido: false,
    fechaEnvio: '2025-11-03T16:00:00Z',
    fechaLectura: null
  },
  {
    id: 'msg_30015',
    remitenteId: 'tchr_12345', // ID de docente
    destinatariosIds: ['mthr_alumno02'], // ID padres 2
    asunto: 'Re: Justificante de inasistencia - Mateo Rodríguez',
    contenido: 'Enterada, muchas gracias por avisar. Que todo salga bien en la cita. Saludos.',
    leido: false, // Para que los padres lo vean como no leído
    fechaEnvio: '2025-11-03T16:30:00Z',
    fechaLectura: null
  },
];

/**
 * Helper para obtener el nombre enriquecido de un usuario.
 * Si es un padre, agrega "papas de [nombre del alumno]".
 * @param {object} usuario El objeto de usuario.
 * @returns {string|null} El nombre formateado o null si no hay usuario.
 */
const getNombreEnriquecido = (usuario) => {
  if (!usuario) {
    return null;
  }
  if (usuario.rol === 'padres') {
    const alumnoAsociado = MOCK_USERS.find(u => u.rol === 'alumno' && u.padresId === usuario.id);
    if (alumnoAsociado) {
      return `${usuario.nombre} papas de ${alumnoAsociado.nombre}`;
    }
  }
  return usuario.nombre;
};
/**
 * Listar mensajes del usuario
 */
const getMensajes = async (req, res, next) => {
  try {
    const { tipo = 'recibidos', leido, page = 1, pageSize = 20 } = req.query;
    const userId = req.user.id;

    let mensajes = [];

    // Filtrar según tipo
    if (tipo === 'recibidos') {
      mensajes = MOCK_MENSAJES.filter(m => m.destinatariosIds.includes(userId));
    } else if (tipo === 'enviados') {
      mensajes = MOCK_MENSAJES.filter(m => m.remitenteId === userId);
    } else {
      throw ErrorFactory.badRequest('Tipo de mensaje inválido', [
        { campo: 'tipo', error: 'Debe ser "recibidos" o "enviados"' }
      ]);
    }

    // Filtrar por leído/no leído
    if (leido !== undefined) {
      const isLeido = leido === 'true';
      mensajes = mensajes.filter(m => m.leido === isLeido);
    }

    // Enriquecer con información de usuarios
    const mensajesEnriquecidos = mensajes.map(m => {
      const remitente = MOCK_USERS.find(u => u.id === m.remitenteId);
      const destinatarios = m.destinatariosIds.map(id => 
        MOCK_USERS.find(u => u.id === id)
      );

      return {
        ...m,
        remitente: remitente ? { id: remitente.id, nombre: getNombreEnriquecido(remitente) } : null,
        destinatarios: destinatarios.map(d => d ? { id: d.id, nombre: getNombreEnriquecido(d) } : null)
      };
    });

    // Ordenar por fecha (más recientes primero)
    mensajesEnriquecidos.sort((a, b) => 
      new Date(b.fechaEnvio) - new Date(a.fechaEnvio)
    );

    // Paginación
    const start = (page - 1) * pageSize;
    const end = start + parseInt(pageSize);
    const paginatedItems = mensajesEnriquecidos.slice(start, end);

    res.status(200).json({
      total: mensajesEnriquecidos.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      items: paginatedItems
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enviar mensaje
 */
const enviarMensaje = async (req, res, next) => {
  try {
    const { destinatariosIds, asunto, contenido } = req.body;
    const remitenteId = req.user.id;

    // Validaciones
    if (!destinatariosIds || !Array.isArray(destinatariosIds) || destinatariosIds.length === 0) {
      throw ErrorFactory.badRequest('Debe especificar al menos un destinatario', [
        { campo: 'destinatariosIds', error: 'Debe ser un array con al menos un ID' }
      ]);
    }

    if (!asunto || asunto.trim().length < 3) {
      throw ErrorFactory.badRequest('El asunto debe tener al menos 3 caracteres', [
        { campo: 'asunto', error: 'Mínimo 3 caracteres' }
      ]);
    }

    if (!contenido || contenido.trim().length < 10) {
      throw ErrorFactory.badRequest('El contenido debe tener al menos 10 caracteres', [
        { campo: 'contenido', error: 'Mínimo 10 caracteres' }
      ]);
    }

    // Verificar que todos los destinatarios existan
    for (const destId of destinatariosIds) {
      const usuario = MOCK_USERS.find(u => u.id === destId);
      if (!usuario) {
        throw ErrorFactory.notFound(`Usuario destinatario ${destId}`);
      }
    }

    // Crear mensaje
    const nuevoMensaje = {
      id: `msg_${Date.now()}`,
      remitenteId: remitenteId,
      destinatariosIds: destinatariosIds,
      asunto: asunto.trim(),
      contenido: contenido.trim(),
      leido: false,
      fechaEnvio: new Date().toISOString(),
      fechaLectura: null
    };

    MOCK_MENSAJES.push(nuevoMensaje);

    // Enriquecer respuesta
    const remitente = MOCK_USERS.find(u => u.id === remitenteId);
    const destinatarios = destinatariosIds.map(id => 
      MOCK_USERS.find(u => u.id === id)
    );

    const mensajeRespuesta = {
      ...nuevoMensaje,
      remitente: remitente ? { id: remitente.id, nombre: getNombreEnriquecido(remitente) } : null,
      destinatarios: destinatarios.map(d => d ? { id: d.id, nombre: getNombreEnriquecido(d) } : null)
    };

    res.status(201).json({
      mensaje: 'Mensaje enviado exitosamente',
      data: mensajeRespuesta
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener detalle de un mensaje
 */
const getMensajeById = async (req, res, next) => {
  try {
    const { mensajeId } = req.params;
    const userId = req.user.id;

    const mensaje = MOCK_MENSAJES.find(m => m.id === mensajeId);

    if (!mensaje) {
      throw ErrorFactory.notFound('Mensaje');
    }

    // Verificar que el usuario tenga acceso al mensaje
    const tieneAcceso = mensaje.remitenteId === userId || 
                        mensaje.destinatariosIds.includes(userId);

    if (!tieneAcceso) {
      throw ErrorFactory.forbidden('No tiene acceso a este mensaje');
    }

    // Enriquecer con información de usuarios
    const remitente = MOCK_USERS.find(u => u.id === mensaje.remitenteId);
    const destinatarios = mensaje.destinatariosIds.map(id => 
      MOCK_USERS.find(u => u.id === id)
    );

    const mensajeEnriquecido = {
      ...mensaje,
      remitente: remitente ? { id: remitente.id, nombre: getNombreEnriquecido(remitente) } : null,
      destinatarios: destinatarios.map(d => d ? { id: d.id, nombre: getNombreEnriquecido(d) } : null)
    };

    res.status(200).json(mensajeEnriquecido);
  } catch (error) {
    next(error);
  }
};

/**
 * Marcar mensaje como leído/no leído
 */
const marcarLeido = async (req, res, next) => {
  try {
    const { mensajeId } = req.params;
    const { leido } = req.body;
    const userId = req.user.id;

    // Validar parámetro leido
    if (typeof leido !== 'boolean') {
      throw ErrorFactory.badRequest('El parámetro leido debe ser booleano', [
        { campo: 'leido', error: 'Debe ser true o false' }
      ]);
    }

    const mensaje = MOCK_MENSAJES.find(m => m.id === mensajeId);

    if (!mensaje) {
      throw ErrorFactory.notFound('Mensaje');
    }

    // Verificar que el usuario sea destinatario
    if (!mensaje.destinatariosIds.includes(userId)) {
      throw ErrorFactory.forbidden('Solo el destinatario puede marcar el mensaje como leído');
    }

    // Actualizar estado
    mensaje.leido = leido;
    mensaje.fechaLectura = leido ? new Date().toISOString() : null;

    // Enriquecer respuesta
    const remitente = MOCK_USERS.find(u => u.id === mensaje.remitenteId);
    const destinatarios = mensaje.destinatariosIds.map(id => 
      MOCK_USERS.find(u => u.id === id)
    );

    const mensajeRespuesta = {
      ...mensaje,
      remitente: remitente ? { id: remitente.id, nombre: getNombreEnriquecido(remitente) } : null,
      destinatarios: destinatarios.map(d => d ? { id: d.id, nombre: getNombreEnriquecido(d) } : null)
    };

    res.status(200).json({
      mensaje: `Mensaje marcado como ${leido ? 'leído' : 'no leído'}`,
      data: mensajeRespuesta
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMensajes,
  enviarMensaje,
  getMensajeById,
  marcarLeido
};
