// src/controllers/transacciones.controller.js
const { ErrorFactory } = require('../utils/errors.util');

// Mock de productos
const MOCK_PRODUCTOS = [
  {
    id: 'prd_001',
    nombre: 'Sándwich de jamón',
    descripcion: 'Sándwich con pan integral, jamón de pavo y vegetales',
    categoria: 'Alimentos',
    precio: 35.00,
    stock: 20,
    disponible: true,
    alergenos: ['gluten', 'huevo']
  },
  {
    id: 'prd_002',
    nombre: 'Jugo de naranja',
    descripcion: 'Jugo natural 100%',
    categoria: 'Bebidas',
    precio: 25.00,
    stock: 30,
    disponible: true,
    alergenos: []
  },
  {
    id: 'prd_003',
    nombre: 'Galletas con chocolate',
    descripcion: 'Paquete de galletas',
    categoria: 'Snacks',
    precio: 15.00,
    stock: 50,
    disponible: true,
    alergenos: ['gluten', 'lactosa']
  },
  {
    id: 'prd_004',
    nombre: 'Refresco de cola',
    descripcion: 'Bebida gaseosa 355ml',
    categoria: 'Bebidas',
    precio: 18.00,
    stock: 40,
    disponible: true,
    alergenos: []
  }
];

// Mock de restricciones
let MOCK_RESTRICCIONES = [
  {
    id: 'res_001',
    alumnoId: 'usr_alumno01',
    productoId: 'prd_004',
    motivo: 'Decisión familiar - Sin refrescos azucarados',
    tipoRestriccion: 'familiar'
  }
];

// Mock de transacciones
let MOCK_TRANSACCIONES = [];

// Importar carteras del otro controlador (en producción usar BD)
const MOCK_CARTERAS = [
  {
    id: 'wlt_22001',
    alumnoId: 'usr_alumno01',
    saldo: 250.75,
    moneda: 'MXN'
  }
];

/**
 * Listar productos disponibles
 */
const getProductos = async (req, res, next) => {
  try {
    const { categoria, disponible, search } = req.query;

    let productos = [...MOCK_PRODUCTOS];

    // Filtrar por categoría
    if (categoria) {
      productos = productos.filter(p => p.categoria === categoria);
    }

    // Filtrar por disponibilidad
    if (disponible !== undefined) {
      const isDisponible = disponible === 'true';
      productos = productos.filter(p => p.disponible === isDisponible && p.stock > 0);
    }

    // Buscar por nombre
    if (search) {
      productos = productos.filter(p => 
        p.nombre.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.status(200).json({
      total: productos.length,
      items: productos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener restricciones de un alumno
 */
const getRestricciones = async (req, res, next) => {
  try {
    const { alumnoId } = req.query;
    const userRol = req.user.rol;
    const userId = req.user.id;

    if (!alumnoId) {
      throw ErrorFactory.badRequest('El parámetro alumnoId es requerido');
    }

    // Verificar permisos
    if (userRol === 'alumno' && alumnoId !== userId) {
      throw ErrorFactory.forbidden('No puede consultar restricciones de otro alumno');
    }

    const restricciones = MOCK_RESTRICCIONES.filter(r => r.alumnoId === alumnoId);

    // Enriquecer con información del producto
    const restriccionesConProducto = restricciones.map(r => {
      const producto = MOCK_PRODUCTOS.find(p => p.id === r.productoId);
      return {
        ...r,
        producto: producto || null
      };
    });

    res.status(200).json({
      total: restriccionesConProducto.length,
      items: restriccionesConProducto
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear transacción de compra
 */
const crearTransaccion = async (req, res, next) => {
  try {
    const { alumnoId, items } = req.body;

    // Validaciones
    if (!alumnoId || !items || !Array.isArray(items) || items.length === 0) {
      const detalles = [];
      if (!alumnoId) detalles.push({ campo: 'alumnoId', error: 'Campo requerido' });
      if (!items || !Array.isArray(items)) {
        detalles.push({ campo: 'items', error: 'Debe ser un array' });
      } else if (items.length === 0) {
        detalles.push({ campo: 'items', error: 'Debe contener al menos un producto' });
      }
      throw ErrorFactory.badRequest('Datos inválidos', detalles);
    }

    // Buscar cartera del alumno
    const cartera = MOCK_CARTERAS.find(c => c.alumnoId === alumnoId);
    if (!cartera) {
      throw ErrorFactory.notFound('Cartera del alumno');
    }

    // Obtener restricciones del alumno
    const restricciones = MOCK_RESTRICCIONES
      .filter(r => r.alumnoId === alumnoId)
      .map(r => r.productoId);

    // Procesar items y calcular total
    const itemsDetalle = [];
    let total = 0;

    for (const item of items) {
      const { productoId, cantidad } = item;

      if (!productoId || !cantidad || cantidad <= 0) {
        throw ErrorFactory.badRequest('Items inválidos', [
          { campo: 'items', error: 'Cada item debe tener productoId y cantidad > 0' }
        ]);
      }

      // Buscar producto
      const producto = MOCK_PRODUCTOS.find(p => p.id === productoId);
      if (!producto) {
        throw ErrorFactory.notFound(`Producto ${productoId}`);
      }

      // Verificar restricciones
      if (restricciones.includes(productoId)) {
        throw ErrorFactory.paymentRequired(
          `El producto "${producto.nombre}" está restringido para este alumno`
        );
      }

      // Verificar stock
      if (producto.stock < cantidad) {
        throw ErrorFactory.badRequest(`Stock insuficiente para ${producto.nombre}`);
      }

      // Calcular subtotal
      const subtotal = producto.precio * cantidad;
      total += subtotal;

      itemsDetalle.push({
        productoId: producto.id,
        nombreProducto: producto.nombre,
        cantidad: cantidad,
        precioUnitario: producto.precio,
        subtotal: subtotal
      });
    }

    // Verificar saldo suficiente
    if (cartera.saldo < total) {
      throw ErrorFactory.paymentRequired(
        `Saldo insuficiente. Disponible: $${cartera.saldo.toFixed(2)}, Requerido: $${total.toFixed(2)}`
      );
    }

    // Descontar del saldo
    cartera.saldo -= total;

    // Crear transacción
    const nuevaTransaccion = {
      id: `trx_${Date.now()}`,
      alumnoId: alumnoId,
      items: itemsDetalle,
      total: total,
      moneda: 'MXN',
      estado: 'exitoso',
      fechaTransaccion: new Date().toISOString()
    };

    MOCK_TRANSACCIONES.push(nuevaTransaccion);

    // Actualizar stock de productos
    for (const item of items) {
      const producto = MOCK_PRODUCTOS.find(p => p.id === item.productoId);
      if (producto) {
        producto.stock -= item.cantidad;
      }
    }

    res.status(201).json({
      mensaje: 'Compra realizada exitosamente',
      transaccion: nuevaTransaccion,
      saldoRestante: cartera.saldo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Listar transacciones de un alumno
 */
const getTransacciones = async (req, res, next) => {
  try {
    const { alumnoId, page = 1, pageSize = 20 } = req.query;
    const userRol = req.user.rol;
    const userId = req.user.id;

    if (!alumnoId) {
      throw ErrorFactory.badRequest('El parámetro alumnoId es requerido');
    }

    // Verificar permisos
    if (userRol === 'alumno' && alumnoId !== userId) {
      throw ErrorFactory.forbidden('No puede consultar transacciones de otro alumno');
    }

    const transacciones = MOCK_TRANSACCIONES
      .filter(t => t.alumnoId === alumnoId)
      .sort((a, b) => new Date(b.fechaTransaccion) - new Date(a.fechaTransaccion));

    // Paginación
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
  getProductos,
  getRestricciones,
  crearTransaccion,
  getTransacciones
};
