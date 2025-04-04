// Modelos basados en las entidades del backend

export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
}

export interface Empresa {
    id: string;
    nombre: string;
    correo: string;
    telefono: string;
    fechaCreacion: string;
    fechaActualizacion: string;
}

export interface Reclutador {
    id: string;
    nombre: string;
    empresa: Empresa;
    linkedinUrl?: string;
    telefono?: string;
}

export enum EstadoCandidatura{
    PENDIENTE = 'PENDIENTE',
    ENTREVISTA = "ENTREVISTA",
    SEGUNDA_ENTREVISTA = "SEGUNDA_ENTREVISTA",
    EN_PROCESO = "EN_PROCESO",
    ACEPTADA = "ACEPTADA",    
    RECHAZADA = "RECHAZADA",
    ARCHIVADA = "ARCHIVADA"
    
}

export interface Candidatura {
    id: string;
    empresa: Empresa;
    cargo: string;
    fecha: string;
    estado: EstadoCandidatura;
    notas: string;
    reclutadores?: Reclutador[];
}

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
    rol?: string;
}

export interface CandidaturaDTO {
    empresaId: string;
    cargo: string;
    fecha: string;
    estado: EstadoCandidatura;
    notas: string;
}

export interface EmpresaDTO {
    nombre: string;
    correo: string;
    telefono: string;
}

export interface ReclutadorDTO {
    nombre: string;
    linkedinUrl: string;
    empresaId: string;
    telefono?: string;
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