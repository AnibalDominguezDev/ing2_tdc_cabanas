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

router.on('/').render('pages/home').as('home')
router.get('/cabanas', [controllers.Cabanas, 'listar']).as('cabanas')
router.get('/gestion', [controllers.Cabanas, 'admin']).as('gestion')
router.get('/cabana/:slug', [controllers.Cabanas, 'mostrar']).as('cabanas.mostrar')
router.get('/cabanas/editar/:slug', [controllers.Cabanas, 'editar']).as('cabanas.editar')
router.get('/cabanas/alta', [controllers.Cabanas, 'crear']).as('nuevaCabana')
router.post('cabanas/guardar', [controllers.Cabanas, 'agregarCabana']).as('guardar')
router.put('cabanas/modificar', [controllers.Cabanas, 'actualizar']).as('modificar')
router.delete('cabanas/eliminar/:id', [controllers.Cabanas, 'eliminarCabana']).as('cabanas.eliminar')
router.get('/register', [RegisterController, 'show'])
router.post('/register', [RegisterController, 'store'])

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())
