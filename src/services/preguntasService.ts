import { Pregunta, PreguntaDTO, Response } from "@/types";
import apiService from "./api";

const BASE_URL = '/preguntas';

/**
 * Servicio para gestionar todas las operaciones CRUD de preguntas de entrevista
 */
class PreguntasService {
 /**
  * Obtiene todas las preguntas asociadas a una candidatura con paginación 
  * @param candidaturaId ID de la candidatura
  * @param page número de página
  * @param size número de elementos por página
  */
 async getPreguntasByCandidatura(candidaturaId: string, page = 0, size =10){
    const params = {
        candidaturaId,
        page,
        size,
        sort: 'id,asc'
    };
    return apiService.get<Response<Pregunta>>(`${BASE_URL}`, params);
 }

 /**
  * Obtiene el número de preguntas de una candidatura
  * @param candidaturaId de la candidatura
  */
 async getCountByCandidatura(candidaturaId: string){
    return apiService.get<number>(`${BASE_URL}/count`, {candidaturaId});
 }

 /**
  * Crea una nueva pregunta
  * @param pregunta Datos de la empresa a crear
  */
 async createPregunta(pregunta: PreguntaDTO){
    return apiService.post<Pregunta>(BASE_URL, pregunta);
 }

 /**
  * Actualiza una pregunta existente
  * @param id ID de la pregunta
  * @param pregunta Datos actualizados de la pregunta
  */
 async updatePregunta(id: string, pregunta: PreguntaDTO){
    return apiService.put<Pregunta>(`${BASE_URL}/${id}`, pregunta);
 }
 /**
  * Elimina una pregunta
  * @param id ID de la pregunta a eliminar
  */
 async deletePregunta(id: string){
    return apiService.delete(`${BASE_URL}/${id}`);
 }

 /**
  * Eliminar múltiples preguntas
  * @param ids IDs de las preguntas a eliminar
  */
 async deletePreguntasBatch(ids: string[]){
    //convertimos el array a string para la URL
    return Promise.all(ids.map(id => this.deletePregunta(id)));
 }
}

export const preguntasService = new PreguntasService();
export default preguntasService;
