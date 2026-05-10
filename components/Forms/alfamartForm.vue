<template>
  <v-row class="justify-center ma-2">
    <v-col cols="12" md="10" class="text-center">
      <v-text-field
        v-model="name"
        outlined
        :label="$t('forms.fullName')"
        :rules="nameRules"
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
        @click="submitAlfamart"
        >{{ loading ? 'Loading...' : $t('general.continue') }}</v-btn
      >
    </v-col>
  </v-row>
</template>
<script>
import { rules, validate } from '~/utils/validation'
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
      name: '',
      nameRules: rules(this).nameRules,
      error: '',
    }
  },
  computed: {
    submitDisabled() {
      return this.loading || !this.name
    },
  },
  methods: {
    submitAlfamart() {
      this.error = this.validate()
      if (!this.error) {
        this.successButtonAction &&
          this.successButtonAction({
            customerName: this.name,
          })
      } else {
        this.showSnackbar({
          text: this.error,
        })
      }
    },
    validate() {
      const error = validate(this, {
        name: this.name,
      })

      if (error) {
        return error
      }

      return ''
    },
  },
}
</script>
