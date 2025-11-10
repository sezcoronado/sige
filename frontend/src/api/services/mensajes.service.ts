// src/api/services/mensajes.service.ts
import apiClient from '../axios.config';

export interface Mensaje {
  id: string;
  remitenteId: string;
  destinatariosIds: string[];
  asunto: string;
  contenido: string;
  leido: boolean;
  fechaEnvio: string;
  fechaLectura: string | null;
  remitente?: {
    id: string;
    nombre: string;
  };
  destinatarios?: Array<{
    id: string;
    nombre: string;
  }>;
}

export interface MensajesResponse {
  total: number;
  page: number;
  pageSize: number;
  items: Mensaje[];
}

export interface EnviarMensajeRequest {
  destinatariosIds: string[];
  asunto: string;
  contenido: string;
}

export interface EnviarMensajeResponse {
  mensaje: string;
  data: Mensaje;
}

export interface MarcarLeidoRequest {
  leido: boolean;
}

export interface MarcarLeidoResponse {
  mensaje: string;
  data: Mensaje;
}

class MensajesService {
  /**
   * Listar mensajes del usuario
   */
  async getMensajes(
    tipo: 'recibidos' | 'enviados' = 'recibidos',
    leido?: boolean,
    page: number = 1,
    pageSize: number = 20
  ): Promise<MensajesResponse> {
    try {
      const params: any = { tipo, page, pageSize };
      if (leido !== undefined) params.leido = leido;

      const response = await apiClient.get<MensajesResponse>('/mensajes', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener detalle de un mensaje
   */
  async getMensajeById(mensajeId: string): Promise<Mensaje> {
    try {
      const response = await apiClient.get<Mensaje>(`/mensajes/${mensajeId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Enviar mensaje
   */
  async enviarMensaje(data: EnviarMensajeRequest): Promise<EnviarMensajeResponse> {
    try {
      const response = await apiClient.post<EnviarMensajeResponse>(
        '/mensajes',
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Marcar mensaje como leído/no leído
   */
  async marcarLeido(
    mensajeId: string,
    leido: boolean
  ): Promise<MarcarLeidoResponse> {
    try {
      const response = await apiClient.patch<MarcarLeidoResponse>(
        `/mensajes/${mensajeId}`,
        { leido }
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
      const mensaje = error.response.data?.mensaje || 'Error en la operación de mensajes';
      return new Error(mensaje);
    } else if (error.request) {
      return new Error('No se pudo conectar con el servidor');
    } else {
      return new Error('Error desconocido');
    }
  }
}

export default new MensajesService();
