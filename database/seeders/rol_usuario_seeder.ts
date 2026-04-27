import RolUsuario from '#models/rol_usuario'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await RolUsuario.createMany([
      { rol: 'cliente' },
      { rol: 'administrador' }
    ])
  }
}