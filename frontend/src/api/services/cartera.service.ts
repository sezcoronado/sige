// src/api/services/cartera.service.ts
import apiClient from '../axios.config';

export interface Cartera {
  id: string;
  alumnoId: string;
  saldo: number;
  moneda: string;
  limiteGastoSemanal: number;
  ultimaActualizacion: string;
}

export interface DepositoRequest {
  alumnoId: string;
  monto: number;
  metodoPago: 'tarjeta' | 'transferencia';
}

export interface DepositoResponse {
  mensaje: string;
  cartera: Cartera;
  transaccion: Transaccion;
}

export interface Transaccion {
  id: string;
  carteraId: string;
  tipo: 'deposito' | 'compra';
  monto: number;
  saldoAnterior: number;
  saldoNuevo: number;
  descripcion: string;
  fecha: string;
}

export interface HistorialResponse {
  total: number;
  page: number;
  pageSize: number;
  items: Transaccion[];
}

class CarteraService {
  /**
   * Consultar saldo de cartera
   */
  async getSaldo(alumnoId: string): Promise<Cartera> {
    try {
      const response = await apiClient.get<Cartera>('/cartera', {
        params: { alumnoId }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Depositar saldo a cartera
   */
  async depositar(depositoData: DepositoRequest): Promise<DepositoResponse> {
    try {
      const response = await apiClient.post<DepositoResponse>(
        '/cartera/depositar',
        depositoData
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener historial de movimientos
   */
  async getHistorial(
    alumnoId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<HistorialResponse> {
    try {
      const response = await apiClient.get<HistorialResponse>('/cartera/historial', {
        params: { alumnoId, page, pageSize }
      });
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
      const mensaje = error.response.data?.mensaje || 'Error en la operación de cartera';
      return new Error(mensaje);
    } else if (error.request) {
      return new Error('No se pudo conectar con el servidor');
    } else {
      return new Error('Error desconocido');
    }
  }
}

export default new CarteraService();
