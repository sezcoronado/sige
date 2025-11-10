// src/pages/TiendaPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import carteraService, { Cartera } from '../api/services/cartera.service';
import transaccionesService, { Producto, ItemTransaccion } from '../api/services/transacciones.service';
import authService from '../api/services/auth.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface CarritoItem extends ItemTransaccion {
  producto: Producto;
}

const TiendaPage: React.FC = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [cartera, setCartera] = useState<Cartera | null>(null);
  const [nombreAlumno, setNombreAlumno] = useState<string>('');
  const [restricciones, setRestricciones] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [comprando, setComprando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const usuario = authService.getUsuarioLocal();
    if (!usuario) {
      navigate('/login');
      return;
    }
    cargarDatos();
  }, [navigate]);

  const cargarDatos = async () => {
    try {
      const usuario = authService.getUsuarioLocal();
      setLoading(true);
      setError(null);

      // Cargar productos
      const productosData = await transaccionesService.getProductos(undefined, true);
      setProductos(productosData.items);

      // Cargar restricciones
      const alumnoId = usuario?.rol === 'alumno' ? usuario.id : 'stdnt_alumno01';
      const restriccionesData = await transaccionesService.getRestricciones(alumnoId);
      const idsRestringidos = restriccionesData.items.map(r => r.productoId);

      // Cargar saldo de cartera
      const carteraData = await carteraService.getSaldo(alumnoId);
      setCartera(carteraData);

      // Si el usuario es padre, obtener el nombre del alumno
      if (usuario?.rol === 'padres') {
        const infoAlumno = await authService.getUserById(alumnoId);
        setNombreAlumno(infoAlumno.nombre.split(' ')[0]);
      }
      setRestricciones(idsRestringidos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = (producto: Producto) => {
    // Verificar si está restringido
    if (restricciones.includes(producto.id)) {
      setError(`El producto "${producto.nombre}" está restringido`);
      return;
    }

    setError(null);
    const itemExistente = carrito.find(item => item.productoId === producto.id);

    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.productoId === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { productoId: producto.id, cantidad: 1, producto }]);
    }
  };

  const actualizarCantidad = (productoId: string, nuevaCantidad: number) => {
    if (nuevaCantidad === 0) {
      setCarrito(carrito.filter(item => item.productoId !== productoId));
    } else {
      setCarrito(carrito.map(item =>
        item.productoId === productoId
          ? { ...item, cantidad: nuevaCantidad }
          : item
      ));
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
  };

  const realizarCompra = async () => {
    if (carrito.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    setComprando(true);
    setError(null);
    setSuccess(null);

    try {
      const usuario = authService.getUsuarioLocal();
      const alumnoId = usuario?.rol === 'alumno' ? usuario.id : 'stdnt_alumno01';
      const items = carrito.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
      }));

      const response = await transaccionesService.crearTransaccion({
        alumnoId,
        items,
      });

      setSuccess(`Compra realizada exitosamente. Total: $${response.transaccion.total.toFixed(2)}`);
      setCarrito([]);
      
      // Recargar productos para actualizar stock
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setComprando(false);
    }
  };

  const handleToggleRestriccion = async (productoId: string, restringir: boolean) => {
    const usuario = authService.getUsuarioLocal();
    if (usuario?.rol !== 'padres') return;

    // Actualización optimista de la UI
    const nuevasRestricciones = restringir
      ? [...restricciones, productoId]
      : restricciones.filter(id => id !== productoId);
    setRestricciones(nuevasRestricciones);

    try {
      const alumnoId = 'stdnt_alumno01'; // En una app real, se obtendría el hijo asociado al padre
      await transaccionesService.updateRestricciones({
        alumnoId,
        productoId,
        restringir,
      });
    } catch (err: any) {
      setError(err.message);
      // Revertir en caso de error
      setRestricciones(restricciones);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando productos..." />
      </div>
    );
  }

  const usuario = authService.getUsuarioLocal();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Tienda Escolar</h1>
            <div className="flex items-center gap-4">
              {usuario?.rol === 'alumno' && (
              <div className="relative">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {carrito.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {carrito.reduce((sum, item) => sum + item.cantidad, 0)}
                  </span>
                )}
              </div>
              )}
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Volver
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Productos */}
          <div className="lg:col-span-2">
            {/* Alertas */}
            {error && (
              <div className="mb-4">
                <Alert type="error" message={error} onClose={() => setError(null)} />
              </div>
            )}
            {success && (
              <div className="mb-4">
                <Alert type="success" message={success} onClose={() => setSuccess(null)} />
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Productos Disponibles</h2>
              {usuario?.rol === 'padres' && (
                <p className="text-sm text-gray-600">
                  Gestiona las restricciones para {nombreAlumno}.
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {productos.map(producto => {
                const esRestringido = restricciones.includes(producto.id);
                return (
                  <Card key={producto.id} padding={false}>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{producto.nombre}</h3>
                        <span className="text-lg font-bold text-green-600">
                          ${producto.precio.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{producto.descripcion}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {producto.categoria}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            Stock: {producto.stock}
                          </span>
                        </div>
                        {usuario?.rol === 'alumno' && (
                          esRestringido ? (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              🚫 Restringido
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => agregarAlCarrito(producto)}
                              disabled={producto.stock === 0}
                            >
                              Agregar
                            </Button>
                          )
                        )}
                        {usuario?.rol === 'padres' && (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${esRestringido ? 'text-red-600' : 'text-gray-500'}`}>
                              {esRestringido ? 'Restringido' : 'Permitido'}
                            </span>
                            <button
                              onClick={() => handleToggleRestriccion(producto.id, !esRestringido)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                esRestringido ? 'bg-red-500' : 'bg-gray-300'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${esRestringido ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Carrito */}
          <div className="lg:col-span-1">
            <Card title="Carrito de Compras" className="sticky top-24">
              {cartera !== null && (
                <div className="flex justify-between items-center text-sm mb-4 pb-4 border-b border-gray-200 text-gray-600">
                  <span>Saldo disponible:</span>
                  <span className="font-medium">${cartera.saldo.toFixed(2)}</span>
                </div>
              )}

              {carrito.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p>El carrito está vacío</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {carrito.map(item => (
                      <div key={item.productoId} className="flex items-center justify-between py-2 border-b">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.producto.nombre}</p>
                          <p className="text-xs text-gray-600">${item.producto.precio.toFixed(2)} c/u</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                            className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{item.cantidad}</span>
                          <button
                            onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                            className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">${calcularTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {authService.getUsuarioLocal()?.rol === 'alumno' ? (
                    <Button
                      variant="success"
                      fullWidth
                      loading={comprando}
                      onClick={realizarCompra}
                    >
                      {comprando ? 'Procesando...' : 'Finalizar Compra'}
                    </Button>
                  ) : (
                    <div className="text-center text-sm text-gray-500 p-3 bg-gray-100 rounded-lg">
                      <p>Solo los alumnos pueden finalizar compras.</p>
                    </div>
                  )}

                </>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TiendaPage;
