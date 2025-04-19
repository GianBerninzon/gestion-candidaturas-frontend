import apiService from './api';
import { Candidatura, Empresa, EmpresaDTO, EmpresaWithCandidaturas, EmpresaWithUsersDTO, Response } from '@/types';

const BASE_URL = '/empresas';

/**
 * Servicio para gestionar las operaciones CRUD de empresas
 */
class EmpresasService {
  /**
   * Obtiene todas las empresas con paginación
   * @param page Número de página
   * @param size Tamaño de página
   */
  async getEmpresas(page = 0, size = 10) {
    try {
      const params = { page, size, sort: 'nombre, asc' };
      const response = await apiService.get<Response<Empresa>>(BASE_URL, params);
      return response;
    }catch (error){
      console.error('Error en getEmpresas:', error);
      throw error;
    }
  }

  /**
   * Obtiene una empresa por su ID
   * @param id ID de la empresa
   */
  async getEmpresaById(id: string, includeCandidatuas: boolean = false): Promise<Empresa | EmpresaWithCandidaturas> {
    try {
      const url = includeCandidatuas
        ? `${BASE_URL}/${id}?includeCandidaturas=true`
        : `${BASE_URL}/${id}`;
      const response = await apiService.get<Empresa | EmpresaWithCandidaturas>(url);
      console.log('Respuesta del backend para empresa:', response);
      return response;
    } catch (error) {
      console.error(`Error al obtener empresa ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca empresas por nombre
   * @param nombre Texto para buscar en el nombre de la empresa
   * @param page Numero de pagina
   * @param size Tamaño de pagina
   */
  async buscarPorNombre(nombre: string, page = 0, size = 10){
    try {
      const params = { nombre, page, size, sort: 'nombre, asc' };
      const response = await apiService.get<Response<Empresa>>(`${BASE_URL}/buscar`, params);
      return response;
    } catch (error) {
      console.error('Error al buscar empresas:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva empresa (solo para administradores)
   * @param empresa Datos de la empresa a crear
   */
  async createEmpresa(empresa: EmpresaDTO) {
    return apiService.post<Empresa>(BASE_URL, empresa);
  }  

  /**
   * Crea una empresa durante el proceso de registro de candidatura
   * @param empresa Datos de la empresa a crear
   */
  async createEmpresaWithCandidatura(empresa: EmpresaDTO){
    return apiService.post<Empresa>(`${BASE_URL}/crear-con-candidatura`, empresa);
  }

  /**
   * Actualiza una empresa existente
   * @param id ID de la empresa a actualizar
   * @param empresa Datos actualizados de la empresa
   */
  async updateEmpresa(id: string, empresa: EmpresaDTO) {
    return apiService.put<Empresa>(`${BASE_URL}/${id}`, empresa);
  }

  /**
   * Actualiza una empresa por un usuario regutlar (solo las propias)
   * @param id ID de la empresa a actualizar
   * @param empresa Datos actualizados de la empresa
   */
  async updateEmpresaByUser(id: string, empresa: EmpresaDTO){
    return apiService.put<Empresa>(`${BASE_URL}/${id}`, empresa);
  }

  /**
   * Obtiene empresas con informacion de usuario asociados (Solo administradores)
   */
  async getEmpresasWithUsers(): Promise<EmpresaWithUsersDTO[]>{
    return apiService.get<EmpresaWithUsersDTO[]>(`${BASE_URL}/with-users`);
  }
  /**
   * Cache de empresas para rendimiento
   * Este es un metodo opcional para mejorar el rendimiento evitando llamadas repetidas a la API
   * @param id ID de la empresa
   */
  private empresaCache = new Map<string, Empresa>();

  /**
   * Obtiene una empresa del cache o desde la API si no esta en cache
   * @param id ID de la empresa
   */
  async getEmpresaCached(id: string): Promise<Empresa>{
    // Si ya tenemos la empresa en cache, la devolvemos
    if(this.empresaCache.has(id)){
      return this.empresaCache.get(id) as Empresa;
    }

    // Si no esta en cache, la buscamos en el servidor
    try {
      const empresa = await this.getEmpresaById(id);
      // Guardar en cache para futuras consultas
      this.empresaCache.set(id, empresa);
      return empresa;
    } catch (error) {
      console.error(`Error al obtener empresa ${id} (cached)`, error);
      // Devolvemos null en caso de error para manejar estos casos en la UI
      throw error;
    }
  }
  
  /**
   * Elimina una empresa
   * @param id ID de la empresa a eliminar
   */
  async deleteEmpresa(id: string) {
    return apiService.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Elimina multiples empresas por sus IDs
   * @param ids Array de IDs de empresas a eliminar
   * @returns ResponseEntity con el número de empresas eliminadas.
   */
  async deleteEmpresasBatch(ids: string[]) {
    return apiService.delete(`${BASE_URL}/batch`, { data: ids });
  }

  /**
   * Obtiene todos los reclutadores de una empresa
   * @param id ID de la empresa
   */
  async getReclutadoresByEmpresa(id: string) {
    return apiService.get(`${BASE_URL}/${id}/reclutadores`);
  }

  /**
   * Obtiene todas las candidaturas de una empresa
   * @param id ID de la empresa
   */
  async getCandidaturasByEmpresa(id: string) {
    return apiService.get(`${BASE_URL}/${id}/candidaturas`); 
  }

  /**
   * Busca la empresa asociada a una candidatura
   * Este metodo realiza una logica especial para intentar encontrar
   * la empresa correcta cuando no tenemos el empresaId directamente
   * @param id ID de la candidatura
   */
  async findEmpresaForCandidatura(candidaturaId: string): Promise<Empresa | null>{
    try {
      const detalleCandidatura = await apiService.get<Candidatura>(`/candidaturas/${candidaturaId}`);

      if(detalleCandidatura.empresa && detalleCandidatura.empresa.id){
        const empresaId = detalleCandidatura.empresa.id;
        return await this.getEmpresaCached(empresaId);
      }
      return null;
    } catch (error) {
      console.error(`Error al buscar empresa para candidatura ${candidaturaId}:`, error);
      return null;
    }
  }

  /**
   * Limpiar el cache de empresas
   */
  clearCache(){
    this.empresaCache.clear;
  }
}

export const empresasService = new EmpresasService();
export default empresasService;
