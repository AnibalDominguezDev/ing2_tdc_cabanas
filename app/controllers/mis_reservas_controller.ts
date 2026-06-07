import { type HttpContext } from '@adonisjs/core/http'
import Reserva from '#models/reserva'
import { inject } from '@adonisjs/core'
import { ReservaService } from '#services/reserva_service'

@inject()
export default class MisReservasController {

  constructor(protected reservaService: ReservaService) { }

  async index({ view, session, response }: HttpContext) {
    const usuarioId = session.get('usuario_id')

    if (!usuarioId) {
      session.flash('error', 'Inicie sesion para ver sus reservas')
      return response.redirect('/login')
    }

    const reservas = await Reserva.query()
      .where('idUsuario', usuarioId)
      .preload('cabana')
      .preload('estado')
      .orderBy('createdAt', 'desc')

    return view.render('pages/reservas/misReservas', { reservas })
  }

  async show({ params, view, session, response }: HttpContext) {
    const usuarioId = session.get('usuario_id')
    const reservaId = params.id
    if (!usuarioId) {
      session.flash('error', 'Inicie sesion para ver sus reservas')
      return response.redirect('/login')
    }

    await this.reservaService.calcularEstado(reservaId)

    const reserva = await Reserva.query()
      .where('id', reservaId)
      .where('idUsuario', usuarioId)
      .preload('estado')
      .preload('huespedes')
      .preload('cabana', (cabanaQuery) => {
        cabanaQuery.preload('servicios')
      })
      .firstOrFail()

    return view.render('pages/reservas/detalleReserva', { reserva })
  }
}
