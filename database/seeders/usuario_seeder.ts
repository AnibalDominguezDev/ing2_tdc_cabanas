import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Usuario from '#models/usuario'

export default class extends BaseSeeder {
  async run() {

    await Usuario.createMany([{
      nombre: 'Juan',
      apellido: 'Perez',
      dni: '23442123',
      email: 'juanperez@gmail.com',
      contrasena: 'soyjuan',
      idRol: 2
    },
    {
      nombre: 'Emma',
      apellido: 'Ramirez',
      dni: '42312456',
      email: 'emmaramirez@gmail.com',
      contrasena: 'soyemma',
      idRol: 1,
    }
    ])
  }
}