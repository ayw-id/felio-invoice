import colors from 'vuetify/es5/util/colors'

export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - Invoice',
    title: 'Felio.id',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['@/assets/style/app.scss'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [{ src: '~/plugins/SSRPlugins' }],

  router: {
    base: '/invoice',
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    'vue-social-sharing/nuxt',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/i18n',
    'nuxt-user-agent',
  ],

  i18n: {
    locales: [
      {
        code: 'en',
        name: 'English',
        // lazy loading order: `es.json` -> `es-AR.json`, and then merge 'es-AR.json' with 'es.json'
        file: 'en.json',
      },
      {
        code: 'id',
        name: 'Indonesian',
        // lazy loading order: `es.json` -> `es-UY.json`, and then merge 'es-UY.json' with 'es.json'
        file: 'id.json',
      },

      // ...
    ],
    lazy: true,
    langDir: 'utils/language',
    defaultLocale: 'en',
    // vueI18n: {
    //   fallbackLocale: 'en',
    //   messages: {
    //     en,
    //     id
    //   }
    // },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root', // recommended
      alwaysRedirect: true,
      cookieCrossOrigin: true,
    },
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/',
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
    },
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      light: true,
      themes: {
        light: {
          primary: '#E76F51',
          accent: '#F4A261',
          secondary: '#F7BC8D',
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: ['vuetify/lib', 'tiptap-vuetify'],
  },

  env: {
    HOST_NAME: process.env.HOST_NAME,
    DOMAIN_TYPE: process.env.DOMAIN_TYPE,
    DOMAIN_EXTENSION: process.env.DOMAIN_EXTENSION,
    WEBSITE_URL: process.env.WEBSITE_URL,
    WEBSITE_PATH_PREFIX: process.env.WEBSITE_PATH_PREFIX,
    WEBSITE_SUB_DOMAIN_SUFFIX: process.env.WEBSITE_SUB_DOMAIN_SUFFIX,
    TEMPORARY_HOSTNAME: process.env.TEMPORARY_HOSTNAME,
    APP_ENV: process.env.APP_ENV,
    API: process.env.API,
    API_CUSTOMER: process.env.API_CUSTOMER,
    API_MERCHANT: process.env.API_MERCHANT,
    API_AI_CONTENT: process.env.API_AI_CONTENT,
    MERCHANT_DASHBOARD: process.env.MERCHANT_DASHBOARD,
    BUILDER_URL: process.env.BUILDER_URL,
  },
  server: {
    port: 8000, // default: 3000
    host: '0.0.0.0', // default: localhost
  },
}
