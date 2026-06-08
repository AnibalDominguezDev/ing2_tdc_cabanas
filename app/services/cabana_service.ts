import Cabana from '#models/cabana'
import db from '@adonisjs/lucid/services/db'
import stringHelpers from '@adonisjs/core/helpers/string'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import { EstadoCabanaFactory } from './CabanaEstados/EstadoFactory.ts'
import { formateadorFecha } from '../utils/formateadorFecha.ts'

export class CabanaService {


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

  async agregarCabana(datosCabana: any, servicios: number[], imgFile: MultipartFile | null) {
    const cabana = await Cabana.create({
      nombre: datosCabana.nombre,
      descripcion: datosCabana.descripcion,
      capacidad: datosCabana.capacidad,
      habitaciones: datosCabana.habitaciones,
      precioPorNoche: datosCabana.precio_por_noche,
      idEstado: 1, // Por defecto al crear
    })

    if (imgFile) {
      const fileName = `${datosCabana.nombre}.${imgFile.extname}`
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

  async obtenerRangosOcupados(cabanaId: number) {
    const reservas = await db
      .from('reservas')
      .select('fecha_inicio as fechaInicio', 'fecha_fin as fechaFin')
      .where('id_cabana', cabanaId)
      .whereIn('id_estado_reserva', [1, 2])
      .orderBy('fecha_inicio', 'asc')

    return reservas.map((reserva) => ({
      inicio: formateadorFecha.formatearFecha(reserva.fechaInicio),
      fin: formateadorFecha.formatearFecha(reserva.fechaFin),
    }))
  }

  async estaDisponible(cabanaId: number, checkin: string, checkout: string) {
    const reservaConflictiva = await db
      .from('reservas')
      .where('id_cabana', cabanaId)
      .whereIn('id_estado_reserva', [1, 2])
      .where('fecha_inicio', '<', checkout)
      .where('fecha_fin', '>', checkin)
      .first()

    return !reservaConflictiva
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