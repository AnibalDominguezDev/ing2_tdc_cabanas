import { IEstadoCabana, CabanaEstadoId } from './IEstadoCabana.ts'

export class EliminadoState implements IEstadoCabana {

    nombre = 'Eliminado'

    reservar(): CabanaEstadoId {
        throw new Error('No se puede reservar: la cabaña está eliminada')
    }

    liberar(): CabanaEstadoId {
        return CabanaEstadoId.DISPONIBLE
    }

    ponerEnMantenimiento(): CabanaEstadoId {
        throw new Error('No se puede poner en mantenimiento: la cabaña está eliminada')
    }

    eliminar(): CabanaEstadoId {
        throw new Error('La cabaña ya está eliminada')
    }
}