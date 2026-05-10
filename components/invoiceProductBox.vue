<template>
  <v-row>
    <v-col v-if="userType !== 'seller'" cols="2" md="2">
      <v-img :src="product.image" />
    </v-col>
    <v-col v-if="userType !== 'seller'" cols="10" md="10">
      <p style="font-size: 16px" class="mb-0">{{ product.name }}</p>
      <p
        v-for="(bundle, i) in product.bundleItems || []"
        :key="i"
        style="font-size: 12px"
        class="mb-0"
      >
        {{ bundle }}
      </p>
      <p
        v-if="!product.bundleItems?.length"
        style="font-size: 14px"
        class="mb-0"
      >
        {{ product.selectedVariant }}
      </p>
      <p style="font-size: 12px; font-weight: 800" class="mb-0">
        {{
          (!product.isDigitalProduct ? `${product.qty} x ` : '') +
          `${priceWithCurrency(product.basePrice || product.price)}`
        }}
      </p>
      <p
        v-if="product.basePrice === product.price"
        style="font-size: 18px; font-weight: 800"
        class="mb-0"
        :class="!product.preOrder && 'mt-2'"
      >
        {{ priceWithCurrency(product.basePrice * product.qty) }}
      </p>
      <p
        v-else
        style="font-size: 18px; font-weight: 800"
        class="mb-0"
        :class="!product.preOrder && 'mt-2'"
      >
        <span
          style="
            font-size: 12px;
            font-weight: 400;
            text-decoration: line-through;
          "
          >{{ priceWithCurrency(product.basePrice * product.qty) }}</span
        >
        {{ priceWithCurrency(product.price * product.qty) }}
      </p>
      <p v-if="product.preOrder" class="mt-2" style="color: teal">
        <b>{{
          priceWithCurrency(product.preOrder.downPayment * product.qty)
        }}</b>
        ({{ $t('invoice.detailOrders.downPayment') }})
      </p>
      <p v-if="product.downPayment" class="mt-2" style="color: teal">
        <b>{{ priceWithCurrency(product.downPayment * product.qty) }}</b> ({{
          $t('invoice.detailOrders.downPayment')
        }})
      </p>
      <p
        v-else-if="product.fulfillmentPayment"
        class="mt-2"
        style="color: teal"
      >
        <b>{{ priceWithCurrency(product.fulfillmentPayment * product.qty) }}</b>
        ({{ $t('invoice.detailOrders.fulfillment') }})
      </p>
      <p style="font-size: 16px" class="mb-0">{{ product.note }}</p>
      <v-row v-if="product.preOrder?.isActive" class="mt-4 mb-4">
        <v-chip small>Pre-Order</v-chip>
      </v-row>
    </v-col>
    <v-col v-else-if="product.type === 'DOMAIN'" cols="12" md="12">
      <p style="font-size: 18px" class="mb-0">
        {{ productType }} -
        <b>{{
          `${product.detailProduct.domainName}.${
            product.detailProduct.extension || 'felio.id'
          }`
        }}</b>
        {{
          product.detailProduct.extension &&
          `(${product.qty} ${product.unit}${product.qty > 1 ? 's' : ''})`
        }}
      </p>
      <v-row class="mt-2">
        <v-col cols="4" md="2">
          <p
            v-if="product.discountAmount || product.discountPercent"
            style="font-size: 12px; color: grey; text-decoration: line-through"
            class="mb-0"
          >
            {{ priceWithCurrency(product.price) }}
          </p>
          <p style="font-size: 16px" class="mb-0">
            {{ priceWithCurrency(product.subtotal) }}
          </p>
        </v-col>
        <v-chip
          v-if="product.discountAmount || product.discountPercent"
          class="mt-4"
          color="teal"
          dark
          >Hemat
          {{
            priceWithCurrency(
              product.discountAmount ||
                parseInt((product.discountPercent * product.price) / 100)
            )
          }}</v-chip
        >
      </v-row>
    </v-col>
  </v-row>
</template>
<script>
import { priceWithCurrency } from '~/utils/utilFunctions'
export default {
  props: {
    userType: {
      type: String,
      default: 'customer',
    },
    showSnackbar: {
      type: Function,
      default(r) {
        return r
      },
    },
    product: {
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
    productType() {
      const productType =
        this.product.type === 'DOMAIN'
          ? this.product.extension
            ? 'Domain'
            : 'Subdomain'
          : ''
      const transactionType =
        this.product.detailProduct.type === 'registration' ? 'Registration' : ''

      return `${productType} ${transactionType}`
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
