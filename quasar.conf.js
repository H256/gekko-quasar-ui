// Configuration for your app

module.exports = function (ctx) {
  return {
    // app boot (/src/boot)
    boot: [
      'i18n',
      'eventbus'
    ],
    css: [
      'app.styl'
    ],
    extras: [
      'roboto-font',
      'material-icons',
      'fontawesome-v5'
    ],
    supportIE: true,
    vendor: {
      add: [],
      remove: []
    },
    build: {
      scopeHoisting: true,
      vueRouterMode: 'hash',//'history',
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      // useNotifier: false,
      extendWebpack (cfg) {
      }
    },
    devServer: {
      // https: true,
      // port: 8080,
      open: true // opens browser window automatically
    },
    // framework: 'all' --- includes everything; for dev only!
    framework: {
      components: [
        "QBanner",
        "QBadge",
        "QBtn",
        'QCard',
        'QCardActions',
        "QCardSection",
        'QCheckbox',
        "QChip",
        "QDate",
        "QDialog",
        "QField",
        "QIcon",
        "QInput",
        "QItem",
        "QItemLabel",
        "QItemSection",
        "QKnob",
        "QLayout",
        "QDrawer",
        "QFooter",
        "QHeader",
        "QList",
        "QOptionGroup",
        "QPage",
        "QPageContainer",
        "QPopupProxy",
        "QLinearProgress",
        "QCircularProgress",
        "QRadio",
        "QRouteTab",
        "QScrollArea",
        "QSelect",
        "QSeparator",
        "QSpace",
        "QSpinner",
        "QSpinnerBars",
        "QSpinnerDots",
        "QSpinnerRadio",
        "QTab",
        "QTabPanel",
        "QTabPanels",
        "QTable",
        "QTd",
        "QTr",
        "QTabs",
        "QTime",
        "QToolbar",
        "QToolbarTitle"
      ],
      directives: [
        'Ripple'
      ],
      // Quasar boot
      plugins: [
        'Notify',
        'Dialog'
      ]
    },
    animations: 'all', //--- includes all animations
    // animations: [],
    pwa: {
      cacheExt: 'js,html,css,ttf,eot,otf,woff,woff2,json,svg,gif,jpg,jpeg,png,wav,ogg,webm,flac,aac,mp4,mp3',
      manifest: {
        // name: 'Quasar App',
        // short_name: 'Quasar-PWA',
        // description: 'Best PWA App in town!',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            'src': 'statics/icons/favicon-256.png',
            'sizes': '256x256',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/favicon-1024.png',
            'sizes': '1024x1024',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/favicon.ico',
            'sizes': '16x16',
            'type': 'image/x-icon'
          },
          {
            'src': 'statics/icons/favicon.ico',
            'sizes': '32x32',
            'type': 'image/x-icon'
          }
        ]
      }
    },
    cordova: {
      // id: 'org.cordova.quasar.app'
    },
    electron: {
      extendWebpack (cfg) {
        // do something with cfg
      },
      packager: {
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Window only
        // win32metadata: { ... }
      }
    },

    // leave this here for Quasar CLI
    starterKit: '1.0.0'
  }
}
