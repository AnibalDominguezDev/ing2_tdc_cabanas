import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { registerValidator } from '#validators/register'
import { UsuarioService } from '#services/usuario_service'

@inject()
export default class RegisterController {
  constructor(private usurioService: UsuarioService) { }

  async show({ view }: HttpContext) {
    return view.render('auth/register')
  }

  async store({ request, response, session }: HttpContext) {
    try {
      // 1. Validar los datos del formulario
      const datos = await request.validateUsing(registerValidator)

      // 2. Delegar la creación del usuario al servicio
      await this.usurioService.registrarUsuario(datos)

      // 3. Notificar éxito y redirigir al login
      session.flash('success', 'Usuario creado con éxito. Listo para iniciar sesión')
      return response.redirect('/login')

    } catch (error: any) {
      // 4. Manejo de errores simplificado
      const mensajes = error.messages
        ? error.messages.map((e: any) => e.message)
        : [error.message || 'Error inesperado']

      // Retornamos los errores a la vista
      session.flash('errors', mensajes)

      // Retenemos los datos introducidos para no vaciar el formulario
      session.flashAll()

      // IMPORTANTE: Redirigimos de vuelta al formulario de registro, no al login
      return response.redirect().back()
    }
  }
}