import { IEstadoCabana, CabanaEstadoId } from './IEstadoCabana.ts'

export class DisponibleState implements IEstadoCabana {

    nombre = 'Disponible'

    reservar(): CabanaEstadoId {

        return CabanaEstadoId.OCUPADA
    }

    liberar(): CabanaEstadoId {
        throw new Error('La cabaña ya se encuentra disponible.')
    }

    ponerEnMantenimiento(): CabanaEstadoId {
        return CabanaEstadoId.MANTENIMIENTO
    }

    eliminar(): CabanaEstadoId {
        return CabanaEstadoId.ELIMINADO
    }
}
