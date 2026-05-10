<template>
  <v-row class="mt-4">
    <v-col
      v-for="(payment, index) in paymentMethods"
      :key="`payment-${index}`"
      cols="12"
    >
      <v-row>
        <v-col cols="10" style="align-self: center">
          <p class="mb-0">
            <b>{{ payment.name }}</b>
          </p>
        </v-col>
        <v-col cols="2">
          <v-btn
            :text="payment.isExpanded"
            :dark="!payment.isExpanded"
            small
            :color="!payment.isExpanded ? 'green' : 'red'"
            style="text-transform: none; font-size: 24px"
            fab
            @click="itemSelected && itemSelected(payment)"
            >{{ !payment.isExpanded ? '+' : '-' }}</v-btn
          >
        </v-col>
      </v-row>
      <v-row>
        <v-col
          v-for="(method, indexMethod) in payment.isExpanded
            ? payment.payment_method
            : []"
          :key="`method-${indexMethod}`"
          cols="12"
          style="border: 0.5px; border-style: solid; border-radius: 12px"
          class="my-2"
          @click="itemChildSelected && itemChildSelected(method)"
        >
          <v-row>
            <v-col cols="8">
              <p class="mb-0">{{ method.name }}</p>
            </v-col>
            <v-col cols="4" class="text-right">
              <v-btn text style="text-transform: none" color="blue"
                >Pilih</v-btn
              >
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-divider class="mt-4"></v-divider>
    </v-col>
  </v-row>
</template>
<script>
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
    paymentMethods: {
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
    itemChildSelected: {
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
    asd(a) {
      console.warn('a', a)
      console.warn('b', this.itemChildSelected ? 'a' : 'b')
      // itemChildSelected && itemChildSelected(method)
    },
  },
}
</script>
