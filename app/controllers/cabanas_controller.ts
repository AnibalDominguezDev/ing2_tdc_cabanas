import type { HttpContext } from '@adonisjs/core/http'
import Cabana from '#models/cabana'
import Servicio from '#models/servicio'
import { validadorCabana } from '#validators/cabana'

export default class CabanasController {

  async crear({ view }: HttpContext) {

    const servicios = await Servicio.all()

    return view.render('pages/cabanas/altaCabana', { servicios })
  }

  async agregarCabana({ request, response, session }: HttpContext) {
    const datos = await request.validateUsing(validadorCabana)

    const servicios = request.input('servicios[]', [])



    const cabana = await Cabana.create({
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      capacidad: datos.capacidad,
      habitaciones: datos.habitaciones,
      precioPorNoche: datos.precio_por_noche,
      idEstado: 1,
    })

    if (servicios.length > 0) {
      await cabana.related('servicios').attach(servicios)
    }

    session.flash('notificacion', 'Cabaña guardada correctamente')
    return response.redirect().toRoute('cabanas')
  }

  async listar({ view }: HttpContext) {

    const cabanas = await Cabana.query()
      .where('id_estado', 1)
      .preload('servicios')

    return view.render('pages/cabanas/catalogo', { cabanas })
  }

  async mostrar({ params, view }: HttpContext) {

    const cabana = Cabana.findBy('slug', params.slug)

    return cabana
  }


}
