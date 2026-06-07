import db from '@adonisjs/lucid/services/db'
import Huesped from '#models/huesped'
import Reserva from '#models/reserva'
import Cabana from '#models/cabana'
import { DateTime } from 'luxon'
import { CabanaService } from '#services/cabana_service'
import { inject } from '@adonisjs/core'

@inject()
export class ReservaService {

  constructor(private cabanaService: CabanaService) { }

  private formatearFecha(value: string | Date) {
    if (value instanceof Date) {
      const year = value.getFullYear()
      const month = String(value.getMonth() + 1).padStart(2, '0')
      const day = String(value.getDate()).padStart(2, '0')

      return `${year}-${month}-${day}`
    }

    return value.slice(0, 10)
  }

  private crearFecha(value: unknown) {
    if (DateTime.isDateTime(value)) {
      return value
    }

    if (value instanceof Date) {
      return DateTime.fromJSDate(value)
    }

    return DateTime.fromISO(String(value).slice(0, 10))
  }

  async obtenerRangosOcupados(cabanaId: number) {
    const reservas = await db
      .from('reservas')
      .select('fecha_inicio as fechaInicio', 'fecha_fin as fechaFin')
      .where('id_cabana', cabanaId)
      .whereIn('id_estado_reserva', [1, 2])
      .orderBy('fecha_inicio', 'asc')

    return reservas.map((reserva) => ({
      inicio: this.formatearFecha(reserva.fechaInicio),
      fin: this.formatearFecha(reserva.fechaFin),
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

  async NuevaReserva(datos: any) {
    // Iniciamos la transacción para asegurar la integridad de los datos
    const trx = await db.transaction()

    try {
      // 1. Obtener la Cabaña y validar el precio base
      const cabana = await Cabana.findOrFail(datos.cabanaId, { client: trx })

      // 2. Calcular la cantidad de noches
      const inicio = this.crearFecha(datos.checkin)
      const fin = this.crearFecha(datos.checkout)

      const inicioSQL = inicio.toSQLDate()!
      const finSQL = fin.toSQLDate()!

      const disponible = await this.estaDisponible(cabana.id, inicioSQL, finSQL)

      if (!disponible) {
        throw new Error('La cabana no esta disponible en las fechas seleccionadas.')
      }

      const noches = Math.round(fin.diff(inicio).as('days'))

      if (noches <= 0) {
        throw new Error('La fecha de fin debe ser mayor a la fecha de inicio.')
      }

      // 2. Nos aseguramos de que el precio sea un número (por si la BD devuelve un string o undefined)
      // Si cabana.precioPorNoche es undefined, Number() devuelve NaN. Lo atraparemos en el paso 3.
      const precio = Number(cabana.precioPorNoche)

      // 3. Calculamos y validamos ANTES de asignar al modelo
      const montoTotal = precio * noches


      //console.log(`Debug -> Precio Cabana: ${precio}, Noches: ${noches}, Total: ${montoTotal}`)

      if (isNaN(montoTotal) || montoTotal <= 0) {
        throw new Error(`Error interno: No se pudo calcular el precio total. Precio detectado: ${cabana.precioPorNoche}`)
      }

      // 3. Crear la Reserva (Aún sin huéspedes vinculados)
      const reserva = new Reserva()
      reserva.cabanaId = cabana.id
      reserva.fechaInicio = datos.checkin
      reserva.fechaFin = datos.checkout
      reserva.precioTotal = montoTotal // Asegúrate de que el nombre coincida con tu diagrama (precioTotal vs montoTotal)
      reserva.idEstadoReserva = 1 // Ajustado al nombre de tu columna FK
      reserva.idUsuario = datos.usuarioId // Si lo tienes en los datos de entrada

      // Asignamos la transacción a la reserva y la guardamos
      reserva.useTransaction(trx)
      await reserva.save()

      // 4. Gestionar los Huéspedes y vincularlos a la reserva
      // Asumimos que datos.huespedes es un array de objetos: [{ dni: '123', nombre: 'Juan'... }, ...]
      const huespedesIds: number[] = []

      // Nos aseguramos de que sea un array válido (si por alguna razón es undefined, usamos un array vacío [])
      const listaHuespedes = Array.isArray(datos.huespedes) ? datos.huespedes : []

      //console.log(`Debug ->--------------------------------------`)
      //console.log(`Debug -> lista de Huespedes: ${{ datos }}`)

      const titular = { nombre: datos.nombre, apellido: datos.apellido, documento: datos.documento, telefono: datos.telefono }

      listaHuespedes.unshift(titular)

      for (const datosHuesped of listaHuespedes) {

        // console.log(`Debug ->--------------------------------------`)
        //console.log(datosHuesped)


        const telefono = datosHuesped.telefono?.trim() || null
        const huesped = await Huesped.updateOrCreate(
          { dni: datosHuesped.documento }, // Condición de búsqueda
          {
            nombre: datosHuesped.nombre,
            apellido: datosHuesped.apellido,
            telefono: telefono
          }, // Datos a guardar (o actualizar)
          { client: trx } // Transacción
        )
        huespedesIds.push(huesped.id)
      }

      // Si hay huéspedes, los vinculamos
      if (huespedesIds.length > 0) {
        await reserva.related('huespedes').attach(huespedesIds)
      }

      // 5. Opcional: Cambiar el estado de la Cabaña usando el Patrón State
      //await this.cabanaService.reservarCabana(cabana.id)

      // 6. Confirmar la transacción
      await trx.commit()

      return reserva

    } catch (error: any) {
      // Si algo falla (ej. DNI duplicado de forma incorrecta, fallo de BD), revertimos
      await trx.rollback()
      throw error.message
    }
  }

  async obtenerTodas() {

    return await Reserva.query().preload('estado')
      .preload('huespedes')
      .preload('cabana', (cabanaQuery) => {
        cabanaQuery.preload('servicios')
      })

  }

  async obtenerReservaPorId(id: number) {

    const reserva = await Reserva.query()
      .where('id', id)
      .preload('estado')
      .preload('huespedes')
      .preload('cabana', (cabanaQuery) => {
        cabanaQuery.preload('servicios')
      })
      .firstOrFail()


    return reserva


  }

  /**
   * Obtiene el estado de la reserva por fechas, lo sincroniza en la base de datos 
   * si está desactualizado y retorna el estado correspondiente.
   */
  async calcularEstado(idReserva: number): Promise<'pendiente' | 'activo' | 'finalizado'> {

    const reserva = await Reserva.findOrFail(idReserva)

    // 2. Calculamos el estado basado en el tiempo actual
    const hoy = DateTime.now().startOf('day')
    const inicio = (reserva.fechaInicio instanceof DateTime
      ? reserva.fechaInicio
      : DateTime.fromJSDate(new Date(reserva.fechaInicio))
    ).startOf('day')

    const fin = (reserva.fechaFin instanceof DateTime
      ? reserva.fechaFin
      : DateTime.fromJSDate(new Date(reserva.fechaFin))
    ).startOf('day')

    let estadoCalculado: 'pendiente' | 'activo' | 'finalizado'
    let idEstadoCalculado: number

    // Determinamos el estado y su ID correspondiente en la BD
    if (hoy < inicio) {
      estadoCalculado = 'pendiente'
      idEstadoCalculado = 1 // ID asignado a "Pendiente"
    } else if (hoy > fin) {
      estadoCalculado = 'finalizado'
      idEstadoCalculado = 3 // ID asignado a "Finalizado"
    } else {
      estadoCalculado = 'activo'
      idEstadoCalculado = 2 // ID asignado a "Activo / En curso"
    }

    // 3. Comparamos con el estado actual de la base de datos
    if (reserva.idEstadoReserva !== idEstadoCalculado) {
      // Si es distinto, modificamos el registro y guardamos
      reserva.idEstadoReserva = idEstadoCalculado
      await reserva.save()

      console.log(`[Sincronizador] Reserva ID ${reserva.id} actualizada físicamente a: ${estadoCalculado}`)
    } else {
      // Si es igual, no hace nada (se salta el guardado)
      console.log(`[Sincronizador] Reserva ID ${reserva.id} ya estaba sincronizada como: ${estadoCalculado}`)
    }

    // 4. Retornamos el estado de texto
    return estadoCalculado
  }
}
