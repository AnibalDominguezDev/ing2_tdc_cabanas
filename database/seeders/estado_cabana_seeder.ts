import EstadoCabana from '#models/estado_cabana'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await EstadoCabana.createMany([
      { descEstado: 'Activo' },
      { descEstado: 'Mantenimiento' },
      { descEstado: 'Eliminado' }
    ])
  }
}