import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cabanas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_cabana')
      table.string('nombre', 254).notNullable().unique()
      table.string('descripcion', 254).notNullable()
      table.float('precio_por_noche').notNullable()
      table.integer('capacidad').defaultTo(1).notNullable()
      table.integer('habitaciones').defaultTo(1).notNullable()
      table.string('slug').nullable()
      table.string('img_url').nullable()
      table
        .integer('id_estado')
        .unsigned()
        .references('id_estado')
        .inTable('estado_cabana')
        .onDelete('RESTRICT')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}