// src/controllers/transacciones.controller.js
const { ErrorFactory } = require('../utils/errors.util');

// Mock de productos (ampliado)
let MOCK_PRODUCTOS = [
  { id: 'prd_001', nombre: 'Sándwich de jamón', descripcion: 'Sándwich con pan integral, jamón de pavo y vegetales', categoria: 'Alimentos', precio: 35.00, stock: 20, disponible: true, alergenos: ['gluten', 'huevo'] },
  { id: 'prd_002', nombre: 'Jugo de naranja', descripcion: 'Jugo natural 100%', categoria: 'Bebidas', precio: 25.00, stock: 30, disponible: true, alergenos: [] },
  { id: 'prd_003', nombre: 'Manzana', descripcion: 'Una manzana roja fresca', categoria: 'Frutas', precio: 12.00, stock: 200, disponible: true, alergenos: [] },
  { id: 'prd_004', nombre: 'Refresco de cola', descripcion: 'Lata de 355ml', categoria: 'Bebidas', precio: 18.00, stock: 80, disponible: true, alergenos: [] },
  { id: 'prd_005', nombre: 'Cuaderno profesional', descripcion: 'Cuaderno de 100 hojas a rayas', categoria: 'Útiles', precio: 45.00, stock: 30, disponible: true, alergenos: [] },
  { id: 'prd_006', nombre: 'Yogurt bebible', descripcion: 'Botella de 200ml sabor fresa', categoria: 'Lácteos', precio: 15.50, stock: 60, disponible: true, alergenos: ['lactosa'] },
  { id: 'prd_007', nombre: 'Galletas integrales', descripcion: 'Paquete individual con 6 galletas', categoria: 'Snacks', precio: 10.00, stock: 120, disponible: true, alergenos: ['gluten'] },
  { id: 'prd_008', nombre: 'Caja de 12 lápices de colores', descripcion: 'Caja de lápices de madera', categoria: 'Útiles', precio: 65.00, stock: 25, disponible: true, alergenos: [] },
  { id: 'prd_009', nombre: 'Desayuno Escolar (Combo)', descripcion: 'Incluye leche con chocolate, fruta de temporada y una barra de cereal.', categoria: 'Combos', precio: 45.00, stock: 50, disponible: true, alergenos: ['lactosa', 'gluten'] },
  { id: 'prd_010', nombre: 'Comida Escolar (Combo)', descripcion: 'Incluye sopa de pasta, plato fuerte del día y agua de sabor.', categoria: 'Combos', precio: 65.00, stock: 40, disponible: true, alergenos: ['gluten'] },
  { id: 'prd_011', nombre: 'Agua embotellada 600ml', descripcion: 'Agua purificada sin gas', categoria: 'Bebidas', precio: 10.00, stock: 150, disponible: true, alergenos: [] },
  { id: 'prd_012', nombre: 'Leche con chocolate 250ml', descripcion: 'Leche semidescremada sabor chocolate', categoria: 'Bebidas', precio: 14.00, stock: 70, disponible: true, alergenos: ['lactosa'] },
  { id: 'prd_013', nombre: 'Barra de granola', descripcion: 'Barra de avena con miel y pasas', categoria: 'Snacks', precio: 13.00, stock: 90, disponible: true, alergenos: ['gluten', 'nueces'] },
  { id: 'prd_014', nombre: 'Papas fritas (bolsa pequeña)', descripcion: 'Papas fritas con sal', categoria: 'Snacks', precio: 15.00, stock: 100, disponible: true, alergenos: [] },
  { id: 'prd_015', nombre: 'Pluma de tinta negra', descripcion: 'Pluma de punto mediano', categoria: 'Útiles', precio: 8.00, stock: 200, disponible: true, alergenos: [] },
  { id: 'prd_016', nombre: 'Goma de borrar', descripcion: 'Goma de migajón que no mancha', categoria: 'Útiles', precio: 5.00, stock: 150, disponible: true, alergenos: [] },
  { id: 'prd_017', nombre: 'Sacapuntas', descripcion: 'Sacapuntas de metal con depósito', categoria: 'Útiles', precio: 12.00, stock: 80, disponible: true, alergenos: [] },
  { id: 'prd_018', nombre: 'Regla de 30cm', descripcion: 'Regla de plástico transparente', categoria: 'Útiles', precio: 10.00, stock: 100, disponible: true, alergenos: [] },
  { id: 'prd_019', nombre: 'Tijeras de punta redonda', descripcion: 'Tijeras seguras para uso escolar', categoria: 'Útiles', precio: 25.00, stock: 60, disponible: true, alergenos: [] },
  { id: 'prd_020', nombre: 'Pegamento en barra', descripcion: 'Pegamento no tóxico de 20g', categoria: 'Útiles', precio: 18.00, stock: 90, disponible: true, alergenos: [] },
  { id: 'prd_021', nombre: 'Paquete de 100 hojas blancas', descripcion: 'Hojas de papel bond tamaño carta', categoria: 'Útiles', precio: 70.00, stock: 40, disponible: true, alergenos: [] },
  { id: 'prd_022', nombre: 'Gelatina de fresa', descripcion: 'Vaso individual de gelatina', categoria: 'Postres', precio: 12.00, stock: 80, disponible: true, alergenos: [] },
  { id: 'prd_023', nombre: 'Palomitas de maíz', descripcion: 'Bolsa de palomitas naturales', categoria: 'Snacks', precio: 15.00, stock: 70, disponible: true, alergenos: [] },
  { id: 'prd_024', nombre: 'Flauta de jamón y queso', descripcion: 'Flauta horneada rellena de jamón y queso', categoria: 'Alimentos', precio: 28.00, stock: 30, disponible: true, alergenos: ['gluten', 'lactosa'] },
  { id: 'prd_025', nombre: 'Plátano', descripcion: 'Una pieza de plátano fresco', categoria: 'Frutas', precio: 8.00, stock: 150, disponible: true, alergenos: [] },
];

// Mock de restricciones
let MOCK_RESTRICCIONES = [
  {
    id: 'res_001',
    alumnoId: 'stdnt_alumno01',
    productoId: 'prd_004',
    motivo: 'Decisión familiar - Sin refrescos azucarados',
    tipoRestriccion: 'familiar'
  }
];

// Mock de transacciones
let MOCK_TRANSACCIONES = [];

/**
 * @description Listar productos disponibles
 * @route GET /api/v1/transacciones/productos
 * @access Private
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

// Importar mocks desde el controlador de cartera para asegurar que se modifica la misma data en memoria
const { MOCK_CARTERAS, MOCK_TRANSACCIONES_CARTERA } = require('./cartera.controller');

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
 * @description Actualizar las restricciones de un alumno
 * @route PUT /api/v1/transacciones/restricciones
 * @access Padre
 */
const actualizarRestricciones = (req, res, next) => {
  try {
    const { alumnoId, productoId, restringir } = req.body;

    if (!alumnoId || !productoId || typeof restringir !== 'boolean') {
      throw ErrorFactory.badRequest('Faltan parámetros: alumnoId, productoId, restringir (boolean)');
    }

    // Eliminar cualquier restricción existente para este producto y alumno
    MOCK_RESTRICCIONES = MOCK_RESTRICCIONES.filter(
      r => !(r.alumnoId === alumnoId && r.productoId === productoId)
    );

    // Si se debe restringir, agregar la nueva restricción
    if (restringir) {
      MOCK_RESTRICCIONES.push({
        id: `res_${Date.now()}`,
        alumnoId,
        productoId,
      });
    }

    res.status(200).json({ mensaje: 'Restricciones actualizadas correctamente' });
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
    // Usamos la cartera importada para que los cambios persistan
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

    const saldoAnterior = cartera.saldo;

    // Descontar del saldo
    cartera.saldo -= total;
    cartera.ultimaActualizacion = new Date().toISOString();

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

    // Registrar la transacción en el historial de la cartera
    const transaccionCartera = {
      id: `txn_${Date.now()}`,
      carteraId: cartera.id,
      tipo: 'compra',
      monto: -total,
      saldoAnterior: saldoAnterior,
      saldoNuevo: cartera.saldo,
      descripcion: `Compra de ${itemsDetalle.length} producto(s)`,
      fecha: new Date().toISOString(),
      referenciaId: nuevaTransaccion.id, // ID de la transacción de compra
      items: itemsDetalle, // Desglose de la compra
    };
    MOCK_TRANSACCIONES_CARTERA.push(transaccionCartera);

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
  getTransacciones,
  actualizarRestricciones,
  // No exportamos los mocks para mantener el encapsulamiento
};
