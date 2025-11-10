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
  private handleError(error: any): Error {
    if (error.response) {
      // Error de respuesta del servidor
      const mensaje = error.response.data?.mensaje || 'Error en la autenticación';
      return new Error(mensaje);
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
