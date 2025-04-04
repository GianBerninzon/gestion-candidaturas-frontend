import apiService from './api';
import { Candidatura, CandidaturaDTO, Response } from '@/types';

const BASE_URL = '/candidaturas';

/**
 * Servicio para gestionar las operaciones CRUD de candidaturas
 */
class CandidaturasService {
  /**
   * Obtiene todas las candidaturas con paginación
   * @param page Número de página
   * @param size Tamaño de página
   * @param search Texto de búsqueda (opcional)
   * @param estado Estado de candidatura (opcional)
   */
  async getCandidaturas(page = 0, size = 10, search?: string, estado?: string) {
    const params = { page, size, search, estado };
    return apiService.get<Response<Candidatura>>(BASE_URL, params);
  }

  /**
   * Obtiene una candidatura por su ID
   * @param id ID de la candidatura
   */
  async getCandidaturaById(id: string) {
    return apiService.get<Candidatura>(`${BASE_URL}/${id}`);
  }

  /**
   * Crea una nueva candidatura
   * @param candidatura Datos de la candidatura a crear
   */
  async createCandidatura(candidatura: CandidaturaDTO) {
    return apiService.post<Candidatura>(BASE_URL, candidatura);
  }

  /**
   * Actualiza una candidatura existente
   * @param id ID de la candidatura a actualizar
   * @param candidatura Datos actualizados de la candidatura
   */
  async updateCandidatura(id: string, candidatura: CandidaturaDTO) {
    return apiService.put<Candidatura>(`${BASE_URL}/${id}`, candidatura);
  }

  /**
   * Elimina una candidatura
   * @param id ID de la candidatura a eliminar
   */
  async deleteCandidatura(id: string) {
    return apiService.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Actualiza el estado de una candidatura
   * @param id ID de la candidatura
   * @param estado Nuevo estado
   */
  async updateEstado(id: string, estado: string) {
    return apiService.patch<Candidatura>(`${BASE_URL}/${id}/estado`, { estado });
  }

  /**
   * Asigna un reclutador a una candidatura
   * @param candidaturaId ID de la candidatura
   * @param reclutadorId ID del reclutador
   */
  async asignarReclutador(candidaturaId: string, reclutadorId: string) {
    return apiService.post<Candidatura>(`${BASE_URL}/${candidaturaId}/reclutadores/${reclutadorId}`, {});
  }

  /**
   * Elimina un reclutador de una candidatura
   * @param candidaturaId ID de la candidatura
   * @param reclutadorId ID del reclutador
   */
  async eliminarReclutador(candidaturaId: string, reclutadorId: string) {
    return apiService.delete(`${BASE_URL}/${candidaturaId}/reclutadores/${reclutadorId}`);
  }
}

export const candidaturasService = new CandidaturasService();
export default candidaturasService;
