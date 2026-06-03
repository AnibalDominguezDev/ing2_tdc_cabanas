import { IEstadoCabana, CabanaEstadoId } from './IEstadoCabana.ts'

export class MantenimientoState implements IEstadoCabana {

    nombre = 'Mantenimiento'

    reservar(): CabanaEstadoId {
        throw new Error('No se puede reservar: la cabaña está en reparaciones.')
    }

    liberar(): CabanaEstadoId {

        return CabanaEstadoId.DISPONIBLE
    }

    ponerEnMantenimiento(): CabanaEstadoId {
        throw new Error('La cabaña ya se encuentra en mantenimiento.')
    }

    eliminar(): CabanaEstadoId {
        return CabanaEstadoId.ELIMINADO
    }
}