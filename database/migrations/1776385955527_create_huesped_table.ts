import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'huesped'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_huesped').primary()
      table.string('nombre', 100).notNullable()
      table.string('apellido', 100).notNullable()
      table.string('dni', 20).unique().notNullable()
      table.string('telefono', 20).nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}