import { DateTime } from "luxon"

export class formateadorFecha {

    public static formatearFecha(value: string | Date) {
        if (value instanceof Date) {
            const year = value.getFullYear()
            const month = String(value.getMonth() + 1).padStart(2, '0')
            const day = String(value.getDate()).padStart(2, '0')

            return `${year}-${month}-${day}`
        }

        return value.slice(0, 10)
    }

    public static crearFecha(value: unknown) {
        if (DateTime.isDateTime(value)) {
            return value
        }

        if (value instanceof Date) {
            return DateTime.fromJSDate(value)
        }

        return DateTime.fromISO(String(value).slice(0, 10))
    }

}