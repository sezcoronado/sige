// src/controllers/tareas.controller.js
const { ErrorFactory } = require('../utils/errors.util');

// Mock de tareas
let MOCK_TAREAS = [
  {
    id: 'tsk_001',
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
    id: 'tsk_002',
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
  },
  {
    id: 'tsk_003',
    titulo: 'Ensayo sobre "Cien años de soledad"',
    descripcion: 'Escribir un ensayo de 3 páginas analizando los temas principales de la novela.',
    materia: 'Español',
    docenteId: 'usr_67890',
    fechaAsignacion: '2025-10-20T08:00:00Z',
    fechaEntrega: '2025-11-10T23:59:59Z',
    estado: 'pendiente',
    calificacion: null,
    comentarioDocente: null,
    archivoEntrega: null,
    fechaEntregaAlumno: null
  },
  {
    id: 'tsk_004',
    titulo: 'Línea de tiempo de la Revolución Mexicana',
    descripcion: 'Crear una línea de tiempo visual con los 10 eventos más importantes de la Revolución Mexicana.',
    materia: 'Historia',
    docenteId: 'usr_67890',
    fechaAsignacion: '2025-11-01T08:00:00Z',
    fechaEntrega: '2025-11-15T23:59:59Z',
    estado: 'pendiente',
    calificacion: null,
    comentarioDocente: null,
    archivoEntrega: null,
    fechaEntregaAlumno: null
  },
  {
    id: 'tsk_005',
    titulo: 'Dibujo a lápiz de un bodegón',
    descripcion: 'Realizar un dibujo a lápiz de un bodegón con al menos 3 frutas, prestando atención a luces y sombras.',
    materia: 'Arte',
    docenteId: 'usr_67890',
    fechaAsignacion: '2025-10-29T08:00:00Z',
    fechaEntrega: '2025-11-08T23:59:59Z',
    estado: 'entregada',
    calificacion: null,
    comentarioDocente: null,
    archivoEntrega: 'uploads/tareas/tarea-bodegon.jpg',
    fechaEntregaAlumno: '2025-11-07T15:00:00Z'
  },
  {
    id: 'tsk_006',
    titulo: 'Ejercicios de Álgebra',
    descripcion: 'Resolver la hoja de ejercicios de ecuaciones de segundo grado.',
    materia: 'Matemáticas',
    docenteId: 'usr_67890',
    fechaAsignacion: '2025-10-15T08:00:00Z',
    fechaEntrega: '2025-10-22T23:59:59Z',
    estado: 'calificada',
    calificacion: 95,
    comentarioDocente: 'Excelente trabajo, muy bien resueltos los problemas. Sigue así.',
    archivoEntrega: 'uploads/tareas/tarea-algebra.pdf',
    fechaEntregaAlumno: '2025-10-21T20:00:00Z'
  },
  {
    id: 'tsk_007',
    titulo: 'Reporte de laboratorio: La célula',
    descripcion: 'Elaborar un reporte del laboratorio sobre la observación de células animales y vegetales.',
    materia: 'Ciencias Naturales',
    docenteId: 'usr_67890',
    fechaAsignacion: '2025-10-18T08:00:00Z',
    fechaEntrega: '2025-10-25T23:59:59Z',
    estado: 'calificada',
    calificacion: 80,
    comentarioDocente: 'Buen reporte, pero faltó detallar más las conclusiones y citar las fuentes correctamente.',
    archivoEntrega: 'uploads/tareas/tarea-celula.docx',
    fechaEntregaAlumno: '2025-10-25T10:15:00Z'
  },
  {
    id: 'tsk_008',
    titulo: 'Análisis de un poema de Octavio Paz',
    descripcion: 'Leer el poema "Piedra de Sol" y escribir un análisis de una página sobre su estructura y significado.',
    materia: 'Español',
    docenteId: 'usr_67890',
    fechaAsignacion: '2025-11-04T08:00:00Z',
    fechaEntrega: '2025-11-12T23:59:59Z',
    estado: 'pendiente',
    calificacion: null,
    comentarioDocente: null,
    archivoEntrega: null,
    fechaEntregaAlumno: null
  },
  {
    id: 'tsk_009',
    titulo: 'Resumen del descubrimiento de América',
    descripcion: 'Escribir un resumen de 500 palabras sobre los viajes de Cristóbal Colón y el descubrimiento de América.',
    materia: 'Historia',
    docenteId: 'usr_67890',
    fechaAsignacion: '2025-10-27T08:00:00Z',
    fechaEntrega: '2025-11-04T23:59:59Z',
    estado: 'entregada',
    calificacion: null,
    comentarioDocente: null,
    archivoEntrega: 'uploads/tareas/tarea-colon.pdf',
    fechaEntregaAlumno: '2025-11-03T22:00:00Z'
  },
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
