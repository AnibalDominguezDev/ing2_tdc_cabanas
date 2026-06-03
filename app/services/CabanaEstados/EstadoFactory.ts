
import { IEstadoCabana, CabanaEstadoId } from './IEstadoCabana.ts'
import { DisponibleState } from './DisponibleState.ts'
import { MantenimientoState } from './MantenimientoState.ts'
import { OcupadaState } from './OcupadaState.ts'
import { EliminadoState } from './EliminadoState.ts'

export class EstadoCabanaFactory {
    static fabricar(idEstado: number): IEstadoCabana {
        switch (idEstado) {
            case CabanaEstadoId.DISPONIBLE:
                return new DisponibleState()
            case CabanaEstadoId.OCUPADA:
                return new OcupadaState()
            case CabanaEstadoId.MANTENIMIENTO:
                return new MantenimientoState()
            case CabanaEstadoId.ELIMINADO:
                return new EliminadoState()
            default:
                throw new Error('Estado de cabaña desconocido.')
        }
    }
}