// src/pages/MensajesPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mensajesService, { Mensaje } from '../api/services/mensajes.service';
import authService from '../api/services/auth.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MensajesPage: React.FC = () => {
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [tipo, setTipo] = useState<'recibidos' | 'enviados'>('recibidos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Mensaje seleccionado
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState<Mensaje | null>(null);

  // Nuevo mensaje
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState({
    destinatario: '',
    asunto: '',
    contenido: '',
  });

  useEffect(() => {
    const usuario = authService.getUsuarioLocal();
    if (!usuario) {
      navigate('/login');
      return;
    }
    cargarMensajes();
  }, [navigate, tipo]);

  const cargarMensajes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mensajesService.getMensajes(tipo);
      setMensajes(data.items);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeido = async (mensajeId: string) => {
    try {
      await mensajesService.marcarLeido(mensajeId, true);
      cargarMensajes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEnviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    try {
      // En producción, buscar el ID del destinatario por email/nombre
      // Por ahora usamos IDs mock
      const destinatarioMap: { [key: string]: string[] | undefined } = {
        'padres': ['mthr_alumno01', 'mthr_alumno02'], // ID del usuario 'padres'
        'docente': ['tchr_12345'],   // ID del docente
        'alumno': ['stdnt_alumno01'],  // ID del alumno
      };

      const destinatarios = destinatarioMap[nuevoMensaje.destinatario];
      if (!destinatarios || destinatarios.length === 0) {
        throw new Error('Destinatario inválido');
      }

      // Obtener el ID del usuario actual desde localStorage
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      // Filtrar tu propio ID (evita enviarte el mensaje a ti mismo)
      const destinatariosFiltrados = destinatarios.filter(
        id => id !== usuario.id
      );

      if (destinatariosFiltrados.length === 0) {
        throw new Error('No hay destinatarios válidos (no puedes enviarte mensajes a ti mismo)');
      }

      // Enviar a cada destinatario individualmente
      for (const destId of destinatariosFiltrados) {
        await mensajesService.enviarMensaje({
          destinatariosIds: [destId], // backend espera array
          asunto: nuevoMensaje.asunto,
          contenido: nuevoMensaje.contenido,
        });
      }

      setSuccess('Mensaje enviado exitosamente');
      setMostrarNuevo(false);
      setNuevoMensaje({ destinatario: '', asunto: '', contenido: '' });
      if (tipo === 'enviados') {
        cargarMensajes();
      }
    } catch (err: any) {
      console.error('Error al enviar mensaje:', err);
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando mensajes..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Mensajería</h1>
            <div className="flex gap-3">
              <Button variant="primary" onClick={() => setMostrarNuevo(true)}>
                Nuevo Mensaje
              </Button>
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Volver
              </Button>
            </div>
          </div>
        </div>
      </header>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Mensajes */}
          <div className="lg:col-span-1">
            <Card title="Mensajes" padding={false}>
              {/* Tabs */}
              <div className="flex border-b">
                <button
                  onClick={() => setTipo('recibidos')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    tipo === 'recibidos'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Recibidos
                </button>
                <button
                  onClick={() => setTipo('enviados')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    tipo === 'enviados'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Enviados
                </button>
              </div>

              {/* Lista */}
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {mensajes.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No hay mensajes {tipo}</p>
                  </div>
                ) : (
                  mensajes.map(mensaje => (
                    <button
                      key={mensaje.id}
                      onClick={() => {
                        setMensajeSeleccionado(mensaje);
                        if (!mensaje.leido && tipo === 'recibidos') {
                          marcarComoLeido(mensaje.id);
                        }
                      }}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        !mensaje.leido && tipo === 'recibidos' ? 'bg-blue-50' : ''
                      } ${mensajeSeleccionado?.id === mensaje.id ? 'bg-blue-100' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-sm text-gray-900">
                          {tipo === 'recibidos' ? mensaje.remitente?.nombre : mensaje.destinatarios?.[0]?.nombre}
                        </p>
                        {!mensaje.leido && tipo === 'recibidos' && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-700 truncate mb-1">
                        {mensaje.asunto}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(mensaje.fechaEnvio).toLocaleDateString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Detalle del Mensaje */}
          <div className="lg:col-span-2">
            {mensajeSeleccionado ? (
              <Card>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {mensajeSeleccionado.asunto}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      <strong>De:</strong> {mensajeSeleccionado.remitente?.nombre}
                    </span>
                    <span>
                      <strong>Para:</strong> {mensajeSeleccionado.destinatarios?.map(d => d.nombre).join(', ')}
                    </span>
                    <span>{new Date(mensajeSeleccionado.fechaEnvio).toLocaleString()}</span>
                  </div>
                </div>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {mensajeSeleccionado.contenido}
                  </p>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-20 text-gray-500">
                  <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p>Selecciona un mensaje para verlo</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Modal Nuevo Mensaje */}
      {mostrarNuevo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full" title="Nuevo Mensaje">
            <form onSubmit={handleEnviarMensaje} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinatario *
                </label>
                <select
                  value={nuevoMensaje.destinatario}
                  onChange={(e) => setNuevoMensaje({ ...nuevoMensaje, destinatario: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="padres">Padres</option>
                  <option value="docente">Docente</option>
                  <option value="alumno">Alumno</option>
                </select>
              </div>

              <Input
                label="Asunto"
                type="text"
                value={nuevoMensaje.asunto}
                onChange={(e) => setNuevoMensaje({ ...nuevoMensaje, asunto: e.target.value })}
                required
                placeholder="Escribe el asunto del mensaje"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje *
                </label>
                <textarea
                  value={nuevoMensaje.contenido}
                  onChange={(e) => setNuevoMensaje({ ...nuevoMensaje, contenido: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setMostrarNuevo(false);
                    setNuevoMensaje({ destinatario: '', asunto: '', contenido: '' });
                  }}
                  disabled={enviando}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={enviando}
                >
                  {enviando ? 'Enviando...' : 'Enviar Mensaje'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MensajesPage;
