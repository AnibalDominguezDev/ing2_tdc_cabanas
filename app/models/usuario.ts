import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave} from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'

export default class Usuario extends BaseModel {
  public static table = 'usuario'
  public static primaryKey = 'id_usuario'

  @column({ isPrimary: true, columnName: 'id_usuario' })
  declare idUsuario: number

  @column({ columnName: 'nombre' })
  declare nombre: string

  @column({ columnName: 'apellido' })
  declare apellido: string

  @column({ columnName: 'email' })
  declare email: string

  @column({ columnName: 'dni' })
  declare dni: string

  @column({ columnName: 'contrasena', serializeAs: null })
  declare contrasena: string

  @column({ columnName: 'id_rol' })
  declare idRol: number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

   @beforeSave()
  static async hashPassword(usuario: Usuario) {
    if (usuario.$dirty.contrasena) {
      usuario.contrasena = await hash.make(usuario.contrasena)
    }

}
}