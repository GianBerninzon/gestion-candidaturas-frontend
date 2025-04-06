import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const DEBUG_MODE = import.meta.env.DEV; //true en desarrollo, false en produccion

class ApiService{
    private api: AxiosInstance;
    private isRefreshing = false;
    private failedQueue: any[] = [];

    constructor(){
        this.api = axios.create({
            baseURL: '/api',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 segundos
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
                    if(DEBUG_MODE){
                        console.log(`Enviando solicitud con token: ${config.url}`);
                    }
                }
                return config;
            },
            (error) => {
                console.error("Error en la solicitud:", error);
                return Promise.reject(error);
            }
        );

        // Interceptor de respuesta para manehar errores de auteticacion
        this.api.interceptors.response.use(
            (response: AxiosResponse) => {
                if(DEBUG_MODE){
                    console.log(`Respuesta exitosa de ${response.config.url}: ${response.status}`);
                }
                return response;
            },
            (error: AxiosError) => {
                if(DEBUG_MODE){
                    console.error("Error en respuesta:", error.response);
                }

                //Manejar errores especificos
                if (error.response) {
                    // El servidor respondio con un codigo de error
                    const status = error.response.status;

                    if(status === 401){
                        // Token expirado o invalido
                        console.log('Error 401: sesion expirada o credenciales invalidas');

                        //Limpiar datos de autenticacion
                        localStorage.removeItem('token');

                        // Redirigir al login si no estamos ya en la pagina de login
                        if(!window.location.pathname.includes('/login')){
                            window.location.href = '/login';
                        }
                    } else if(status === 403){
                        console.error('Error 403: No tiene permisos para realizar esta accion');
                    }else if(status === 404){
                        console.error('Error 404: Recurso no encontrado');
                    } else if(status === 500){
                        console.error('Error 500: Error interno del servidor')
                    }
                }else if(error.request){
                    // La peticion fue realizada pero no se recibio respuesta
                    console.error('Sin responesta del servidor: ' + error.request);
                }else {
                    // Algo ocurrio al configurar la peticion
                    console.error('Error al configurar la peticion: ' + error.message);
                }
                return Promise.reject(error);
            }
        );
    }

    // Metodos genericos para opercaciones CRUD
    async get<T>(url: string, params?: any, config?: AxiosRequestConfig) {
        try {
            const response = await this.api.get<T>(url, { ...config, params });
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'GET', url);
            throw error;
        }
    }

    async post<T>(url: string, data: any, config?:AxiosRequestConfig) {
        try {
            const response = await this.api.post<T>(url, data, config);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'POST', url);
            throw error;
        }
    }

    async put<T>(url: string, data: any, config?: AxiosRequestConfig) {
        try {
            const response = await this.api.put<T>(url, data, config);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'PUT', url);
            throw error;
        }
    }

    async patch<T>(url: string, data: any, config?: AxiosRequestConfig) {
    try {
        const response = await this.api.patch<T>(url, data, config);
        return response.data;
    } catch (error) {
        this.handleApiError(error, 'PATCH', url);
        throw error;
    }
}

    async delete<T>(url: string, config?: AxiosRequestConfig) {
        try {
            const response = await this.api.delete<T>(url, config);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'DELETE', url);
            throw error;
        }
    }
    
    // Metodo especifico para manejar errores de API
    private handleApiError(error: any, method: string, url: string){
        if(DEBUG_MODE){
            console.error(`Error en ${method} ${url}:`, error);

            if (error.response){
                console.error('Detalles del error: ', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                });
            }
        }
    }
}

export const apiService = new ApiService();
export default apiService;