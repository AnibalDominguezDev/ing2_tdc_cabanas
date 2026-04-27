import Servicio from '#models/servicio'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Servicio.createMany([
      { descripcion: 'Wi-Fi' },
      { descripcion: 'Aire acondicionado' },
      { descripcion: 'Fogata' },
      { descripcion: 'Jacuzzi' },
      { descripcion: 'Parrilla' },
      { descripcion: 'Piscina' },
      { descripcion: 'Sauna' },
      { descripcion: 'Mascotas permitidas' },
      { descripcion: 'Habitaciones sin humo' },
    ])
  }
}