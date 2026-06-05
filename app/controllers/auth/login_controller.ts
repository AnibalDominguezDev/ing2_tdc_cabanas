import type { HttpContext } from '@adonisjs/core/http'
import Usuario from '#models/usuario'
import hash from '@adonisjs/core/services/hash'
import { loginValidator } from '#validators/login'

export default class LoginController {
  async show({ view }: HttpContext) {
    return view.render('auth/login')
  }

  async store({ request, response, session }: HttpContext) {
    try {
      const datos = await request.validateUsing(loginValidator)

      const usuario = await Usuario.findBy('email', datos.email)

      if (!usuario) {
        session.flash('errors', ['Correo o contraseña incorrectos'])
        session.flashAll()
        return response.redirect().back()
      }

      const passwordCorrecta = await hash.verify(usuario.contrasena, datos.contrasena)

      if (!passwordCorrecta) {
        session.flash('errors', ['Correo o contraseña incorrectos'])
        session.flashAll()
        return response.redirect().back()
      }

      session.put('usuario_id', usuario.idUsuario)
      session.put('usuario_nombre', usuario.nombre)
      session.put('usuario_rol', usuario.idRol)
      session.put('usuario_apellido', usuario.apellido)
      session.put('usuario_email', usuario.email)
      session.put(
         'usuario_rol_nombre',
          usuario.idRol === 1 ? 'Cliente' : 'Administrador'
        )

      if (usuario.idRol === 2) {
        return response.redirect().toRoute('gestion')
      }

      return response.redirect('/')
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

      session.flashAll()
      return response.redirect().back()
    }
  }

  async logout({ response, session }: HttpContext) {
    session.forget('usuario_id')
    session.forget('usuario_nombre')
    session.forget('usuario_rol')
    session.forget('usuario_apellido')
    session.forget('usuario_email')
    session.forget('usuario_rol_nombre')


    return response.redirect('/login')
  }
}
