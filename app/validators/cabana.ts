import vine from '@vinejs/vine'


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
    descripcion: vine.string().trim().maxLength(500),
    capacidad: vine.number().min(1).max(50),
    habitaciones: vine.number().min(1).max(10),
    precio_por_noche: vine.number().min(0),

})