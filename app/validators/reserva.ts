import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const mensajesReserva = new SimpleMessagesProvider({
  required: 'Este campo es obligatorio.',
  string: 'Debe ser un texto valido.',
  minLength: 'Este campo es obligatorio.',
  maxLength: 'Has superado el limite de caracteres permitido.',
  date: 'Debes ingresar una fecha valida.',
  afterField: 'La fecha de salida debe ser posterior a la de entrada.',

  'checkin.required': 'Selecciona una fecha de entrada.',
  'checkout.required': 'Selecciona una fecha de salida.',

  'nombre.required': 'El nombre es obligatorio.',
  'nombre.minLength': 'El nombre es obligatorio.',
  'apellido.required': 'El apellido es obligatorio.',
  'apellido.minLength': 'El apellido es obligatorio.',
  'documento.required': 'El DNI es obligatorio.',
  'documento.regex': 'El DNI debe tener exactamente 8 numeros, sin puntos ni espacios.',
  'telefono.regex': 'El telefono debe tener 10 numeros exactos o dejarse vacio.',

  'huespedes.*.nombre.required': 'El nombre del acompañante es obligatorio.',
  'huespedes.*.nombre.minLength': 'El nombre del acompañante es obligatorio.',
  'huespedes.*.apellido.required': 'El apellido del acompañante es obligatorio.',
  'huespedes.*.apellido.minLength': 'El apellido del acompañante es obligatorio.',
  'huespedes.*.documento.required': 'El DNI del acompañante es obligatorio.',
  'huespedes.*.documento.regex': 'El DNI del acompañante debe tener exactamente 8 numeros.',
  'huespedes.*.telefono.regex':
    'El telefono del acompañante debe tener 10 numeros exactos o dejarse vacio.',
  validation: 'Revisa los campos marcados e intenta nuevamente.',
})

export const ReservaValidator = vine.create(
  vine.object({
    cabanaId: vine.number(),
    checkin: vine.date({ formats: ['YYYY-MM-DD'] }),
    checkout: vine.date({ formats: ['YYYY-MM-DD'] }).afterField('checkin'),

    nombre: vine.string().trim().minLength(1).maxLength(90),
    apellido: vine.string().trim().minLength(1).maxLength(90),
    documento: vine.string().trim().regex(/^[0-9]{8}$/),
    telefono: vine.string().trim().regex(/^$|^[0-9]{10}$/).optional(),

    huespedes: vine
      .array(
        vine.object({
          nombre: vine.string().trim().minLength(1).maxLength(90),
          apellido: vine.string().trim().minLength(1).maxLength(90),
          documento: vine.string().trim().regex(/^[0-9]{8}$/),
          telefono: vine.string().trim().regex(/^$|^[0-9]{10}$/).optional(),
        })
      )
      .optional(),
  })
)
