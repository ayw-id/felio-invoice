<template>
  <v-row>
    <v-col cols="12">
      <v-btn
        style="text-transform: none; border-radius: 12px; width: 240px"
        color="teal"
        dark
        block
        @click="actions?.addItem && actions.addItem()"
        >{{ $t('invoice.address.addNewAddress') }}</v-btn
      >
    </v-col>
    <v-col
      v-for="(address, index) in initStore.customerAddress"
      :key="`address-${index}`"
      class="py-0"
      cols="12"
    >
      <AddressBox
        :address="address"
        :use-address="useAddress"
        :delete-address="deleteAddress"
        :edit-address="editAddress"
      />
    </v-col>
  </v-row>
</template>
<script>
import AddressBox from '~/components/addressBox.vue'
export default {
  components: {
    AddressBox,
  },
  props: {
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
    actions: {
      type: Object,
      default(r) {
        return r
      },
    },
  },
  data() {
    return {}
  },
  computed: {
    initStore() {
      return this.$store.state.init
    },
  },
  methods: {
    useAddress(selectedAddress) {
      if (selectedAddress) {
        this.actions?.itemSelected && this.actions.itemSelected(selectedAddress)
      }
    },
    editAddress(selectedAddress) {
      if (selectedAddress) {
        this.actions?.editItem && this.actions.editItem(selectedAddress)
      }
    },
    deleteAddress(selectedAddress) {
      if (selectedAddress) {
        this.actions?.deleteItem && this.actions.deleteItem(selectedAddress)
      }
    },
  },
}
</script>
