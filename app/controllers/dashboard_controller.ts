import Cabana from '#models/cabana'
import Reserva from '#models/reserva'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class DashboardController {
    public async index({ view }: HttpContext) {

        // 1. Ejecutamos AMBOS procedimientos al mismo tiempo para mayor velocidad
        const [resultadoGenerales, resultadoSecundarias] = await Promise.all([
            db.rawQuery('CALL obtenerEstadisticasGenerales()'),
            db.rawQuery('CALL obtenerEstadisticasSecundarias()')
        ])

        // 2. Extraemos los objetos de los arreglos anidados
        const estadisticas = resultadoGenerales[0][0][0] || {}
        const metricasExtra = resultadoSecundarias[0][0][0] || {}

        // 3. Formateo de Ingresos Totales (M o k)
        const ingresosBrutos = Number(estadisticas.ingresos_totales || 0)
        let ingresosFormateados = ingresosBrutos.toString()

        if (ingresosBrutos >= 1000000) {
            ingresosFormateados = (ingresosBrutos / 1000000).toFixed(2) + 'M'
        } else if (ingresosBrutos >= 1000) {
            ingresosFormateados = (ingresosBrutos / 1000).toFixed(1) + 'k'
        }

        const tarifaRedondeada = Math.round(Number(estadisticas.tarifa_promedio || 0))
        const ingresoHuespedRedondeado = Math.round(Number(metricasExtra.ingreso_por_huesped || 0))

        // 4. Empaquetamos todo junto
        const datosVista = {
            // Del primer SP
            ingresosTotales: ingresosFormateados,
            cabanasTotales: estadisticas.cabanas_totales || 0,
            reservasTotales: estadisticas.reservas_totales || 0,
            tarifaPromedio: tarifaRedondeada.toLocaleString('es-AR'),

            // Del segundo SP
            nuevasReservasSemana: metricasExtra.nuevas_reservas_semana || 0,
            cabanasEnMantenimiento: metricasExtra.cabanas_en_mantenimiento || 0,
            cabanaEstrella: metricasExtra.cabana_estrella || 'Sin datos aún',
            ingresoPorHuesped: ingresoHuespedRedondeado.toLocaleString('es-AR'),

            // Pendiente de implementar
            crecimientoIngresos: 0
        }
        // 3. Renderizamos la vista pasándole los datos
        return view.render('pages/admin/dashboard', datosVista)
    }
}