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

  async NuevaReserva(datos: any) {
    // Iniciamos la transacción para asegurar la integridad de los datos
    const trx = await db.transaction()

    try {
      // 1. Obtener la Cabaña y validar el precio base
      const cabana = await Cabana.findOrFail(datos.cabanaId, { client: trx })

      const fechaIn = new Date(datos.checkin)
      const fechaOut = new Date(datos.checkout)

      // 2. Calcular la cantidad de noches
      const inicio = DateTime.fromJSDate(fechaIn)
      const fin = DateTime.fromJSDate(fechaOut)

      const inicioSQL = inicio.toSQLDate()!
      const finSQL = fin.toSQLDate()!

      const reservaConflictiva = await Reserva.query()
        .where('cabanaId', cabana.id)
        // Opcional: Si tienes un estado "Cancelada" (ej. ID 4), descomenta la siguiente línea:
        // .where('idEstadoReserva', '!=', 4) 
        .where((query) => {
          query
            .where('fechaInicio', '<', finSQL)
            .andWhere('fechaFin', '>', inicioSQL)
        })
        .first() // Solo necesitamos saber si existe al menos UNA que choque

      if (reservaConflictiva) {
        throw new Error('La cabaña no está disponible en las fechas seleccionadas.')
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

      // Agregamos un console.log temporal para ayudarte a depurar qué dato está roto
      console.log(`Debug -> Precio Cabana: ${precio}, Noches: ${noches}, Total: ${montoTotal}`)

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

      console.log(`Debug ->--------------------------------------`)
      console.log(`Debug -> lista de Huespedes: ${{ datos }}`)

      const titular = { nombre: datos.nombre, apellido: datos.apellido, documento: datos.documento, telefono: datos.telefono }

      listaHuespedes.unshift(titular)

      for (const datosHuesped of listaHuespedes) {

        console.log(`Debug ->--------------------------------------`)
        console.log(datosHuesped)


        const huesped = await Huesped.updateOrCreate(
          { dni: datosHuesped.documento },
          {
            nombre: datosHuesped.nombre,
            apellido: datosHuesped.apellido,
            telefono: datosHuesped.telefono
          },
          { client: trx }
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

  // async NuevaReserva(datos: any) {
  //   console.log('===========================NUEVA==================================')
  //   console.log({ datos })
  // }
}