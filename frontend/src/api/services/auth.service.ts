// src/api/services/auth.service.ts
import apiClient from '../axios.config';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  };
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  alumnoAsociado?: string;
}

export interface ChangePasswordRequest {
  contrasenaActual: string;
  contrasenaNueva: string;
  contrasenaConfirmacion: string;
}

export interface ChangePasswordResponse {
  mensaje: string;
}

/** Detalle de validación devuelto por el backend ({ campo, error }). */
export interface ValidationDetail {
  campo: string;
  error: string;
}

/** Error de API que conserva los detalles de validación por campo. */
export interface ApiError extends Error {
  detalles?: ValidationDetail[];
}

class AuthService {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      
      // Guardar en localStorage
      const { token, refreshToken, usuario } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Cambiar contraseña con verificación de seguridad.
   * Requiere la contraseña actual (re-autenticación) y una contraseña nueva
   * que cumpla la política de seguridad.
   */
  async changePassword(payload: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      const response = await apiClient.post<ChangePasswordResponse>('/auth/change-password', payload);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar localStorage independientemente del resultado
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('usuario');
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<Usuario> {
    try {
      const response = await apiClient.get<Usuario>('/auth/me');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener información de un usuario por su ID.
   * NOTA: Este endpoint no existe en el backend actual.
   * Se simula la respuesta para obtener el nombre del alumno.
   */
  async getUserById(userId: string): Promise<Usuario> {
    // En una implementación real, aquí se llamaría a un endpoint como GET /api/v1/users/${userId}
    // Por ahora, devolvemos un mock del usuario alumno para que la UI funcione.
    const MOCK_ALUMNO = {
      id: 'stdnt_alumno01',
      nombre: 'Emma Hernandez',
      email: 'alumno@ejemplo.com',
      rol: 'alumno'
    };
    return Promise.resolve(MOCK_ALUMNO);
  }

  /**
   * Obtener lista de alumnos (para docentes)
   */
  async getAlumnos(): Promise<Usuario[]> {
    try {
      const response = await apiClient.get<{ items: Usuario[] }>('/auth/users?rol=alumno');
      return response.data.items;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }
  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Obtener usuario del localStorage
   */
  getUsuarioLocal(): Usuario | null {
    const usuarioStr = localStorage.getItem('usuario');
    return usuarioStr ? JSON.parse(usuarioStr) : null;
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): ApiError {
    if (error.response) {
      // Error de respuesta del servidor
      const data = error.response.data;
      const mensaje = data?.mensaje || 'Error en la autenticación';
      const apiError: ApiError = new Error(mensaje);
      if (Array.isArray(data?.detalles) && data.detalles.length > 0) {
        apiError.detalles = data.detalles;
      }
      return apiError;
    } else if (error.request) {
      // Error de red
      return new Error('No se pudo conectar con el servidor');
    } else {
      // Otro tipo de error
      return new Error('Error desconocido');
    }
  }
}

export default new AuthService();
