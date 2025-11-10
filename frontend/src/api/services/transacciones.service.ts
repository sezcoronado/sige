// src/api/services/transacciones.service.ts
import apiClient from '../axios.config';

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  disponible: boolean;
  alergenos: string[];
}

export interface Restriccion {
  id: string;
  alumnoId: string;
  productoId: string;
  motivo: string;
  tipoRestriccion: string;
  producto?: Producto;
}

export interface ItemTransaccion {
  productoId: string;
  cantidad: number;
}

export interface TransaccionRequest {
  alumnoId: string;
  items: ItemTransaccion[];
}

export interface UpdateRestriccionesRequest {
  alumnoId: string;
  productoId: string;
  restringir: boolean;
}

export interface TransaccionResponse {
  mensaje: string;
  transaccion: {
    id: string;
    alumnoId: string;
    items: ItemDetalle[];
    total: number;
    moneda: string;
    estado: string;
    fechaTransaccion: string;
  };
  saldoRestante: number;
}

export interface ItemDetalle {
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface ProductosResponse {
  total: number;
  items: Producto[];
}

export interface RestriccionesResponse {
  total: number;
  items: Restriccion[];
}

export interface TransaccionesResponse {
  total: number;
  page: number;
  pageSize: number;
  items: TransaccionResponse['transaccion'][];
}

class TransaccionesService {
  /**
   * Listar productos disponibles
   */
  async getProductos(
    categoria?: string,
    disponible?: boolean,
    search?: string
  ): Promise<ProductosResponse> {
    try {
      const params: any = {};
      if (categoria) params.categoria = categoria;
      if (disponible !== undefined) params.disponible = disponible;
      if (search) params.search = search;

      const response = await apiClient.get<ProductosResponse>(
        '/transacciones/productos',
        { params }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener restricciones de un alumno
   */
  async getRestricciones(alumnoId: string): Promise<RestriccionesResponse> {
    try {
      const response = await apiClient.get<RestriccionesResponse>(
        '/transacciones/restricciones',
        { params: { alumnoId } }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Crear transacción de compra
   */
  async crearTransaccion(data: TransaccionRequest): Promise<TransaccionResponse> {
    try {
      const response = await apiClient.post<TransaccionResponse>(
        '/transacciones',
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Listar transacciones de un alumno
   */
  async getTransacciones(
    alumnoId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<TransaccionesResponse> {
    try {
      const response = await apiClient.get<TransaccionesResponse>(
        '/transacciones',
        { params: { alumnoId, page, pageSize } }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar las restricciones de un alumno
   */
  async updateRestricciones(data: UpdateRestriccionesRequest): Promise<{ mensaje: string }> {
    try {
      const response = await apiClient.put<{ mensaje: string }>(
        '/transacciones/restricciones',
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
      const mensaje = error.response.data?.mensaje || 'Error en la transacción';
      return new Error(mensaje);
    } else if (error.request) {
      return new Error('No se pudo conectar con el servidor');
    } else {
      return new Error('Error desconocido');
    }
  }
}

export default new TransaccionesService();
