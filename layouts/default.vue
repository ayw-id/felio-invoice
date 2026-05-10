<template>
  <v-app>
    <v-main class="grey lighten-3">
      <v-container fill-height>
        <Nuxt />
      </v-container>
    </v-main>

    <!-- <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer> -->
  </v-app>
</template>

<script>
import { storageNames } from '~/utils/constants'
export default {
  components: {},
  data() {
    return {
      fixed: false,
      title: 'Felio.id - Invoice',
      is_login: false,
      drawer: true,
      clipped: true,
      items: [
        {
          icon: 'mdi-face',
          title: 'Profile',
          to: '/',
          child: null,
          redirect: true,
        },
        {
          icon: 'mdi-book-open',
          title: 'Invoice',
          to: '/',
          child: null,
          redirect: false,
        },
        {
          icon: 'mdi-wrench',
          title: 'Pengaturan',
          to: '/settings',
          child: null,
          redirect: true,
        },
      ],
      otherPaths: [
        {
          title: 'Login',
          path: '/auth/login',
        },
        {
          title: 'Registrasi',
          path: '/auth/registration',
        },
        {
          title: 'Lupa Password',
          path: '/auth/forgot-password',
        },
      ],
      auth_path: ['/auth/login', '/auth/registration', '/auth/forgot-password'],
      show_password_form: false,
      requiredRules: [(v) => !!v || 'This Field is required'],
      is_loading: false,
      password: '',
      password_: '',
    }
  },
  computed: {
    initStore() {
      return this.$store.state.init
    },
    disabled() {
      return (
        this.password === '' ||
        this.password_ === '' ||
        this.password !== this.password_
      )
    },
  },
  mounted() {
    this.getToken()

    this.$router.beforeEach((to, from, next) => {
      if (to.path === '/faq') {
        this.changeTitle(to.path)
        next()
      } else if (this.auth_path.includes(to.path)) {
        if (!this.this.initStore.user) {
          this.changeTitle(to.path)
          next()
        } else {
          this.changeTitle('/')
          next('/')
        }
      } else if (this.initStore.user) {
        this.changeTitle(to.path)
        next()
      } else {
        this.changeTitle('/auth/login')
        next('/auth/login')
      }
    })
  },
  methods: {
    checkPath(item) {
      if (item.child === null || item.child === undefined) {
        return this.$route.path === item.to && !item.redirect
          ? 'grey lighten-3'
          : ''
      } else {
        const pathExist = item.child.some(
          (child) => child.to === this.$route.path && !child.redirect
        )
        return pathExist ? 'grey lighten-3' : ''
      }
    },
    getToken() {
      const invoiceCode = this.$route.query.inv
      const authCode = this.$route.query.authCode

      let userType = 'customer'
      if (authCode) {
        const splittedInvCode = invoiceCode.split('-')
        if (splittedInvCode.length > 1 && splittedInvCode[0] === 'INVS') {
          userType = 'seller'
        }
      }

      let userStore = localStorage.getItem(
        userType === 'customer'
          ? storageNames.userStore
          : storageNames.sellerToken
      )
      if (userStore) {
        userStore = JSON.parse(userStore)
        this.$store.commit('init/setUser', {
          user: userStore,
          userType,
        })
      }
    },
    changeTitle(path) {
      let title = ''

      this.items.forEach((item) => {
        if (item.child) {
          item.child.forEach((child) => {
            if (path === child.to) {
              title = child.title
            }
          })
        } else if (path === item.to) {
          title = item.title
        }
      })

      if (title === '') {
        this.otherPaths.forEach((otherPath) => {
          if (path === otherPath.path) {
            title = otherPath.title
          }
        })
      }
      this.title = title === '' ? 'Rovelio.id' : 'Rovelio.id - ' + title
    },
  },
}
</script>
