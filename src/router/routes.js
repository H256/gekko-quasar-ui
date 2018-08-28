
export default [
  {
    path: '/',
    component: () => import('layouts/default'),
    children: [
      { path: '', component: () => import('pages/index') },
      { path: 'live-gekkos', component: () => import('pages/live-gekkos')},
      { path: 'live-gekkos/new', component: () => import('components/gekko/new')},
      { path: 'live-gekkos/:id', component: () => import('components/gekko/singleGekko')},
      { path: 'backtest', component: () => import('pages/backtest') },
      { path: 'data', component: () => import('pages/data')},
      { path: 'data/importer', component: () => import('components/data/import/importer')},
      { path: 'data/importer/import/:id', component: () => import('components/data/import/single')},
      { path: 'config', component: () => import('pages/config') },
      { path: 'help', beforeEnter: (to, from, next) => {
        window.open('https://gekko.wizb.it/docs/introduction/about_gekko.html', '_blank');
      } }
    ]
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
