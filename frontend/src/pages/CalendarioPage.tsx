// src/pages/CalendarioPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import calendarioService, { Evento, CrearEventoRequest } from '../api/services/calendario.service';
import tareasService from '../api/services/tareas.service';
import authService from '../api/services/auth.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface ItemCalendario extends Evento {
  tipo_item: 'evento' | 'tarea';
  materia?: string;
  estado?: string;
  fechaCalificacion?: string;
}

const CalendarioPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ItemCalendario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tipoFiltro, setTipoFiltro] = useState<string>('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [creando, setCreando] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemCalendario | null>(null);
  const [vistaAlumno, setVistaAlumno] = useState(false);
  const [mostrarTareas, setMostrarTareas] = useState(false);
  const [mostrarTareasDocente, setMostrarTareasDocente] = useState(false);

  const [formData, setFormData] = useState<CrearEventoRequest>({
    titulo: '',
    descripcion: '',
    tipo: 'Académico',
    fecha: '',
    fechaFin: '',
    ubicacion: '',
    responsable: '',
  });

  useEffect(() => {
    const usuario = authService.getUsuarioLocal();
    if (!usuario) {
      navigate('/login');
      return;
    }

    cargarDatos();
  }, [navigate, currentDate, tipoFiltro, vistaAlumno, mostrarTareas, mostrarTareasDocente]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const usuario = authService.getUsuarioLocal();
      if (!usuario) throw new Error('Usuario no autenticado');

      const mes = currentDate.getMonth() + 1;
      const año = currentDate.getFullYear();

      // Cargar eventos
      const eventosData = await calendarioService.getEventos(
        tipoFiltro || undefined,
        mes,
        año,
        undefined,
        1,
        100
      );

      let itemsCombinados: ItemCalendario[] = eventosData.items.map(e => ({
        ...e,
        tipo_item: 'evento'
      }));

      // Si es alumno o si el padre tiene vistaAlumno activa, cargar también tareas
      const deboMostrarTareas = usuario.rol === 'alumno' || (usuario.rol === 'padres' && vistaAlumno);
      const esDocente = usuario.rol === 'docente' || usuario.rol === 'admin';

      if ((deboMostrarTareas && mostrarTareas) || (esDocente && mostrarTareasDocente)) {
        try {
          const tareasData = await tareasService.getTareas(undefined, undefined, undefined, 1, 100);
          const tareasComTipo = tareasData.items.map(t => ({
            id: t.id,
            titulo: t.titulo,
            descripcion: t.descripcion || '',
            tipo: 'Tarea',
            fecha: t.fechaEntrega,
            fechaFin: t.fechaEntrega,
            ubicacion: t.materia || '',
            responsable: t.docenteId || '',
            creadorId: '',
            importante: false,
            tipo_item: 'tarea' as const,
            materia: t.materia,
            estado: t.estado,
            fechaCalificacion: t.fechaCalificacion
          }));

          // Para docentes, agregar también eventos de calificación
          if (esDocente && mostrarTareasDocente) {
            const tareasCalificacion = tareasData.items
              .filter(t => t.fechaCalificacion)
              .map(t => ({
                id: `${t.id}-cal`,
                titulo: `[Calificación] ${t.titulo}`,
                descripcion: `Fecha límite para calificar: ${t.descripcion || ''}`,
                tipo: 'Tarea',
                fecha: t.fechaCalificacion,
                fechaFin: t.fechaCalificacion,
                ubicacion: t.materia || '',
                responsable: t.docenteId || '',
                creadorId: '',
                importante: false,
                tipo_item: 'tarea' as const,
                materia: t.materia,
                estado: 'calificacion',
                fechaCalificacion: t.fechaCalificacion
              }));
            itemsCombinados = [...itemsCombinados, ...tareasComTipo, ...tareasCalificacion];
          } else {
            itemsCombinados = [...itemsCombinados, ...tareasComTipo];
          }
        } catch (err) {
          // Si hay error cargando tareas, continuar sin ellas
          console.error('Error cargando tareas:', err);
        }
      }

      setItems(itemsCombinados);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreando(true);
    setError(null);
    setSuccess(null);

    try {
      const usuario = authService.getUsuarioLocal();
      if (usuario?.rol !== 'admin' && usuario?.rol !== 'docente') {
        throw new Error('No tiene permisos para crear eventos');
      }

      if (!formData.titulo || !formData.fecha || !formData.tipo) {
        throw new Error('Por favor complete los campos requeridos');
      }

      const response = await calendarioService.crearEvento(formData);
      setSuccess('Evento creado exitosamente');
      setFormData({
        titulo: '',
        descripcion: '',
        tipo: 'Académico',
        fecha: '',
        fechaFin: '',
        ubicacion: '',
        responsable: '',
      });
      setMostrarFormulario(false);
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreando(false);
    }
  };

  const handleEliminar = async (eventoId: string) => {
    if (!window.confirm('¿Está seguro que desea eliminar este evento?')) return;

    try {
      await calendarioService.eliminarEvento(eventoId);
      setSuccess('Evento eliminado exitosamente');
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getItemsForDay = (day: number): ItemCalendario[] => {
    return items.filter(item => {
      const fecha = new Date(item.fecha);
      return fecha.getDate() === day &&
        fecha.getMonth() === currentDate.getMonth() &&
        fecha.getFullYear() === currentDate.getFullYear();
    });
  };

  const getItemColor = (item: ItemCalendario) => {
    if (item.tipo_item === 'tarea') {
      // Colores para tareas basados en estado de entrega
      switch (item.estado) {
        case 'entregada':
          return 'bg-blue-100 text-blue-800'; // blue-500
        case 'calificada':
          return 'bg-emerald-100 text-emerald-800'; // emerald-500
        case 'vencida':
          return 'bg-red-100 text-red-800'; // red-500
        case 'calificacion':
          return 'bg-purple-100 text-purple-800'; // purple para fecha de calificación
        case 'pendiente':
        default:
          return 'bg-amber-100 text-amber-800'; // amber-400
      }
    }
    // Colores para eventos escolares
    if (item.tipo === 'Académico') {
      return 'bg-indigo-100 text-indigo-800'; // indigo
    } else if (item.tipo === 'Extracurricular') {
      return 'bg-teal-100 text-teal-800'; // teal
    } else {
      return 'bg-slate-200 text-slate-800'; // slate para otros eventos/feriados
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-50 p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayItems = getItemsForDay(day);
      const isToday =
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`border rounded p-2 min-h-24 ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
        >
          <div className={`font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayItems.slice(0, 2).map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`text-xs p-1 rounded cursor-pointer ${getItemColor(item)}`}
              >
                {item.titulo.substring(0, 15)}...
              </div>
            ))}
            {dayItems.length > 2 && (
              <div className="text-xs text-gray-500">+{dayItems.length - 2} más</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando calendario..." />
      </div>
    );
  }

  const usuario = authService.getUsuarioLocal();
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendario Escolar</h1>
              {vistaAlumno && usuario?.rol === 'padres' && (
                <p className="text-sm text-gray-500 mt-1">Vista como alumno</p>
              )}
            </div>
            <div className="flex gap-2">
              {usuario?.rol === 'padres' && (
                <Button
                  variant={vistaAlumno ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setVistaAlumno(!vistaAlumno)}
                >
                  {vistaAlumno ? 'Mi Vista' : 'Ver Calendario del Hijo'}
                </Button>
              )}
              {usuario?.rol === 'alumno' && (
                <Button
                  variant={mostrarTareas ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setMostrarTareas(!mostrarTareas)}
                >
                  {mostrarTareas ? 'Ocultar Tareas' : 'Mostrar Mis Tareas'}
                </Button>
              )}
              {(usuario?.rol === 'docente' || usuario?.rol === 'admin') && (
                <Button
                  variant={mostrarTareasDocente ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setMostrarTareasDocente(!mostrarTareasDocente)}
                >
                  {mostrarTareasDocente ? 'Ocultar Tareas' : 'Mostrar Tareas'}
                </Button>
              )}
              {(usuario?.rol === 'admin' || usuario?.rol === 'docente') && !vistaAlumno && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setMostrarFormulario(!mostrarFormulario)}
                >
                  {mostrarFormulario ? 'Cancelar' : 'Nuevo Evento'}
                </Button>
              )}
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Volver
              </Button>
            </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario */}
          {mostrarFormulario && !vistaAlumno && (
            <Card className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Crear Evento</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Título"
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Académico">Académico</option>
                    <option value="Extracurricular">Extracurricular</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <Input
                  label="Fecha"
                  type="datetime-local"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  required
                />

                <Input
                  label="Fecha Fin"
                  type="datetime-local"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                />

                <Input
                  label="Descripción"
                  type="textarea"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />

                <Input
                  label="Ubicación"
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                />

                <Input
                  label="Responsable"
                  type="text"
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                />

                <Button
                  type="submit"
                  variant="success"
                  fullWidth
                  loading={creando}
                >
                  {creando ? 'Creando...' : 'Crear Evento'}
                </Button>
              </form>
            </Card>
          )}

          {/* Calendario */}
          <Card className={mostrarFormulario && !vistaAlumno ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {/* Controles */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 hover:bg-gray-200 rounded"
                >
                  ←
                </button>
                <h3 className="text-xl font-bold text-gray-900 min-w-32 text-center">
                  {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 hover:bg-gray-200 rounded"
                >
                  →
                </button>
              </div>

              <div className="flex gap-2">
                <select
                  value={tipoFiltro}
                  onChange={(e) => setTipoFiltro(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Todos los eventos</option>
                  <option value="Académico">Académico</option>
                  <option value="Extracurricular">Extracurricular</option>
                  <option value="General">General</option>
                </select>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  Hoy
                </button>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {diasSemana.map(dia => (
                <div key={dia} className="text-center font-semibold text-gray-700 py-2">
                  {dia}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-2 auto-rows-max">
              {renderCalendarDays()}
            </div>

            {/* Leyenda */}
            {((mostrarTareas && (usuario?.rol === 'alumno' || (usuario?.rol === 'padres' && vistaAlumno))) ||
              (mostrarTareasDocente && (usuario?.rol === 'docente' || usuario?.rol === 'admin'))) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2 font-medium">Leyenda:</p>
                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-gray-700">Tareas (por estado de entrega):</div>
                  <div className="flex flex-wrap gap-4 ml-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-amber-100 border border-amber-800"></div>
                      <span>Pendiente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-100 border border-blue-800"></div>
                      <span>Entregada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-800"></div>
                      <span>Calificada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-100 border border-red-800"></div>
                      <span>Vencida</span>
                    </div>
                    {mostrarTareasDocente && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-purple-100 border border-purple-800"></div>
                        <span>Fecha de Calificación</span>
                      </div>
                    )}
                  </div>

                  <div className="font-semibold text-gray-700 mt-3">Eventos Escolares:</div>
                  <div className="flex flex-wrap gap-4 ml-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-indigo-100 border border-indigo-800"></div>
                      <span>Académicos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-teal-100 border border-teal-800"></div>
                      <span>Extracurriculares</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-slate-200 border border-slate-800"></div>
                      <span>Otros/Feriados</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Detalles del item seleccionado */}
        {selectedItem && (
          <Card className="mt-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedItem.titulo}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getItemColor(selectedItem)}`}
                  >
                    {selectedItem.tipo_item === 'tarea' ? 'Tarea' : selectedItem.tipo}
                  </span>
                  {selectedItem.importante && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      Importante
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{selectedItem.descripcion}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="font-medium">
                  {new Date(selectedItem.fecha).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha Fin</p>
                <p className="font-medium">
                  {new Date(selectedItem.fechaFin).toLocaleString()}
                </p>
              </div>
              {selectedItem.tipo_item === 'tarea' && selectedItem.materia && (
                <div>
                  <p className="text-sm text-gray-600">Materia</p>
                  <p className="font-medium">{selectedItem.materia}</p>
                </div>
              )}
              {selectedItem.tipo_item === 'tarea' && selectedItem.estado && (
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="font-medium capitalize">{selectedItem.estado}</p>
                </div>
              )}
              {selectedItem.tipo_item === 'tarea' && selectedItem.fechaCalificacion && selectedItem.estado !== 'calificacion' && (
                <div>
                  <p className="text-sm text-gray-600">Fecha de Calificación</p>
                  <p className="font-medium">
                    {new Date(selectedItem.fechaCalificacion).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedItem.tipo_item === 'evento' && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Ubicación</p>
                    <p className="font-medium">{selectedItem.ubicacion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Responsable</p>
                    <p className="font-medium">{selectedItem.responsable}</p>
                  </div>
                </>
              )}
            </div>

            {!vistaAlumno && selectedItem.tipo_item === 'evento' && (usuario?.rol === 'admin' || usuario?.id === selectedItem.creadorId) && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    handleEliminar(selectedItem.id);
                    setSelectedItem(null);
                  }}
                >
                  Eliminar
                </Button>
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  );
};

export default CalendarioPage;
