import { test } from '@japa/runner'
import { CabanaService } from '#services/cabana_service'
import Cabana from '#models/cabana'
import Servicio from '#models/servicio'
import db from '@adonisjs/lucid/services/db'

test.group('CabanaService', (group) => {
  let cabanaService: CabanaService

  // Instanciamos el servicio antes de todo el grupo
  group.setup(() => {
    cabanaService = new CabanaService()
  })

  // Usamos una transacción global por cada test. 
  // Esto asegura que la BD quede limpia exactamente como estaba antes del test.
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  // --- TESTS DE OBTENCIÓN (READ) ---

  test('obtenerTodas - debe retornar todas las cabañas', async ({ assert }) => {
    await Cabana.createMany([
      { nombre: 'Cabaña 1', capacidad: 2, precioPorNoche: 100, idEstado: 1 },
      { nombre: 'Cabaña 2', capacidad: 4, precioPorNoche: 200, idEstado: 2 }
    ])

    const cabanas = await cabanaService.obtenerTodas()
    assert.isAtLeast(cabanas.length, 2)
  })

  test('obtenerActivas - debe retornar solo cabañas con id_estado 1 e incluir servicios', async ({ assert }) => {
    const cabanaActiva = await Cabana.create({ nombre: 'Activa', idEstado: 1, precioPorNoche: 100 })
    await Cabana.create({ nombre: 'Eliminada', idEstado: 4, precioPorNoche: 100 }) // No debe salir

    const servicio = await Servicio.create({ nombre: 'Wifi' })
    await cabanaActiva.related('servicios').attach([servicio.id])

    const activas = await cabanaService.obtenerActivas()

    // 1. Verificamos que todas las que trajo (viejas y nuevas) tengan estado 1
    assert.isTrue(activas.every(c => c.idEstado === 1))

    // 2. Aislamos específicamente la cabaña que creamos para el test
    const cabanaDelTest = activas.find(c => c.id === cabanaActiva.id)

    // 3. Verificamos que el preload funcionó
    assert.isDefined(cabanaDelTest, 'La cabaña creada no apareció en la lista de activas')
    assert.isDefined(cabanaDelTest!.servicios, 'Los servicios no se cargaron con preload')

    // 4. Buscamos que el servicio Wifi esté entre los servicios de esta cabaña
    const tieneWifi = cabanaDelTest!.servicios.some(s => s.nombre === 'Wifi')
    assert.isTrue(tieneWifi, 'La cabaña no tiene el servicio Wifi vinculado')
  })

  // --- TESTS DE CREACIÓN Y ACTUALIZACIÓN ---

  test('crear - debe crear una cabaña y vincular servicios', async ({ assert }) => {
    const servicio = await Servicio.create({ nombre: 'Desayuno' })

    const datosCabana = {
      nombre: 'Nueva Cabaña',
      descripcion: 'Hermosa vista',
      capacidad: 5,
      habitaciones: 2,
      precio_por_noche: 15000
    }

    // Pasamos null al archivo de imagen para aislar la prueba de la BD
    const cabana = await cabanaService.agregarCabana(datosCabana, [servicio.id], null)

    assert.isTrue(cabana.$isPersisted)
    assert.equal(cabana.nombre, 'Nueva Cabaña')
    assert.equal(cabana.idEstado, 1) // Debe asignarse 1 por defecto

    await cabana.load('servicios')
    assert.equal(cabana.servicios.length, 1)
    assert.equal(cabana.servicios[0].id, servicio.id)
  })

  // --- TESTS DEL PATRÓN STATE (TRANSICIONES) ---
  // Nota: Asumimos los siguientes IDs: 1=Disponible,2=Mantenimiento, 3=Ocupada, 4=Eliminada

  test('reservarCabana - debe transicionar de Disponible (1) a Ocupada (3)', async ({ assert }) => {
    const cabana = await Cabana.create({ nombre: 'Test', idEstado: 1, precioPorNoche: 100 })

    const cabanaActualizada = await cabanaService.reservarCabana(cabana.id)
    assert.equal(cabanaActualizada.idEstado, 3)
  })

  test('reservarCabana - debe fallar si intenta reservar una cabaña en Mantenimiento (2)', async ({ assert }) => {
    const cabana = await Cabana.create({ nombre: 'Test', idEstado: 2, precioPorNoche: 100 })

    // Al intentar transicionar un estado inválido, el Patrón State debe arrojar un error
    await assert.rejects(async () => {
      await cabanaService.reservarCabana(cabana.id)
    })
  })

  test('liberarCabana - debe transicionar de Ocupada (3) a Disponible (1)', async ({ assert }) => {
    const cabana = await Cabana.create({ nombre: 'Test', idEstado: 3, precioPorNoche: 100 })

    const cabanaActualizada = await cabanaService.liberarCabana(cabana.id)
    assert.equal(cabanaActualizada.idEstado, 1)
  })

  test('establecerMantenimiento - debe transicionar de Disponible (1) a Mantenimiento (2)', async ({ assert }) => {
    const cabana = await Cabana.create({ nombre: 'Test', idEstado: 1, precioPorNoche: 100 })

    const cabanaActualizada = await cabanaService.establecerMantenimiento(cabana.id)
    assert.equal(cabanaActualizada.idEstado, 2)
  })

  test('eliminar - debe transicionar cualquier estado permitido a Eliminada (4)', async ({ assert }) => {
    // Probamos eliminando una disponible
    const cabana = await Cabana.create({ nombre: 'Test', idEstado: 1, precioPorNoche: 100 })

    const cabanaActualizada = await cabanaService.eliminar(cabana.id)
    assert.equal(cabanaActualizada.idEstado, 4)
  })
})