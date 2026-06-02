import type { HttpContext } from '@adonisjs/core/http'
import Usuario from '#models/usuario'
import { registerValidator } from '#validators/register'

export default class RegisterController {
  async show({ view }: HttpContext) {
    return view.render('auth/register')
  }

  async store({ request, response, session }: HttpContext) {
    try {
      const datos = await request.validateUsing(registerValidator)
      await Usuario.create({
        nombre: datos.nombre,
        apellido: datos.apellido,
        email: datos.email,
        dni: datos.dni,
        contrasena: datos.contrasena,
        idRol: 1,
      })
      session.flash('success', 'Usuario creado con éxito. Listo para iniciar sesión')
      return response.redirect('/login')
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'messages' in error
      ) {
        const errs = (error as any).messages

        session.flash(
          'errors',
          errs.map((e: any) => e.message)
        )
      } else {
        session.flash('errors', ['Error inesperado'])
      }

      session.flash('success', 'Usuario creado con éxito. Listo para iniciar sesión')
      return response.redirect('/login')
    }
  }
}