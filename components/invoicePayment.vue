<template>
  <v-row class="align-center mb-4">
    <v-col cols="12">
      <PaymentStatus :remove-payment="removePayment" :user-type="userType" />

      <AddressBox
        v-if="userType === 'customer' && initStore.isShippingNeeded"
        :address="selectedCustomerAddress"
        :show-buttons="false"
        :title="$t('invoice.address.title')"
      />

      <v-card style="border-radius: 12px">
        <v-row class="ma-4 py-4">
          <v-col cols="12" style="text-align: center">
            <p class="text-center text-lg">
              {{ $t('invoice.detailOrders.title') }}
            </p>
          </v-col>
          <v-col
            v-for="(invDetail, indexDetail) in invoiceData?.details || []"
            :key="`details-${indexDetail}`"
            cols="12"
            class="pa-4"
          >
            <InvoiceDetailBox
              v-if="userType !== 'seller'"
              :inv-detail="invDetail"
              :is-payment-page="true"
              :user-type="userType"
            />
            <InvoiceProductBox
              v-else
              :product="invDetail"
              :user-type="userType"
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- <v-card style="border-radius: 12px">
        <TransactionSummary />
      </v-card> -->
    </v-col>
  </v-row>
</template>
<script>
import PaymentStatus from '~/components/PaymentStatus'
import AddressBox from '~/components/addressBox.vue'
import InvoiceDetailBox from '~/components/invoiceDetailBox.vue'
// import TransactionSummary from '~/components/transactionSummary.vue'
import InvoiceProductBox from '~/components/invoiceProductBox.vue'
export default {
  components: {
    PaymentStatus,
    AddressBox,
    InvoiceDetailBox,
    InvoiceProductBox,
    // TransactionSummary,
  },
  props: {
    userType: {
      type: String,
      default: 'customer',
    },
    selectedCustomerAddress: {
      type: Object,
      default(r) {
        return r
      },
    },
    invoiceData: {
      type: Object,
      default(r) {
        return r
      },
    },
    removePayment: {
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
    initStore() {
      return this.$store.state.init
    },
  },
  methods: {},
}
</script>
