<template>
  <v-card style="border-radius: 12px">
    <v-row class="ma-4 py-4">
      <v-col cols="12">
        <p class="text-center text-lg">{{ $t('invoice.summary.title') }}</p>
      </v-col>
      <v-col class="text-center px-6">
        <p v-if="loading" class="mb-0">Loading ...</p>
        <v-row v-else-if="summaryData?.length">
          <v-col
            v-for="(summary, index) in summaryData"
            :key="`summary-${index}`"
            cols="12"
          >
            <v-row>
              <v-col cols="6" class="pl-0">
                <p class="mb-0 text-left">{{ summary.title }}</p>
              </v-col>
              <v-col cols="6" class="pr-0">
                <p v-if="!summary.discountPrice" class="mb-0 text-right">
                  {{ priceWithCurrency(summary.price) }}
                </p>
                <p v-else class="mb-0 text-right">
                  <del style="color: grey">{{
                    priceWithCurrency(summary.price)
                  }}</del>
                  <span style="color: green">{{
                    priceWithCurrency(summary.discountPrice)
                  }}</span>
                </p>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>
<script>
import { priceWithCurrency } from '~/utils/utilFunctions'
export default {
  components: {},
  props: {
    showSnackbar: {
      type: Function,
      default(r) {
        return r
      },
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {}
  },
  computed: {
    summaryData() {
      return this.initStore.summaryData
    },
    initStore() {
      return this.$store.state.init
    },
  },
  methods: {
    priceWithCurrency(amount) {
      return priceWithCurrency(amount, true)
    },
  },
}
</script>
