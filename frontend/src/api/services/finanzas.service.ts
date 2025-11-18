// src/api/services/finanzas.service.ts
import apiClient from '../axios.config';

export interface Cuota {
  id: string;
  alumnoId: string;
  mes: string;
  año: number;
  monto: number;
  moneda: string;
  estado: 'pagada' | 'pendiente' | 'vencida';
  fechaPago: string | null;
  metodoPago: string | null;
  comprobante: string | null;
  fechaVencimiento?: string;
  createdAt: string;
}

export interface Pago {
  id: string;
  cuotaId: string;
  alumnoId: string;
  monto: number;
  metodoPago: string;
  referencia: string;
  comprobante: string | null;
  estado: 'confirmado' | 'pendiente';
  createdAt: string;
}

export interface CuotasResponse {
  total: number;
  page: number;
  pageSize: number;
  items: Cuota[];
  resumen: {
    total: number;
    pagadas: number;
    pendientes: number;
    vencidas: number;
    montoPendiente: number;
  };
}

export interface CuotaDetalleResponse extends Cuota {
  pagos: Pago[];
}

export interface PagarCuotaRequest {
  cuotaId: string;
  metodoPago: string;
  referencia?: string;
}

export interface PagarCuotaResponse {
  mensaje: string;
  pago: Pago;
  cuota: Cuota;
}

export interface SubirComprobanteResponse {
  mensaje: string;
  pago: Pago;
  rutaArchivo: string;
}

export interface PagosResponse {
  total: number;
  page: number;
  pageSize: number;
  items: Pago[];
}

class FinanzasService {
  /**
   * Obtener cuotas de un alumno
   */
  async getCuotas(
    alumnoId?: string,
    estado?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<CuotasResponse> {
    try {
      const params: any = { page, pageSize };
      if (alumnoId) params.alumnoId = alumnoId;
      if (estado) params.estado = estado;

      const response = await apiClient.get<CuotasResponse>('/finanzas/cuotas', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener detalle de una cuota
   */
  async getCuotaById(cuotaId: string): Promise<CuotaDetalleResponse> {
    try {
      const response = await apiClient.get<CuotaDetalleResponse>(`/finanzas/cuotas/${cuotaId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Pagar una cuota
   */
  async pagarCuota(data: PagarCuotaRequest): Promise<PagarCuotaResponse> {
    try {
      const { cuotaId, ...rest } = data;
      const response = await apiClient.post<PagarCuotaResponse>(
        `/finanzas/cuotas/${cuotaId}/pagar`,
        rest
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Subir comprobante de pago
   */
  async subirComprobante(pagoId: string, archivo: File): Promise<SubirComprobanteResponse> {
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);

      const response = await apiClient.post<SubirComprobanteResponse>(
        `/finanzas/pagos/${pagoId}/comprobante`,
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
   * Obtener historial de pagos
   */
  async getHistorialPagos(
    alumnoId?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PagosResponse> {
    try {
      const params: any = { page, pageSize };
      if (alumnoId) params.alumnoId = alumnoId;

      const response = await apiClient.get<PagosResponse>('/finanzas/historial-pagos', { params });
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
      const mensaje = error.response.data?.mensaje || 'Error en la operación de finanzas';
      return new Error(mensaje);
    } else if (error.request) {
      return new Error('No se pudo conectar con el servidor');
    } else {
      return new Error('Error desconocido');
    }
  }
}

export default new FinanzasService();
