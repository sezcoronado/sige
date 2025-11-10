// src/controllers/cartera.controller.js
const { ErrorFactory } = require('../utils/errors.util');

// Simulación de base de datos
let MOCK_CARTERAS = [
  // Cartera Alumno 1
  {
    id: 'wlt_22001',
    alumnoId: 'stdnt_alumno01',
    saldo: 250.75,
    moneda: 'MXN',
    limiteGastoSemanal: 500.00,
    ultimaActualizacion: new Date().toISOString()
  },
  // Cartera Alumno 2
  {
    id: 'wlt_22002',
    alumnoId: 'stdnt_alumno02',
    saldo: 150.00,
    moneda: 'MXN',
    limiteGastoSemanal: 300.00,
    ultimaActualizacion: new Date().toISOString()
  },
];

// Importar usuarios para buscar alumnos asociados
const { MOCK_USERS } = require('./auth.controller');

let MOCK_TRANSACCIONES_CARTERA = [
  {
    id: 'txn_001',
    carteraId: 'wlt_22001',
    tipo: 'deposito',
    monto: 300.00,
    saldoAnterior: 0,
    saldoNuevo: 300.00,
    descripcion: 'Depósito inicial',
    fecha: '2025-10-01T10:00:00Z'
  },
  {
    id: 'txn_002',
    carteraId: 'wlt_22001',
    tipo: 'compra',
    monto: -49.25,
    saldoAnterior: 300.00,
    saldoNuevo: 250.75,
    descripcion: 'Compra en tienda escolar',
    fecha: '2025-11-02T10:45:00Z'
  },
  // Transacciones nuevo alumno
  {
    id: 'txn_003',
    carteraId: 'wlt_22002',
    tipo: 'deposito',
    monto: 200.00,
    saldoAnterior: 0,
    saldoNuevo: 200.00,
    descripcion: 'Depósito inicial',
    fecha: '2025-10-05T11:00:00Z'
  },
  {
    id: 'txn_004',
    carteraId: 'wlt_22002',
    tipo: 'compra',
    monto: -50.00,
    saldoAnterior: 200.00,
    saldoNuevo: 150.00,
    descripcion: 'Compra de útiles escolares',
    fecha: '2025-11-03T12:00:00Z'
  },
];

/**
 * Consultar saldo de cartera
 */
const getSaldo = async (req, res, next) => {
  try {
    let { alumnoId } = req.query;
    const userRol = req.user.rol;
    const userId = req.user.id;

    // Si el rol es 'padres', forzar el alumnoId asociado para seguridad.
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

    // Si es alumno, solo puede ver su propia cartera
    if (userRol === 'alumno' && alumnoId !== userId) {
      throw ErrorFactory.forbidden('No puede consultar la cartera de otro alumno');
    }

    // Buscar cartera
    const cartera = MOCK_CARTERAS.find(c => c.alumnoId === alumnoId);

    if (!cartera) {
      throw ErrorFactory.notFound('Cartera');
    }

    res.status(200).json(cartera);
  } catch (error) {
    next(error);
  }
};

/**
 * Depositar saldo a cartera
 */
const depositar = async (req, res, next) => {
  try {
    const { alumnoId, monto, metodoPago } = req.body;

    // Validaciones
    if (!alumnoId || !monto || !metodoPago) {
      const detalles = [];
      if (!alumnoId) detalles.push({ campo: 'alumnoId', error: 'Campo requerido' });
      if (!monto) detalles.push({ campo: 'monto', error: 'Campo requerido' });
      if (!metodoPago) detalles.push({ campo: 'metodoPago', error: 'Campo requerido' });
      
      throw ErrorFactory.badRequest('Datos incompletos', detalles);
    }

    if (monto <= 0) {
      throw ErrorFactory.badRequest('El monto debe ser mayor a 0', [
        { campo: 'monto', error: 'Debe ser un número positivo' }
      ]);
    }

    if (!['tarjeta', 'transferencia'].includes(metodoPago)) {
      throw ErrorFactory.badRequest('Método de pago inválido', [
        { campo: 'metodoPago', error: 'Debe ser "tarjeta" o "transferencia"' }
      ]);
    }

    // Buscar cartera
    const cartera = MOCK_CARTERAS.find(c => c.alumnoId === alumnoId);

    if (!cartera) {
      throw ErrorFactory.notFound('Cartera del alumno');
    }

    // Simular procesamiento de pago
    // En producción: integrar con Stripe/Conekta/PayPal

    const saldoAnterior = cartera.saldo;
    const saldoNuevo = saldoAnterior + monto;

    // Actualizar saldo
    cartera.saldo = saldoNuevo;
    cartera.ultimaActualizacion = new Date().toISOString();

    // Registrar transacción
    const nuevaTransaccion = {
      id: `txn_${Date.now()}`,
      carteraId: cartera.id,
      tipo: 'deposito',
      monto: monto,
      saldoAnterior: saldoAnterior,
      saldoNuevo: saldoNuevo,
      descripcion: `Depósito por ${metodoPago}`,
      fecha: new Date().toISOString()
    };

    MOCK_TRANSACCIONES_CARTERA.push(nuevaTransaccion);

    res.status(200).json({
      mensaje: 'Depósito realizado exitosamente',
      cartera: cartera,
      transaccion: nuevaTransaccion
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener historial de movimientos
 */
const getHistorial = async (req, res, next) => {
  try {
    let { alumnoId, page = 1, pageSize = 20 } = req.query;
    const userRol = req.user.rol;
    const userId = req.user.id;

    // Si el rol es 'padres', forzar el alumnoId asociado para seguridad.
    if (userRol === 'padres') {
      const alumnoAsociado = MOCK_USERS.find(u => u.padresId === userId);
      if (alumnoAsociado) {
        alumnoId = alumnoAsociado.id;
      }
    }
    if (!alumnoId) {
      throw ErrorFactory.badRequest('El parámetro alumnoId es requerido');
    }

    // Verificar permisos
    if (userRol === 'alumno' && alumnoId !== userId) {
      throw ErrorFactory.forbidden('No puede consultar el historial de otro alumno');
    }

    // Buscar cartera
    const cartera = MOCK_CARTERAS.find(c => c.alumnoId === alumnoId);

    if (!cartera) {
      throw ErrorFactory.notFound('Cartera');
    }

    // Filtrar transacciones de esta cartera
    const transacciones = MOCK_TRANSACCIONES_CARTERA
      .filter(t => t.carteraId === cartera.id)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Paginación simple
    const start = (page - 1) * pageSize;
    const end = start + parseInt(pageSize);
    const paginatedItems = transacciones.slice(start, end);

    res.status(200).json({
      total: transacciones.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      items: paginatedItems
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSaldo,
  depositar,
  getHistorial,
  MOCK_CARTERAS, // Exportar para que otros controladores puedan modificarlo
  MOCK_TRANSACCIONES_CARTERA, // Exportar para que otros controladores puedan modificarlo
};
