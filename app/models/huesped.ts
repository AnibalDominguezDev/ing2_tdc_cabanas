import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Reserva from '#models/reserva'

export default class Huesped extends BaseModel {
    public static table = 'huesped'


    @column({ isPrimary: true, columnName: 'id_huesped' })
    declare id: number

    @column()
    declare nombre: string

    @column()
    declare apellido: string

    @column()
    declare dni: string

    @column()
    declare telefono: string

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    // --- Relaciones ---
    @manyToMany(() => Reserva, {
        pivotTable: 'huesped_reserva',
        pivotForeignKey: 'id_huesped',
        pivotRelatedForeignKey: 'id_reserva',
    })
    declare reservas: ManyToMany<typeof Reserva>
}