import apiService from './api';
import { Reclutador, ReclutadorDTO, Response } from '@/types';

const BASE_URL = '/reclutadores';

/**
 * Servicio para gestionar las operaciones CRUD de reclutadores
 */
class ReclutadoresService {
  /**
   * Obtiene todos los reclutadores con paginación
   * @param page Número de página
   * @param size Tamaño de página
   * @param search Texto de búsqueda (opcional)
   * @param empresaId ID de empresa para filtrar (opcional)
   */
  async getReclutadores(page = 0, size = 10, search?: string, empresaId?: string) {
    const params = { page, size, search, empresaId };
    return apiService.get<Response<Reclutador>>(BASE_URL, params);
  }

  /**
   * Obtiene un reclutador por su ID
   * @param id ID del reclutador
   */
  async getReclutadorById(id: string) {
    return apiService.get<Reclutador>(`${BASE_URL}/${id}`);
  }

  /**
   * Crea un nuevo reclutador
   * @param reclutador Datos del reclutador a crear
   */
  async createReclutador(reclutador: ReclutadorDTO) {
    return apiService.post<Reclutador>(BASE_URL, reclutador);
  }

  /**
   * Actualiza un reclutador existente
   * @param id ID del reclutador a actualizar
   * @param reclutador Datos actualizados del reclutador
   */
  async updateReclutador(id: string, reclutador: ReclutadorDTO) {
    return apiService.put<Reclutador>(`${BASE_URL}/${id}`, reclutador);
  }

  /**
   * Elimina un reclutador
   * @param id ID del reclutador a eliminar
   */
  async deleteReclutador(id: string) {
    return apiService.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Obtiene todas las candidaturas asignadas a un reclutador
   * @param id ID del reclutador
   */
  async getCandidaturasByReclutador(id: string) {
    return apiService.get(`${BASE_URL}/${id}/candidaturas`);
  }
}

export const reclutadoresService = new ReclutadoresService();
export default reclutadoresService;
