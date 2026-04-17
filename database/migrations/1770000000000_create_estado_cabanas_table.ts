import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'estado_cabana'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_estado').primary()
      table.string('desc_estado', 50).notNullable()

    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}