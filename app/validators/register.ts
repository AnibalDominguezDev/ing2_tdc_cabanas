import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'

export const registerValidator = vine.compile(
  vine.object({
    nombre: vine.string().minLength(2).maxLength(100),

    apellido: vine.string().minLength(2).maxLength(100),

    email: vine
      .string()
      .email()
      .unique(async (dbRef, value) => {
        const usuario = await db
          .from('usuario')
          .where('email', value)
          .first()

        return !usuario
      }),

    dni: vine
      .string()
      .regex(/^\d{7,11}$/)
      .unique(async (dbRef, value) => {
        const usuario = await db
          .from('usuario')
          .where('dni', value)
          .first()

        return !usuario
      }),

    contrasena: vine.string().minLength(6),
  })
) 
