

export enum CabanaEstadoId {
    DISPONIBLE = 1,
    MANTENIMIENTO = 2,
    OCUPADA = 3,
    ELIMINADO = 4,
}


export interface IEstadoCabana {
    nombre: string
    reservar(): CabanaEstadoId
    liberar(): CabanaEstadoId
    ponerEnMantenimiento(): CabanaEstadoId
    eliminar(): CabanaEstadoId
}