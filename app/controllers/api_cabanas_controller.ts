import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { validadorCabana, mensajesCabana } from '#validators/cabana'

export default class ApiCabanasController {

    async store({ request, response }: HttpContext) {
        try {

            const datos = await request.validateUsing(validadorCabana, {
                messagesProvider: mensajesCabana
            })


            const imagen = datos.imagen || null


            await db.rawQuery(
                `CALL agregarCabana(?, ?, ?, ?, ?, ?, @id_cabana)`,
                [
                    datos.nombre,
                    datos.descripcion,
                    datos.habitaciones,
                    datos.capacidad,
                    datos.precio_por_noche,
                    imagen
                ]
            )


            const result = await db.rawQuery('SELECT @id_cabana AS id')
            const idGenerado = result[0][0].id


            return response.status(201).json({
                success: "ok",
                mensaje: "Cabaña creada correctamente",
                id_nueva_cabana: idGenerado
            })

        } catch (error: any) {
            if (error.messages) {
                const mensajeErrores = error.messages.map((e: any) => e.message).join(' | ')

                return response.status(400).json({
                    success: "false",
                    mensaje: mensajeErrores
                })
            }

            return response.status(500).json({
                success: "false",
                mensaje: error.message || "Error interno del servidor"
            })
        }
    }
    // Datos de prueba 
    //
    //     {
    //   "nombre": "Cabaña del api",
    //   "descripcion": "Cabaña amplia con vista al lago",
    //   "habitaciones": 2,
    //   "capacidad": 4,
    //   "precio_por_noche": 85000,
    //   "imagen": null
    // }
}