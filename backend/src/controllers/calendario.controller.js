// src/controllers/calendario.controller.js
const { ErrorFactory } = require('../utils/errors.util');

// Simulación de base de datos
let MOCK_EVENTOS = [
  // Eventos Académicos
  {
    id: 'evt_001',
    titulo: 'Inicio de Clases',
    descripcion: 'Regreso a clases después de vacaciones',
    tipo: 'Académico',
    fecha: '2025-01-06T08:00:00Z',
    fechaFin: '2025-01-06T16:00:00Z',
    ubicacion: 'Todas las aulas',
    responsable: 'Dirección',
    creadorId: 'admin_001',
    importante: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_002',
    titulo: 'Exámen Parcial - Matemáticas',
    descripcion: 'Evaluación parcial de matemáticas',
    tipo: 'Académico',
    fecha: '2025-01-20T09:00:00Z',
    fechaFin: '2025-01-20T11:00:00Z',
    ubicacion: 'Aulas de 3ro a 6to',
    responsable: 'Departamento de Matemáticas',
    creadorId: 'docente_001',
    importante: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_003',
    titulo: 'Día del Profesor',
    descripcion: 'Celebración en honor a los maestros',
    tipo: 'Académico',
    fecha: '2025-01-15T08:00:00Z',
    fechaFin: '2025-01-15T17:00:00Z',
    ubicacion: 'Auditorio',
    responsable: 'Dirección',
    creadorId: 'admin_001',
    importante: false,
    createdAt: new Date().toISOString()
  },
  // Eventos Extracurriculares
  {
    id: 'evt_004',
    titulo: 'Torneo de Fútbol',
    descripcion: 'Competencia deportiva interna',
    tipo: 'Extracurricular',
    fecha: '2025-02-01T14:00:00Z',
    fechaFin: '2025-02-01T17:00:00Z',
    ubicacion: 'Cancha de fútbol',
    responsable: 'Profesor de Educación Física',
    creadorId: 'docente_002',
    importante: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_005',
    titulo: 'Taller de Arte',
    descripcion: 'Actividad extracurricular de artes plásticas',
    tipo: 'Extracurricular',
    fecha: '2025-01-25T15:00:00Z',
    fechaFin: '2025-01-25T16:30:00Z',
    ubicacion: 'Taller de Arte',
    responsable: 'Profesor de Arte',
    creadorId: 'docente_003',
    importante: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_008',
    titulo: 'Noche Nocturna',
    descripcion: 'Evento cultural y social nocturno con participación de alumnos',
    tipo: 'Extracurricular',
    fecha: '2025-11-29T18:00:00Z',
    fechaFin: '2025-11-29T22:00:00Z',
    ubicacion: 'Auditorio y espacios abiertos',
    responsable: 'Coordinación de Actividades',
    creadorId: 'admin_001',
    importante: true,
    createdAt: new Date().toISOString()
  },
  // Eventos Generales
  {
    id: 'evt_006',
    titulo: 'Reunión de Padres',
    descripcion: 'Reunión informativa con padres de familia',
    tipo: 'General',
    fecha: '2025-02-10T18:00:00Z',
    fechaFin: '2025-02-10T19:30:00Z',
    ubicacion: 'Auditorio',
    responsable: 'Dirección',
    creadorId: 'admin_001',
    importante: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_007',
    titulo: 'Día no lectivo',
    descripcion: 'Suspensión de clases por festividad',
    tipo: 'General',
    fecha: '2025-02-17T00:00:00Z',
    fechaFin: '2025-02-17T23:59:59Z',
    ubicacion: 'Institución',
    responsable: 'Dirección',
    creadorId: 'admin_001',
    importante: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_009',
    titulo: 'Junta de Maestros',
    descripcion: 'Junta de consejo de maestros. No hay clase para alumnos.',
    tipo: 'General',
    fecha: '2025-11-28T08:00:00Z',
    fechaFin: '2025-11-28T17:00:00Z',
    ubicacion: 'Sala de Maestros',
    responsable: 'Dirección',
    creadorId: 'admin_001',
    importante: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_010',
    titulo: 'Junta de Maestros',
    descripcion: 'Junta de consejo de maestros. No hay clase para alumnos.',
    tipo: 'General',
    fecha: '2025-12-26T08:00:00Z',
    fechaFin: '2025-12-26T17:00:00Z',
    ubicacion: 'Sala de Maestros',
    responsable: 'Dirección',
    creadorId: 'admin_001',
    importante: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_011',
    titulo: 'Junta de Maestros',
    descripcion: 'Junta de consejo de maestros. No hay clase para alumnos.',
    tipo: 'General',
    fecha: '2025-01-31T08:00:00Z',
    fechaFin: '2025-01-31T17:00:00Z',
    ubicacion: 'Sala de Maestros',
    responsable: 'Dirección',
    creadorId: 'admin_001',
    importante: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_012',
    titulo: 'Evento de Cierre de Año',
    descripcion: 'Ceremonia de cierre del ciclo escolar. Participación de toda la comunidad educativa.',
    tipo: 'Académico',
    fecha: '2025-12-12T09:00:00Z',
    fechaFin: '2025-12-12T13:00:00Z',
    ubicacion: 'Auditorio',
    responsable: 'Dirección',
    creadorId: 'admin_001',
    importante: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_013',
    titulo: 'Período Vacacional',
    descripcion: 'Suspensión de actividades escolares para vacaciones de invierno',
    tipo: 'General',
    fecha: '2025-12-15T00:00:00Z',
    fechaFin: '2026-01-08T23:59:59Z',
    ubicacion: 'Institución cerrada',
    responsable: 'Dirección',
    creadorId: 'admin_001',
    importante: true,
    createdAt: new Date().toISOString()
  },
];

/**
 * Obtener lista de eventos
 */
const getEventos = async (req, res, next) => {
  try {
    let { tipo, mes, año, importante, page = 1, pageSize = 20 } = req.query;
    const userRol = req.user.rol;

    // Filtrar por tipo si se proporciona
    let eventosFiltered = MOCK_EVENTOS;

    if (tipo) {
      eventosFiltered = eventosFiltered.filter(e => e.tipo === tipo);
    }

    if (mes && año) {
      const mesNum = parseInt(mes);
      const añoNum = parseInt(año);
      eventosFiltered = eventosFiltered.filter(e => {
        const fecha = new Date(e.fecha);
        return fecha.getMonth() + 1 === mesNum && fecha.getFullYear() === añoNum;
      });
    }

    if (importante === 'true') {
      eventosFiltered = eventosFiltered.filter(e => e.importante);
    }

    // Ordenar por fecha
    eventosFiltered.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    // Paginación
    const start = (parseInt(page) - 1) * parseInt(pageSize);
    const end = start + parseInt(pageSize);
    const paginatedItems = eventosFiltered.slice(start, end);

    res.status(200).json({
      total: eventosFiltered.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      items: paginatedItems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener detalle de un evento
 */
const getEventoById = async (req, res, next) => {
  try {
    const { eventoId } = req.params;

    const evento = MOCK_EVENTOS.find(e => e.id === eventoId);

    if (!evento) {
      throw ErrorFactory.notFound('Evento');
    }

    res.status(200).json(evento);
  } catch (error) {
    next(error);
  }
};

/**
 * Crear nuevo evento (solo admin y docentes)
 */
const crearEvento = async (req, res, next) => {
  try {
    const userRol = req.user.rol;
    const userId = req.user.id;

    // Solo admin y docentes pueden crear eventos
    if (!['admin', 'docente'].includes(userRol)) {
      throw ErrorFactory.forbidden('Solo administradores y docentes pueden crear eventos');
    }

    const { titulo, descripcion, tipo, fecha, fechaFin, ubicacion, responsable, importante } = req.body;

    // Validaciones
    const detalles = [];
    if (!titulo) detalles.push({ campo: 'titulo', error: 'Campo requerido' });
    if (!tipo) detalles.push({ campo: 'tipo', error: 'Campo requerido' });
    if (!fecha) detalles.push({ campo: 'fecha', error: 'Campo requerido' });
    if (!['Académico', 'Extracurricular', 'General'].includes(tipo)) {
      detalles.push({ campo: 'tipo', error: 'Tipo inválido' });
    }

    if (detalles.length > 0) {
      throw ErrorFactory.badRequest('Datos incompletos', detalles);
    }

    // Validar fechas
    const fechaInicio = new Date(fecha);
    const fechaTermino = fechaFin ? new Date(fechaFin) : fechaInicio;

    if (fechaTermino < fechaInicio) {
      throw ErrorFactory.badRequest('La fecha de fin no puede ser anterior a la de inicio', [
        { campo: 'fechaFin', error: 'Debe ser mayor o igual a la fecha de inicio' }
      ]);
    }

    // Crear nuevo evento
    const nuevoEvento = {
      id: `evt_${Date.now()}`,
      titulo,
      descripcion: descripcion || '',
      tipo,
      fecha: fecha,
      fechaFin: fechaFin || fecha,
      ubicacion: ubicacion || 'No especificada',
      responsable: responsable || 'Por definir',
      creadorId: userId,
      importante: importante === true || importante === 'true',
      createdAt: new Date().toISOString()
    };

    MOCK_EVENTOS.push(nuevoEvento);

    res.status(201).json({
      mensaje: 'Evento creado exitosamente',
      evento: nuevoEvento
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar evento (solo creador y admin)
 */
const actualizarEvento = async (req, res, next) => {
  try {
    const { eventoId } = req.params;
    const userRol = req.user.rol;
    const userId = req.user.id;
    const { titulo, descripcion, tipo, fecha, fechaFin, ubicacion, responsable, importante } = req.body;

    const evento = MOCK_EVENTOS.find(e => e.id === eventoId);

    if (!evento) {
      throw ErrorFactory.notFound('Evento');
    }

    // Validar permisos (solo creador o admin)
    if (userRol !== 'admin' && evento.creadorId !== userId) {
      throw ErrorFactory.forbidden('No tiene permiso para actualizar este evento');
    }

    // Actualizar campos
    if (titulo) evento.titulo = titulo;
    if (descripcion !== undefined) evento.descripcion = descripcion;
    if (tipo) evento.tipo = tipo;
    if (fecha) evento.fecha = fecha;
    if (fechaFin) evento.fechaFin = fechaFin;
    if (ubicacion !== undefined) evento.ubicacion = ubicacion;
    if (responsable !== undefined) evento.responsable = responsable;
    if (importante !== undefined) evento.importante = importante;

    res.status(200).json({
      mensaje: 'Evento actualizado exitosamente',
      evento
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar evento (solo creador y admin)
 */
const eliminarEvento = async (req, res, next) => {
  try {
    const { eventoId } = req.params;
    const userRol = req.user.rol;
    const userId = req.user.id;

    const eventoIndex = MOCK_EVENTOS.findIndex(e => e.id === eventoId);

    if (eventoIndex === -1) {
      throw ErrorFactory.notFound('Evento');
    }

    const evento = MOCK_EVENTOS[eventoIndex];

    // Validar permisos (solo creador o admin)
    if (userRol !== 'admin' && evento.creadorId !== userId) {
      throw ErrorFactory.forbidden('No tiene permiso para eliminar este evento');
    }

    MOCK_EVENTOS.splice(eventoIndex, 1);

    res.status(200).json({
      mensaje: 'Evento eliminado exitosamente',
      evento
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEventos,
  getEventoById,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  MOCK_EVENTOS, // Exportar para otros controladores si es necesario
};
