<template>
  <v-card style="border-radius: 12px">
    <v-row class="ma-4 py-4">
      <v-col cols="12">
        <p class="text-center text-lg">
          {{ $t('invoice.paymentMethods.title') }}
        </p>
      </v-col>
      <v-col cols="12" class="text-center px-6">
        <p v-if="paymentMessage" style="color: red" class="mb-0">
          {{ paymentMessage }}
        </p>
        <p v-else-if="!paymentMethods?.length" class="mb-0">Loading ...</p>
        <p v-else-if="!selectedPaymentMethodMutation" class="mb-0">
          {{ $t('invoice.paymentMethods.choosePayment') }}
        </p>
        <p v-else class="mb-0">
          {{ selectedPaymentMethodMutation.method.name }}
        </p>
        <v-btn
          v-if="paymentMethods?.length && !paymentMessage"
          style="text-transform: none; border-radius: 12px"
          color="primary"
          outlined
          class="mt-2"
          @click="onPaymentBoxClicked()"
          >{{
            $t(
              `invoice.paymentMethods.${
                selectedPaymentMethodMutation
                  ? 'changePaymentButton'
                  : 'choosePaymentButton'
              }`
            )
          }}</v-btn
        >
      </v-col>
    </v-row>

    <DialogUI :dialogState.sync="choosePaymentDialogState"></DialogUI>
  </v-card>
</template>
<script>
import DialogUI from '~/components/UI/dialogUI.vue'
export default {
  components: {
    DialogUI,
  },
  props: {
    shippingServicesLoading: {
      type: String,
      default: '',
    },
    showSnackbar: {
      type: Function,
      default(r) {
        return r
      },
    },
    paymentMessage: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      choosePaymentDialogState: {
        state: false,
        isLoading: false,
        header: this.$t('invoice.paymentMethods.title'),
        description: this.$t('invoice.paymentMethods.choosePayment'),
        width: 480,
        isFullWidth: false,
        type: 'list',
        showActionButton: false,
        formType: 'paymentList',
        data: null,
        actions: {
          itemSelected: this.onPaymentSelected,
          itemChildSelected: this.onMethodSelected,
        },
      },
    }
  },
  computed: {
    selectedPaymentMethodMutation: {
      set(val) {
        this.$store.commit('init/setData', {
          selectedPaymentMethod: val,
        })
      },
      get() {
        return this.initStore.selectedPaymentMethod
      },
    },
    paymentMethods() {
      return this.initStore.paymentMethods
    },
    initStore() {
      return this.$store.state.init
    },
  },
  methods: {
    onPaymentBoxClicked() {
      if (this.paymentMethods?.length) {
        this.choosePaymentDialogState = {
          ...this.choosePaymentDialogState,
          state: true,
          data: this.paymentMethods,
        }
      }
    },
    onMethodSelected(method) {
      this.selectedPaymentMethodMutation =
        this.choosePaymentDialogState.data.find((data) => data.isExpanded)
      this.selectedPaymentMethodMutation = {
        ...this.selectedPaymentMethodMutation,
        method,
      }
      this.choosePaymentDialogState = {
        ...this.choosePaymentDialogState,
        state: false,
        loading: false,
      }
    },
    onPaymentSelected(paymentMethod) {
      const data = JSON.parse(
        JSON.stringify(this.choosePaymentDialogState.data)
      )
      const newPaymentMethods = data.map((payment) => {
        return {
          ...payment,
          isExpanded:
            payment.id === paymentMethod.id
              ? !payment.isExpanded
              : payment.isExpanded,
        }
      })
      this.choosePaymentDialogState = {
        ...this.choosePaymentDialogState,
        // state: false,
        // loading: false,
        data: newPaymentMethods,
      }
    },
  },
}
</script>
