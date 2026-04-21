import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'usuario'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_usuario').primary()
      table.string('nombre', 100).notNullable()
      table.string('apellido', 100).notNullable()
      table.string('dni').notNullable().unique()
      table.string('email', 150).notNullable().unique()
      table.string('dni',11).notNullable().unique()
      table.string('contrasena', 255).notNullable()
      table.integer('id_rol')
        .unsigned()
        .references('id_rol')
        .inTable('rol_usuario')
        .onDelete('RESTRICT')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}