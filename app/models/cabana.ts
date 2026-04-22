import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, belongsTo, beforeSave } from '@adonisjs/lucid/orm'
import type { ManyToMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Servicio from '#models/servicio'
import EstadoCabana from '#models/estado_cabana'
import string from '@adonisjs/core/helpers/string'

export default class Cabana extends BaseModel {
    public static table = 'cabana'

    @column({ isPrimary: true, columnName: 'id_cabana' })
    declare id: number

    @column()
    declare nombre: string

    @column()
    declare descripcion: string

    @column({ columnName: 'precio_por_noche' })
    declare precioPorNoche: number

    @column()
    declare capacidad: number

    @column()
    declare habitaciones: number

    @column()
    declare slug: string | null

    @column({ columnName: 'img_url' })
    declare imgUrl: string | null

    @column({ columnName: 'id_estado' })
    declare idEstado: number

    @belongsTo(() => EstadoCabana, {
        foreignKey: 'idEstado',
    })
    declare estado: BelongsTo<typeof EstadoCabana>

    @manyToMany(() => Servicio, {
        pivotTable: 'cabana_servicios',
        pivotForeignKey: 'id_cabana',
        pivotRelatedForeignKey: 'id_servicios',
    })
    declare servicios: ManyToMany<typeof Servicio>

    @column.dateTime({ autoCreate: true, columnName: 'created_at' })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
    declare updatedAt: DateTime

    @beforeSave()
    public static async generarSlug(cabana: Cabana) {

        if (cabana.$dirty.nombre) {
            cabana.slug = string.slug(cabana.nombre, {
                lower: true,
                strict: true,
                replacement: '-'
            })
        }
    }
}