import apiService from './api';
import { Candidatura, CandidaturaDTO, Response, Empresa, CandidaturaWithEmpresaDTO } from '@/types';


const BASE_URL = '/candidaturas';

/**
 * Servicio para Gestionar todas las operaciones CRUD de candidaturas
 */
class CandidaturasService {
  /**
   * Obtiene todas las candidaturas con paginación
   * @param page Número de página
   * @param size Tamaño de página
   * @param estado Estado de candidatura (opcional)
   * @param search Texto de búsqueda (opcional)
   */
  async getCandidaturas(page = 0, size = 10, estado?: string, texto?: string){
    let endpoint = BASE_URL;

    //Si se proporciona algun filtro, usamos el endpoint de busqueda
    if(estado || texto){
      endpoint = `${BASE_URL}/buscar`;
    }

    const params: any ={
      page,
      size,
      sort: 'fecha,desc'
    };

    if(estado) params.estado = estado;
    if(texto) params.q = texto;

    console.log(`Solicitando candidaturas desde ${endpoint} con parametros:`, params);

    try {
      const response = await apiService.get<Response<Candidatura>>(endpoint, params);
      return response;
    } catch (error) {
      console.error('Error en getCandidaturas', error);
      throw error;
    }
  }

  /**
   * Obtiene una candidatura por su ID
   * @param id ID de la candidatura
   */
  async getCandidaturaById(id: string) {
    return apiService.get<CandidaturaWithEmpresaDTO>(`${BASE_URL}/${id}`);
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
    return apiService.patch<Candidatura>(`${BASE_URL}/${id}/estado?estado=${estado}`, {});
  }

  /**
   * Busca candidaturas con filtros
   * @param estado Estado de la candidatura
   * @param empresa Nombre de la empresa
   * @param fechaDesde Fecha incial
   * @param fechaHasta Fecha final
   * @param q Termino de búsqueda
   * @param page Numero de pagina
   * @param size Tamaño de pagina
   */
  async buscar(estado?: string, empresa?: string, fechaDesde?: Date, fechaHasta?: Date, q?: string, page=0,size=10){
    const params :any ={
      page,
      size,
      sort: 'fecha,desc'
    };

    if(estado) params.estado = estado;
    if(empresa) params.empresa = empresa;
    if(fechaDesde) params.fechaDesde = fechaDesde.toISOString().split('T')[0];
    if(fechaHasta) params.fechaHasta = fechaHasta.toISOString().split('T')[0];
    if(q) params.q = q;

    console.log('Buscando candidaturas con filtros:', params);
    return apiService.get<Response<Candidatura>>(`${BASE_URL}/buscar`, params);
  }

  /**
   * Asigna un reclutador a una candidatura
   * @param candidaturaId ID de la candidatura
   * @param reclutadorId ID del reclutador
   */
  async asignarReclutador(candidaturaId: string, reclutadorId: string) {
    return apiService.post<Candidatura>(`/reclutador/${reclutadorId}/candidaturas/${candidaturaId}`, {});
  }

  /**
   * Elimina un reclutador de una candidatura
   * @param candidaturaId ID de la candidatura
   * @param reclutadorId ID del reclutador
   */
  async eliminarReclutador(candidaturaId: string, reclutadorId: string) {
    return apiService.delete(`/reclutador/${reclutadorId}/candidaturas/${candidaturaId}`);
  }
  
  /**
   * Filtra candidaturas (para administradores puede filtrar todas las candidaturas)
   * @param q Término de búsqueda general
   * @param usuario ID o username del usuario (solo para administradores)
   * @param page Número de página
   * @param size Tamaño de página
   */
  async filtrar(q?: string, usuario?: string, page=0, size=10){
    const params: any = {
      page,
      size,
      sort: 'fecha,desc'
    };

    if(q) params.q = q;
    if(usuario) params.usuario = usuario;

    console.log('Filtrando candidaturas con parámetros:', params);

    return apiService.get<Response<CandidaturaWithEmpresaDTO>>(`${BASE_URL}/filtrar`, params);
  }

  /**
   * Elimina multiples candidaturas por sus IDs
   * @param ids Lista de IDs de candidaturas a eliminar
   * @returns Respuesta con la cantidad de candidaturas eliminadas
   */
  async deleteCandidaturasBatch(ids: string[]){
    console.log(`Eliminando ${ids.length} candidaturas: `, ids);
    return apiService.delete<{eliminadas: number, total: number}>(`${BASE_URL}/batch`, {data: ids});
  }

}

export const candidaturasService = new CandidaturasService();
export default candidaturasService;
