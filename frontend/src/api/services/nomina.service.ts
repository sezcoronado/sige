// src/api/services/nomina.service.ts
import apiClient from '../axios.config';

export interface Empleado {
  id: string;
  nombre: string;
  rol: string;
  departamento: string;
  salarioMensual: number;
  moneda: string;
  estado: 'activo' | 'inactivo';
  fechaIngreso: string;
}

export interface Pago {
  id: string;
  empleadoId: string;
  mes: number;
  año: number;
  quincena: 1 | 2; // 1 = primera quincena (1-15), 2 = segunda quincena (16-31)
  monto: number;
  estado: 'pagado' | 'pendiente' | 'atrasado';
  fechaPago: string | null;
  referencia: string | null;
}

export interface ResumenNomina {
  totalEmpleados: number;
  totalActivos: number;
  totalInactivos: number;
  nominaTotal: number;
  pagosPendientes: number;
}

export interface EmpleadosResponse {
  total: number;
  page: number;
  pageSize: number;
  items: Empleado[];
}

export interface PagosResponse {
  total: number;
  page: number;
  pageSize: number;
  items: Pago[];
  resumen: ResumenNomina;
}

export interface RegistrarPagoRequest {
  empleadoId: string;
  mes: number;
  año: number;
  quincena: 1 | 2;
  referencia?: string;
}

export interface RegistrarPagoResponse {
  mensaje: string;
  pago: Pago;
}

class NominaService {
  /**
   * Obtener lista de empleados
   */
  async getEmpleados(
    estado?: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<EmpleadosResponse> {
    try {
      const params: any = { page, pageSize };
      if (estado) params.estado = estado;

      const response = await apiClient.get('/nomina/empleados', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener detalle de un empleado
   */
  async getEmpleadoById(empleadoId: string): Promise<Empleado> {
    try {
      const response = await apiClient.get(`/nomina/empleados/${empleadoId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener pagos/nómina
   */
  async getPagos(
    mes?: number,
    año?: number,
    estado?: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<PagosResponse> {
    try {
      const params: any = { page, pageSize };
      if (mes) params.mes = mes;
      if (año) params.año = año;
      if (estado) params.estado = estado;

      const response = await apiClient.get('/nomina/pagos', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener pagos de un empleado específico
   */
  async getPagosEmpleado(
    empleadoId: string,
    mes?: number,
    año?: number
  ): Promise<Pago[]> {
    try {
      const params: any = {};
      if (mes) params.mes = mes;
      if (año) params.año = año;

      const response = await apiClient.get(
        `/nomina/empleados/${empleadoId}/pagos`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Registrar un pago de nómina
   */
  async registrarPago(
    request: RegistrarPagoRequest
  ): Promise<RegistrarPagoResponse> {
    try {
      const response = await apiClient.post('/nomina/pagos', request);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar estado de un pago
   */
  async actualizarEstadoPago(
    pagoId: string,
    estado: 'pagado' | 'pendiente' | 'atrasado',
    referencia?: string
  ): Promise<RegistrarPagoResponse> {
    try {
      const response = await apiClient.put(
        `/nomina/pagos/${pagoId}`,
        { estado, referencia }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener resumen de nómina
   */
  async getResumen(mes?: number, año?: number): Promise<ResumenNomina> {
    try {
      const params: any = {};
      if (mes) params.mes = mes;
      if (año) params.año = año;

      const response = await apiClient.get('/nomina/resumen', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.response?.status === 401) {
      return new Error('No autorizado. Por favor inicie sesión nuevamente.');
    }
    if (error.response?.status === 403) {
      return new Error('No tiene permiso para acceder a este recurso.');
    }
    if (error.response?.status === 404) {
      return new Error('El recurso solicitado no fue encontrado.');
    }
    return new Error(
      error.message || 'Error al procesar la solicitud de nómina.'
    );
  }
}

const nominaService = new NominaService();
export default nominaService;
