// src/pages/TareasPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tareasService, { Tarea } from '../api/services/tareas.service';
import authService from '../api/services/auth.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TareasPage: React.FC = () => {
  const navigate = useNavigate();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [filtro, setFiltro] = useState<'todas' | 'pendiente' | 'entregada' | 'calificada'>('todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal de entrega
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [comentario, setComentario] = useState('');
  const [entregando, setEntregando] = useState(false);

  const usuario = authService.getUsuarioLocal();

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    cargarTareas();
  }, [usuario, navigate, filtro]);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      setError(null);
      const alumnoId = usuario?.rol === 'alumno' ? usuario.id : 'usr_alumno01';
      const estado = filtro === 'todas' ? undefined : filtro;
      const data = await tareasService.getTareas(alumnoId, estado);
      setTareas(data.items);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleEntregar = async () => {
    if (!tareaSeleccionada || !archivo) {
      setError('Debe seleccionar un archivo');
      return;
    }

    setEntregando(true);
    setError(null);

    try {
      await tareasService.entregarTarea(tareaSeleccionada.id, {
        archivo,
        comentario: comentario || undefined,
      });
      
      setSuccess('Tarea entregada exitosamente');
      setTareaSeleccionada(null);
      setArchivo(null);
      setComentario('');
      cargarTareas();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEntregando(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'entregada':
        return 'bg-blue-100 text-blue-800';
      case 'calificada':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando tareas..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Tareas Académicas</h1>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Volver
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Filtros */}
        <div className="mb-6 flex gap-2">
          {(['todas', 'pendiente', 'entregada', 'calificada'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                filtro === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f === 'todas' ? 'Todas' : f}
            </button>
          ))}
        </div>

        {/* Lista de Tareas */}
        {tareas.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No hay tareas {filtro === 'todas' ? '' : filtro + 's'}</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {tareas.map(tarea => (
              <Card key={tarea.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{tarea.titulo}</h3>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getEstadoColor(tarea.estado)}`}>
                        {tarea.estado}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{tarea.descripcion}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {tarea.materia}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Entrega: {new Date(tarea.fechaEntrega).toLocaleDateString()}
                      </span>
                      {tarea.calificacion !== null && (
                        <span className="font-semibold text-green-600">
                          Calificación: {tarea.calificacion}/100
                        </span>
                      )}
                    </div>
                  </div>
                  {tarea.estado === 'pendiente' && usuario?.rol === 'alumno' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setTareaSeleccionada(tarea)}
                    >
                      Entregar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Entrega */}
      {tareaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full" title={`Entregar: ${tareaSeleccionada.titulo}`}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo *
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos: PDF, DOC, DOCX, JPG, PNG (máx. 5MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentario (opcional)
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Escribe un comentario sobre tu entrega..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setTareaSeleccionada(null);
                    setArchivo(null);
                    setComentario('');
                  }}
                  disabled={entregando}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleEntregar}
                  loading={entregando}
                  disabled={!archivo}
                >
                  {entregando ? 'Entregando...' : 'Confirmar Entrega'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TareasPage;
