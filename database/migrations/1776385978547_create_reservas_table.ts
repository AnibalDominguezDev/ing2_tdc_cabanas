import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reservas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_reserva').primary()
      table.date('fecha_inicio').notNullable()
      table.date('fecha_fin').notNullable()
      table.decimal('precio_total', 12, 2).notNullable()

      // Foreign Keys
      table.integer('id_cabana')
        .unsigned()
        .references('id_cabana')
        .inTable('cabanas')
        .onDelete('CASCADE')
      table.integer('id_estado_reserva')
        .unsigned()
        .references('id_estado_reserva')
        .inTable('estado_reserva')
        .onDelete('RESTRICT')
      table.integer('id_usuario')
        .unsigned()
        .references('id_usuario')
        .inTable('usuario')
        .onDelete('RESTRICT')

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}