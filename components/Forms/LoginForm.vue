<template>
  <v-row class="justify-center ma-2">
    <v-col cols="12" md="10" class="text-center">
      <p class="text-lg mt-4 mb-8 mx-4 text-center" style="text-align: center">
        {{ $t('forms.loginForm.title') }}
      </p>
      <v-text-field
        v-model="emailMutation"
        outlined
        label="Email"
        :rules="emailRules"
      ></v-text-field>

      <v-text-field
        v-model="password"
        outlined
        label="Password*"
        :type="showPassword ? 'text' : 'password'"
        :rules="passwordRules"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        class="mt-4"
        @click:append="showPassword = !showPassword"
      ></v-text-field>

      <p v-if="error" style="color: red; font-size: 16px" class="mt-4">
        {{ error }}
      </p>

      <v-btn
        rounded
        class="mb-4"
        color="primary"
        large
        style="width: 240px; text-transform: none"
        :disabled="submitDisabled"
        @click="submitLogin"
        >{{ loading ? 'Loading...' : 'Login' }}</v-btn
      >
    </v-col>
  </v-row>
</template>
<script>
import { requestData } from '~/utils/serverAccess'
import { rules, validate } from '~/utils/validation'
export default {
  props: {
    showSnackbar: {
      type: Function,
      default(r) {
        return r
      },
    },
    setToken: {
      type: Function,
      default(r) {
        return r
      },
    },
    invoiceCode: {
      type: String,
      default: '',
    },
    requestHeader: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      email: '',
      emailRules: rules(this).emailRules,
      password: '',
      showPassword: false,
      passwordRules: rules(this).passwordRules,
      error: '',
      loading: false,
    }
  },
  computed: {
    emailMutation: {
      set(val) {
        this.email = val
        setTimeout(() => {
          this.email = this.email.toLowerCase().replace(' ', '')
        }, 300)
      },
      get() {
        return this.email
      },
    },
    submitDisabled() {
      return this.loading || !this.email || !this.password
    },
  },
  methods: {
    submitLogin() {
      this.error = this.validate()
      if (!this.error) {
        this.login()
      } else {
        this.showSnackbar({
          text: this.error,
        })
      }
    },
    validate() {
      const error = validate(this, {
        email: this.email,
        password: this.password,
      })

      return error
    },
    login() {
      this.loading = true
      requestData({
        type: 'customer',
        url: 'invoice/invoiceLogin',
        body: {
          invoiceCode: this.invoiceCode,
          email: this.email,
          password: this.password,
        },
        headers: {
          Authorization: this.requestHeader,
        },
      })
        .then((response) => {
          this.loading = false
          if (response.data.success === 1) {
            const data = response.data.data

            const userStore = {
              token: data.token,
              type: 'customer',
            }

            this.setToken(userStore)
          } else {
            this.showSnackbar({ text: response.data.msg })
          }
        })
        .catch((error) => {
          this.loading = false
          this.showSnackbar({ type: 'serverIssue' })
          console.warn(error)
        })
    },
  },
}
</script>
