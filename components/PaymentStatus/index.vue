<template>
  <v-card v-if="paymentState" style="border-radius: 12px">
    <v-row class="ma-4 py-4">
      <v-col cols="12" style="text-align: center">
        <img
          :src="paymentStatus[paymentState.status].img"
          style="height: 80px; width: 80px"
        />
        <p>{{ $t(`invoice.payment.types.${paymentState.status}.status`) }}</p>

        <v-divider class="mb-4"></v-divider>

        <p style="font-size: 12px" class="mb-0">
          {{ $t(`invoice.code`) }}
        </p>
        <p style="font-size: 24px" @click="copy($route.query.inv)">
          {{ $route.query.inv }}
          <v-icon>mdi-content-copy</v-icon>
        </p>
        <v-divider class="mb-4"></v-divider>

        <p style="font-size: 12px" class="mb-0">
          {{ $t(`invoice.payment.types.${paymentState.status}.date`) }}
        </p>
        <p style="font-size: 24px">
          {{
            paymentState.status === 'PAID'
              ? paymentState.paidAt
              : paymentState.dueDate
          }}
        </p>

        <v-divider class="mb-4"></v-divider>

        <p style="font-size: 12px" class="mb-0">
          {{ $t(`invoice.payment.amount`) }}
        </p>
        <p
          style="font-size: 24px; cursor: pointer"
          @click="
            copy(paymentState.amountToPay || initStore.invoiceTotal, 'amount')
          "
        >
          RP.{{
            priceWithCurrency(
              paymentState.amountToPay || initStore.invoiceTotal
            )
          }}
          <v-icon>mdi-content-copy</v-icon>
        </p>

        <v-divider class="mb-4"></v-divider>

        <p style="font-size: 12px" class="mb-0">
          {{ paymentState.paymentType }}
        </p>
        <p style="font-size: 24px" class="mb-0">
          {{ paymentState.paymentMethod }}
        </p>

        <v-divider
          v-if="paymentState.paymentType === 'Virtual Account'"
          class="mb-4"
        ></v-divider>

        <p
          v-if="paymentState.paymentType === 'Virtual Account'"
          style="font-size: 12px"
          class="mb-0"
        >
          {{ $t(`invoice.payment.accountNumber`) }}
        </p>
        <p
          v-if="paymentState.paymentType === 'Virtual Account'"
          style="font-size: 24px; cursor: pointer"
          class="mb-0"
          @click="copy(paymentState.accountNumber, 'accountNumber')"
        >
          {{ paymentState.accountNumber }} <v-icon>mdi-content-copy</v-icon>
        </p>

        <v-divider
          v-if="
            userType !== 'ai-content-user' &&
            ((paymentState.redirectTo && paymentState.status === 'PENDING') ||
              paymentState.status !== 'PAID')
          "
          class="mb-4"
        ></v-divider>

        <v-btn
          v-if="paymentState.redirectTo && paymentState.status === 'PENDING'"
          color="teal"
          dark
          style="border-radius: 12px; text-transform: none"
          class="mb-0 mt-8"
          @click="payNow()"
        >
          {{ $t('invoice.payment.pay') }}
        </v-btn>

        <v-btn
          v-if="
            paymentState.status !== 'PAID' && userType !== 'ai-content-user'
          "
          color="teal"
          outlined
          rounded
          style="text-transform: none"
          @click="removePayment()"
        >
          {{ $t('invoice.payment.change') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      multi-line
      :timeout="timeout"
    >
      {{ snackbarText }}
      <v-btn dark text @click="snackbar = false"> Close </v-btn>
    </v-snackbar>
  </v-card>
</template>
<script>
import { priceWithCurrency } from '~/utils/utilFunctions'
import PENDING from '~/assets/img/pending.png'
import PAID from '~/assets/img/success.png'
import EXPIRED from '~/assets/img/expired.png'
import FAILED from '~/assets/img/failed.png'

export default {
  components: {},
  props: {
    removePayment: {
      type: Function,
      default(r) {
        return r
      },
    },
    userType: {
      type: String,
      default: 'customer',
    },
  },
  data() {
    return {
      paymentStatus: {
        PENDING: {
          img: PENDING,
        },
        PAID: {
          img: PAID,
        },
        EXPIRED: {
          img: EXPIRED,
        },
        FAILED: {
          img: FAILED,
        },
      },
      snackbar: false,
      timeout: 3000,
      snackbarColor: 'teal',
      snackbarText: '',
    }
  },
  computed: {
    paymentState() {
      return this.initStore.paymentState
    },
    initStore() {
      return this.$store.state.init
    },
  },
  methods: {
    copy(data, type) {
      navigator.clipboard.writeText(data)
      this.snackbarText = this.$t(
        `invoice.payment.${
          type === 'amount' ? 'amountCopied' : 'accountNumberCopied'
        }`
      )
      this.snackbar = true
    },
    payNow() {
      window.location.href = this.paymentState.redirectTo
    },
    priceWithCurrency(amount) {
      return priceWithCurrency(amount, false)
    },
  },
}
</script>
