// src/pages/CarteraPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import carteraService, { Cartera, DepositoRequest, Transaccion as TransaccionCartera } from '../api/services/cartera.service';
import authService from '../api/services/auth.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CarteraPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartera, setCartera] = useState<Cartera | null>(null);
  const [historial, setHistorial] = useState<TransaccionCartera[]>([]);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estado del formulario de depósito
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositando, setDepositando] = useState(false);
  const [depositoForm, setDepositoForm] = useState({
    monto: '',
    metodoPago: 'tarjeta' as 'tarjeta' | 'transferencia',
  });

  useEffect(() => {
    const usuario = authService.getUsuarioLocal();
    if (!usuario) {
      navigate('/login');
      return;
    }

    const cargarCartera = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener el ID del alumno correcto según el rol del usuario
        const alumnoId = usuario.rol === 'alumno' 
          ? usuario.id 
          : usuario.alumnoAsociado;

        if (!alumnoId) throw new Error("No se pudo identificar al alumno asociado.");

        const data = await carteraService.getSaldo(alumnoId);
        const historialData = await carteraService.getHistorial(alumnoId);
        setCartera(data);
        setHistorial(historialData.items);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarCartera();
  }, [navigate]);

  const handleDeposito = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositando(true);
    setError(null);
    setSuccess(null);

    try {
      const usuario = authService.getUsuarioLocal();
      const monto = parseFloat(depositoForm.monto);
      if (isNaN(monto) || monto <= 0) {
        throw new Error('El monto debe ser un número positivo');
      }

      const alumnoId = usuario?.alumnoAsociado;
      if (!alumnoId) {
        throw new Error("No se pudo identificar al alumno para realizar el depósito.");
      }

      // El padre siempre deposita al alumno asociado
      const depositoData: DepositoRequest = {
        alumnoId,
        monto,
        metodoPago: depositoForm.metodoPago,
      };

      const response = await carteraService.depositar(depositoData);
      const historialData = await carteraService.getHistorial(alumnoId);

      setCartera(response.cartera);
      setSuccess(`Depósito de $${monto.toFixed(2)} realizado exitosamente`);
      setShowDepositForm(false);
      setHistorial(historialData.items);
      setDepositoForm({ monto: '', metodoPago: 'tarjeta' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDepositando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando información de cartera..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Cartera Digital</h1>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Volver
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Saldo Actual */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Saldo Disponible</p>
              <p className="text-4xl font-bold text-gray-900">
                ${cartera?.saldo.toFixed(2)}
                <span className="text-lg text-gray-500 ml-2">{cartera?.moneda}</span>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Última actualización: {cartera ? new Date(cartera.ultimaActualizacion).toLocaleString() : '-'}
              </p>
            </div>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Acciones */}
        {authService.getUsuarioLocal()?.rol === 'padres' &&
          <Card className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Depositar Saldo</h3>
                <p className="text-sm text-gray-600">Agregar fondos a la cartera digital</p>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowDepositForm(!showDepositForm)}
              >
                {showDepositForm ? 'Cancelar' : 'Depositar'}
              </Button>
            </div>
 
            {/* Formulario de Depósito */}
            {showDepositForm && (
              <form onSubmit={handleDeposito} className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-4">
                  <Input
                    label="Monto a depositar"
                    type="number"
                    step="0.01"
                    min="1"
                    value={depositoForm.monto}
                    onChange={(e) => setDepositoForm({ ...depositoForm, monto: e.target.value })}
                    placeholder="0.00"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de pago
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setDepositoForm({ ...depositoForm, metodoPago: 'tarjeta' })}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${
                          depositoForm.metodoPago === 'tarjeta'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="text-sm font-medium">Tarjeta</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDepositoForm({ ...depositoForm, metodoPago: 'transferencia' })}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${
                          depositoForm.metodoPago === 'transferencia'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span className="text-sm font-medium">Transferencia</span>
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="success"
                    fullWidth
                    loading={depositando}
                  >
                    {depositando ? 'Procesando...' : 'Confirmar Depósito'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        }

        {/* Historial de Transacciones */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Movimientos</h3>
          {historial.length === 0 ? (
            <p className="text-sm text-gray-500">No hay movimientos recientes.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {historial.map(tx => (
                <li key={tx.id} className="py-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.tipo === 'deposito' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {tx.tipo === 'deposito' ? (
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        ) : (
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">{tx.descripcion}</p>
                        <p className="text-xs text-gray-500">{new Date(tx.fecha).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-sm font-bold ${
                          tx.tipo === 'deposito' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.tipo === 'deposito' ? '+' : ''}${Math.abs(tx.monto).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Saldo: ${tx.saldoNuevo.toFixed(2)}
                        </p>
                      </div>
                      {tx.tipo === 'compra' && tx.items && tx.items.length > 0 && (
                        <button
                          onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedTx === tx.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Desglose de la transacción */}
                  {expandedTx === tx.id && tx.items && (
                    <div className="mt-3 ml-12 pl-4 border-l-2 border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Detalle de la compra:</h4>
                      <ul className="space-y-1 text-xs">
                        {tx.items.map(item => (
                          <li key={item.productoId} className="flex justify-between">
                            <span className="text-gray-600">
                              {item.nombreProducto} (x{item.cantidad})
                            </span>
                            <span className="font-medium text-gray-800">
                              ${item.subtotal.toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Información Adicional */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Cartera</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">ID de Cartera</p>
              <p className="text-sm font-medium text-gray-900">{cartera?.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Límite Semanal</p>
              <p className="text-sm font-medium text-gray-900">
                ${cartera?.limiteGastoSemanal.toFixed(2)} {cartera?.moneda}
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default CarteraPage;
