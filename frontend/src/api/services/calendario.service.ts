// src/api/services/calendario.service.ts
import apiClient from '../axios.config';

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'Académico' | 'Extracurricular' | 'General';
  fecha: string;
  fechaFin: string;
  ubicacion: string;
  responsable: string;
  creadorId: string;
  importante: boolean;
  createdAt: string;
}

export interface EventosResponse {
  total: number;
  page: number;
  pageSize: number;
  items: Evento[];
}

export interface CrearEventoRequest {
  titulo: string;
  descripcion?: string;
  tipo: 'Académico' | 'Extracurricular' | 'General';
  fecha: string;
  fechaFin?: string;
  ubicacion?: string;
  responsable?: string;
  importante?: boolean;
}

export interface CrearEventoResponse {
  mensaje: string;
  evento: Evento;
}

export interface ActualizarEventoRequest {
  titulo?: string;
  descripcion?: string;
  tipo?: string;
  fecha?: string;
  fechaFin?: string;
  ubicacion?: string;
  responsable?: string;
  importante?: boolean;
}

export interface EliminarEventoResponse {
  mensaje: string;
  evento: Evento;
}

class CalendarioService {
  /**
   * Obtener lista de eventos
   */
  async getEventos(
    tipo?: string,
    mes?: number,
    año?: number,
    importante?: boolean,
    page: number = 1,
    pageSize: number = 20
  ): Promise<EventosResponse> {
    try {
      const params: any = { page, pageSize };
      if (tipo) params.tipo = tipo;
      if (mes) params.mes = mes;
      if (año) params.año = año;
      if (importante !== undefined) params.importante = importante;

      const response = await apiClient.get<EventosResponse>('/calendario/eventos', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener detalle de un evento
   */
  async getEventoById(eventoId: string): Promise<Evento> {
    try {
      const response = await apiClient.get<Evento>(`/calendario/eventos/${eventoId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Crear nuevo evento
   */
  async crearEvento(data: CrearEventoRequest): Promise<CrearEventoResponse> {
    try {
      const response = await apiClient.post<CrearEventoResponse>(
        '/calendario/eventos',
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar evento
   */
  async actualizarEvento(
    eventoId: string,
    data: ActualizarEventoRequest
  ): Promise<CrearEventoResponse> {
    try {
      const response = await apiClient.put<CrearEventoResponse>(
        `/calendario/eventos/${eventoId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar evento
   */
  async eliminarEvento(eventoId: string): Promise<EliminarEventoResponse> {
    try {
      const response = await apiClient.delete<EliminarEventoResponse>(
        `/calendario/eventos/${eventoId}`
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
      const mensaje = error.response.data?.mensaje || 'Error en la operación del calendario';
      return new Error(mensaje);
    } else if (error.request) {
      return new Error('No se pudo conectar con el servidor');
    } else {
      return new Error('Error desconocido');
    }
  }
}

export default new CalendarioService();
