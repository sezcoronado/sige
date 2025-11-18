// src/pages/NominaPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../api/services/auth.service';
import nominaService from '../api/services/nomina.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Empleado {
  id: string;
  nombre: string;
  rol: string;
  departamento: string;
  salarioMensual: number;
  moneda: string;
  estado: 'activo' | 'inactivo';
  fechaIngreso: string;
}

interface Pago {
  id: string;
  empleadoId: string;
  mes: number;
  año: number;
  quincena: 1 | 2; // 1 = primera quincena (1-15), 2 = segunda quincena (16-31)
  monto: number;
  estado: 'pagado' | 'pendiente' | 'atrasado';
  fechaPago: string | null;
  referencia: string | null;
}

interface ResumenNomina {
  totalEmpleados: number;
  totalActivos: number;
  totalInactivos: number;
  nominaTotal: number;
  pagosPendientes: number;
}

const NominaPage: React.FC = () => {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [resumen, setResumen] = useState<ResumenNomina | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState('activo');
  const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
  const [yearActual, setYearActual] = useState(new Date().getFullYear());
  const [expandedEmpleado, setExpandedEmpleado] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [usuarioRol, setUsuarioRol] = useState<string>('');

  useEffect(() => {
    const usuario = authService.getUsuarioLocal();
    if (!usuario) {
      navigate('/login');
      return;
    }

    // Solo permitir acceso a docentes y admin
    if (usuario.rol !== 'docente' && usuario.rol !== 'admin') {
      setError('Solo docentes y administradores pueden acceder a esta sección');
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }

    setUsuarioRol(usuario.rol);
    cargarDatos();
  }, [navigate, filtroEstado, mesActual, yearActual, usuarioRol]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const usuario = authService.getUsuarioLocal();
      if (!usuario) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener empleados
      const empleadosResponse = await nominaService.getEmpleados(
        usuario.rol === 'admin' ? filtroEstado : undefined
      );
      setEmpleados(empleadosResponse.items);

      // Obtener pagos
      const pagosResponse = await nominaService.getPagos(
        mesActual,
        yearActual,
        undefined
      );
      setPagos(pagosResponse.items);

      // Usar el resumen del servidor
      setResumen(pagosResponse.resumen);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos de nómina');
    } finally {
      setLoading(false);
    }
  };

  const handlePagarNomina = async (empleadoId: string) => {
    setProcesando(true);
    setError(null);
    setSuccess(null);

    try {
      // Simular pago
      setTimeout(() => {
        const pagoIndex = pagos.findIndex(p => p.empleadoId === empleadoId);
        if (pagoIndex !== -1) {
          const pagoActualizado = [...pagos];
          pagoActualizado[pagoIndex].estado = 'pagado';
          pagoActualizado[pagoIndex].fechaPago = new Date().toISOString();
          pagoActualizado[pagoIndex].referencia = `TRF${Date.now()}`;
          setPagos(pagoActualizado);
          setSuccess(`Nómina de ${empleadoId} pagada exitosamente`);
        }
        setProcesando(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando nómina..." />
      </div>
    );
  }

  const usuario = authService.getUsuarioLocal();
  const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Nómina de Empleados</h1>
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

        {/* Resumen */}
        {resumen && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Empleados</p>
                <p className="text-3xl font-bold text-gray-900">{resumen.totalEmpleados}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Activos</p>
                <p className="text-3xl font-bold text-green-600">{resumen.totalActivos}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Inactivos</p>
                <p className="text-3xl font-bold text-gray-600">{resumen.totalInactivos}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Nómina Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${resumen.nominaTotal.toLocaleString('es-MX')} MXN
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Pagos Pendientes</p>
                <p className="text-3xl font-bold text-red-600">{resumen.pagosPendientes}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Controles */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
                <select
                  value={mesActual}
                  onChange={(e) => setMesActual(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {meses.map((mes, idx) => idx > 0 && <option key={idx} value={idx}>{mes}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                <select
                  value={yearActual}
                  onChange={(e) => setYearActual(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
            </div>
            {usuario?.rol === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="todos">Todos</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            )}
          </div>
        </Card>

        {/* Listado de Empleados */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {usuario?.rol === 'admin' ? 'Nómina General' : 'Mi Nómina'} - {meses[mesActual]} {yearActual}
          </h3>

          {empleados.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay empleados con este filtro</p>
          ) : (
            <div className="space-y-3">
              {empleados.map(empleado => {
                const pago = pagos.find(p => p.empleadoId === empleado.id);
                const estaExpandido = expandedEmpleado === empleado.id;

                return (
                  <div key={empleado.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{empleado.nombre}</h4>
                        <p className="text-sm text-gray-600">{empleado.rol}</p>
                        <p className="text-xs text-gray-500">{empleado.departamento}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ${empleado.salarioMensual.toLocaleString('es-MX')}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          pago?.estado === 'pagado'
                            ? 'bg-green-100 text-green-800'
                            : pago?.estado === 'atrasado'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {pago?.estado === 'pagado' ? '✓ Pagado' : pago?.estado === 'atrasado' ? '⚠ Atrasado' : '⏳ Pendiente'}
                        </span>
                      </div>
                    </div>

                    {/* Detalles expandibles */}
                    <button
                      onClick={() => setExpandedEmpleado(estaExpandido ? null : empleado.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {estaExpandido ? '▼' : '▶'} Detalles de pago
                    </button>

                    {estaExpandido && pago && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Quincena</p>
                            <p className="font-medium">
                              {pago.quincena === 1 ? '1ª (1-15)' : '2ª (16-31)'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Referencia</p>
                            <p className="font-medium">{pago.referencia || '-'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Fecha de Pago</p>
                            <p className="font-medium">
                              {pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString('es-MX') : '-'}
                            </p>
                          </div>
                        </div>

                        {pago.estado !== 'pagado' && usuario?.rol === 'admin' && (
                          <Button
                            variant="success"
                            fullWidth
                            loading={procesando}
                            onClick={() => handlePagarNomina(empleado.id)}
                          >
                            {procesando ? 'Procesando...' : `Registrar Pago Quincena ${pago.quincena}`}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Información */}
        <Card className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Nómina</h3>
          <div className="space-y-4">
            {usuario?.rol === 'admin' ? (
              <>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Acceso Administrativo</h4>
                  <p className="text-sm text-gray-600">
                    Como administrador, tienes acceso a toda la nómina de empleados. Puedes registrar pagos y ver el estado de todas las quincenas.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Sistema de Pagos Quincenales</h4>
                  <p className="text-sm text-gray-600">
                    Los empleados reciben su pago en dos quincenas: Primera quincena (1-15) y Segunda quincena (16-31). Cada quincena es el 50% del salario mensual.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Estados de Pago</h4>
                  <p className="text-sm text-gray-600">
                    • <strong>Pagado:</strong> La quincena ya fue procesada<br/>
                    • <strong>Pendiente:</strong> Esperando procesamiento<br/>
                    • <strong>Atrasado:</strong> Pago vencido sin procesar
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tu Nómina</h4>
                  <p className="text-sm text-gray-600">
                    En esta sección puedes ver el estado de tus pagos quincenales. Aquí aparecerá información sobre los pagos realizados y pendientes.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Pagos Quincenales</h4>
                  <p className="text-sm text-gray-600">
                    Tu salario se divide en dos quincenas mensuales. Primera quincena: del 1 al 15, Segunda quincena: del 16 al 31. Cada una representa el 50% de tu salario mensual.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">¿Preguntas?</h4>
                  <p className="text-sm text-gray-600">
                    Contacta con la oficina administrativa para cualquier duda sobre tus pagos o deducciones.
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default NominaPage;
