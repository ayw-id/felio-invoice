<template>
  <v-row class="justify-center ma-2">
    <v-col cols="12" md="10" class="text-center">
      <vue-tel-input-vuetify
        v-model="phone"
        outlined
        :label="$t('forms.phone')"
        default-country="ID"
        mode="international"
        @country-changed="countryChanged"
      ></vue-tel-input-vuetify>

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
        @click="submitOvo"
        >{{ loading ? 'Loading...' : $t('general.continue') }}</v-btn
      >
    </v-col>
  </v-row>
</template>
<script>
import { countryCode } from '~/utils/constants'
import { rules, validate, filterPhoneNumber } from '~/utils/validation'
export default {
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    successButtonAction: {
      type: Function,
      default(r) {
        return r
      },
    },
  },
  data() {
    return {
      countryData: null,
      phone: '',
      filteredPhone: '',
      phoneRules: rules(this).phoneRules,
      error: '',
    }
  },
  computed: {
    submitDisabled() {
      return this.loading || !this.phone
    },
  },
  methods: {
    countryChanged(country) {
      this.countryData = country
    },
    submitOvo() {
      this.error = this.validate()
      if (!this.error) {
        this.successButtonAction &&
          this.successButtonAction({
            phone: this.filteredPhone,
            callingCode: this.countryData.dialCode,
          })
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
        phone,
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

      return ''
    },
  },
}
</script>
