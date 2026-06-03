

// Usamos un Enum para no tener "números mágicos" regados por el código
export enum CabanaEstadoId {
    DISPONIBLE = 1,
    OCUPADA = 2,
    MANTENIMIENTO = 3,
    ELIMINADO = 4,
}

// El contrato de lo que una cabaña puede intentar hacer
export interface IEstadoCabana {
    nombre: string
    reservar(): CabanaEstadoId
    liberar(): CabanaEstadoId
    ponerEnMantenimiento(): CabanaEstadoId
    eliminar(): CabanaEstadoId
}