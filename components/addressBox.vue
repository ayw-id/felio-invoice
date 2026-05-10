<template>
  <v-card style="border-radius: 12px; cursor: pointer" @click="boxClicked">
    <v-row class="ma-4 py-4">
      <v-col v-if="title" cols="12">
        <p class="text-center text-lg">{{ title }}</p>
      </v-col>
      <v-col
        v-if="!initStore.customerAddress?.length && !address"
        cols="12"
        class="text-center"
      >
        <p>{{ $t('invoice.address.noAddress') }}</p>
        <v-btn
          style="text-transform: none; border-radius: 24px; width: 240px"
          color="primary"
          @click="showAddressDialog()"
          >{{ $t('invoice.address.addNewAddress') }}</v-btn
        >
      </v-col>
      <v-col
        v-else-if="address"
        cols="12"
        style="border-width: 1px; border-style: solid; border-radius: 12px"
      >
        <p>
          <b>{{ `${address.saveAs} - ${address.receiver}` }}</b>
        </p>
        <p class="mb-0">{{ `+${address.callingCode} ${address.phone}` }}</p>
        <p class="mb-0">{{ address.address }}</p>
        <p class="mb-0">
          {{ `${address.district}, ${address.city}, ${address.province}` }}
        </p>
        <v-btn
          v-if="showButtons && !isSelected"
          color="primary"
          dark
          class="mt-2"
          style="border-radius: 12px; text-transform: none"
          block
          @click="selectAddress"
          >{{ $t('invoice.address.useAddress') }}</v-btn
        >
        <v-row v-if="showButtons" class="mt-2">
          <v-col :cols="!isSelected ? 6 : 12">
            <v-btn
              color="blue"
              outlined
              dark
              style="border-radius: 12px; text-transform: none"
              block
              @click="editAddress && editAddress(address)"
              >{{ $t('general.edit') }}</v-btn
            >
          </v-col>
          <v-col v-if="!isSelected" cols="6">
            <v-btn
              color="red"
              text
              style="border-radius: 12px; text-transform: none"
              block
              @click="deleteAddress && deleteAddress(address)"
              >{{ $t('general.delete') }}</v-btn
            >
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>
<script>
export default {
  components: {},
  props: {
    title: {
      type: String,
      default: '',
    },
    showSnackbar: {
      type: Function,
      default(r) {
        return r
      },
    },
    requestHeader: {
      type: String,
      default: '',
    },
    useAddress: {
      type: Function,
      default(r) {
        return r
      },
    },
    editAddress: {
      type: Function,
      default(r) {
        return r
      },
    },
    deleteAddress: {
      type: Function,
      default(r) {
        return r
      },
    },
    clickAction: {
      type: Function,
      default(r) {
        return r
      },
    },
    address: {
      type: Object,
      default(r) {
        return r
      },
    },
    showButtons: {
      type: Boolean,
      default: true,
    },
    onAddAddress: {
      type: Function,
      default(r) {
        return r
      },
    },
  },
  data() {
    return {}
  },
  computed: {
    isSelected() {
      return this.initStore.selectedAddress.id === this.address.id
    },
    initStore() {
      return this.$store.state.init
    },
  },
  methods: {
    boxClicked() {
      if (!this.showButtons) {
        this.clickAction && this.clickAction()
      }
    },
    selectAddress() {
      if (this.address.id === this.initStore.selectedAddress.id) {
        this.useAddress && this.useAddress()
      } else {
        this.useAddress && this.useAddress(this.address)
      }
    },
    showAddressDialog() {
      this.onAddAddress()
    },
  },
}
</script>
