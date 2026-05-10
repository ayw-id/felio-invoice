<template>
  <v-row class="justify-center ma-2">
    <v-col v-if="!district" cols="12" class="text-center">
      <v-text-field
        v-model="queryAddress"
        outlined
        :label="$t('invoice.address.form.queryAddress')"
        :placeholder="$t('invoice.address.form.queryAddressPlaceHolder')"
        :rules="nameRules"
      ></v-text-field>

      <v-btn
        v-if="showSearchButton && queryAddress"
        :loading="loading"
        style="border-radius: 12px; text-transform: none"
        color="teal"
        dark
        class="mb-4"
        block
        @click="submitQuery()"
        >{{ $t('general.search') }}</v-btn
      >

      <v-row>
        <v-col
          v-for="(address, i) in addressList"
          :key="`district-${i}`"
          cols="12"
        >
          <v-card style="border-radius: 12px" @click="selectAddress(address)">
            <v-container>
              <p class="mb-0">
                {{
                  `${address.district}, ${address.city}, ${address.province}`
                }}
              </p>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </v-col>

    <v-col v-else cols="12" class="text-center">
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card style="border-radius: 12px">
            <v-container>
              <p>
                {{
                  `${district.district}, ${district.city}, ${district.province}`
                }}
              </p>
              <v-btn
                class="mb-2"
                style="text-transform: none; border-radius: 12px"
                block
                color="primary"
                outlined
                @click="removeDistrict()"
                >{{ $t('invoice.address.form.selectDistrictButton') }}</v-btn
              >
            </v-container>
          </v-card>
        </v-col>
      </v-row>

      <v-text-field
        v-model="saveAs"
        outlined
        :label="$t('invoice.address.form.saveAs')"
        :placeholder="$t('invoice.address.form.saveAsPlaceholder')"
        :rules="requiredRules"
      ></v-text-field>

      <v-text-field
        v-model="receiver"
        outlined
        :label="$t('invoice.address.form.receiver')"
        :placeholder="$t('invoice.address.form.receiver')"
        :rules="nameRules"
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
        v-model="address"
        outlined
        :label="$t('invoice.address.form.address')"
        :placeholder="$t('invoice.address.form.addressPlaceholder')"
        :rules="requiredRules"
      ></v-text-field>

      <v-text-field
        v-model="postCode"
        outlined
        :label="$t('invoice.address.form.postCode')"
        :placeholder="$t('invoice.address.form.postCode')"
        :rules="postRules"
      ></v-text-field>

      <v-checkbox
        v-model="isPrimary"
        :label="$t('invoice.address.form.isPrimary')"
      ></v-checkbox>
    </v-col>
  </v-row>
</template>
<script>
import { requestData } from '~/utils/serverAccess'
import { rules } from '~/utils/validation'
export default {
  props: {
    showSnackbar: {
      type: Function,
      default(r) {
        return r
      },
    },
    formState: {
      type: Object,
      default(r) {
        return r
      },
    },
    showActionButton: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      nameRules: rules(this).nameRules,
      requiredRules: rules(this).requiredRules,
      countryData: null,
      filteredPhone: '',
      phoneRules: rules(this).phoneRules,
      postRules: rules(this).postCodeRules,
      error: '',
      loading: false,
      typingQueryAddress: false,
      addressList: [],
      showSearchButton: false,
    }
  },
  computed: {
    saveAs: {
      set(val) {
        this.$emit('update:formState', {
          ...this.formState,
          saveAs: val,
        })
        this.checkFormState()
      },
      get() {
        return this.formState.saveAs
      },
    },
    receiver: {
      set(val) {
        this.$emit('update:formState', {
          ...this.formState,
          receiver: val,
        })
        this.checkFormState()
      },
      get() {
        return this.formState.receiver
      },
    },
    phone: {
      set(val) {
        this.$emit('update:formState', {
          ...this.formState,
          phone: val,
        })
        this.checkFormState()
      },
      get() {
        return this.formState.phone
      },
    },
    callingCode: {
      set(val) {
        this.$emit('update:formState', {
          ...this.formState,
          callingCode: val,
        })
      },
      get() {
        return this.formState.callingCode
      },
    },
    queryAddress: {
      set(val) {
        this.showSearchButton = true
        this.$emit('update:formState', {
          ...this.formState,
          queryAddress: val,
        })
      },
      get() {
        return this.formState.queryAddress
      },
    },
    district: {
      set(val) {
        setTimeout(() => {
          this.$emit('update:formState', {
            ...this.formState,
            district: val,
          })
          this.checkFormState()
        }, 500)
      },
      get() {
        return this.formState.district
      },
    },
    address: {
      set(val) {
        this.$emit('update:formState', {
          ...this.formState,
          address: val,
        })
        this.checkFormState()
      },
      get() {
        return this.formState.address
      },
    },
    postCode: {
      set(val) {
        this.$emit('update:formState', {
          ...this.formState,
          postalCode: val,
        })
        this.checkFormState()
      },
      get() {
        return this.formState.postalCode
      },
    },
    isPrimary: {
      set(val) {
        this.$emit('update:formState', {
          ...this.formState,
          isPrimary: val,
        })
      },
      get() {
        return this.formState.isPrimary
      },
    },
    initStore() {
      return this.$store.state.init
    },
    requestHeader() {
      const headerUserType =
        this.initStore.user?.type === 'guest' ? 'GUEST' : 'CUSTOMER'

      return `${this.initStore.hostName} ${headerUserType}_${
        this.initStore.user?.token || ''
      }`
    },
  },
  methods: {
    checkFormState() {
      setTimeout(() => {
        if (
          this.saveAs &&
          this.callingCode &&
          this.phone &&
          this.receiver &&
          this.district &&
          this.address &&
          this.postCode
        ) {
          this.$emit('update:showActionButton', true)
        } else {
          this.$emit('update:showActionButton', false)
        }
      }, 500)
    },
    submitQuery() {
      if (this.queryAddress) {
        this.searchAddress()
      }
    },
    removeDistrict() {
      this.district = null
      this.queryAddress = ''
    },
    selectAddress(address) {
      this.district = address
      this.addressList = []
      this.checkFormState()
    },
    countryChanged(country) {
      this.callingCode = country.dialCode.replace('+', '')
      this.checkFormState()
    },
    searchAddress() {
      this.loading = true
      requestData({
        type: 'customer',
        url: 'user/searchAddress',
        body: {
          query: this.queryAddress,
        },
        headers: {
          Authorization: this.requestHeader,
        },
      })
        .then((response) => {
          this.loading = false
          if (response.data.success === 1) {
            const data = response.data.data

            this.addressList = data.address
            this.showSearchButton = false
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
