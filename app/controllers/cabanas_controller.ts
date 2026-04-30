import type { HttpContext } from '@adonisjs/core/http'
import Cabana from '#models/cabana'
import Servicio from '#models/servicio'
import { validadorCabana } from '#validators/cabana'
import stringHelpers from '@adonisjs/core/helpers/string'

export default class CabanasController {

  async crear({ view }: HttpContext) {

    const servicios = await Servicio.all()

    return view.render('pages/cabanas/altaCabana', { servicios })
  }

  async agregarCabana({ request, response, session }: HttpContext) {

    const datos = await request.validateUsing(validadorCabana)

    const servicios = request.input('servicios[]', [])

    const img = request.file('imagen', {
      size: '20mb',
      extnames: ['jpg', 'png', 'jpeg', 'webp']
    })

    try {
      const cabana = await Cabana.create({
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        capacidad: datos.capacidad,
        habitaciones: datos.habitaciones,
        precioPorNoche: datos.precio_por_noche,
        idEstado: 1,
      })



      if (img) {
        await img.moveToDisk(`cabanas_img/${datos.nombre}.${img.extname}`)
        cabana.imgUrl = `cabanas_img/${datos.nombre}.${img.extname}`
        await cabana.save()
      }

      if (servicios.length > 0) {
        await cabana.related('servicios').attach(servicios)
      }

      session.flash('success', 'Cabaña guardada correctamente')
      return response.redirect().toRoute('cabanas')

    } catch (error) {

      session.flash(request.except(['imagen', '_csrf']))
      session.flash('error', 'Error: Ocurrio un error al insertar la cabaña.')
    }

    return response.redirect().back()


  }

  async editar({ params, view }: HttpContext) {

    const cabana = await Cabana.query().where('slug', params.slug).preload('servicios').firstOrFail()

    const servicios = await Servicio.all();

    const serviciosActuales = cabana.servicios.map((servicio) => servicio.id)

    return view.render('pages/cabanas/altaCabana', { cabana, servicios, serviciosActuales })
  }

  async actualizar({ response, request, session }: HttpContext) {

    try {

      const cabana = await Cabana.findOrFail(request.input('id'))

      const img = request.file('imagen', {
        size: '20mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp']
      })

      const nuevosDatos = await request.validateUsing(validadorCabana, {
        meta: {
          cabanaId: request.input('id')
        }
      })

      const serviciosInput = request.input('servicios[]', [])

      const servicios = await Servicio.all();

      await cabana.merge({
        //nombre: nuevosDatos.nombre,
        descripcion: nuevosDatos.descripcion,
        capacidad: nuevosDatos.capacidad,
        habitaciones: nuevosDatos.habitaciones,
        precioPorNoche: nuevosDatos.precio_por_noche,

      }).save()

      if (servicios.length > 0) {
        await cabana.related('servicios').sync(serviciosInput)
      }

      if (img) {

        const path = `cabanas_img/${stringHelpers.uuid()}.${img.extname}`

        await img.moveToDisk(path)
        cabana.imgUrl = path
        await cabana.save()
      }

      return response.json(nuevosDatos)

    } catch (error) {
      session.flash(request.except(['imagen', '_csrf']))
      session.flash('error', 'Error: Ocurrio un error al actualizar la cabaña.')
      return response.redirect().back()
    }



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
