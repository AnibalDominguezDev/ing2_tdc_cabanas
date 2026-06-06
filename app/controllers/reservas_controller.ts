import { type HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { CabanaService } from '#services/cabana_service'
import { ReservaValidator, mensajesReserva } from '#validators/reserva'
import { ReservaService } from '#services/reserva_service'

@inject()
export default class ReservasController {
    constructor(protected reservaService: ReservaService) { }

    private cabana = new CabanaService()

    public async crear({ params, view }: HttpContext) {

        const cabana = await this.cabana.obtenerPorSlug(params.slug)


        return view.render('pages/reservas/realizarReserva', { cabana })
    }

    public async store({ session, params, request, response }: HttpContext) {

        try {

            const cabana = await this.cabana.obtenerPorSlug(params.slug)

            const datosRecibidos = request.all()

            datosRecibidos.cabanaId = cabana.id;
            datosRecibidos.usuairioId = session.get('usuario_id')

            const datosValidados = await request.validateUsing(ReservaValidator, {
                messagesProvider: mensajesReserva
            })

            // const reserva = await this.reservaService.NuevaReserva(datosValidados)

            // console.log('--- NUEVA RESERVA RECIBIDA ---')
            // console.log('================Datos recibidos===================')
            // console.log({ datosRecibidos })
            console.log('================Datos validos===================')
            console.dir(datosValidados, { depth: null })

            return response.json({
                status: 'Éxito',
                mensaje: 'Formulario recibido correctamente',
                data: datosValidados
            })

        } catch (error: any) {


            console.log(error)


            return response.json({ error })
        }


    }
}