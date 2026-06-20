/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'
import RegisterController from '#controllers/auth/register_controller'
import LoginController from '#controllers/auth/login_controller'
import MisReservasController from '#controllers/mis_reservas_controller'

router.on('/').render('pages/home').as('home')
router.get('/cabanas', [controllers.Cabanas, 'listar']).as('cabanas')
router.get('/cabana/:slug', [controllers.Cabanas, 'mostrar']).as('cabanas.mostrar')

// 1. Importación diferida (Lazy loading) recomendada en AdonisJS 6
const ApiCabanasController = () => import('#controllers/api_cabanas_controller')

// 2. Agrupamos todas las rutas de la API bajo el prefijo /api/v1
router.group(() => {

  // Endpoint: POST /api/v1/cabanas
  router.post('/cabanas', [ApiCabanasController, 'store'])

  // Aquí podrás agregar más endpoints en el futuro:
  // router.get('/cabanas', ...)
  // router.put('/cabanas/:id', ...)

}).prefix('/api/v1');

router
  .group(() => {
    router.get('/gestion', [controllers.Cabanas, 'admin']).as('gestion')
    router.get('/cabanas/editar/:slug', [controllers.Cabanas, 'editar']).as('cabanas.editar')
    router.get('/cabanas/alta', [controllers.Cabanas, 'crear']).as('nuevaCabana')
    router.post('cabanas/guardar', [controllers.Cabanas, 'agregarCabana']).as('guardar')
    router.put('cabanas/modificar', [controllers.Cabanas, 'actualizar']).as('modificar')
    router.delete('cabanas/eliminar/:id', [controllers.Cabanas, 'eliminarCabana']).as('cabanas.eliminar')
    router.get('/cabanas/mantenimiento/:id', [controllers.Cabanas, 'mantenimiento']).as('cabanas.mantenimiento')
    router.get('gestion/cabanas-eliminadas', [controllers.Cabanas, 'listarEliminadas']).as('cabanas.eliminadas')
    router.get('gestion/reactivar/:id', [controllers.Cabanas, 'reactivar']).as('cabana.reactivar')
    router.get('admin/reservas', [controllers.Reservas, 'listarTodasAdmin']).as('admin.reservas')
    router.get('admin/reservas/:id', [controllers.Reservas, 'detalleReservaAdmin']).as('admin.detalleReserva')
    router.get('admin/dashboard', [controllers.Dashboard, 'index']).as('admin.index')
  })
  .use(middleware.admin())

router.get('/register', [RegisterController, 'show'])
router.post('/register', [RegisterController, 'store'])
router.get('/mis-reservas', [MisReservasController, 'index']).as('misReservas')
router.get('/mis-reservas/:id', [MisReservasController, 'show']).as('misReservas.detalle')
router.post('/reservar/:slug', [controllers.Reservas, 'store']).as('reservas.store')

router.get('reservar/:slug', [controllers.Reservas, 'crear'])

router
  .group(() => {
    // router.get('signup', [controllers.NewAccount, 'create'])
    // router.post('signup', [controllers.NewAccount, 'store'])

    router.get('/login', [LoginController, 'show'])
    router.post('/login', [LoginController, 'store'])
    router.post('/logout', [LoginController, 'logout']).as('auth.logout')
  })
  .use(middleware.guest())
