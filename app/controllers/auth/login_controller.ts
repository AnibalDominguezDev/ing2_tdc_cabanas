import type { HttpContext } from '@adonisjs/core/http'
import { loginValidator } from '#validators/login'
import { inject } from '@adonisjs/core'
import { UsuarioService } from '#services/usuario_service'

@inject()
export default class LoginController {
  constructor(private usuarioService: UsuarioService) { }

  async show({ view }: HttpContext) {
    return view.render('auth/login')
  }

  async store({ request, response, session }: HttpContext) {
    try {
      // 1. Validar request
      const datos = await request.validateUsing(loginValidator)

      // 2. Verificar credenciales en el servicio
      const usuario = await this.usuarioService.verificarCredenciales(datos.email, datos.contrasena)

      // 3. Guardar en sesión usando el getter del modelo
      const payload = usuario.datosUsuario
      for (const [key, value] of Object.entries(payload)) {
        session.put(key, value)
      }

      // 4. Redirigir según el rol
      if (usuario.idRol === 2) {
        return response.redirect().toRoute('gestion')
      }

      return response.redirect('/')

    } catch (error: any) {
      // Manejo de errores simplificado
      const mensajes = error.messages
        ? error.messages.map((e: any) => e.message)
        : [error.message || 'Error inesperado']

      session.flash('errors', mensajes)
      session.flashAll()

      return response.redirect().back()
    }
  }

  async logout({ response, session }: HttpContext) {
    // Es más seguro limpiar toda la sesión en lugar de llave por llave
    session.clear()
    return response.redirect('/login')
  }
}