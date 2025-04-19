// Enumaracion de estados de candidatura
export enum EstadoCandidatura{
    PENDIENTE = 'PENDIENTE',
    ENTREVISTA = "ENTREVISTA",
    SEGUNDA_ENTREVISTA = "SEGUNDA_ENTREVISTA",
    EN_PROCESO = "EN_PROCESO",
    ACEPTADA = "ACEPTADA",    
    RECHAZADA = "RECHAZADA",
    ARCHIVADA = "ARCHIVADA"
    
}

// Interfaz para datos de usuario
export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
}

// Interfaz relacionada con empresa
export interface Empresa {
    id: string;
    nombre: string;
    correo: string;
    telefono: string;
    userHasCandidatura?: boolean; // Indica si el usuario tiene candidaturas en esta empresa
}

export interface EmpresaDTO{
    nombre: string;
    correo?: string;
    telefono?: string;
}

export interface EmpresaWithUsersDTO{
    id: string;
    nombre: string,
    correo?: string;
    telefono?: string;
    usuariosAsociados: UserResumenDTO[];    
}

export interface EmpresaWithCandidaturas extends Empresa{
    candidaturas?: CandidaturaWithEmpresaDTO[];
}

export interface UserResumenDTO{
    id: string;
    username: string;
    numeroCandidaturas: number;
}

// Interfaz para datos de reclutadores
export interface Reclutador {
    id: string;
    nombre: string;
    empresa: Empresa;
    linkinUrl?: string;
}

export interface ReclutadorDTO {
    nombre: string;
    linkinUrl: string;
    empresaId: string;
}

export interface ReclutadorWithEmpresaDTO{
    id: string;
    nombre: string;
    linkinUrl?: string;
    empresa: Empresa;
}

// Interfaz para datos de candidatura completa
export interface Candidatura {
    id: string;
    empresa?: Empresa; 
    cargo: string;
    fecha: string;
    estado: EstadoCandidatura;
    notas: string;
    empresaId?: string; 
    reclutadores?: Reclutador[];
    userInfo?: UserResumenDTO; // Usuario asociado a la candidatura
}

// Interfaz para datos de pregunta
export interface Pregunta {
    id: string;
    pregunta: string;
    candidatura: Candidatura;
    usuario: User;
}

// DTOs para formularios

export interface AuthRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface CandidaturaDTO {
    id: string;
    empresaId: string;
    cargo: string;
    fecha: string;
    estado: EstadoCandidatura;
    notas: string;
    userInfo?: UserResumenDTO;
    reclutadores?: ReclutadorDTO[];
}

export interface CandidaturaWithEmpresaDTO{
    id: string;
    cargo: string;
    fecha: string;
    estado: EstadoCandidatura;
    notas: string;
    empresa: Empresa;
    reclutadoresIds?: string[];
    userInfo?: UserResumenDTO;
}


export interface PreguntaDTO {
    pregunta: string;
    candidaturaId: string;
}


// Tipos de respuesta de API

export interface Response<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
        offset: number;
        unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };
    numberOfElements: number;
    firts: boolean;
    empty: boolean;
}