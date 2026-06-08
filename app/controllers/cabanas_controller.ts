import { type HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { validadorCabana } from '#validators/cabana'
import { CabanaService } from '#services/cabana_service'
@inject()
export default class CabanasController {

  // Inyección de la clase de servicio
  constructor(private cabanaService: CabanaService) { }

  async crear({ view }: HttpContext) {
    const servicios = await this.cabanaService.obtenerServicios()
    return view.render('pages/cabanas/altaCabana', { servicios })
  }

  async agregarCabana({ request, response, session }: HttpContext) {
    const datosCabana = await request.validateUsing(validadorCabana)
    const servicios = request.input('servicios[]', [])
    const img = request.file('imagen', {
      size: '20mb',
      extnames: ['jpg', 'png', 'jpeg', 'webp']
    })

    try {
      // Delegamos la lógica compleja al servicio
      await this.cabanaService.agregarCabana(datosCabana, servicios, img)

      session.flash('success', 'Cabaña guardada correctamente')
      return response.redirect().toRoute('gestion')

    } catch (error) {
      session.flash(request.except(['imagen', '_csrf']))
      session.flash('error', 'Error: Ocurrió un error al insertar la cabaña.')
      return response.redirect().back()
    }
  }

  async editar({ params, view }: HttpContext) {

    const cabana = await this.cabanaService.obtenerPorSlug(params.slug)
    const servicios = await this.cabanaService.obtenerServicios()

    // Mapeo para los checkboxes en la vista
    const serviciosActuales = cabana.servicios.map((servicio) => servicio.id)

    return view.render('pages/cabanas/altaCabana', { cabana, servicios, serviciosActuales })
  }

  async actualizar({ response, request, session }: HttpContext) {
    const id = request.input('id')
    const img = request.file('imagen', {
      size: '20mb',
      extnames: ['jpg', 'png', 'jpeg', 'webp']
    })

    try {
      // Es importante validar antes de enviar datos al servicio
      const nuevosDatos = await request.validateUsing(validadorCabana, {
        meta: { cabanaId: id }
      })
      const serviciosInput = request.input('servicios[]', [])

      // Delegamos la actualización
      await this.cabanaService.actualizar(id, nuevosDatos, serviciosInput, img)

      session.flash('success', 'Cabaña editada correctamente')
      return response.redirect().toRoute('gestion')

    } catch (error) {
      session.flash(request.except(['imagen', '_csrf']))
      session.flash('error', 'Error: Ocurrió un error al actualizar la cabaña.')
      return response.redirect().back()
    }
  }

  async eliminarCabana({ session, response, params }: HttpContext) {


    try {

      const cabanaId = params.id



      await this.cabanaService.eliminar(cabanaId)
      session.flash('success', 'Cabaña eliminada correctamente')
      return response.redirect().back()

    } catch (error: any) {
      session.flash('error', error.message)
      return response.redirect().back()
    }


  }

  async mantenimiento({ params, session, response }: HttpContext) {


    try {

      const cabanaId = params.id

      const estadoActual = await this.cabanaService.obtenerEstadoActual(cabanaId)

      if (estadoActual.nombre === 'Mantenimiento') {
        await this.cabanaService.liberarCabana(cabanaId)
        session.flash('success', 'La cabaña fue reactivada')

      } else {
        await this.cabanaService.establecerMantenimiento(cabanaId)
        session.flash('success', 'La cabaña ahora esta en mantenimiento')
      }
      return response.redirect().back()

    } catch (error: any) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async reactivar({ params, session, response }: HttpContext) {

    try {

      const cabanaId = params.id

      await this.cabanaService.liberarCabana(cabanaId)
      session.flash('success', 'La cabaña fue reactivada')

    } catch (error: any) {
      session.flash('error', error.message)

    } finally {
      return response.redirect().back()
    }


  }

  async admin({ view }: HttpContext) {
    const cabanas = await this.cabanaService.obtenerDisponibles()
    return view.render('pages/admin/gestionCabanas', { cabanas })
  }

  async listarEliminadas({ view }: HttpContext) {
    const cabanas = await this.cabanaService.obtenerEliminadas()
    return view.render('pages/admin/gestionCabanasEliminadas', { cabanas })
  }

  async listar({ view }: HttpContext) {
    const cabanas = await this.cabanaService.obtenerActivas()
    return view.render('pages/cabanas/catalogo', { cabanas })
  }

  async mostrar({ view, params }: HttpContext) {

    const cabana = await this.cabanaService.obtenerPorSlug(params.slug)

    return view.render('pages/cabanas/verCabana', { cabana })

  }
}