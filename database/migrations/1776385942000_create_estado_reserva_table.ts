import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'estado_reserva'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_estado_reserva').primary()
      table.string('estado', 50).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}