import apiService from './api';
import { CandidaturaWithEmpresaDTO, Reclutador, ReclutadorDTO, ReclutadorWithEmpresaDTO, Response } from '@/types';

const BASE_URL = '/reclutador';

/**
 * Servicio para gestionar las operaciones CRUD de reclutadores
 */
class ReclutadoresService {
  /**
   * Obtiene todos los reclutadores con paginación
   * @param page Número de página
   * @param size Tamaño de página
   */
  async getReclutadores(page = 0, size = 10) {
    try {
      const params = { page, size, sort: 'nombre, asc' };
      const response = await apiService.get<Response<ReclutadorWithEmpresaDTO>>(BASE_URL, params);
      return response;
    } catch (error) {
      console.error('Error en getReclutadores:', error);
      throw error;
    }
  }

  /**
   * Obtiene un reclutador por su ID
   * @param id ID del reclutador
   */
  async getReclutadorById(id: string) {
    return apiService.get<ReclutadorWithEmpresaDTO>(`${BASE_URL}/${id}`);
  }

  /**
   * Obtiene los reclutadores de una empresa especifica
   * @param empresaId ID de la empresa
   * @param page Numero de pagina
   * @param size Tamaño de pagina
   */
  async getReclutadoresByEmpresa(empresaId: string, page = 0, size= 10){
    try {
      const params = { page, size, sort :'nombre, asc'};
      const response = await apiService.get<Response<any>>(`${BASE_URL}/empresa/${empresaId}`, params);
      return response;
    } catch (error) {
      console.error(`Erro en getReclutadoresByEmpresa para empresa ${empresaId}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo reclutador (para administradores)
   * @param reclutador Datos del reclutador a crear
   */
  async createReclutador(reclutador: ReclutadorDTO) {
    return apiService.post<Reclutador>(BASE_URL, reclutador);
  }

  /**
   * Crea un reclutador dudante el proceso de gestion de candidaturas
   * @param reclutador Datos del reclutador a crear
   */
  async createReclutadorWithCandidatura(reclutador: ReclutadorDTO){
    return apiService.post<Reclutador>(`${BASE_URL}/crear-con-candidatura`,reclutador);
  }

  /**
   * Actualiza un reclutador existente (para administradores)
   * @param id ID del reclutador a actualizar
   * @param reclutador Datos actualizados del reclutador
   */
  async updateReclutador(id: string, reclutador: ReclutadorDTO) {
    return apiService.put<Reclutador>(`${BASE_URL}/${id}`, reclutador);
  }

  /**
   * Actualiza un reclutador por un usuario regular (solo los asociados a sus candidaturas)
   * @param id ID del reclutador a actualizar
   * @param reclutador Datos actualizados del reclutador
   */
  async updateReclutadorByUser(id: string, reclutador: ReclutadorDTO){
    return apiService.put<Reclutador>(`${BASE_URL}/${id}/user-update`, reclutador);
  }

  /**
   * Elimina un reclutador (solo para administradores)
   * @param id ID del reclutador a eliminar
   */
  async deleteReclutador(id: string) {
    return apiService.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Asocia un reclutador a una candidatura
   * @param reclutadorId ID del reclutador
   * @param candidaturaId ID de la candidatura
   */
  async asociarACandidatura(reclutadorId: string, candidaturaId: string){
    return apiService.post(`${BASE_URL}/${reclutadorId}/candidaturas/${candidaturaId}`,{});
  }

  /**
   * Desasocia un reclutador de una candidatura
   * @param reclutadorId ID del reclutador
   * @param candidaturaId ID de la candidatura
   */
  async desasociarDeCandidatura(reclutadorId: string, candidaturaId: string){
    return apiService.delete(`${BASE_URL}/${reclutadorId}/candidaturas/${candidaturaId}`);
  }

  /**
   * Obtiene las candidaturas asociadas a un reclutador con paginacion
   * 
   * @param reclutadorId ID del reclutador
   * @param page Numero de pagina
   * @param size Tamaño de pagina
   */
  async getCandidaturasByReclutador(reclutadorId: string, page = 0, size = 10){
    const params = { page, size, sort: 'fecha, desc'};
    return apiService.get<Response<CandidaturaWithEmpresaDTO>>(`${BASE_URL}/${reclutadorId}/candidaturas`, params);
  }
}

export const reclutadoresService = new ReclutadoresService();
export default reclutadoresService;
