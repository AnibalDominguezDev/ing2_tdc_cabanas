import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cabana_servicios'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('id_cabana')
        .unsigned()
        .references('id_cabana')
        .inTable('cabanas')
        .onDelete('CASCADE')


      table
        .integer('id_servicios')
        .unsigned()
        .references('id_servicios')
        .inTable('servicios')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}