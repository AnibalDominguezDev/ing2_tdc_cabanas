import Cabana from '#models/cabana'
import Servicio from '#models/servicio'
import stringHelpers from '@adonisjs/core/helpers/string'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import { EstadoCabanaFactory } from './CabanaEstados/EstadoFactory.ts'

export class CabanaService {
  async obtenerServicios() {
    return await Servicio.all()
  }

  async obtenerTodas() {
    return await Cabana.all()
  }

  async obtenerPorId(id: number) {
    return Cabana.findOrFail(id)
  }

  async obtenerDisponibles() {
    return await Cabana.query().whereNot('idEstado', '4')
  }

  async obtenerActivas() {
    return await Cabana.query()
      .where('id_estado', 1)
      .preload('servicios')
  }

  async obtenerEliminadas() {
    return await Cabana.query().where('idEstado', 4)
  }

  async obtenerPorSlug(slug: string) {
    return await Cabana.query().where('slug', slug).preload('servicios').firstOrFail()
  }

  async crear(datos: any, servicios: number[], imgFile: MultipartFile | null) {
    const cabana = await Cabana.create({
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      capacidad: datos.capacidad,
      habitaciones: datos.habitaciones,
      precioPorNoche: datos.precio_por_noche,
      idEstado: 1, // Por defecto al crear
    })

    if (imgFile) {
      const fileName = `${datos.nombre}.${imgFile.extname}`
      await imgFile.moveToDisk(`cabanas_img/${fileName}`)
      cabana.imgUrl = `cabanas_img/${fileName}`
      await cabana.save()
    }

    if (servicios && servicios.length > 0) {
      await cabana.related('servicios').attach(servicios)
    }

    return cabana
  }

  async actualizar(id: number, nuevosDatos: any, serviciosIds: number[], imgFile: MultipartFile | null) {
    const cabana = await Cabana.findOrFail(id)

    await cabana.merge({
      nombre: nuevosDatos.nombre,
      descripcion: nuevosDatos.descripcion,
      capacidad: nuevosDatos.capacidad,
      habitaciones: nuevosDatos.habitaciones,
      precioPorNoche: nuevosDatos.precio_por_noche,
    }).save()

    if (serviciosIds && serviciosIds.length > 0) {
      await cabana.related('servicios').sync(serviciosIds)
    }

    if (imgFile) {
      const path = `cabanas_img/${stringHelpers.uuid()}.${imgFile.extname}`
      await imgFile.moveToDisk(path)
      cabana.imgUrl = path
      await cabana.save()
    }

    return cabana
  }

  async obtenerEstadoActual(idCabana: number) {
    const cabana = await Cabana.findOrFail(idCabana)
    return EstadoCabanaFactory.fabricar(cabana.idEstado)
  }

  async reservarCabana(idCabana: number) {
    const cabana = await Cabana.findOrFail(idCabana)

    // 1. Hidratamos el estado actual
    const estadoActual = EstadoCabanaFactory.fabricar(cabana.idEstado)

    // 2. Intentamos la transición. Si es inválida, lanzará un Error aquí mismo.
    const nuevoEstadoId = estadoActual.reservar()

    // 3. Si todo salió bien, actualizamos la base de datos
    cabana.idEstado = nuevoEstadoId
    await cabana.save()

    return cabana
  }

  async liberarCabana(idCabana: number) {
    const cabana = await Cabana.findOrFail(idCabana)

    // 1. Hidratamos el estado actual
    const estadoActual = EstadoCabanaFactory.fabricar(cabana.idEstado)

    // 2. Intentamos la transición. Si es inválida, lanzará un Error aquí mismo.
    const nuevoEstadoId = estadoActual.liberar()

    // 3. Si todo salió bien, actualizamos la base de datos
    cabana.idEstado = nuevoEstadoId
    await cabana.save()

    return cabana
  }

  async establecerMantenimiento(idCabana: number) {

    const cabana = await Cabana.findOrFail(idCabana)
    const estadoActual = EstadoCabanaFactory.fabricar(cabana.idEstado)

    cabana.idEstado = estadoActual.ponerEnMantenimiento()
    await cabana.save()

    return cabana
  }

  async finalizarMantenimiento(idCabana: number) {
    const cabana = await Cabana.findOrFail(idCabana)
    const estadoActual = EstadoCabanaFactory.fabricar(cabana.idEstado)

    cabana.idEstado = estadoActual.liberar() // Vuelve a disponible
    await cabana.save()

    return cabana
  }

  async eliminar(idCabana: number) {

    const cabana = await Cabana.findOrFail(idCabana)
    const estadoActual = EstadoCabanaFactory.fabricar(cabana.idEstado)

    cabana.idEstado = estadoActual.eliminar()
    await cabana.save()

    return cabana
  }
}