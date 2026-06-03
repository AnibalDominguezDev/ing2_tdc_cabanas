import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    contrasena: vine.string().trim().minLength(1),
  })
)