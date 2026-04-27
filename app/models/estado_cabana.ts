import { EstadoCabanaSchema } from '#database/schema'
import { BaseModel, column, manyToMany, belongsTo, beforeSave } from '@adonisjs/lucid/orm'

export default class EstadoCabana extends EstadoCabanaSchema {
    public static table = 'estado_cabana'

    @column({ isPrimary: true, columnName: 'id_esatado' })
    declare id: number

    @column({ columnName: 'desc_estado' })
    declare descEstado: string
}