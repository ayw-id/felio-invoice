<template>
  <v-row class="mt-4">
    <v-col
      v-for="(est, index) in shippingEstimates"
      :key="`est-${index}`"
      style="
        border: 0.5px;
        border-style: solid;
        border-radius: 12px;
        cursor: pointer;
      "
      class="my-2"
      cols="12"
      @click="itemSelected && itemSelected(est)"
    >
      <p class="mb-0">
        {{ estimateShippingService(est.est) }}
        <b
          >({{
            `${priceWithCurrency(
              getPriceRange(est.services)?.min
            )} - ${priceWithCurrency(getPriceRange(est.services)?.max)}`
          }})</b
        >
      </p>
    </v-col>
  </v-row>
</template>
<script>
import { priceWithCurrency, getShippingPriceRange } from '~/utils/utilFunctions'
export default {
  components: {},
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
    shippingEstimates: {
      type: Array,
      default(r) {
        return r
      },
    },
    itemSelected: {
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
  methods: {
    getPriceRange(services) {
      return getShippingPriceRange(services)
    },
    priceWithCurrency(amount) {
      return priceWithCurrency(amount, false)
    },
    estimateShippingService(estimate) {
      if (estimate.includes('>')) {
        const est = estimate.replace('>', '')
        return this.$t('invoice.shipping.moreThanEstimate').replace('*', est)
      } else {
        return this.$t('invoice.shipping.estimate').replace('*', estimate)
      }
    },
  },
}
</script>
