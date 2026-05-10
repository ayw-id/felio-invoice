<template>
  <v-row class="mt-4">
    <v-col
      v-for="(service, index) in shippingServices"
      :key="`service-${index}`"
      style="
        border: 0.5px;
        border-style: solid;
        border-radius: 12px;
        cursor: pointer;
      "
      class="my-2"
      cols="12"
      @click="itemSelected && itemSelected(service)"
    >
      <p class="mb-0">{{ `${service.name} - ${service.service}` }}</p>
      <p>{{ service.description }}</p>
      <p class="mb-0">
        <b>{{ priceWithCurrency(service.value) }}</b>
      </p>
    </v-col>
  </v-row>
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
    requestHeader: {
      type: String,
      default: '',
    },
    shippingServices: {
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
    priceWithCurrency(amount) {
      return priceWithCurrency(amount, true)
    },
  },
}
</script>
