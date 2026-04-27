import { RolUsuarioSchema } from '#database/schema'
import { column } from '@adonisjs/lucid/orm'

export default class RolUsuario extends RolUsuarioSchema {
    public static table = 'rol_usuario'

    @column({ isPrimary: true, columnName: 'id_rol' })
    declare id: number

    @column({ columnName: 'rol' })
    declare rol: string

}