import Usuario from "#models/usuario"
import hash from '@adonisjs/core/services/hash'

export class UsuarioService {
  /**
   * Verifica las credenciales y devuelve el usuario si son correctas.
   * Lanza un error si son inválidas.
   */

  async registrarUsuario(datos: any) {
    const usuario = await Usuario.create({
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      dni: datos.dni,
      contrasena: datos.contrasena,
      idRol: 1, // 1 = Cliente
    })

    return usuario
  }

  async verificarCredenciales(email: string, contrasenaPlana: string) {
    const usuario = await Usuario.findBy('email', email)

    if (!usuario) {
      throw new Error('Correo o contraseña incorrectos')
    }

    const passwordCorrecta = await hash.verify(usuario.contrasena, contrasenaPlana)

    if (!passwordCorrecta) {
      throw new Error('Correo o contraseña incorrectos')
    }

    return usuario
  }
}