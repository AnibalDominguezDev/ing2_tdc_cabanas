import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rol_usuario'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_rol').primary()
      table.string('rol', 50).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}