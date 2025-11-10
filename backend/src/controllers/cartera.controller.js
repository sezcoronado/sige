// src/controllers/cartera.controller.js
const { ErrorFactory } = require('../utils/errors.util');

// Simulación de base de datos
let MOCK_CARTERAS = [
  {
    id: 'wlt_22001',
    alumnoId: 'usr_alumno01',
    saldo: 250.75,
    moneda: 'MXN',
    limiteGastoSemanal: 500.00,
    ultimaActualizacion: new Date().toISOString()
  }
];

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
  }
];

/**
 * Consultar saldo de cartera
 */
const getSaldo = async (req, res, next) => {
  try {
    const { alumnoId } = req.query;
    const userRol = req.user.rol;
    const userId = req.user.id;

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
    const { alumnoId, page = 1, pageSize = 20 } = req.query;
    const userRol = req.user.rol;
    const userId = req.user.id;

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
  getHistorial
};
