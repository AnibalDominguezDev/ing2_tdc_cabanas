import { ServicioSchema } from '#database/schema'
import { column } from '@adonisjs/lucid/orm'

export default class Servicio extends ServicioSchema {
    public static table = 'servicios'

    @column({ isPrimary: true, columnName: 'id_servicios' })
    declare id: number

    @column({ columnName: 'descripcion' })
    declare nombre: string
}