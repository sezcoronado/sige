// src/controllers/nomina.controller.js
const { ErrorFactory } = require('../utils/errors.util');
const { MOCK_USERS } = require('./auth.controller');

// Simulación de base de datos para Nómina
let MOCK_EMPLEADOS = [
  {
    id: 'emp_001',
    nombre: 'Prof. Juan Pérez',
    rol: 'Maestro de Matemáticas',
    departamento: 'Académico',
    salarioMensual: 15000.00,
    moneda: 'MXN',
    estado: 'activo',
    fechaIngreso: '2020-01-15T00:00:00Z',
    usuarioId: 'docente_001',
  },
  {
    id: 'emp_002',
    nombre: 'Prof. María García',
    rol: 'Maestra de Español',
    departamento: 'Académico',
    salarioMensual: 15000.00,
    moneda: 'MXN',
    estado: 'activo',
    fechaIngreso: '2019-06-10T00:00:00Z',
    usuarioId: 'docente_002',
  },
  {
    id: 'emp_003',
    nombre: 'Prof. Carlos López',
    rol: 'Maestro de Ciencias',
    departamento: 'Académico',
    salarioMensual: 15500.00,
    moneda: 'MXN',
    estado: 'activo',
    fechaIngreso: '2021-02-01T00:00:00Z',
    usuarioId: 'docente_003',
  },
  {
    id: 'emp_004',
    nombre: 'Prof. Ana Martínez',
    rol: 'Maestra de Historia',
    departamento: 'Académico',
    salarioMensual: 14500.00,
    moneda: 'MXN',
    estado: 'activo',
    fechaIngreso: '2020-08-20T00:00:00Z',
    usuarioId: 'docente_004',
  },
  {
    id: 'emp_005',
    nombre: 'Prof. Roberto Sánchez',
    rol: 'Profesor de Educación Física',
    departamento: 'Académico',
    salarioMensual: 13000.00,
    moneda: 'MXN',
    estado: 'activo',
    fechaIngreso: '2018-09-05T00:00:00Z',
    usuarioId: 'docente_005',
  },
  {
    id: 'emp_006',
    nombre: 'Adm. Patricia Torres',
    rol: 'Secretaria Administrativa',
    departamento: 'Administración',
    salarioMensual: 10000.00,
    moneda: 'MXN',
    estado: 'activo',
    fechaIngreso: '2019-01-10T00:00:00Z',
    usuarioId: 'admin_001',
  },
  {
    id: 'emp_007',
    nombre: 'Dir. Fernando Díaz',
    rol: 'Director General',
    departamento: 'Dirección',
    salarioMensual: 25000.00,
    moneda: 'MXN',
    estado: 'activo',
    fechaIngreso: '2015-03-01T00:00:00Z',
    usuarioId: 'admin_002',
  },
];

let MOCK_PAGOS = [
  // Noviembre 2025 - Quincena 1
  { id: 'pago_001', empleadoId: 'emp_001', mes: 11, año: 2025, quincena: 1, monto: 7500.00, estado: 'pagado', fechaPago: '2025-11-15T00:00:00Z', referencia: 'TRF20251115001' },
  { id: 'pago_002', empleadoId: 'emp_002', mes: 11, año: 2025, quincena: 1, monto: 7500.00, estado: 'pagado', fechaPago: '2025-11-15T00:00:00Z', referencia: 'TRF20251115002' },
  { id: 'pago_003', empleadoId: 'emp_003', mes: 11, año: 2025, quincena: 1, monto: 7750.00, estado: 'pagado', fechaPago: '2025-11-15T00:00:00Z', referencia: 'TRF20251115003' },
  { id: 'pago_004', empleadoId: 'emp_004', mes: 11, año: 2025, quincena: 1, monto: 7250.00, estado: 'pagado', fechaPago: '2025-11-15T00:00:00Z', referencia: 'TRF20251115004' },
  { id: 'pago_005', empleadoId: 'emp_005', mes: 11, año: 2025, quincena: 1, monto: 6500.00, estado: 'pagado', fechaPago: '2025-11-15T00:00:00Z', referencia: 'TRF20251115005' },
  { id: 'pago_006', empleadoId: 'emp_006', mes: 11, año: 2025, quincena: 1, monto: 5000.00, estado: 'pagado', fechaPago: '2025-11-15T00:00:00Z', referencia: 'TRF20251115006' },
  { id: 'pago_007', empleadoId: 'emp_007', mes: 11, año: 2025, quincena: 1, monto: 12500.00, estado: 'pagado', fechaPago: '2025-11-15T00:00:00Z', referencia: 'TRF20251115007' },

  // Noviembre 2025 - Quincena 2
  { id: 'pago_008', empleadoId: 'emp_001', mes: 11, año: 2025, quincena: 2, monto: 7500.00, estado: 'pagado', fechaPago: '2025-11-30T00:00:00Z', referencia: 'TRF20251130001' },
  { id: 'pago_009', empleadoId: 'emp_002', mes: 11, año: 2025, quincena: 2, monto: 7500.00, estado: 'pagado', fechaPago: '2025-11-30T00:00:00Z', referencia: 'TRF20251130002' },
  { id: 'pago_010', empleadoId: 'emp_003', mes: 11, año: 2025, quincena: 2, monto: 7750.00, estado: 'pagado', fechaPago: '2025-11-30T00:00:00Z', referencia: 'TRF20251130003' },
  { id: 'pago_011', empleadoId: 'emp_004', mes: 11, año: 2025, quincena: 2, monto: 7250.00, estado: 'pagado', fechaPago: '2025-11-30T00:00:00Z', referencia: 'TRF20251130004' },
  { id: 'pago_012', empleadoId: 'emp_005', mes: 11, año: 2025, quincena: 2, monto: 6500.00, estado: 'pendiente', fechaPago: null, referencia: null },
  { id: 'pago_013', empleadoId: 'emp_006', mes: 11, año: 2025, quincena: 2, monto: 5000.00, estado: 'pendiente', fechaPago: null, referencia: null },
  { id: 'pago_014', empleadoId: 'emp_007', mes: 11, año: 2025, quincena: 2, monto: 12500.00, estado: 'pendiente', fechaPago: null, referencia: null },

  // Diciembre 2025 - Quincena 1
  { id: 'pago_015', empleadoId: 'emp_001', mes: 12, año: 2025, quincena: 1, monto: 7500.00, estado: 'pendiente', fechaPago: null, referencia: null },
  { id: 'pago_016', empleadoId: 'emp_002', mes: 12, año: 2025, quincena: 1, monto: 7500.00, estado: 'pendiente', fechaPago: null, referencia: null },
  { id: 'pago_017', empleadoId: 'emp_003', mes: 12, año: 2025, quincena: 1, monto: 7750.00, estado: 'pendiente', fechaPago: null, referencia: null },
];

/**
 * Obtener lista de empleados
 */
const getEmpleados = async (req, res, next) => {
  try {
    let { estado, page = 1, pageSize = 100 } = req.query;
    const userRol = req.user.rol;
    const userId = req.user.id;

    let empleadosFiltrados = MOCK_EMPLEADOS;

    // Si es docente, solo ver su propia información
    if (userRol === 'docente') {
      empleadosFiltrados = MOCK_EMPLEADOS.filter(
        e => e.usuarioId === userId || e.id === userId
      );
    } else if (userRol === 'admin') {
      // Admin puede filtrar por estado
      if (estado) {
        empleadosFiltrados = empleadosFiltrados.filter(e => e.estado === estado);
      }
    } else {
      throw ErrorFactory.forbidden('Solo docentes y administradores pueden acceder a esta información');
    }

    // Paginación
    const start = (parseInt(page) - 1) * parseInt(pageSize);
    const end = start + parseInt(pageSize);
    const paginatedItems = empleadosFiltrados.slice(start, end);

    res.status(200).json({
      total: empleadosFiltrados.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      items: paginatedItems
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener detalle de un empleado
 */
const getEmpleadoById = async (req, res, next) => {
  try {
    const { empleadoId } = req.params;
    const userRol = req.user.rol;
    const userId = req.user.id;

    const empleado = MOCK_EMPLEADOS.find(e => e.id === empleadoId);

    if (!empleado) {
      throw ErrorFactory.notFound('Empleado');
    }

    // Verificar permisos
    if (userRol === 'docente' && empleado.usuarioId !== userId && empleado.id !== userId) {
      throw ErrorFactory.forbidden('No puede consultar información de otro empleado');
    }

    res.status(200).json(empleado);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener pagos/nómina
 */
const getPagos = async (req, res, next) => {
  try {
    let { mes, año, estado, page = 1, pageSize = 100 } = req.query;
    const userRol = req.user.rol;
    const userId = req.user.id;

    let pagosFiltrados = MOCK_PAGOS;

    // Filtrar por mes y año si se proporcionan
    if (mes) {
      pagosFiltrados = pagosFiltrados.filter(p => p.mes === parseInt(mes));
    }
    if (año) {
      pagosFiltrados = pagosFiltrados.filter(p => p.año === parseInt(año));
    }

    // Filtrar por estado si se proporciona
    if (estado) {
      pagosFiltrados = pagosFiltrados.filter(p => p.estado === estado);
    }

    // Si es docente, solo ver sus propios pagos
    if (userRol === 'docente') {
      const empleadoDocente = MOCK_EMPLEADOS.find(e => e.usuarioId === userId);
      if (empleadoDocente) {
        pagosFiltrados = pagosFiltrados.filter(p => p.empleadoId === empleadoDocente.id);
      } else {
        pagosFiltrados = [];
      }
    }

    // Paginación
    const start = (parseInt(page) - 1) * parseInt(pageSize);
    const end = start + parseInt(pageSize);
    const paginatedItems = pagosFiltrados.slice(start, end);

    // Calcular resumen
    const empleadosActivos = MOCK_EMPLEADOS.filter(e => e.estado === 'activo').length;
    const resumen = {
      totalEmpleados: MOCK_EMPLEADOS.length,
      totalActivos: empleadosActivos,
      totalInactivos: MOCK_EMPLEADOS.length - empleadosActivos,
      nominaTotal: MOCK_EMPLEADOS.reduce((sum, e) => sum + (e.salarioMensual / 2), 0), // Dividido por 2 por quincena
      pagosPendientes: pagosFiltrados.filter(p => p.estado === 'pendiente').length,
    };

    res.status(200).json({
      total: pagosFiltrados.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      items: paginatedItems,
      resumen
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener pagos de un empleado específico
 */
const getPagosEmpleado = async (req, res, next) => {
  try {
    const { empleadoId } = req.params;
    let { mes, año } = req.query;
    const userRol = req.user.rol;
    const userId = req.user.id;

    // Verificar que el empleado existe
    const empleado = MOCK_EMPLEADOS.find(e => e.id === empleadoId);
    if (!empleado) {
      throw ErrorFactory.notFound('Empleado');
    }

    // Verificar permisos
    if (userRol === 'docente' && empleado.usuarioId !== userId && empleado.id !== userId) {
      throw ErrorFactory.forbidden('No puede consultar pagos de otro empleado');
    }

    let pagosFiltrados = MOCK_PAGOS.filter(p => p.empleadoId === empleadoId);

    if (mes) {
      pagosFiltrados = pagosFiltrados.filter(p => p.mes === parseInt(mes));
    }
    if (año) {
      pagosFiltrados = pagosFiltrados.filter(p => p.año === parseInt(año));
    }

    res.status(200).json(pagosFiltrados);
  } catch (error) {
    next(error);
  }
};

/**
 * Registrar un pago de nómina
 */
const registrarPago = async (req, res, next) => {
  try {
    const { empleadoId, mes, año, quincena, referencia } = req.body;
    const userRol = req.user.rol;

    // Solo admin puede registrar pagos
    if (userRol !== 'admin') {
      throw ErrorFactory.forbidden('Solo administradores pueden registrar pagos');
    }

    // Validaciones
    if (!empleadoId || !mes || !año || !quincena) {
      const detalles = [];
      if (!empleadoId) detalles.push({ campo: 'empleadoId', error: 'Campo requerido' });
      if (!mes) detalles.push({ campo: 'mes', error: 'Campo requerido' });
      if (!año) detalles.push({ campo: 'año', error: 'Campo requerido' });
      if (!quincena) detalles.push({ campo: 'quincena', error: 'Campo requerido' });
      throw ErrorFactory.badRequest('Datos incompletos', detalles);
    }

    // Buscar empleado
    const empleado = MOCK_EMPLEADOS.find(e => e.id === empleadoId);
    if (!empleado) {
      throw ErrorFactory.notFound('Empleado');
    }

    // Buscar o crear pago
    const pagoExistente = MOCK_PAGOS.find(
      p => p.empleadoId === empleadoId && p.mes === mes && p.año === año && p.quincena === quincena
    );

    if (!pagoExistente) {
      throw ErrorFactory.notFound('Pago no encontrado. Debe existir un registro de pago para registrarlo.');
    }

    // Actualizar pago
    pagoExistente.estado = 'pagado';
    pagoExistente.fechaPago = new Date().toISOString();
    pagoExistente.referencia = referencia || `TRF${Date.now()}`;

    res.status(200).json({
      mensaje: 'Pago registrado exitosamente',
      pago: pagoExistente
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar estado de un pago
 */
const actualizarEstadoPago = async (req, res, next) => {
  try {
    const { pagoId } = req.params;
    const { estado, referencia } = req.body;
    const userRol = req.user.rol;

    // Solo admin puede actualizar pagos
    if (userRol !== 'admin') {
      throw ErrorFactory.forbidden('Solo administradores pueden actualizar pagos');
    }

    // Validaciones
    if (!estado) {
      throw ErrorFactory.badRequest('El estado es requerido', [
        { campo: 'estado', error: 'Campo requerido' }
      ]);
    }

    // Validar estado válido
    const estadosValidos = ['pagado', 'pendiente', 'atrasado'];
    if (!estadosValidos.includes(estado)) {
      throw ErrorFactory.badRequest('Estado inválido', [
        { campo: 'estado', error: `Debe ser uno de: ${estadosValidos.join(', ')}` }
      ]);
    }

    // Buscar pago
    const pago = MOCK_PAGOS.find(p => p.id === pagoId);
    if (!pago) {
      throw ErrorFactory.notFound('Pago');
    }

    // Actualizar pago
    pago.estado = estado;
    if (estado === 'pagado') {
      pago.fechaPago = new Date().toISOString();
      pago.referencia = referencia || `TRF${Date.now()}`;
    } else {
      pago.fechaPago = null;
      pago.referencia = null;
    }

    res.status(200).json({
      mensaje: 'Pago actualizado exitosamente',
      pago: pago
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener resumen de nómina
 */
const getResumen = async (req, res, next) => {
  try {
    let { mes, año } = req.query;

    let empleados = MOCK_EMPLEADOS;
    let pagos = MOCK_PAGOS;

    if (mes) {
      pagos = pagos.filter(p => p.mes === parseInt(mes));
    }
    if (año) {
      pagos = pagos.filter(p => p.año === parseInt(año));
    }

    const empleadosActivos = empleados.filter(e => e.estado === 'activo').length;
    const nominaTotal = empleados.reduce((sum, e) => sum + (e.salarioMensual / 2), 0); // Dividido por 2 por quincena

    const resumen = {
      totalEmpleados: empleados.length,
      totalActivos: empleadosActivos,
      totalInactivos: empleados.length - empleadosActivos,
      nominaTotal,
      pagosPendientes: pagos.filter(p => p.estado === 'pendiente').length,
    };

    res.status(200).json(resumen);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmpleados,
  getEmpleadoById,
  getPagos,
  getPagosEmpleado,
  registrarPago,
  actualizarEstadoPago,
  getResumen
};
