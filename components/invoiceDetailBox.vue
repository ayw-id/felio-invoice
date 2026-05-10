<template>
  <v-card style="border-radius: 12px">
    <v-row>
      <v-col cols="12" class="pa-8">
        <h3
          v-if="
            invDetail.sellerAddress ||
            !invDetail.isPhysicalProduct ||
            invDetail.preOrder
          "
        >
          {{ addressTitle }}
        </h3>

        <v-row
          :class="
            invDetail.sellerAddress || !invDetail.isPhysicalProduct
              ? 'mt-4'
              : ''
          "
        >
          <v-col
            v-for="(product, indexProduct) in invDetail.products"
            :key="`products-${indexProduct}`"
            cols="12"
          >
            <InvoiceProductBox :product="product" :user-type="userType" />
          </v-col>
        </v-row>

        <v-row
          v-if="!isDownPayment && invDetail.availableShippingServices?.error"
          class="my-0"
        >
          <v-col cols="12" class="py-0">
            <p style="color: red">
              {{ invDetail.availableShippingServices.error }}
            </p>
          </v-col>
        </v-row>

        <v-row
          v-if="!isDownPayment && invDetail.selectedShippingService"
          style="border: 0.5px; border-style: solid; border-radius: 12px"
        >
          <v-col v-if="shippingServicesLoading === invDetail.idDistrict">
            <p>Loading ...</p>
          </v-col>
          <v-col
            v-if="shippingServicesLoading !== invDetail.idDistrict"
            cols="12"
            style="
              border: 0px;
              border-bottom: 0.5px;
              border-style: solid;
              cursor: pointer;
            "
            @click="showShippingEstimateDialog"
          >
            <p class="mb-0">
              {{ estimateShippingService }}
              <b v-if="invDetail.selectedShippingService.priceRange"
                >({{
                  `${priceWithCurrency(
                    invDetail.selectedShippingService.priceRange.min,
                    false
                  )} - ${priceWithCurrency(
                    invDetail.selectedShippingService.priceRange.max,
                    false
                  )}`
                }})</b
              >
            </p>
          </v-col>
          <v-col
            v-if="
              shippingServicesLoading !== invDetail.idDistrict &&
              invDetail.selectedShippingService.selectedService
            "
            cols="12"
            style="cursor: pointer"
            @click="showShippingServiceDialog"
          >
            <p class="mb-0">
              {{
                `${invDetail.selectedShippingService.selectedService.name} - ${invDetail.selectedShippingService.selectedService.service}`
              }}
            </p>
            <p>
              {{
                invDetail.selectedShippingService.selectedService.description
              }}
            </p>
            <p class="mb-0">
              <b>{{
                priceWithCurrency(
                  invDetail.selectedShippingService.selectedService.value
                )
              }}</b>
            </p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <DialogUI :dialogState.sync="shippingEstimateDialogState"></DialogUI>

    <DialogUI :dialogState.sync="shippingServiceDialogState"></DialogUI>
  </v-card>
</template>
<script>
import InvoiceProductBox from '~/components/invoiceProductBox.vue'
import { priceWithCurrency } from '~/utils/utilFunctions'
import DialogUI from '~/components/UI/dialogUI.vue'
export default {
  components: {
    InvoiceProductBox,
    DialogUI,
  },
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
    invDetail: {
      type: Object,
      default(r) {
        return r
      },
    },
    updateSelectedShippingEstimate: {
      type: Function,
      default(r) {
        return r
      },
    },
    updateSelectedShippingService: {
      type: Function,
      default(r) {
        return r
      },
    },
    isPaymentPage: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      shippingServiceDialogState: {
        state: false,
        isLoading: false,
        header: this.$t('invoice.shipping.serviceTitle'),
        // description: '',
        width: 480,
        isFullWidth: false,
        type: 'list',
        showActionButton: false,
        formType: 'shippingService',
        data: [],
        actions: {
          itemSelected: this.onShippingServiceSelected,
        },
      },
      shippingEstimateDialogState: {
        state: false,
        isLoading: false,
        header: this.$t('invoice.shipping.estimateTitle'),
        // description: '',
        width: 480,
        isFullWidth: false,
        type: 'list',
        showActionButton: false,
        formType: 'shippingEstimate',
        data: [],
        actions: {
          itemSelected: this.onShippingEstimateSelected,
        },
      },
    }
  },
  computed: {
    isDownPayment() {
      const dpProducts = (this.invDetail?.products || []).filter(
        (product) => product.preOrder?.downPayment || product.downPayment
      )

      return dpProducts.length > 0
    },
    addressTitle() {
      const append = this.invDetail.isPreOrder ? '(Pre-Order) ' : ''
      return this.invDetail.sellerAddress
        ? `${append}${this.invDetail.sellerAddress.city}, ${this.invDetail.sellerAddress.province}`
        : `${append}Digital Product`
    },
    shippingServicesLoading() {
      return this.initStore.shippingServicesLoading
    },
    initStore() {
      return this.$store.state.init
    },
    estimateShippingService() {
      if (this.invDetail.selectedShippingService.est.includes('>')) {
        const est = this.invDetail.selectedShippingService.est.replace('>', '')
        return this.$t('invoice.shipping.moreThanEstimate').replace('*', est)
      } else {
        return this.$t('invoice.shipping.estimate').replace(
          '*',
          this.invDetail.selectedShippingService.est
        )
      }
    },
  },
  methods: {
    showShippingServiceDialog() {
      if (!this.isPaymentPage) {
        this.shippingServiceDialogState = {
          ...this.shippingServiceDialogState,
          state: true,
          data: this.invDetail.selectedShippingService?.services || [],
        }
      }
    },
    showShippingEstimateDialog() {
      if (!this.isPaymentPage) {
        this.shippingEstimateDialogState = {
          ...this.shippingEstimateDialogState,
          state: true,
          data: this.invDetail.availableShippingServices,
        }
      }
    },
    onShippingServiceSelected(shippingService) {
      if (this.updateSelectedShippingService) {
        this.updateSelectedShippingService({
          idDistrict: this.invDetail.idDistrict,
          shippingService,
        })
      }

      this.shippingServiceDialogState = {
        ...this.shippingServiceDialogState,
        state: false,
        data: [],
      }
    },
    onShippingEstimateSelected(shippingEstimate) {
      console.warn('shippingEstimate', shippingEstimate)
      this.updateSelectedShippingEstimate({
        idDistrict: this.invDetail.idDistrict,
        shippingEstimate,
      })

      this.shippingEstimateDialogState = {
        ...this.shippingEstimateDialogState,
        state: false,
        data: [],
      }
    },
    priceWithCurrency(amount, useCurrency = true) {
      return priceWithCurrency(amount, useCurrency)
    },
  },
}
</script>
