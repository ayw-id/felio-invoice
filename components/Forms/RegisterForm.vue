<template>
  <v-row class="justify-center ma-2">
    <v-col cols="12" md="10" class="text-center">
      <p class="text-lg mt-4 mb-8 mx-4 text-center" style="text-align: center">
        {{ $t('forms.registerForm.title') }}
      </p>
      <v-text-field
        v-model="name"
        outlined
        :label="$t('forms.fullName')"
        :rules="nameRules"
      ></v-text-field>

      <v-text-field
        v-model="email"
        outlined
        label="Email"
        :rules="emailRules"
        class="mt-4"
      ></v-text-field>

      <vue-tel-input-vuetify
        v-model="phone"
        outlined
        :label="$t('forms.phone')"
        default-country="ID"
        mode="international"
        @country-changed="countryChanged"
      ></vue-tel-input-vuetify>

      <v-text-field
        v-model="password"
        outlined
        :label="$t('forms.passwordRequired')"
        :type="showPassword ? 'text' : 'password'"
        :rules="passwordRules"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        class="mt-4"
        @click:append="showPassword = !showPassword"
      ></v-text-field>

      <v-text-field
        v-model="rePassword"
        outlined
        :label="$t('forms.rePasswordRequired')"
        :type="showRePassword ? 'text' : 'password'"
        :rules="passwordRules"
        :append-icon="showRePassword ? 'mdi-eye' : 'mdi-eye-off'"
        class="mt-4"
        @click:append="showRePassword = !showRePassword"
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
        @click="submitRegistration"
        >{{
          loading ? 'Loading...' : $t('forms.registerForm.submitButton')
        }}</v-btn
      >
    </v-col>
  </v-row>
</template>
<script>
import { requestData } from '~/utils/serverAccess'
import { countryCode } from '~/utils/constants'
import { rules, validate, filterPhoneNumber } from '~/utils/validation'
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
      name: '',
      nameRules: rules(this).nameRules,
      email: '',
      emailRules: rules(this).emailRules,
      countryData: null,
      phone: '',
      filteredPhone: '',
      phoneRules: rules(this).phoneRules,
      password: '',
      rePassword: '',
      showPassword: false,
      showRePassword: false,
      passwordRules: rules(this).passwordRules,
      requiredRules: rules(this).requiredRules,
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
      return (
        this.loading ||
        !this.email ||
        !this.password ||
        this.password !== this.rePassword ||
        !this.phone ||
        !this.name
      )
    },
  },
  methods: {
    countryChanged(country) {
      this.countryData = country
    },
    submitRegistration() {
      this.error = this.validate()
      if (!this.error) {
        this.register()
      } else {
        this.showSnackbar({
          text: this.error,
        })
      }
    },
    validate() {
      const phone = filterPhoneNumber(
        this.phone,
        this.countryData?.dialCode || ''
      )

      const error = validate(this, {
        name: this.name,
        email: this.email,
        phone,
        password: this.password,
      })

      if (error) {
        return error
      }

      this.filteredPhone = phone
      if (
        !countryCode.some(
          (code) => code.dialCode === `+${this.countryData?.dialCode || ''}`
        )
      ) {
        return this.$t('errors.countryCodeNotAvailable')
      }

      if (this.password !== this.rePassword) {
        return this.$t('errors.passwordNotTheSame')
      }

      return ''
    },
    register() {
      this.loading = true
      requestData({
        type: 'customer',
        url: 'invoice/invoiceRegistration',
        body: {
          invoiceCode: this.invoiceCode,
          email: this.email,
          password: this.password,
          fullName: this.name,
          callingCode: this.countryData.dialCode,
          phone: this.filteredPhone,
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
