// src/controllers/finanzas.controller.js
const { ErrorFactory } = require('../utils/errors.util');
const { MOCK_USERS } = require('./auth.controller');

// Simulación de base de datos
let MOCK_CUOTAS = [
  // Cuotas Alumno 1
  {
    id: 'cuota_001',
    alumnoId: 'stdnt_alumno01',
    mes: 'Enero',
    año: 2025,
    monto: 2500.00,
    moneda: 'MXN',
    estado: 'pagada',
    fechaPago: '2024-12-20T10:00:00Z',
    metodoPago: 'transferencia',
    comprobante: null,
    createdAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'cuota_002',
    alumnoId: 'stdnt_alumno01',
    mes: 'Febrero',
    año: 2025,
    monto: 2500.00,
    moneda: 'MXN',
    estado: 'pendiente',
    fechaPago: null,
    metodoPago: null,
    comprobante: null,
    createdAt: '2025-01-01T00:00:00Z',
    fechaVencimiento: '2025-02-15T23:59:59Z',
  },
  {
    id: 'cuota_003',
    alumnoId: 'stdnt_alumno01',
    mes: 'Marzo',
    año: 2025,
    monto: 2500.00,
    moneda: 'MXN',
    estado: 'pendiente',
    fechaPago: null,
    metodoPago: null,
    comprobante: null,
    createdAt: '2025-02-01T00:00:00Z',
    fechaVencimiento: '2025-03-15T23:59:59Z',
  },
  // Cuotas Alumno 2
  {
    id: 'cuota_004',
    alumnoId: 'stdnt_alumno02',
    mes: 'Enero',
    año: 2025,
    monto: 2500.00,
    moneda: 'MXN',
    estado: 'pagada',
    fechaPago: '2024-12-15T14:00:00Z',
    metodoPago: 'tarjeta',
    comprobante: null,
    createdAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'cuota_005',
    alumnoId: 'stdnt_alumno02',
    mes: 'Febrero',
    año: 2025,
    monto: 2500.00,
    moneda: 'MXN',
    estado: 'vencida',
    fechaPago: null,
    metodoPago: null,
    comprobante: null,
    createdAt: '2025-01-01T00:00:00Z',
    fechaVencimiento: '2025-02-15T23:59:59Z',
  },
];

let MOCK_PAGOS = [
  {
    id: 'pago_001',
    cuotaId: 'cuota_001',
    alumnoId: 'stdnt_alumno01',
    monto: 2500.00,
    metodoPago: 'transferencia',
    referencia: 'TRF20241220001',
    comprobante: null,
    estado: 'confirmado',
    createdAt: '2024-12-20T10:00:00Z',
  },
  {
    id: 'pago_002',
    cuotaId: 'cuota_004',
    alumnoId: 'stdnt_alumno02',
    monto: 2500.00,
    metodoPago: 'tarjeta',
    referencia: 'TRJ20241215001',
    comprobante: null,
    estado: 'confirmado',
    createdAt: '2024-12-15T14:00:00Z',
  },
];

/**
 * Obtener cuotas de un alumno
 */
const getCuotas = async (req, res, next) => {
  try {
    let { alumnoId, estado, page = 1, pageSize = 20 } = req.query;
    const userRol = req.user.rol;
    const userId = req.user.id;

    // Si el rol es 'padres', forzar el alumnoId asociado para seguridad
    if (userRol === 'padres') {
      const alumnoAsociado = MOCK_USERS.find(u => u.padresId === userId);
      if (alumnoAsociado) {
        alumnoId = alumnoAsociado.id;
      }
    }

    // Validar que se proporcione alumnoId
    if (!alumnoId) {
      throw ErrorFactory.badRequest('El parámetro alumnoId es requerido', [
        { campo: 'alumnoId', error: 'Campo requerido' }
      ]);
    }

    // Si es alumno, solo puede ver sus propias cuotas
    if (userRol === 'alumno' && alumnoId !== userId) {
      throw ErrorFactory.forbidden('No puede consultar las cuotas de otro alumno');
    }

    // Filtrar cuotas del alumno
    let cuotasFiltered = MOCK_CUOTAS.filter(c => c.alumnoId === alumnoId);

    // Filtrar por estado si se proporciona
    if (estado) {
      cuotasFiltered = cuotasFiltered.filter(c => c.estado === estado);
    }

    // Ordenar por año y mes descendente
    cuotasFiltered.sort((a, b) => {
      if (b.año !== a.año) return b.año - a.año;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Paginación
    const start = (parseInt(page) - 1) * parseInt(pageSize);
    const end = start + parseInt(pageSize);
    const paginatedItems = cuotasFiltered.slice(start, end);

    // Calcular resumen
    const resumen = {
      total: cuotasFiltered.length,
      pagadas: cuotasFiltered.filter(c => c.estado === 'pagada').length,
      pendientes: cuotasFiltered.filter(c => c.estado === 'pendiente').length,
      vencidas: cuotasFiltered.filter(c => c.estado === 'vencida').length,
      montoPendiente: cuotasFiltered
        .filter(c => c.estado === 'pendiente' || c.estado === 'vencida')
        .reduce((sum, c) => sum + c.monto, 0),
    };

    res.status(200).json({
      total: cuotasFiltered.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      items: paginatedItems,
      resumen,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener detalle de una cuota
 */
const getCuotaById = async (req, res, next) => {
  try {
    const { cuotaId } = req.params;
    const userRol = req.user.rol;
    const userId = req.user.id;

    const cuota = MOCK_CUOTAS.find(c => c.id === cuotaId);

    if (!cuota) {
      throw ErrorFactory.notFound('Cuota');
    }

    // Verificar permisos (solo el alumno, sus padres o admin)
    if (userRol === 'alumno' && cuota.alumnoId !== userId) {
      throw ErrorFactory.forbidden('No puede consultar esta cuota');
    }

    if (userRol === 'padres') {
      const alumnoAsociado = MOCK_USERS.find(u => u.padresId === userId);
      if (!alumnoAsociado || alumnoAsociado.id !== cuota.alumnoId) {
        throw ErrorFactory.forbidden('No puede consultar esta cuota');
      }
    }

    // Obtener pagos relacionados
    const pagosRelacionados = MOCK_PAGOS.filter(p => p.cuotaId === cuotaId);

    res.status(200).json({
      ...cuota,
      pagos: pagosRelacionados,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Registrar pago de cuota
 */
const pagarCuota = async (req, res, next) => {
  try {
    const { cuotaId, metodoPago, referencia } = req.body;
    const userRol = req.user.rol;
    const userId = req.user.id;

    // Validaciones
    if (!cuotaId || !metodoPago) {
      const detalles = [];
      if (!cuotaId) detalles.push({ campo: 'cuotaId', error: 'Campo requerido' });
      if (!metodoPago) detalles.push({ campo: 'metodoPago', error: 'Campo requerido' });
      throw ErrorFactory.badRequest('Datos incompletos', detalles);
    }

    if (!['transferencia', 'tarjeta', 'efectivo'].includes(metodoPago)) {
      throw ErrorFactory.badRequest('Método de pago inválido', [
        { campo: 'metodoPago', error: 'Debe ser "transferencia", "tarjeta" o "efectivo"' }
      ]);
    }

    const cuota = MOCK_CUOTAS.find(c => c.id === cuotaId);

    if (!cuota) {
      throw ErrorFactory.notFound('Cuota');
    }

    // Verificar permisos (solo padres del alumno pueden pagar)
    if (userRol === 'padres') {
      const alumnoAsociado = MOCK_USERS.find(u => u.padresId === userId);
      if (!alumnoAsociado || alumnoAsociado.id !== cuota.alumnoId) {
        throw ErrorFactory.forbidden('No puede realizar pagos para esta cuota');
      }
    } else if (userRol !== 'admin') {
      throw ErrorFactory.forbidden('Solo padres y administradores pueden registrar pagos');
    }

    // Verificar que la cuota no esté ya pagada
    if (cuota.estado === 'pagada') {
      throw ErrorFactory.badRequest('Esta cuota ya ha sido pagada', [
        { campo: 'cuotaId', error: 'Cuota pagada previamente' }
      ]);
    }

    // Registrar pago
    const nuevoPago = {
      id: `pago_${Date.now()}`,
      cuotaId: cuotaId,
      alumnoId: cuota.alumnoId,
      monto: cuota.monto,
      metodoPago: metodoPago,
      referencia: referencia || `REF${Date.now()}`,
      comprobante: null,
      estado: 'confirmado',
      createdAt: new Date().toISOString(),
    };

    MOCK_PAGOS.push(nuevoPago);

    // Actualizar estado de la cuota
    cuota.estado = 'pagada';
    cuota.fechaPago = new Date().toISOString();
    cuota.metodoPago = metodoPago;

    res.status(200).json({
      mensaje: 'Pago registrado exitosamente',
      pago: nuevoPago,
      cuota: cuota,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Subir comprobante de pago
 */
const subirComprobante = async (req, res, next) => {
  try {
    const { pagoId } = req.params;

    if (!req.file) {
      throw ErrorFactory.badRequest('Archivo no proporcionado', [
        { campo: 'archivo', error: 'Debe proporcionar un archivo' }
      ]);
    }

    const pago = MOCK_PAGOS.find(p => p.id === pagoId);

    if (!pago) {
      throw ErrorFactory.notFound('Pago');
    }

    // Simular almacenamiento del archivo
    const rutaArchivo = `/uploads/comprobantes/${req.file.filename}`;
    pago.comprobante = rutaArchivo;

    res.status(200).json({
      mensaje: 'Comprobante subido exitosamente',
      pago: pago,
      rutaArchivo: rutaArchivo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener historial de pagos
 */
const getHistorialPagos = async (req, res, next) => {
  try {
    let { alumnoId, page = 1, pageSize = 20 } = req.query;
    const userRol = req.user.rol;
    const userId = req.user.id;

    // Si el rol es 'padres', forzar el alumnoId asociado
    if (userRol === 'padres') {
      const alumnoAsociado = MOCK_USERS.find(u => u.padresId === userId);
      if (alumnoAsociado) {
        alumnoId = alumnoAsociado.id;
      }
    }

    if (!alumnoId) {
      throw ErrorFactory.badRequest('El parámetro alumnoId es requerido', [
        { campo: 'alumnoId', error: 'Campo requerido' }
      ]);
    }

    if (userRol === 'alumno' && alumnoId !== userId) {
      throw ErrorFactory.forbidden('No puede consultar el historial de otro alumno');
    }

    // Filtrar pagos del alumno
    let pagosFiltered = MOCK_PAGOS.filter(p => p.alumnoId === alumnoId);

    // Ordenar por fecha descendente
    pagosFiltered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginación
    const start = (parseInt(page) - 1) * parseInt(pageSize);
    const end = start + parseInt(pageSize);
    const paginatedItems = pagosFiltered.slice(start, end);

    res.status(200).json({
      total: pagosFiltered.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      items: paginatedItems,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCuotas,
  getCuotaById,
  pagarCuota,
  subirComprobante,
  getHistorialPagos,
  MOCK_CUOTAS,
  MOCK_PAGOS,
};
