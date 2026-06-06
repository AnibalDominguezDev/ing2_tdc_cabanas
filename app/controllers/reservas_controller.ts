import { type HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { CabanaService } from '#services/cabana_service'
import { ReservaValidator, mensajesReserva } from '#validators/reserva'
import { ReservaService } from '#services/reserva_service'

@inject()
export default class ReservasController {
    constructor(protected reservaService: ReservaService) { }

    private cabana = new CabanaService()

    public async crear({ params, view, session, response }: HttpContext) {

        if (!session.get('usuario_id')) {
            session.flash('error', 'Inicie sesion para realizar una reserva')
            return response.redirect('/login')
        }

        const cabana = await this.cabana.obtenerPorSlug(params.slug)
        const rangosOcupados = await this.reservaService.obtenerRangosOcupados(cabana.id)


        return view.render('pages/reservas/realizarReserva', { cabana, rangosOcupados })
    }

    public async store({ session, params, request, response }: HttpContext) {

        try {

            if (!session.get('usuario_id')) {
                session.flash('error', 'Inicie sesion para realizar una reserva')
                return response.redirect('/login')
            }

            const cabana = await this.cabana.obtenerPorSlug(params.slug)

            const datosValidados = await request.validateUsing(ReservaValidator, {
                messagesProvider: mensajesReserva
            })

            const datosReserva = {
                ...datosValidados,
                cabanaId: cabana.id,
                usuarioId: session.get('usuario_id'),
            }

            await this.reservaService.NuevaReserva(datosReserva)

            // console.log('--- NUEVA RESERVA RECIBIDA ---')
            // console.log('================Datos recibidos===================')
            // console.log({ datosRecibidos })
            console.log('================Datos validos===================')
            console.dir(datosReserva, { depth: null })

            session.flash('success', 'Reserva realizada correctamente')
            return response.redirect().toRoute('home')

        } catch (error: any) {


            console.log(error)

            session.flash('error', typeof error === 'string' ? error : error.message || 'No se pudo realizar la reserva')
            session.flashAll()
            return response.redirect().back()
        }


    }
}
