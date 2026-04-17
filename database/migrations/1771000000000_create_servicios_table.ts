import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'servicios'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_servicios').primary()
      table.string('descripcion', 255).notNullable()


    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}