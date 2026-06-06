import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Cabana from '#models/cabana'
import Huesped from '#models/huesped'
import EstadoReserva from '#models/estado_reserva'

export default class Reserva extends BaseModel {
    @column({ isPrimary: true, columnName: 'id_reserva' })
    declare id: number

    @column.date()
    declare fechaInicio: DateTime

    @column.date()
    declare fechaFin: DateTime

    @column()
    declare precioTotal: number

    @column({ columnName: 'id_cabana' })
    declare cabanaId: number

    @column({ columnName: 'id_estado_reserva' })
    declare idEstadoReserva: number

    @column({ columnName: 'id_usuario' })
    declare idUsuario: number

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    // --- Relaciones ---
    @belongsTo(() => Cabana, { foreignKey: 'cabanaId' })
    declare cabana: BelongsTo<typeof Cabana>

    @belongsTo(() => EstadoReserva, { foreignKey: 'idEstadoReserva' })
    declare estado: BelongsTo<typeof EstadoReserva>

    @manyToMany(() => Huesped, {
        pivotTable: 'huesped_reserva',
        pivotForeignKey: 'id_reserva',
        pivotRelatedForeignKey: 'id_huesped',
    })
    declare huespedes: ManyToMany<typeof Huesped>
}