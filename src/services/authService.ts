import { AuthRequest, RegisterRequest } from "@/types";
import apiService from "./api";

// Interfaces para respuesta de la API
interface AuthResponse {
    token: string;
    id: string;
    username: string;
    email: string;
    role: string;
}

interface RegisterResponse{
    message: string;
    username: string;
    role: string;
}

interface UserInfo {
    id: string;
    username: string;
    email: string;
    role: string;
}

/**
 * Servicio para gestionar la autenticacion con el backend.
 */
const AuthService = {
    /**
     * Inicia sesión con las credenciales proporcionadas.
     * @param credentials Datos de login (username, password)
     * @returns Datos del usuario y token JWT
     */
    login: async (credentials: AuthRequest): Promise<AuthResponse> => {
        try {
            return await apiService.post<AuthResponse>('/auth/login', credentials);
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            throw error;
        }
    },

    /**
     * Registra un nuevo usuario.
     * @param userData Datos del nuevo usuario (username, email, password)
     * @returns Confirmación de registro
     */
    register: async (userData: RegisterRequest): Promise<RegisterResponse> =>{
        try {
            return await apiService.post<RegisterResponse>('/auth/register', userData);
        } catch (error) {
            console.error('Error al registrar el usuario:', error);
            throw error;
        }
    },

    /**
     * Cierra sesión, eliminando el token y el usuario del almacenamiento local.
     */
    logout: async () => {
        try {
            await apiService.post('/auth/logout', {});
            // Limpiar almacenamiento local independientemente de la respuesta
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } catch (error) {
            console.error('Error en logout:', error);
            // Aun eliminamos el token localmente si hay un error en la API
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw error;            
        }
    },

    /**
     * Obtiene el usuario actual autenticado.
     * @returns Información del usuario autenticado
     */
    getCurrentUser: async (): Promise<UserInfo> => {
        try {
            return await apiService.get<UserInfo>('/auth/me');
        } catch (error) {
            console.error('Error al obtener el usuario actual:', error);
            throw error;
        }
    },

    /**
     * Verifica si hay un usuario autenticado
     * @returns true si hay un token valido
     */
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    }
};

export default AuthService;