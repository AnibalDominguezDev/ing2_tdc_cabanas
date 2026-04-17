import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'huesped_reservas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('id_huesped')
        .unsigned()
        .references('id_huesped')
        .inTable('huesped')
        .onDelete('CASCADE')

      table.integer('id_reserva')
        .unsigned()
        .references('id_reserva')
        .inTable('reservas')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}