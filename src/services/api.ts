import axios, { AxiosError, AxiosInstance } from "axios";

class ApiService{
    private api: AxiosInstance;

    constructor(){
        this.api = axios.create({
            baseURL: '/api',
            headers: {
                'Content-Type': 'application/json',
            },
            });
            this.setupInterceptors();
    }

    private setupInterceptors(){
        // Interceptor de solicitud para añadir token JWT
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Interceptor de respuesta para manehar errores de auteticacion
        this.api.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response && error.response.status === 401) {
                    // Redirigir al login o refrescar token
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Metodos genericos para opercaciones CRUD
    async get<T>(url: string, params?: any) {
        const response = await this.api.get(url, { params });
        return response.data;
    }

    async post<T>(url: string, data: any) {
        const response = await this.api.post<T>(url, data);
        return response.data;
    }

    async put<T>(url: string, data: any) {
        const response = await this.api.put<T>(url, data);
        return response.data;
    }

    async patch<T>(url: string, data: any) {
        const response = await this.api.patch<T>(url, data);
        return response.data;
    }

    async delete<T>(url: string) {
        const response = await this.api.delete<T>(url);
        return response.data;
    }   
}

export const apiService = new ApiService();
export default apiService;