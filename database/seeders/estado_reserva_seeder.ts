import EstadoReserva from '#models/estado_reserva'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await EstadoReserva.createMany([
      { estado: 'Pendiente' },
      { estado: 'Activo' },
      { estado: 'Finalizado' },
    ])
  }
}