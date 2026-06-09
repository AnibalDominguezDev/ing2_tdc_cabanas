import vine, { SimpleMessagesProvider } from '@vinejs/vine'


export const mensajesCabana = new SimpleMessagesProvider({
    required: 'Este campo es obligatorio.',
    string: 'Debe ser un texto valido.',
    minLength: 'Este campo es obligatorio.',
    maxLength: 'Has superado el limite de caracteres permitido.',
    date: 'Debes ingresar una fecha valida.',
    afterField: 'La fecha de salida debe ser posterior a la de entrada.',

    'nombre.required': 'El nombre es obligatorio.',
    'nombre.database.unique': 'Ya existe una cabaña con este nombre.',
    'nombre.minLength': 'El nombre es obligatorio.',

    'file.extname': 'La imagen esta en un formato no soportado',

    'capacidad.min': 'El valor de capacidad debe ser por lo menos 1',
    'habitaciones.min': 'La cantidad de habitaciones debe ser por lo menos 1',
    'precio_por_noche.min': 'El precio debe ser un numero mayor a cero',
    validation: 'Revisa los campos marcados e intenta nuevamente.',
})


export const validadorCabana = vine.create({
    nombre: vine.string().trim().unique({
        table: 'cabana',
        column: 'nombre',
        filter: (db, value, field) => {

            if (field.meta.cabanaId) {
                db.whereNot('id_cabana', field.meta.cabanaId)

            }
        }
    }).minLength(3).maxLength(100),
    descripcion: vine.string().trim().maxLength(700),
    capacidad: vine.number().min(1).max(50),
    habitaciones: vine.number().min(1).max(10),
    precio_por_noche: vine.number().min(1).positive(),
    imagen: vine.file({ size: '10mb', extnames: ['png', 'jpg', 'webp'] }).optional()

})