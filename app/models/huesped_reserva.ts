import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Reserva from '#models/reserva'
import Huesped from '#models/huesped'

export default class HuespedReserva extends BaseModel {
    // Forzamos el nombre de la tabla para evitar que Adonis la pluralice
    public static table = 'huesped_reserva'

    @column({ isPrimary: true })
    declare id: number

    @column({ columnName: 'id_reserva' })
    declare idReserva: number

    @column({ columnName: 'id_huesped' })
    declare idHuesped: number

    // --- Relaciones ---
    // Un registro de esta tabla pertenece a una única reserva
    @belongsTo(() => Reserva, { foreignKey: 'idReserva' })
    declare reserva: BelongsTo<typeof Reserva>

    // Un registro de esta tabla pertenece a un único huésped
    @belongsTo(() => Huesped, { foreignKey: 'idHuesped' })
    declare huesped: BelongsTo<typeof Huesped>
}