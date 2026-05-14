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

const mockCabins = [
  {
    name: 'The Obsidian Peak',
    sku: 'WH-001-OP',
    location: 'Aspen, Colorado',
    coordinates: '45.06° N, 106.94° W',
    status: 'Available',
    price: '450',
    imageUrl: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=150&h=150&fit=crop'
  },
  {
    name: 'Misty Lake Retreat',
    sku: 'WH-004-ML',
    location: 'Loon Lake, WA',
    coordinates: '47.88° N, 122.33° W',
    status: 'Booked',
    price: '325',
    imageUrl: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=150&h=150&fit=crop'
  },
  {
    name: 'Cedar Ember',
    sku: 'WH-012-CE',
    location: 'Blue Ridge, GA',
    coordinates: '34.86° N, 84.32° W',
    status: 'Maintenance',
    price: '580',
    imageUrl: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=150&h=150&fit=crop'
  },
  {
    name: 'Isle of Echoes',
    sku: 'WH-021-IE',
    location: 'Boundary Waters, MN',
    coordinates: '47.92° N, 91.86° W',
    status: 'Available',
    price: '290',
    imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=150&h=150&fit=crop'
  }
]


router.on('/').render('pages/home').as('home')
router.get('/cabanas', [controllers.Cabanas, 'listar']).as('cabanas')
router.get('/gestion', [controllers.Cabanas, 'admin'])
router.get('/cabana/:slug', [controllers.Cabanas, 'mostrar']).as('cabanas.mostrar')
router.get('/cabanas/editar/:slug', [controllers.Cabanas, 'editar']).as('cabanas.editar')
router.get('/cabanas/alta', [controllers.Cabanas, 'crear']).as('nuevaCabana')
router.post('cabanas/guardar', [controllers.Cabanas, 'agregarCabana']).as('guardar')
router.put('cabanas/modificar', [controllers.Cabanas, 'actualizar']).as('modificar')
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
