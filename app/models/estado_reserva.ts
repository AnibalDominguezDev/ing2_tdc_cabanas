import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Reserva from '#models/reserva'

export default class EstadoReserva extends BaseModel {

    public static table = 'estado_reserva'

    @column({ isPrimary: true, columnName: 'id_estado_reserva' })
    declare id: number

    @column()
    declare estado: string

    // --- Relaciones ---
    @hasMany(() => Reserva, { foreignKey: 'idEstadoReserva' })
    declare reservas: HasMany<typeof Reserva>
}