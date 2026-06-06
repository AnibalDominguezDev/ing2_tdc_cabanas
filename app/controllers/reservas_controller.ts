import { type HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { CabanaService } from '#services/cabana_service'
import { ReservaValidator, mensajesReserva } from '#validators/reserva'
import { ReservaService } from '#services/reserva_service'

@inject()
export default class ReservasController {
    constructor(protected reservaService: ReservaService) { }

    private cabana = new CabanaService()

    private formatearErroresValidacion(error: any) {
        const errores: Record<string, string[]> = {}

        for (const item of error.messages || []) {
            const field = item.field || 'formulario'

            if (!errores[field]) {
                errores[field] = []
            }

            errores[field].push(item.message || 'Revisa este campo.')
        }

        return errores
    }

    private tieneErroresValidacion(error: any) {
        return Array.isArray(error?.messages)
    }

    private validarDocumentosRepetidos(datos: any) {
        const errores: Record<string, string[]> = {}
        const documentos = [
            { field: 'documento', value: datos.documento },
            ...(datos.huespedes || []).map((huesped: any, index: number) => ({
                field: `huespedes.${index}.documento`,
                value: huesped.documento,
            })),
        ]
        const vistos = new Map<string, string>()

        for (const documento of documentos) {
            if (!documento.value) {
                continue
            }

            if (vistos.has(documento.value)) {
                const primerCampo = vistos.get(documento.value)!
                errores[documento.field] = ['Este DNI ya fue cargado en la reserva.']
                errores[primerCampo] = ['Este DNI ya fue cargado en la reserva.']
            } else {
                vistos.set(documento.value, documento.field)
            }
        }

        return errores
    }

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

            let datosValidados

            try {
                datosValidados = await request.validateUsing(ReservaValidator, {
                    messagesProvider: mensajesReserva
                })
            } catch (error: any) {
                if (this.tieneErroresValidacion(error)) {
                    session.flash('errors', this.formatearErroresValidacion(error))
                    session.flashAll()
                    return response.redirect().back()
                }

                throw error
            }

            const erroresDocumentos = this.validarDocumentosRepetidos(datosValidados)

            if (Object.keys(erroresDocumentos).length > 0) {
                session.flash('errors', erroresDocumentos)
                session.flashAll()
                return response.redirect().back()
            }

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
