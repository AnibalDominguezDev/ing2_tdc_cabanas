import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle({ session, response }: HttpContext, next: NextFn) {
    const usuarioId = session.get('usuario_id')
    const usuarioRol = Number(session.get('usuario_rol'))

    if (!usuarioId) {
      return response.redirect('/login')
    }

    if (usuarioRol !== 2) {
      return response.redirect('/')
    }

    return next()
  }
}
