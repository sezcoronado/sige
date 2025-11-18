// src/api/services/tareas.service.ts
import apiClient from '../axios.config';

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  materia: string;
  docenteId: string;
  fechaAsignacion: string;
  fechaEntrega: string;
  fechaCalificacion?: string;
  estado: 'pendiente' | 'entregada' | 'calificada';
  calificacion: number | null;
  comentarioDocente: string | null;
  archivoEntrega: string | null;
  fechaEntregaAlumno: string | null;
}

export interface TareasResponse {
  total: number;
  page: number;
  pageSize: number;
  items: Tarea[];
}

export interface EntregaRequest {
  archivo: File;
  comentario?: string;
}

export interface EntregaResponse {
  mensaje: string;
  entrega: {
    id: string;
    tareaId: string;
    alumnoId: string;
    fechaEntrega: string;
    archivo: string;
    comentario: string | null;
  };
  tarea: Tarea;
}

export interface CalificacionRequest {
  alumnoId: string;
  calificacion: number;
  comentario?: string;
}

export interface CalificacionResponse {
  mensaje: string;
  tarea: Tarea;
}

class TareasService {
  /**
   * Listar tareas
   */
  async getTareas(
    alumnoId?: string,
    estado?: string,
    materia?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<TareasResponse> {
    try {
      const params: any = { page, pageSize };
      if (alumnoId) params.alumnoId = alumnoId;
      if (estado) params.estado = estado;
      if (materia) params.materia = materia;

      const response = await apiClient.get<TareasResponse>('/tareas', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener detalle de una tarea
   */
  async getTareaById(tareaId: string): Promise<Tarea> {
    try {
      const response = await apiClient.get<Tarea>(`/tareas/${tareaId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Entregar tarea (con archivo)
   */
  async entregarTarea(
    tareaId: string,
    data: EntregaRequest
  ): Promise<EntregaResponse> {
    try {
      // Crear FormData para enviar archivo
      const formData = new FormData();
      formData.append('archivo', data.archivo);
      if (data.comentario) {
        formData.append('comentario', data.comentario);
      }

      const response = await apiClient.post<EntregaResponse>(
        `/tareas/${tareaId}/entregar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Calificar tarea
   */
  async calificarTarea(
    tareaId: string,
    data: CalificacionRequest
  ): Promise<CalificacionResponse> {
    try {
      const response = await apiClient.post<CalificacionResponse>(
        `/tareas/${tareaId}/calificar`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): Error {
    if (error.response) {
      const mensaje = error.response.data?.mensaje || 'Error en la operación de tareas';
      return new Error(mensaje);
    } else if (error.request) {
      return new Error('No se pudo conectar con el servidor');
    } else {
      return new Error('Error desconocido');
    }
  }
}

export default new TareasService();
