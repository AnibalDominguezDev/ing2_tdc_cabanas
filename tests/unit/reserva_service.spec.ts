import { test } from '@japa/runner'
import { ReservaService } from '#services/reserva_service'
import { CabanaService } from '#services/cabana_service'
import Cabana from '#models/cabana'
import Reserva from '#models/reserva'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Usuario from '#models/usuario'
import { ReservaValidator } from '#validators/reserva'

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

  // --- TESTS DE CREACIÓN  ---

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
    const cabana = await Cabana.create({ nombre: 'Cabaña VIP', idEstado: 1, precioPorNoche: 200 })

    const reserva = await Reserva.create({
      cabanaId: cabana.id,
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

    const cabana = await Cabana.create({ nombre: 'Cabaña VIP', idEstado: 1, precioPorNoche: 200 })

    const reserva = await Reserva.create({
      cabanaId: cabana.id,
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
    const cabana = await Cabana.create({ nombre: 'Cabaña VIP', idEstado: 1, precioPorNoche: 200 })

    const reserva = await Reserva.create({
      cabanaId: cabana.id,
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


test.group('Registrar Reserva - Validaciones QA', (group) => {
  let reservaService: ReservaService
  let cabanaService: CabanaService
  let cabanaBase: Cabana
  let usuarioBase: Usuario

  group.setup(() => {
    cabanaService = new CabanaService()
    reservaService = new ReservaService(cabanaService)
  })

  // Transacción global y datos base para cada test
  group.each.setup(async () => {
    await db.beginGlobalTransaction()

    // Creamos datos válidos que usaremos en la mayoría de los casos
    usuarioBase = await Usuario.create({
      nombre: 'Benjamin', apellido: 'Admin', dni: '11111111',
      email: 'benjamin@test.com', contrasena: '123456', idRol: 1
    })

    cabanaBase = await Cabana.create({
      nombre: 'Cabaña 1', capacidad: 4, precioPorNoche: 10000, idEstado: 1
    })

    return () => db.rollbackGlobalTransaction()
  })

  // --- CASO 1: ÉXITO ---
  test('Caso 1: Registro normal de una reserva con datos válidos', async ({ assert }) => {
    const payload = {
      cabanaId: cabanaBase.id,
      usuarioId: usuarioBase.idUsuario,
      checkin: '2026-10-01',
      checkout: '2026-10-03',
      nombre: 'Juan',
      apellido: 'Pérez',
      documento: '12345678',
      telefono: '3794000000'
    }

    const reserva = await reservaService.registrarReserva(payload)

    assert.isTrue(reserva.$isPersisted)
    assert.equal(reserva.cabanaId, cabanaBase.id)
  })

  // --- CASO 2: CABAÑA INEXISTENTE ---
  test('Caso 2: Registro de reserva con cabaña inexistente debe fallar', async ({ assert }) => {
    const payload = {
      cabanaId: 999, // Inválido
      usuarioId: usuarioBase.idUsuario,
      checkin: '2026-10-04',
      checkout: '2026-10-06',
      nombre: 'Juan',
      apellido: 'Pérez',
      documento: '12345678'
    }

    // El servicio hará un Cabana.findOrFail(999) y rechazará la promesa
    await assert.rejects(async () => {
      await reservaService.registrarReserva(payload)
    })
  })

  // --- CASO 3: USUARIO INEXISTENTE ---
  test('Caso 3: Registro de reserva con usuario inexistente debe fallar', async ({ assert }) => {
    const payload = {
      cabanaId: cabanaBase.id,
      usuarioId: 999, // Inválido
      checkin: '2026-10-07',
      checkout: '2026-10-09',
      nombre: 'Juan',
      apellido: 'Pérez',
      documento: '12345678'
    }

    // Al intentar guardar, la llave foránea de MySQL rechazará el id_usuario inexistente
    await assert.rejects(async () => {
      await reservaService.registrarReserva(payload)
    })
  })

  // --- CASO 4: CAPACIDAD MÁXIMA ---
  test('Caso 4: Registro de reserva alcanzando capacidad máxima debe ser exitoso', async ({ assert }) => {
    // Backend test: Simulamos enviar al titular + 3 acompañantes (4 en total, límite de la cabaña)
    const payload = {
      cabanaId: cabanaBase.id,
      usuarioId: usuarioBase.idUsuario,
      checkin: '2026-10-10',
      checkout: '2026-10-12',
      nombre: 'Titular',
      apellido: 'Uno',
      documento: '11111111',
      huespedes: [
        { nombre: 'Acomp', apellido: 'Dos', documento: '22222222' },
        { nombre: 'Acomp', apellido: 'Tres', documento: '33333333' },
        { nombre: 'Acomp', apellido: 'Cuatro', documento: '44444444' }
      ]
    }

    const reserva = await reservaService.registrarReserva(payload)
    await reserva.load('huespedes')

    assert.isTrue(reserva.$isPersisted)
    assert.equal(reserva.huespedes.length, 4) // El backend procesó correctamente el máximo
  })

  // --- CASO 5: DNI INVÁLIDO ---
  test('Caso 5: Registro con DNI inválido debe fallar en el validador', async ({ assert }) => {
    const payload = {
      cabanaId: cabanaBase.id,
      checkin: '2026-10-13',
      checkout: '2026-10-15',
      nombre: 'Juan',
      apellido: 'Pérez',
      documento: '123', // Inválido (VineJS debería bloquearlo si tienes regla de 8 caracteres)
      telefono: '3794000000'
    }

    // El frontend fallaría al intentar pasar por VineJS
    await assert.rejects(async () => {
      await ReservaValidator.validate(payload)
    })
  })

  // --- CASO 6: FECHAS OCUPADAS (OVERBOOKING) ---
  test('Caso 6: Registro en fechas ya ocupadas debe fallar', async ({ assert }) => {
    // 1. Creamos la reserva original
    const payloadOriginal = {
      cabanaId: cabanaBase.id,
      usuarioId: usuarioBase.idUsuario,
      checkin: '2026-10-01',
      checkout: '2026-10-03',
      nombre: 'Primero',
      apellido: 'Ocupante',
      documento: '11111111'
    }
    await reservaService.registrarReserva(payloadOriginal)

    // 2. Intentamos crear otra reserva en la misma cabaña con fechas solapadas
    const payloadSolapado = {
      cabanaId: cabanaBase.id,
      usuarioId: usuarioBase.idUsuario,
      checkin: '2026-10-01', // Mismas fechas
      checkout: '2026-10-03',
      nombre: 'Segundo',
      apellido: 'Intento',
      documento: '22222222'
    }

    // Tu ReservaService debe lanzar el Error de disponibilidad
    await assert.rejects(async () => {
      await reservaService.registrarReserva(payloadSolapado)
    })
  })
})