/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| The validator file is used for configuring global transforms for VineJS.
| The transform below converts all VineJS date outputs from JavaScript
| Date objects to Luxon DateTime instances, so that validated dates are
| ready to use with Lucid models and other parts of the app that expect
| Luxon DateTime.
|
*/

import { DateTime } from 'luxon'
import { VineDate } from '@vinejs/vine'
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))



vine.messagesProvider = new SimpleMessagesProvider({
  required: 'El campo {{ field }} es obligatorio',
  string: 'El campo {{ field }} debe ser texto',
  email: 'El campo {{ field }} debe ser un correo válido',

  minLength: 'El campo {{ field }} debe tener al menos {{ min }} caracteres',
  maxLength: 'El campo {{ field }} no debe superar los {{ max }} caracteres',

  'nombre.minLength': 'El nombre debe tener al menos {{ min }} caracteres',
  'apellido.minLength': 'El apellido debe tener al menos {{ min }} caracteres',
  'dni.minLength': 'El DNI debe tener al menos {{ min }} caracteres',
  'contrasena.minLength': 'La contraseña debe tener al menos {{ min }} caracteres',
})
