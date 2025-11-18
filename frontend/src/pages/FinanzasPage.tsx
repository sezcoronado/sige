// src/pages/FinanzasPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import finanzasService, { Cuota, Pago } from '../api/services/finanzas.service';
import authService from '../api/services/auth.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FinanzasPage: React.FC = () => {
  const navigate = useNavigate();
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<Cuota | null>(null);
  const [metodoPago, setMetodoPago] = useState('transferencia');
  const [referencia, setReferencia] = useState('');
  const [archivoComprobante, setArchivoComprobante] = useState<File | null>(null);
  const [expandedCuota, setExpandedCuota] = useState<string | null>(null);

  useEffect(() => {
    const usuario = authService.getUsuarioLocal();
    if (!usuario) {
      navigate('/login');
      return;
    }

    // Solo permitir acceso a padres
    if (usuario.rol !== 'padres') {
      setError('Solo los padres de familia pueden acceder a esta sección');
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }

    cargarDatos();
  }, [navigate, filtroEstado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const usuario = authService.getUsuarioLocal();
      const alumnoId = usuario?.rol === 'alumno' ? usuario.id : usuario?.alumnoAsociado;

      if (!alumnoId) throw new Error('No se pudo identificar al alumno');

      const [cuotasData, pagosData] = await Promise.all([
        finanzasService.getCuotas(alumnoId, filtroEstado || undefined),
        finanzasService.getHistorialPagos(alumnoId),
      ]);

      setCuotas(cuotasData.items);
      setResumen(cuotasData.resumen);
      setPagos(pagosData.items);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePagarCuota = async (cuota: Cuota) => {
    if (!metodoPago) {
      setError('Por favor seleccione un método de pago');
      return;
    }

    setProcesando(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await finanzasService.pagarCuota({
        cuotaId: cuota.id,
        metodoPago,
        referencia: referencia || undefined,
      });

      setSuccess(`Pago de $${response.cuota.monto.toFixed(2)} registrado exitosamente`);
      setCuotaSeleccionada(null);
      setMetodoPago('transferencia');
      setReferencia('');
      setArchivoComprobante(null);
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const handleUploadComprobante = async (pago: Pago) => {
    if (!archivoComprobante) {
      setError('Por favor seleccione un archivo');
      return;
    }

    setProcesando(true);
    setError(null);

    try {
      await finanzasService.subirComprobante(pago.id, archivoComprobante);
      setSuccess('Comprobante subido exitosamente');
      setArchivoComprobante(null);
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando información de finanzas..." />
      </div>
    );
  }

  const usuario = authService.getUsuarioLocal();
  const isPadre = usuario?.rol === 'padres';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Administración de Finanzas</h1>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Volver
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Resumen de Cuotas */}
        {resumen && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total de Cuotas</p>
                <p className="text-3xl font-bold text-gray-900">{resumen.total}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Pagadas</p>
                <p className="text-3xl font-bold text-green-600">{resumen.pagadas}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{resumen.pendientes}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Pendiente</p>
                <p className="text-2xl font-bold text-red-600">
                  ${resumen.montoPendiente.toFixed(2)} MXN
                </p>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cuotas */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cuotas Mensuales</h3>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Todas las cuotas</option>
                  <option value="pagada">Pagadas</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="vencida">Vencidas</option>
                </select>
              </div>

              {cuotas.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay cuotas disponibles</p>
              ) : (
                <div className="space-y-3">
                  {cuotas.map(cuota => (
                    <div key={cuota.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {cuota.mes} {cuota.año}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {cuota.estado === 'pagada'
                              ? `Pagado el ${new Date(cuota.fechaPago || '').toLocaleDateString()}`
                              : cuota.estado === 'vencida'
                              ? 'Vencida'
                              : 'Pendiente'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${cuota.monto.toFixed(2)}
                          </p>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              cuota.estado === 'pagada'
                                ? 'bg-green-100 text-green-800'
                                : cuota.estado === 'vencida'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {cuota.estado.charAt(0).toUpperCase() + cuota.estado.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Detalles expandibles */}
                      <button
                        onClick={() => setExpandedCuota(expandedCuota === cuota.id ? null : cuota.id)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {expandedCuota === cuota.id ? '▼' : '▶'} Ver detalles
                      </button>

                      {expandedCuota === cuota.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                          {cuota.estado !== 'pagada' && isPadre && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h5 className="font-semibold text-gray-900 mb-3">Registrar Pago</h5>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Método de Pago
                                  </label>
                                  <select
                                    value={metodoPago}
                                    onChange={(e) => setMetodoPago(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  >
                                    <option value="transferencia">Transferencia Bancaria</option>
                                    <option value="tarjeta">Tarjeta de Crédito</option>
                                    <option value="efectivo">Efectivo</option>
                                  </select>
                                </div>

                                {metodoPago === 'transferencia' && (
                                  <input
                                    type="text"
                                    placeholder="Referencia/Folio de transferencia"
                                    value={referencia}
                                    onChange={(e) => setReferencia(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  />
                                )}

                                <Button
                                  variant="success"
                                  fullWidth
                                  loading={procesando}
                                  onClick={() => handlePagarCuota(cuota)}
                                >
                                  {procesando ? 'Procesando...' : `Pagar $${cuota.monto.toFixed(2)}`}
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <strong>Moneda:</strong> {cuota.moneda}
                            </p>
                            {cuota.fechaVencimiento && (
                              <p className="text-sm text-gray-600">
                                <strong>Vencimiento:</strong> {new Date(cuota.fechaVencimiento).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Historial de Pagos */}
          <div className="lg:col-span-1">
            <Card title="Historial de Pagos">
              {pagos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Sin pagos registrados</p>
              ) : (
                <div className="space-y-3">
                  {pagos.map(pago => (
                    <div key={pago.id} className="border-l-4 border-green-500 pl-3 pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-sm text-gray-900">
                          ${pago.monto.toFixed(2)}
                        </p>
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          Confirmado
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {pago.metodoPago === 'transferencia' ? '🏦 Transferencia' : '💳 Tarjeta'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(pago.createdAt).toLocaleDateString()}
                      </p>
                      {pago.referencia && (
                        <p className="text-xs text-gray-500 mt-1">
                          Ref: {pago.referencia}
                        </p>
                      )}

                      {!pago.comprobante && isPadre && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <label className="block text-xs text-gray-600 mb-2">
                            Subir comprobante:
                          </label>
                          <div className="flex gap-1">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => setArchivoComprobante(e.target.files?.[0] || null)}
                              className="text-xs flex-1"
                            />
                            <Button
                              variant="primary"
                              size="sm"
                              loading={procesando}
                              onClick={() => handleUploadComprobante(pago)}
                              className="whitespace-nowrap"
                            >
                              Subir
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Información Importante */}
        <Card className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Importante</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Cuotas Académicas</h4>
              <p className="text-sm text-gray-600">
                Las cuotas mensuales deben ser pagadas antes de la fecha de vencimiento.
                Si la cuota no se paga a tiempo, pasará al estado de vencida.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Métodos de Pago</h4>
              <p className="text-sm text-gray-600">
                Puede pagar mediante transferencia bancaria, tarjeta de crédito o en efectivo
                en la secretaría de la institución.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Comprobantes</h4>
              <p className="text-sm text-gray-600">
                Por favor suba el comprobante de pago después de realizar la transferencia
                para acelerar la confirmación.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default FinanzasPage;
