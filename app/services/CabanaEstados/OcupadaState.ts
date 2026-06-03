import { IEstadoCabana, CabanaEstadoId } from './IEstadoCabana.ts'

export class OcupadaState implements IEstadoCabana {


    nombre = 'Ocupada'

    reservar(): CabanaEstadoId {
        throw new Error('No se puede reservar: la cabaña ya está ocupada.')
    }

    liberar(): CabanaEstadoId {

        return CabanaEstadoId.DISPONIBLE
    }

    ponerEnMantenimiento(): CabanaEstadoId {
        throw new Error('No se puede reparar: hay huéspedes en la cabaña.')
    }

    eliminar(): CabanaEstadoId {
        throw new Error('No se puede eliminar: hay huéspedes en la cabaña.')
    }
}