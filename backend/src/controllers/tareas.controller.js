// src/controllers/tareas.controller.js
const { ErrorFactory } = require('../utils/errors.util');
const { MOCK_USERS } = require('./auth.controller');


// Mock de tareas - Sincronizadas con el calendario escolar
let MOCK_TAREAS = [
  {
    id: 'tsk_001',
    titulo: 'Investigación sobre el sistema solar',
    descripcion: 'Realizar investigación de 2 páginas sobre los planetas. Entrega antes de la Noche Nocturna del 29 de noviembre.',
    materia: 'Ciencias Naturales',
    docenteId: 'tchr_12345',
    fechaAsignacion: '2025-11-03T08:00:00Z',
    fechaEntrega: '2025-11-25T23:59:59Z',
    fechaCalificacion: '2025-12-02T23:59:59Z',
  },
  {
    id: 'tsk_002',
    titulo: 'Ensayo sobre Literatura Contemporánea',
    descripcion: 'Escribir un ensayo de 3 páginas analizando autores contemporáneos mexicanos.',
    materia: 'Español',
    docenteId: 'tchr_12345',
    fechaAsignacion: '2025-11-04T08:00:00Z',
    fechaEntrega: '2025-11-24T23:59:59Z',
    fechaCalificacion: '2025-12-01T23:59:59Z',
  },
  {
    id: 'tsk_003',
    titulo: 'Preparación para evaluación - Historia',
    descripcion: 'Estudiar temas de la Historia de México para la evaluación del mes.',
    materia: 'Historia',
    docenteId: 'tchr_12345',
    fechaAsignacion: '2025-11-05T08:00:00Z',
    fechaEntrega: '2025-11-22T23:59:59Z',
    fechaCalificacion: '2025-11-29T23:59:59Z',
  },
  {
    id: 'tsk_004',
    titulo: 'Proyecto de Ciencias - Energías Renovables',
    descripcion: 'Crear un modelo o presentación sobre energías renovables. Se presentará antes de la Junta de Maestros del 28 de noviembre.',
    materia: 'Ciencias Naturales',
    docenteId: 'tchr_12345',
    fechaAsignacion: '2025-11-06T08:00:00Z',
    fechaEntrega: '2025-11-26T23:59:59Z',
    fechaCalificacion: '2025-12-03T23:59:59Z',
  },
  {
    id: 'tsk_005',
    titulo: 'Ejercicios de Matemáticas - Álgebra',
    descripcion: 'Resolver la hoja de ejercicios sobre sistemas de ecuaciones lineales.',
    materia: 'Matemáticas',
    docenteId: 'tchr_12345',
    fechaAsignacion: '2025-11-07T08:00:00Z',
    fechaEntrega: '2025-11-20T23:59:59Z',
    fechaCalificacion: '2025-11-27T23:59:59Z',
  },
  {
    id: 'tsk_006',
    titulo: 'Lectura: "El Llano en Llamas"',
    descripcion: 'Leer los cuentos seleccionados y elaborar un resumen crítico de cada uno.',
    materia: 'Español',
    docenteId: 'tchr_12345',
    fechaAsignacion: '2025-11-08T08:00:00Z',
    fechaEntrega: '2025-11-23T23:59:59Z',
    fechaCalificacion: '2025-11-30T23:59:59Z',
  },
  {
    id: 'tsk_007',
    titulo: 'Reporte de Laboratorio - Reacciones Químicas',
    descripcion: 'Elaborar un reporte detallado sobre las reacciones químicas observadas en el laboratorio.',
    materia: 'Química',
    docenteId: 'tchr_12345',
    fechaAsignacion: '2025-11-10T08:00:00Z',
    fechaEntrega: '2025-11-21T23:59:59Z',
    fechaCalificacion: '2025-11-28T23:59:59Z',
  },
  {
    id: 'tsk_008',
    titulo: 'Trabajo de Arte - Técnicas Tradicionales',
    descripcion: 'Crear una obra de arte utilizando técnicas tradicionales de pintura o dibujo.',
    materia: 'Arte',
    docenteId: 'tchr_12345',
    fechaAsignacion: '2025-11-11T08:00:00Z',
    fechaEntrega: '2025-11-27T23:59:59Z',
    fechaCalificacion: '2025-12-04T23:59:59Z',
  },
  {
    id: 'tsk_009',
    titulo: 'Preparación para Evaluación - Geografía',
    descripcion: 'Estudiar mapas y características geográficas de América Latina.',
    materia: 'Geografía',
    docenteId: 'tchr_12345',
    fechaAsignacion: '2025-11-12T08:00:00Z',
    fechaEntrega: '2025-11-26T23:59:59Z',
    fechaCalificacion: '2025-12-03T23:59:59Z',
  },
  {
    id: 'tsk_010',
    titulo: 'Presentación Multimedia - Tecnología',
    descripcion: 'Crear una presentación sobre avances tecnológicos del siglo XXI.',
    materia: 'Tecnología',
    docenteId: 'tchr_12345',
    fechaAsignacion: '2025-11-14T08:00:00Z',
    fechaEntrega: '2025-11-27T23:59:59Z',
    fechaCalificacion: '2025-12-04T23:59:59Z',
  },
];

// Mock de Entregas (Submissions) - Esta variable se había eliminado por error.
let MOCK_ENTREGAS = [
  // Entregas Alumno 1 (Emma Hernandez)
  { id: 'ent_001', tareaId: 'tsk_001', alumnoId: 'stdnt_alumno01', estado: 'entregada', archivoEntrega: 'uploads/tareas/tarea-sistemasolar-emma.pdf', fechaEntregaAlumno: '2025-11-22T18:30:00Z', calificacion: null, comentarioDocente: null },
  { id: 'ent_002', tareaId: 'tsk_008', alumnoId: 'stdnt_alumno01', estado: 'entregada', archivoEntrega: 'uploads/tareas/tarea-arte-emma.jpg', fechaEntregaAlumno: '2025-11-24T15:00:00Z', calificacion: null, comentarioDocente: null },
  { id: 'ent_003', tareaId: 'tsk_005', alumnoId: 'stdnt_alumno01', estado: 'calificada', archivoEntrega: 'uploads/tareas/tarea-algebra-emma.pdf', fechaEntregaAlumno: '2025-11-19T20:00:00Z', calificacion: 95, comentarioDocente: 'Excelente trabajo, muy bien resueltos los problemas. Sigue así.' },
  { id: 'ent_004', tareaId: 'tsk_007', alumnoId: 'stdnt_alumno01', estado: 'calificada', archivoEntrega: 'uploads/tareas/tarea-quimica-emma.docx', fechaEntregaAlumno: '2025-11-20T10:15:00Z', calificacion: 80, comentarioDocente: 'Buen reporte, pero faltó detallar más las conclusiones y citar las fuentes correctamente.' },
  // Entregas Alumno 2 (Mateo Rodríguez)
  { id: 'ent_006', tareaId: 'tsk_005', alumnoId: 'stdnt_alumno02', estado: 'calificada', archivoEntrega: 'uploads/tareas/tarea-algebra-mateo.pdf', fechaEntregaAlumno: '2025-11-19T10:00:00Z', calificacion: 88, comentarioDocente: 'Buen trabajo, Mateo. Revisa el ejercicio 5.' },
  { id: 'ent_007', tareaId: 'tsk_007', alumnoId: 'stdnt_alumno02', estado: 'calificada', archivoEntrega: 'uploads/tareas/tarea-quimica-mateo.docx', fechaEntregaAlumno: '2025-11-20T18:00:00Z', calificacion: 92, comentarioDocente: 'Muy buen reporte, excelentes conclusiones.' },
  { id: 'ent_008', tareaId: 'tsk_001', alumnoId: 'stdnt_alumno02', estado: 'entregada', archivoEntrega: 'uploads/tareas/tarea-sistemasolar-mateo.pdf', fechaEntregaAlumno: '2025-11-23T14:20:00Z', calificacion: null, comentarioDocente: null },
  { id: 'ent_009', tareaId: 'tsk_010', alumnoId: 'stdnt_alumno02', estado: 'calificada', archivoEntrega: 'uploads/tareas/tarea-tecnologia-mateo.pdf', fechaEntregaAlumno: '2025-11-25T22:00:00Z', calificacion: 75, comentarioDocente: 'Faltó profundidad en el análisis de las consecuencias.' },
];
/**
 * Listar tareas
 */
const getTareas = async (req, res, next) => {
  try {
    let { alumnoId, estado, materia, page = 1, pageSize = 20 } = req.query;
    const userRol = req.user.rol;
    const userId = req.user.id;

    let tareasResult = [];

    // Filtrar por alumno (en producción buscar por asignación a grupo/alumno)
    if (alumnoId) {
      // Verificar permisos
      if (userRol === 'alumno' && alumnoId !== userId) {
        throw ErrorFactory.forbidden('No puede consultar tareas de otro alumno');
      }
      // En mock todas las tareas son del mismo alumno
    }
    if (userRol === 'docente') {
      // Para el docente, mostrar todas las entregas existentes.
      const todosLosAlumnos = MOCK_USERS.filter(u => u.rol === 'alumno');
      
      MOCK_TAREAS.forEach(tarea => {
        todosLosAlumnos.forEach(alumno => {
          const entregaExistente = MOCK_ENTREGAS.find(
            e => e.tareaId === tarea.id && e.alumnoId === alumno.id
          );

          let estadoFinal = entregaExistente ? entregaExistente.estado : 'pendiente';
          if (estadoFinal === 'pendiente' && new Date(tarea.fechaEntrega) < new Date()) {
            estadoFinal = 'vencida';
          }

          const tareaParaAlumno = {
            ...tarea,
            ...(entregaExistente || { calificacion: null, comentarioDocente: null, archivoEntrega: null, fechaEntregaAlumno: null }),
            estado: estadoFinal,
            alumno: {
              id: alumno.id,
              nombre: alumno.nombre,
            },
          };
          // Si se filtra por un alumno específico, solo agregar las de ese alumno
          if (!alumnoId || alumno.id === alumnoId) {
            tareasResult.push(tareaParaAlumno);
          }
        });
      });

      tareasResult.sort((a, b) => new Date(b.fechaEntrega) - new Date(a.fechaEntrega));
    } else {
      // Para alumnos y padres, mostrar todas las tareas y su estado para ese alumno.
      let targetAlumnoId = userRol === 'alumno' ? userId : alumnoId;
      if (userRol === 'padres') {
        const alumnoAsociado = MOCK_USERS.find(u => u.padresId === userId);
        if (alumnoAsociado) targetAlumnoId = alumnoAsociado.id;
      }

      if (!targetAlumnoId) {
        throw ErrorFactory.badRequest('El parámetro alumnoId es requerido');
      }

      tareasResult = MOCK_TAREAS.map(tarea => {
        const entrega = MOCK_ENTREGAS.find(e => e.tareaId === tarea.id && e.alumnoId === targetAlumnoId);
        const tareaFinal = { ...tarea, ...(entrega || {}) };

        let estadoFinal = entrega ? entrega.estado : 'pendiente';
        let calificacionFinal = entrega ? entrega.calificacion : null;

        // Si está pendiente, verificar si está vencida
        if (estadoFinal === 'pendiente' && new Date(tarea.fechaEntrega) < new Date()) {
          estadoFinal = 'vencida';
          calificacionFinal = 0; // Asignar calificación 0 si está vencida
        }

        tareaFinal.estado = estadoFinal;
        tareaFinal.calificacion = calificacionFinal;
        return tareaFinal;
      });
      tareasResult.sort((a, b) => new Date(a.fechaEntrega) - new Date(b.fechaEntrega));
    }
    // Filtrar por estado
    if (estado) {
      tareasResult = tareasResult.filter(t => t.estado === estado);
    }

    // Paginación
    const start = (page - 1) * pageSize;
    const end = start + parseInt(pageSize);
    const paginatedItems = tareasResult.slice(start, end);

    res.status(200).json({
      total: tareasResult.length,
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
    const { tareaId, alumnoId } = req.params;

    const tarea = MOCK_TAREAS.find(t => t.id === tareaId)

    if (!tarea) {
      throw ErrorFactory.notFound('Tarea');
    }

    const entrega = MOCK_ENTREGAS.find(e => e.tareaId === tareaId && e.alumnoId === alumnoId);

    res.status(200).json({
      ...tarea,
      ...(entrega || { estado: 'pendiente' })
    });

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

    // Crear o actualizar entrega
    const datosEntrega = {
      id: `ent_${Date.now()}`,
      tareaId: tarea.id,
      alumnoId: userId,
      estado: 'entregada',
      archivoEntrega: archivo.path, // Usar la ruta del archivo guardado por multer
      fechaEntregaAlumno: new Date().toISOString(),
      comentarioAlumno: comentario || null,
      calificacion: null,
      comentarioDocente: null,
    };

    MOCK_ENTREGAS.push(datosEntrega);

    res.status(200).json({
      mensaje: 'Tarea entregada exitosamente',
      entrega: datosEntrega,
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

    // Buscar entrega
    const entrega = MOCK_ENTREGAS.find(e => e.tareaId === tareaId && e.alumnoId === alumnoId);

    if (!entrega) {
      throw ErrorFactory.notFound('La entrega para este alumno y tarea no fue encontrada');
    }

    // Validar que esté entregada
    if (entrega.estado !== 'entregada') {
      throw ErrorFactory.badRequest('Solo se pueden calificar tareas entregadas');
    }

    // Actualizar calificación
    entrega.estado = 'calificada';
    entrega.calificacion = calificacion;
    entrega.comentarioDocente = comentario || null;

    res.status(200).json({
      mensaje: 'Tarea calificada exitosamente',
      entrega: entrega
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
