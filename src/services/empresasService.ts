import apiService from './api';
import { Empresa, EmpresaDTO, Response } from '@/types';

const BASE_URL = '/empresas';

/**
 * Servicio para gestionar las operaciones CRUD de empresas
 */
class EmpresasService {
  /**
   * Obtiene todas las empresas con paginación
   * @param page Número de página
   * @param size Tamaño de página
   * @param search Texto de búsqueda (opcional)
   */
  async getEmpresas(page = 0, size = 10, search?: string) {
    const params = { page, size, search };
    return apiService.get<Response<Empresa>>(BASE_URL, params);
  }

  /**
   * Obtiene una empresa por su ID
   * @param id ID de la empresa
   */
  async getEmpresaById(id: string) {
    return apiService.get<Empresa>(`${BASE_URL}/${id}`);
  }

  /**
   * Crea una nueva empresa
   * @param empresa Datos de la empresa a crear
   */
  async createEmpresa(empresa: EmpresaDTO) {
    return apiService.post<Empresa>(BASE_URL, empresa);
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
   * Elimina una empresa
   * @param id ID de la empresa a eliminar
   */
  async deleteEmpresa(id: string) {
    return apiService.delete(`${BASE_URL}/${id}`);
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
}

export const empresasService = new EmpresasService();
export default empresasService;
