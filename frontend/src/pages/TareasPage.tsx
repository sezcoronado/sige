// src/pages/TareasPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import tareasService, { Tarea } from '../api/services/tareas.service';
import authService from '../api/services/auth.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Usuario {
  id: string;
  nombre: string;
  rol: string;
}
interface TaskStats {
  name: string;
  value: number;
}

const TareasPage: React.FC = () => {
  const navigate = useNavigate();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [filtro, setFiltro] = useState<'todas' | 'pendiente' | 'entregada' | 'calificada' | 'vencida'>('todas');
  const [filtroAlumno, setFiltroAlumno] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [taskStats, setTaskStats] = useState<TaskStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const [alumnos, setAlumnos] = useState<Usuario[]>([]);

  const COLORS = {
    pendiente: '#FBBF24', // amber-400
    entregada: '#3B82F6', // blue-500
    calificada: '#10B981', // emerald-500
    vencida: '#EF4444', // red-500
  };

  
  // Modal de entrega
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [comentario, setComentario] = useState('');
  const [entregando, setEntregando] = useState(false);

  useEffect(() => {
    const usuario = authService.getUsuarioLocal();
    if (!usuario) {
      navigate('/login');
      return;
    }

    const getAlumnos = async () => {
      if (usuario.rol === 'docente') {
        try {
          // Este método se debe añadir en auth.service.ts
          const data = await authService.getAlumnos();
          setAlumnos(data);
        } catch (err) {
          console.error("Error al cargar la lista de alumnos:", err);
        }
      }
    };

    cargarTareas();
    fetchTaskStats();
    getAlumnos();
  }, [filtro, filtroAlumno]);

  const fetchTaskStats = async () => {
    const usuario = authService.getUsuarioLocal();
    if (!usuario) return;

      try {
        setLoadingStats(true);
        let alumnoIdParaStats: string | undefined;

        if (usuario.rol === 'docente') {
          alumnoIdParaStats = filtroAlumno === 'todos' ? undefined : filtroAlumno;
        } else {
          alumnoIdParaStats = usuario.rol === 'alumno' ? usuario.id : usuario.alumnoAsociado;
        }

        // Si es docente y no hay alumno seleccionado, la API devuelve todas las tareas
        const response = await tareasService.getTareas(alumnoIdParaStats);
        const tasks = response.items;

        const stats = tasks.reduce((acc, task) => {
          const estado = task.estado || 'pendiente';
          acc[estado] = (acc[estado] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        const formattedStats = Object.keys(stats).map(key => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: stats[key],
        }));

        setTaskStats(formattedStats);
      } catch (error) {
        console.error("Error al cargar estadísticas de tareas:", error);
      } finally {
        setLoadingStats(false);
      }
  };


  const cargarTareas = async () => {
    try {
      const usuario = authService.getUsuarioLocal();
      setLoading(true);
      setError(null);
      const alumnoId = usuario?.rol === 'alumno' ? usuario.id : usuario?.alumnoAsociado;
      const estado = filtro === 'todas' ? undefined : filtro;

      // Para el docente, el ID del alumno viene del filtro
      if (usuario?.rol === 'docente') {
        const data = await tareasService.getTareas(filtroAlumno === 'todos' ? undefined : filtroAlumno, estado);
        setTareas(data.items);
      } else {
        const data = await tareasService.getTareas(alumnoId, estado);
        setTareas(data.items);
      }
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
      fetchTaskStats(); // <-- AÑADIDO: Volver a cargar las estadísticas para la gráfica
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
      case 'vencida':
        return 'bg-red-100 text-red-800';
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

  const usuario = authService.getUsuarioLocal();

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

        {/* Gráfica de Tareas */}
        {usuario && (
          <Card className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen de Tareas</h2>
            {loadingStats ? (
              <div className="h-64 flex items-center justify-center">
                <LoadingSpinner text="Cargando estadísticas..." />
              </div>
            ) : (
              <>
                {taskStats.length > 0 ? (
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={taskStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {taskStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} tarea(s)`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : <p className="text-gray-600">No hay tareas para mostrar estadísticas.</p>}
              </>
            )}
          </Card>
        )}

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          {usuario?.rol === 'docente' && (
            <div>
              <label htmlFor="filtro-alumno" className="text-sm font-medium text-gray-700 mr-2">Filtrar por Alumno:</label>
              <select
                id="filtro-alumno"
                value={filtroAlumno}
                onChange={(e) => setFiltroAlumno(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los Alumnos</option>
                {alumnos.map(alumno => (
                  <option key={alumno.id} value={alumno.id}>{alumno.nombre}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            {(['todas', 'pendiente', 'entregada', 'calificada', 'vencida'] as const).map(f => (
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
                    {usuario?.rol === 'docente' && tarea.alumno && (
                      <p className="text-sm font-semibold text-indigo-600 mb-2">
                        Alumno: {tarea.alumno.nombre}
                      </p>
                    )}
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
                        <span
                          className={`font-semibold ${
                            tarea.estado === 'vencida' ? 'text-gray-500' : 'text-green-600'
                          }`}
                        >
                          Calificación: {tarea.calificacion} / 100
                        </span>
                      )}
                    </div>
                  </div>
                  {tarea.estado === 'pendiente' && authService.getUsuarioLocal()?.rol === 'alumno' && (
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
