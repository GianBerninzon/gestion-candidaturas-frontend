import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const DEBUG_MODE = import.meta.env.DEV; //true en desarrollo, false en produccion


/**
 * Funcion util para decodificar tokens JWT y mostrar su contenido
 */
const decodeJWT = (token: string) => {
    try {
        const [headerB64, payloadB64] = token.split('.');

        // Convertir base64url a base64 estandar y decodificar
        const normalizeBase64 = (str: string) => str.replace(/-/g, '+').replace(/_/g, '/');
        const padding = (str: string) => '='.repeat((4- str.length % 4)% 4);

        const header = JSON.parse(atob(normalizeBase64(headerB64) + padding(headerB64)));
        const payload = JSON.parse(atob(normalizeBase64(payloadB64) + padding(payloadB64)));

        return { header, payload };
    } catch (error) {
        console.error('Error decodificando token SWT:', error);
        return null;
    }   
};

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
                    //config.headers.Authorization = `Bearer ${token}`;
                    // Verificar si el token ya incluye "Bearer " para evitar duplicados
                    const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
                    config.headers.Authorization = tokenValue;

                    if(DEBUG_MODE){
                        console.log(`🔒 Enviando solicitud con token: ${config.url} con token`);

                        // En desarrollo mostrar informacion mas detallada del token
                        const tokenData = decodeJWT(token.replace('Bearer ', ''));
                        if(tokenData){
                            console.log('📃 Contenido del token: ', tokenData);

                            //Verificar especificamente las authorities/roles
                            if(tokenData.payload.authorities){
                                console.log('👤 Roles del usuario:', tokenData.payload.authorities);
                            }else{
                                console.warn('⚠️ El token no contiene authorities/roles');
                            }
                        }
                    }
                }else if(DEBUG_MODE){
                    console.warn(`⚠️ Enviando solicitud a ${config.url} sin token`);
                }
                return config;
            },
            (error) => {
                console.error("❌ Error en la solicitud:", error);
                return Promise.reject(error);
            }
        );

        // Interceptor de respuesta para manehar errores de auteticacion
        this.api.interceptors.response.use(
            (response: AxiosResponse) => {
                if(DEBUG_MODE){
                    console.log(`✅ Respuesta exitosa de ${response.config.url}: ${response.status}`);
                }
                return response;
            },
            (error: AxiosError) => {
                if(DEBUG_MODE){
                    console.error("❌ Error de red o timeout:", error.response);
                    return Promise.reject(error);
                }

                const status = error.response?.status;
                const url = error.config?.url || 'desconocida';

                if(DEBUG_MODE){
                    console.error(`❌  Error ${status} en ${url}`, error.response?.data);

                    //Informacion adicional de depuracion
                    // console.log('📋 Detalles de la solicitud:', {
                    //     metodo: error.config?.method?.toUpperCase(),
                    //     url: error.config?.url,
                    //     headers: error.config?.headers,
                    //     datos: error.config?.data ? JSON.parse(error.config.data) : null
                    // });
                    // Para errores 500, mostrar mas detalles de depuracion
                    if(status === 500){
                        console.error('💥 Error 500: Error interno del servidor');
                        console.log('URL completa:', `${this.api.defaults.baseURL}${url}`);
                        console.log('Metodo:', error.config?.method?.toUpperCase());
                        console.log('Headers', error.config?.headers);
                        console.log('Params:', error.config?.params);

                        if(error.config?.data){
                            try {
                                console.log('Datos enviados:', JSON.parse(error.config.data));
                            } catch (e) {
                                console.log('Datos enviados (raw):', error.config.data);
                            }
                        }

                    }
                }

                //Manejar errores especificos
                if (status === 401) {
                    console.log('🔑 Error 401: sesion expirada o credenciales invalidas');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    if(!window.location.pathname.includes('/login')){
                        window.location.href = '/login';
                    }
                    
                }else if(status === 403){
                        console.error('🚫 Error 403: No tiene permisos para realizar esta accion');

                        // Verificar autorizacion
                        const token = localStorage.getItem('token');
                        if(token && DEBUG_MODE){
                            const tokenData = decodeJWT(token.replace('Bearer ', ''));
                            console.log('📝 Verificación de permisos:');
                            console.log('- Token presente:', !!token);
                            console.log('- Formato correcto:', token.startsWith('Bearer '));
                            console.log('- Contenido:', tokenData);
                        }

                }else if(status === 404){
                        console.error('🔍 Error 404: Recurso no encontrado');
                        console.log('URL solicitada:', url);
                } else if(status === 500){
                        console.error('💥 Error 500: Error interno del servidor')
                }

                return Promise.reject(error);
            }
        );
    }

    // Metodos genericos para opercaciones CRUD
    async get<T>(url: string, params?: any, config?: AxiosRequestConfig) {
        try {
            const requestConfig = { ...config, params};
            if(DEBUG_MODE){
                console.log(`📤 GET ${url} con parametros:`, params);
            }
            const response = await this.api.get<T>(url, requestConfig);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'GET', url, params);
            throw error;
        }
    }

    async post<T>(url: string, data: any, config?:AxiosRequestConfig) {
        try {
            if(DEBUG_MODE) {
                console.log(`📤 POST ${url} con datos:`, data);
            }
            const response = await this.api.post<T>(url, data, config);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'POST', url, null, data);
            throw error;
        }
    }

    async put<T>(url: string, data: any, config?: AxiosRequestConfig) {
        try {
            if(DEBUG_MODE) {
                console.log(`📤 PUT ${url} con datos:`, data);
            }
            const response = await this.api.put<T>(url, data, config);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'PUT', url, null, data);
            throw error;
        }
    }

    async patch<T>(url: string, data: any, config?: AxiosRequestConfig) {
    try {
        if(DEBUG_MODE) {
            console.log(`📤 PATCH ${url} con datos:`, data);
        }
        const response = await this.api.patch<T>(url, data, config);
        return response.data;
    } catch (error) {
        this.handleApiError(error, 'PATCH', url, null, data);
        throw error;
    }
}

    async delete<T>(url: string, config?: AxiosRequestConfig) {
        try {
            if(DEBUG_MODE) {
                console.log(`📤 DELETE ${url}`);
            }
            const response = await this.api.delete<T>(url, config);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'DELETE', url);
            throw error;
        }
    }
    
    // Metodo especifico para manejar errores de API
    private handleApiError(error: any, method: string, url: string, params?: any, data?: any){
        if(DEBUG_MODE){
            console.error(`❌ Error en ${method} ${url}:`, error);

            if (error.response){
                console.error('📄 Detalles del error: ', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                });

                //Informacion adicional para depuracion especifica segun el tipo de error
                if(error.response.status === 500){
                    console.error('💥 Error interno del servidor (500)');
                    console.log('Parámetros:', params);
                    console.log('Datos enviados:', data);
                    console.log('URL completa:', `${this.api.defaults.baseURL}${url}`);
                }
            }
        }
    }
}

export const apiService = new ApiService();
export default apiService;