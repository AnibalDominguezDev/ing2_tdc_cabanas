import { test } from '@japa/runner'
import { ReservaService } from '#services/reserva_service'
import { CabanaService } from '#services/cabana_service'
import Cabana from '#models/cabana'
import Reserva from '#models/reserva'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

test.group('ReservaService', (group) => {
  let reservaService: ReservaService
  let cabanaService: CabanaService

  // Instanciamos los servicios inyectando las dependencias manualmente
  group.setup(() => {
    cabanaService = new CabanaService()
    reservaService = new ReservaService(cabanaService)
  })

  // Transacción global para no ensuciar la base de datos real
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  // --- TESTS DE CREACIÓN Y OVERBOOKING ---

  test('registrarReserva - debe crear una reserva exitosa con titular y huéspedes', async ({ assert }) => {
    // 1. Preparamos una cabaña de prueba
    const cabana = await Cabana.create({ nombre: 'Cabaña Test', capacidad: 4, precioPorNoche: 10000, idEstado: 1 })

    const datosReserva = {
      cabanaId: cabana.id,
      checkin: '2026-10-01',
      checkout: '2026-10-05',
      nombre: 'Benjamin',
      apellido: 'Admin',
      documento: '12345678',
      telefono: '3794000000',
      huespedes: [
        { nombre: 'Acompañante', apellido: 'Uno', documento: '87654321', telefono: null }
      ]
    }

    const reserva = await reservaService.registrarReserva(datosReserva)

    // 2. Verificamos la reserva principal
    assert.isTrue(reserva.$isPersisted)
    assert.equal(reserva.precioTotal, 40000) // 4 noches * 10000
    assert.equal(reserva.idEstadoReserva, 1)

    // 3. Verificamos que los huéspedes (Titular + Acompañante) se hayan vinculado
    await reserva.load('huespedes')
    assert.equal(reserva.huespedes.length, 2)

    const dnisGuardados = reserva.huespedes.map(h => h.dni)
    assert.include(dnisGuardados, '12345678') // Verifica el Titular
    assert.include(dnisGuardados, '87654321') // Verifica el Acompañante
  })

  test('registrarReserva - debe lanzar error por overbooking si las fechas chocan', async ({ assert }) => {
    const cabana = await Cabana.create({ nombre: 'Cabaña Test', capacidad: 4, precioPorNoche: 10000, idEstado: 1 })

    // Creamos una reserva inicial directamente en la BD
    await Reserva.create({
      cabanaId: cabana.id,
      fechaInicio: DateTime.fromISO('2026-10-10'),
      fechaFin: DateTime.fromISO('2026-10-15'),
      precioTotal: 50000,
      idEstadoReserva: 1
    })

    // Intentamos registrar otra que se solapa (entra el 12, sale el 18)
    const datosSolapados = {
      cabanaId: cabana.id,
      checkin: '2026-10-12',
      checkout: '2026-10-18',
      nombre: 'Usuario',
      apellido: 'Choque',
      documento: '11111111'
    }

    await assert.rejects(async () => {
      await reservaService.registrarReserva(datosSolapados)
    }, 'La cabana no esta disponible en las fechas seleccionadas.')
  })

  test('registrarReserva - debe lanzar error si el checkout es antes del checkin', async ({ assert }) => {
    const cabana = await Cabana.create({ nombre: 'Cabaña Test', capacidad: 2, precioPorNoche: 5000, idEstado: 1 })

    const datosInvalidos = {
      cabanaId: cabana.id,
      checkin: '2026-11-20',
      checkout: '2026-11-15', // Fecha ilógica
      nombre: 'Viajero',
      apellido: 'Tiempo',
      documento: '99999999'
    }

    await assert.rejects(async () => {
      await reservaService.registrarReserva(datosInvalidos)
    }, 'La fecha de fin debe ser mayor a la fecha de inicio.')
  })

  // --- TESTS DE OBTENCIÓN CON RELACIONES ---

  test('obtenerReservaPorId - debe cargar la reserva con todas sus relaciones anidadas', async ({ assert }) => {
    const cabana = await Cabana.create({ nombre: 'Cabaña VIP', idEstado: 1, precioPorNoche: 200 })
    const reservaBase = await Reserva.create({
      cabanaId: cabana.id,
      fechaInicio: DateTime.now().plus({ days: 1 }),
      fechaFin: DateTime.now().plus({ days: 3 }),
      precioTotal: 400,
      idEstadoReserva: 1
    })

    const reserva = await reservaService.obtenerReservaPorId(reservaBase.id)

    assert.isDefined(reserva.cabana, 'No precargó la cabaña')
    assert.isDefined(reserva.huespedes, 'No precargó los huéspedes')
    assert.equal(reserva.cabana.nombre, 'Cabaña VIP')
  })

  // --- TESTS DEL SINCRONIZADOR DE ESTADOS DE RESERVA ---

  test('calcularEstado - debe marcar como PENDIENTE una reserva futura', async ({ assert }) => {
    const reserva = await Reserva.create({
      cabanaId: 1, // Usamos ID dummy, no necesitamos la cabaña real aquí
      fechaInicio: DateTime.now().plus({ days: 5 }), // Empieza en 5 días
      fechaFin: DateTime.now().plus({ days: 10 }),
      precioTotal: 1000,
      idEstadoReserva: 3 // Forzamos un estado erróneo en BD para ver si lo arregla
    })

    const estado = await reservaService.calcularEstado(reserva.id)

    assert.equal(estado, 'pendiente')
    // Verificamos que se haya actualizado físicamente en la BD al ID 1
    const reservaActualizada = await Reserva.findOrFail(reserva.id)
    assert.equal(reservaActualizada.idEstadoReserva, 1)
  })

  test('calcularEstado - debe marcar como ACTIVO una reserva en curso', async ({ assert }) => {
    const reserva = await Reserva.create({
      cabanaId: 1,
      fechaInicio: DateTime.now().minus({ days: 2 }), // Empezó hace 2 días
      fechaFin: DateTime.now().plus({ days: 2 }),     // Termina en 2 días
      precioTotal: 1000,
      idEstadoReserva: 1
    })

    const estado = await reservaService.calcularEstado(reserva.id)

    assert.equal(estado, 'activo')
    const reservaActualizada = await Reserva.findOrFail(reserva.id)
    assert.equal(reservaActualizada.idEstadoReserva, 2)
  })

  test('calcularEstado - debe marcar como FINALIZADO una reserva antigua', async ({ assert }) => {
    const reserva = await Reserva.create({
      cabanaId: 1,
      fechaInicio: DateTime.now().minus({ days: 10 }), // Empezó hace 10 días
      fechaFin: DateTime.now().minus({ days: 5 }),     // Terminó hace 5 días
      precioTotal: 1000,
      idEstadoReserva: 2
    })

    const estado = await reservaService.calcularEstado(reserva.id)

    assert.equal(estado, 'finalizado')
    const reservaActualizada = await Reserva.findOrFail(reserva.id)
    assert.equal(reservaActualizada.idEstadoReserva, 3)
  })
})