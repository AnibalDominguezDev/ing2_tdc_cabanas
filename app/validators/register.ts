import vine from '@vinejs/vine'


export const registerValidator = vine.compile(
  vine.object({
    nombre: vine.string().minLength(2).maxLength(100),
    apellido: vine.string().minLength(2).maxLength(100),
    email: vine.string().email(),
    dni: vine.string().minLength(7).maxLength(11),
    contrasena: vine.string().minLength(6),
  })
)


