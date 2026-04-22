import type { HttpContext } from '@adonisjs/core/http'
import Cabana from '#models/cabana' // Ajusta el path según tu proyecto
import { validadorCabana } from '#validators/cabana' // Luego definimos el validador

export default class CabanasController {

  async crear({ view }: HttpContext) {
    return view.render('pages/cabanas/altaCabana')
  }

  async agregarCabana({ request, response, session }: HttpContext) {
    const datos = await request.validateUsing(validadorCabana)

    const cabana = await Cabana.create({
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      capacidad: datos.capacidad,
      habitaciones: datos.habitaciones,
      precioPorNoche: datos.precio_por_noche,
      idEstado: 1,
    })

    // if (datos.servicios) {
    //   await cabana.related('servicios').attach(datos.servicios)
    // }

    session.flash('notificacion', 'Cabaña guardada correctamente')
    return response.redirect().toRoute('home')
  }

  async listar({ view }: HttpContext) {

    const cabanas = await Cabana.findManyBy({ id_estado: 1 })

    return view.render('pages/cabanas/catalogo', { cabanas })
  }

  async mostrar({ params, view }: HttpContext) {

    const cabana = Cabana.findBy('slug', params.slug)

    return cabana
  }


}
