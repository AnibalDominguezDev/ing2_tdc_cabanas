import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const mensajesReserva = new SimpleMessagesProvider({
    // --- Mensajes Genéricos (Atrapan cualquier error general) ---
    'required': 'Este campo es obligatorio.',
    'string': 'Debe ser un texto válido.',
    'maxLength': 'Has superado el límite de caracteres permitido.',
    'date': 'Debes ingresar una fecha válida.',
    'afterField': 'La fecha de salida debe ser posterior a la de entrada.',

    // --- Mensajes Específicos para el Huésped Principal ---
    'documento.regex': 'El DNI/Pasaporte debe tener entre 8 y 11 números, sin puntos ni espacios.',
    'telefono.regex': 'El teléfono debe tener 10 números exactos (ej. 3794123456).',

    // --- Mensajes Específicos para los Acompañantes Dinámicos ---
    // El comodín .* aplica el mensaje a cualquier posición del array
    'acompanantes.*.required': 'AAAAAAAAAAAAA.',
    'acompanantes.*.nombre.required': 'El nombre del acompañante es obligatorio.',
    'acompanantes.*.apellido.required': 'El apellido del acompañante es obligatorio.',
    'acompanantes.*.documento.required': 'El documento del acompañante es obligatorio.',
    'acompanantes.*.documento.regex': 'El documento debe tener entre 8 y 11 números, sin espacios.',
    'acompanantes.*.telefono.regex': 'El teléfono del acompañante no tiene un formato válido.',
    'validation': 'Error de formulario: Por favor verifique los campos y intente denuevo.'
})

export const ReservaValidator = vine.create(
    vine.object({
        // --- Fechas de Estadía ---
        cabanaId: vine.number(),
        checkin: vine.date({ formats: ['YYYY-MM-DD'] }),
        checkout: vine.date({ formats: ['YYYY-MM-DD'] })
            .afterField('checkin'),

        // --- Huésped Principal ---
        nombre: vine.string().trim().maxLength(90),
        apellido: vine.string().trim().maxLength(90),
        // Regex: Solo números del 0 al 9, entre 8 y 11 caracteres (DNI o CUIL)
        documento: vine.string().trim().regex(/^[0-9]{8,11}$/),
        // Regex: Solo números, exactamente 10 caracteres. Como es opcional, usamos .optional()
        telefono: vine.string().trim().regex(/^[0-9]{10}$/).optional(),

        // --- Acompañantes  ---
        huespedes: vine.array(
            vine.object({
                nombre: vine.string().trim().maxLength(90),
                apellido: vine.string().trim().maxLength(90),
                documento: vine.string().trim().regex(/^[0-9]{8,11}$/),
                telefono: vine.string().trim().regex(/^[0-9]{10}$/).optional(),
            })
        ).optional()
    })
)