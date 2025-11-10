// src/controllers/tareas.controller.js
const { ErrorFactory } = require('../utils/errors.util');

// Mock de tareas
let MOCK_TAREAS = [
  {
    id: 'tsk_5001',
    titulo: 'Problemas de fracciones',
    descripcion: 'Resolver los ejercicios 1-15 del libro página 45',
    materia: 'Matemáticas',
    docenteId: 'usr_67890',
    fechaAsignacion: '2025-10-28T08:00:00Z',
    fechaEntrega: '2025-11-05T23:59:59Z',
    estado: 'pendiente',
    calificacion: null,
    comentarioDocente: null,
    archivoEntrega: null,
    fechaEntregaAlumno: null
  },
  {
    id: 'tsk_5002',
    titulo: 'Investigación sobre el sistema solar',
    descripcion: 'Realizar investigación de 2 páginas sobre los planetas',
    materia: 'Ciencias Naturales',
    docenteId: 'usr_67890',
    fechaAsignacion: '2025-10-25T08:00:00Z',
    fechaEntrega: '2025-11-03T23:59:59Z',
    estado: 'entregada',
    calificacion: null,
    comentarioDocente: null,
    archivoEntrega: 'uploads/tareas/tarea-1234567890-sistema-solar.pdf',
    fechaEntregaAlumno: '2025-11-02T18:30:00Z'
  }
];

/**
 * Listar tareas
 */
const getTareas = async (req, res, next) => {
  try {
    const { alumnoId, estado, materia, page = 1, pageSize = 20 } = req.query;
    const userRol = req.user.rol;
    const userId = req.user.id;

    let tareas = [...MOCK_TAREAS];

    // Filtrar por alumno (en producción buscar por asignación a grupo/alumno)
    if (alumnoId) {
      // Verificar permisos
      if (userRol === 'alumno' && alumnoId !== userId) {
        throw ErrorFactory.forbidden('No puede consultar tareas de otro alumno');
      }
      // En mock todas las tareas son del mismo alumno
    }

    // Filtrar por estado
    if (estado) {
      tareas = tareas.filter(t => t.estado === estado);
    }

    // Filtrar por materia
    if (materia) {
      tareas = tareas.filter(t => t.materia === materia);
    }

    // Ordenar por fecha de entrega
    tareas.sort((a, b) => new Date(a.fechaEntrega) - new Date(b.fechaEntrega));

    // Paginación
    const start = (page - 1) * pageSize;
    const end = start + parseInt(pageSize);
    const paginatedItems = tareas.slice(start, end);

    res.status(200).json({
      total: tareas.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      items: paginatedItems
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener detalle de una tarea
 */
const getTareaById = async (req, res, next) => {
  try {
    const { tareaId } = req.params;

    const tarea = MOCK_TAREAS.find(t => t.id === tareaId);

    if (!tarea) {
      throw ErrorFactory.notFound('Tarea');
    }

    res.status(200).json(tarea);
  } catch (error) {
    next(error);
  }
};

/**
 * Entregar tarea (con archivo)
 */
const entregarTarea = async (req, res, next) => {
  try {
    const { tareaId } = req.params;
    const { comentario } = req.body;
    const userId = req.user.id;
    const archivo = req.file;

    // Validar que se subió un archivo
    if (!archivo) {
      throw ErrorFactory.badRequest('Debe subir un archivo', [
        { campo: 'archivo', error: 'Archivo requerido' }
      ]);
    }

    // Buscar tarea
    const tarea = MOCK_TAREAS.find(t => t.id === tareaId);

    if (!tarea) {
      throw ErrorFactory.notFound('Tarea');
    }

    // Validar que no esté vencida
    const fechaEntrega = new Date(tarea.fechaEntrega);
    const ahora = new Date();

    if (ahora > fechaEntrega) {
      throw ErrorFactory.badRequest('La fecha de entrega ha expirado');
    }

    // Validar que no esté ya entregada
    if (tarea.estado === 'entregada' || tarea.estado === 'calificada') {
      throw ErrorFactory.badRequest('Esta tarea ya fue entregada');
    }

    // Actualizar tarea
    tarea.estado = 'entregada';
    tarea.archivoEntrega = archivo.path;
    tarea.fechaEntregaAlumno = new Date().toISOString();

    // Crear entrega
    const entrega = {
      id: `ent_${Date.now()}`,
      tareaId: tarea.id,
      alumnoId: userId,
      fechaEntrega: tarea.fechaEntregaAlumno,
      archivo: archivo.path,
      comentario: comentario || null
    };

    res.status(200).json({
      mensaje: 'Tarea entregada exitosamente',
      entrega: entrega,
      tarea: tarea
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calificar tarea entregada
 */
const calificarTarea = async (req, res, next) => {
  try {
    const { tareaId } = req.params;
    const { alumnoId, calificacion, comentario } = req.body;

    // Validaciones
    if (!alumnoId || calificacion === undefined || calificacion === null) {
      const detalles = [];
      if (!alumnoId) detalles.push({ campo: 'alumnoId', error: 'Campo requerido' });
      if (calificacion === undefined || calificacion === null) {
        detalles.push({ campo: 'calificacion', error: 'Campo requerido' });
      }
      throw ErrorFactory.badRequest('Datos incompletos', detalles);
    }

    // Validar rango de calificación
    if (calificacion < 0 || calificacion > 100) {
      throw ErrorFactory.badRequest('La calificación debe estar entre 0 y 100', [
        { campo: 'calificacion', error: 'Debe ser un número entre 0 y 100' }
      ]);
    }

    // Buscar tarea
    const tarea = MOCK_TAREAS.find(t => t.id === tareaId);

    if (!tarea) {
      throw ErrorFactory.notFound('Tarea');
    }

    // Validar que esté entregada
    if (tarea.estado !== 'entregada') {
      throw ErrorFactory.badRequest('Solo se pueden calificar tareas entregadas');
    }

    // Actualizar calificación
    tarea.estado = 'calificada';
    tarea.calificacion = calificacion;
    tarea.comentarioDocente = comentario || null;

    res.status(200).json({
      mensaje: 'Tarea calificada exitosamente',
      tarea: tarea
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTareas,
  getTareaById,
  entregarTarea,
  calificarTarea
};
