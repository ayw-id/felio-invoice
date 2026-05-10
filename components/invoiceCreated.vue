<template>
  <v-row class="align-center mb-4">
    <v-col
      v-if="requiredAction === 'REGISTRATION'"
      cols="12"
      style="text-align: center"
    >
      <v-btn
        :outlined="showLoginForm"
        style="width: 240px; border-radius: 12px; text-transform: none"
        class="mt-12"
        color="primary"
        @click.native="showLoginForm = false"
        >Registration</v-btn
      >
      <v-btn
        :outlined="!showLoginForm"
        style="width: 240px; border-radius: 12px; text-transform: none"
        class="mt-12"
        color="primary"
        @click.native="showLoginForm = true"
        >Login</v-btn
      >
    </v-col>
    <v-col cols="12">
      <v-card v-if="requiredAction" style="border-radius: 12px">
        <LoginForm
          v-if="
            requiredAction === 'LOGIN' ||
            (requiredAction === 'REGISTRATION' && showLoginForm)
          "
          :show-snackbar="showSnackbar"
          :invoice-code="invoiceCode"
          :request-header="requestHeader"
          :set-token="setToken"
        />
        <RegisterForm
          v-else-if="requiredAction === 'REGISTRATION'"
          :show-snackbar="showSnackbar"
          :invoice-code="invoiceCode"
          :request-header="requestHeader"
          :set-token="setToken"
        />
      </v-card>

      <v-row v-else>
        <v-col cols="12">
          <InvoiceData
            :invoice-details="invoiceData?.details || []"
            :show-snackbar="showSnackbar"
            :request-header="requestHeader"
            :get-shipping-services="getShippingServices"
            :update-selected-shipping-estimate="updateSelectedShippingEstimate"
            :update-selected-shipping-service="updateSelectedShippingService"
            :loading="loading"
            :payment-message="paymentMessage"
            :show-transaction-summary="showTransactionSummary"
          />
        </v-col>
      </v-row>
    </v-col>

    <v-col
      v-if="!requiredAction && showTransactionSummary"
      cols="12"
      style="text-align: center"
    >
      <v-btn
        style="text-transform: none; width: 240px"
        rounded
        class="mb-4"
        color="teal"
        dark
        :loading="isLoading"
        @click="checkPaymentRequirements"
        >{{ $t('general.continue') }}</v-btn
      >
    </v-col>

    <DialogUI :dialogState.sync="ovoDialogState"></DialogUI>
    <DialogUI :dialogState.sync="alfamartDialogState"></DialogUI>
  </v-row>
</template>
<script>
import LoginForm from '~/components/Forms/loginForm.vue'
import RegisterForm from '~/components/Forms/registerForm.vue'
import InvoiceData from '~/components/Checkout/invoiceData.vue'
import DialogUI from '~/components/UI/dialogUI.vue'
import { storageNames } from '~/utils/constants'
import { requestData } from '~/utils/serverAccess'
import { getShippingPriceRange } from '~/utils/utilFunctions'
export default {
  components: {
    LoginForm,
    RegisterForm,
    InvoiceData,
    DialogUI,
  },
  props: {
    selectedIdPayment: {
      type: Number,
      default: 0,
    },
    getInvoiceData: {
      type: Function,
      default(r) {
        return r
      },
    },
    requiredAction: {
      type: String,
      default: '',
    },
    showSnackbar: {
      type: Function,
      default(r) {
        return r
      },
    },
    invoiceCode: {
      type: String,
      default: '',
    },
    invoiceData: {
      type: Object,
      default(r) {
        return r
      },
    },
    loading: {
      type: Boolean,
      default: true,
    },
    getShippingServices: {
      type: Function,
      default(r) {
        return r
      },
    },
    calculateSummaryData: {
      type: Function,
      default(r) {
        return r
      },
    },
    paymentMessage: {
      type: String,
      default: '',
    },
    showTransactionSummary: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      showLoginForm: false,
      isLoading: false,
      ovoDialogState: {
        state: false,
        isLoading: false,
        header: this.$t('invoice.paymentMethods.ovo.title'),
        description: this.$t('invoice.paymentMethods.ovo.inputPhone'),
        width: 480,
        isFullWidth: false,
        type: 'form',
        showActionButton: false,
        // cancelButtonText: this.$t('general.cancel'),
        // cancelButtonColor: string;
        cancelButtonAction: () => {
          this.ovoDialogState.isLoading = false
          this.ovoDialogState.state = false
        },
        successButtonText: this.$t('general.save'),
        // successButtonColor:
        successButtonAction: this.checkPaymentRequirements,
        formType: 'ovoForm',
        formState: {},
      },
      alfamartDialogState: {
        state: false,
        isLoading: false,
        header: this.$t('invoice.paymentMethods.alfamart.title'),
        description: this.$t('invoice.paymentMethods.alfamart.inputPhone'),
        width: 480,
        isFullWidth: false,
        type: 'form',
        showActionButton: false,
        // cancelButtonText: this.$t('general.cancel'),
        // cancelButtonColor: string;
        cancelButtonAction: () => {
          this.alfamartDialogState.isLoading = false
          this.alfamartDialogState.state = false
        },
        successButtonText: this.$t('general.save'),
        // successButtonColor:
        successButtonAction: this.checkPaymentRequirements,
        formType: 'alfamartForm',
        formState: {},
      },
    }
  },
  computed: {
    initStore() {
      return this.$store.state.init
    },
    requestHeader() {
      const headerUserType =
        this.initStore.user?.type === 'guest' ? 'GUEST' : 'CUSTOMER'

      return `Bearer ${headerUserType}_${this.initStore.user?.token || ''}`
    },
    requiredActionMutation: {
      set(val) {
        this.$emit('update:requiredAction', val)
      },
      get() {
        return this.requiredAction
      },
    },
    invoiceDataMutation: {
      set(val) {
        this.$emit('update:invoiceData', val)
      },
      get() {
        return this.invoiceData
      },
    },
    getSelectedPaymentMethod() {
      let indexType = -1
      let indexMethod = -1
      if (!this.initStore.selectedPaymentMethod) {
        return null
      }
      this.paymentMethods.forEach((paymentType, index) => {
        if (indexType === -1) {
          indexMethod = paymentType.payment_method.findIndex(
            (method) =>
              method.id === this.initStore.selectedPaymentMethod.method.id &&
              method.code === this.initStore.selectedPaymentMethod.method.code
          )

          if (indexMethod !== -1) {
            indexType = index
          }
        }
      })

      if (indexType >= 0 && indexMethod >= 0) {
        return {
          type: this.paymentMethods[indexType].name,
          paymentMethod:
            this.paymentMethods[indexType].payment_method[indexMethod].name,
        }
      }

      return null
    },
    paymentMethods() {
      return this.initStore.paymentMethods
    },
  },
  methods: {
    setToken(userStore) {
      localStorage.setItem(storageNames.userStore, JSON.stringify(userStore))
      this.$store.commit('init/setUser', {
        userType: 'customer',
        user: userStore,
      })
      this.requiredActionMutation = ''
      this.getInvoiceData()
    },
    updateSelectedShippingEstimate(params) {
      const { idDistrict, shippingEstimate } = params
      const invoiceData = JSON.parse(JSON.stringify(this.invoiceData))
      const indexDetail = invoiceData.details.findIndex(
        (detail) => detail.idDistrict === idDistrict
      )
      if (indexDetail >= 0 && shippingEstimate.services?.length) {
        const priceRange = getShippingPriceRange(shippingEstimate.services)

        invoiceData.details[indexDetail].selectedShippingService = {
          ...shippingEstimate,
          selectedService: shippingEstimate.services[0],
          priceRange,
        }

        this.invoiceDataMutation = invoiceData
      }
    },
    updateSelectedShippingService(params) {
      const { idDistrict, shippingService } = params
      const invoiceData = JSON.parse(JSON.stringify(this.invoiceData))
      const indexDetail = invoiceData.details.findIndex(
        (detail) => detail.idDistrict === idDistrict
      )
      if (indexDetail >= 0) {
        invoiceData.details[
          indexDetail
        ].selectedShippingService.selectedService = shippingService

        this.invoiceDataMutation = invoiceData

        this.calculateSummaryData()
      }
    },
    checkPaymentRequirements(body = {}) {
      const selectedPaymentMethod = this.getSelectedPaymentMethod
      if (selectedPaymentMethod) {
        const paymentMethod = selectedPaymentMethod.paymentMethod.toLowerCase()
        if (
          selectedPaymentMethod.type === 'E-Wallet' &&
          paymentMethod.includes('ovo') &&
          !body.phone &&
          !body.callingCode
        ) {
          // phone & callingCode
          this.ovoDialogState = {
            ...this.ovoDialogState,
            state: true,
            formState: {
              callingCode: '',
              phone: '',
              filteredPhone: '',
            },
          }
        } else if (
          selectedPaymentMethod.type === 'Retail Outlet' &&
          !body.customerName
        ) {
          // customer name
          this.alfamartDialogState = {
            ...this.alfamartDialogState,
            state: true,
            formState: {
              name: '',
            },
          }
        } else {
          this.setPayment(body)
        }
      } else {
        this.showSnackbar({
          text: this.$t('errors.paymentMethodNotAvailable'),
          color: 'error',
        })
      }
    },
    setPayment(body = {}) {
      this.isLoading = true
      this.ovoDialogState.isLoading = true
      this.alfamartDialogState.isLoading = true

      body = {
        ...body,
        invoiceCode: this.invoiceCode,
        idCustomerAddress: this.initStore.selectedAddress?.id,
        shippingServices: JSON.stringify(
          this.invoiceData.details
            .filter((detail) => detail.idAddress)
            .map((detail) => {
              return {
                idDistrict: detail.idDistrict,
                shippingService: detail.selectedShippingService,
              }
            })
        ),
        paymentMethod: JSON.stringify(this.getSelectedPaymentMethod),
        idPayment: this.selectedIdPayment,
      }

      requestData({
        type: this.initStore.userType,
        url: 'invoice/setInvoicePayment',
        body,
        headers: {
          Authorization:
            this.initStore.userType === 'customer'
              ? this.requestHeader.replace('Bearer', this.initStore.hostName)
              : `Bearer ${this.initStore.user?.sellerToken}`,
        },
      })
        .then((res) => {
          this.isLoading = false
          this.ovoDialogState.isLoading = false
          this.alfamartDialogState.isLoading = false

          if (res.data.success === 1) {
            // const data = res.data.data
            // data.dueDate.date
            // data.accountNumber
            // data.redirectTo

            this.ovoDialogState.state = false
            this.alfamartDialogState.state = false

            if (this.selectedIdPayment) {
              localStorage.setItem(
                storageNames.selectedIdPayment,
                this.selectedIdPayment
              )
            }

            window.location.reload()
          } else {
            this.showSnackbar({ text: res.data.msg })
          }
        })
        .catch((error) => {
          this.isLoading = false
          this.ovoDialogState.isLoading = false
          this.alfamartDialogState.isLoading = false
          this.showSnackbar({ type: 'serverIssue' })
          console.warn(error)
        })
    },
  },
}
</script>
