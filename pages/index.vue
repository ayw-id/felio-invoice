<template>
  <div style="width: 100%">
    <v-row v-show="loading" justify="center" class="pa-4 text-center">
      <v-col cols="12" xs="12">
        <v-progress-circular
          indeterminate
          :size="100"
          color="primary"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <v-row
      v-show="
        !loading &&
        invoiceData?.status === 'CREATED' &&
        paymentState?.paymentType === 'QRIS' &&
        paymentState?.qrString
      "
    >
      <v-col cols="12" class="text-center">
        <canvas id="canvas"></canvas>
      </v-col>
    </v-row>

    <v-row
      v-if="!loading && initStore.userType === 'seller'"
      style="justify-content: center"
    >
      <v-col cols="4" md="2">
        <v-btn
          block
          style="border-radius: 12px; text-transform: none"
          outlined
          color="black"
          @click="backToDashboard()"
          >Back</v-btn
        >
      </v-col>
    </v-row>

    <v-row v-if="!loading" class="text-brown justify-center align-center">
      <v-col
        v-if="!invoiceData || invoiceData?.status === 'CREATED'"
        cols="12"
        sm="10"
        md="8"
      >
        <v-row v-if="selectedIdPayment">
          <v-btn
            class="ml-2"
            rounded
            style="text-transform: none"
            color="primary"
            @click="
              () => {
                selectedIdPayment = 0
                if (!installments.length) {
                  loading = true
                  getInvoiceData()
                }
              }
            "
            >{{ $t('general.back') }}</v-btn
          >
        </v-row>

        <v-row
          v-if="!selectedIdPayment && installments?.length"
          class="align-center mb-4"
        >
          <v-col cols="12">
            <v-card
              v-for="(installment, i) in installments"
              :key="i"
              style="border-radius: 12px"
              @click="selectInstallment(installment)"
            >
              <v-row class="ma-4 py-4">
                <v-col cols="3" md="2" style="">
                  <img
                    :src="paymentStatus[installment.status].img"
                    style="height: 60px; width: 60px"
                  />
                </v-col>
                <v-col cols="9" md="10" style="">
                  <p style="font-size: 12px" class="mb-0">
                    {{ $t(`invoice.payment.types.${installment.status}.date`) }}
                  </p>
                  <p style="font-size: 20px">
                    {{
                      installment.status === 'PAID'
                        ? installment.paidAt
                        : dateFormat(installment.dueDate)
                    }}
                  </p>
                  <v-divider class="mb-4"></v-divider>

                  <p style="font-size: 12px" class="mb-0">
                    {{ $t(`invoice.payment.amount`) }}
                  </p>
                  <p style="font-size: 20px; cursor: pointer" class="mb-0">
                    RP.{{ priceWithCurrency(installment.amountToPay) }}
                  </p>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <InvoicePayment
          v-else-if="paymentState"
          :selected-customer-address="selectedCustomerAddress"
          :invoice-data="invoiceData"
          :remove-payment="removePayment"
          :user-type="userType"
        />

        <InvoiceCreated
          v-else
          :get-invoice-data="getInvoiceData"
          :requiredAction.sync="requiredAction"
          :show-snackbar="showSnackbar"
          :invoice-code="invoiceCode"
          :invoiceData.sync="invoiceData"
          :get-shipping-services="getShippingServices"
          :calculate-summary-data="calculateSummaryData"
          :loading="loading"
          :selected-id-payment="selectedIdPayment"
          :payment-message="paymentMessage"
          :show-transaction-summary="showTransactionSummary"
        />
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
  </div>
</template>
<script>
import moment from 'moment'
import QRCode from 'qrcode'
import { storageNames } from '~/utils/constants'
import { requestData } from '~/utils/serverAccess'
import { getShippingPriceRange, priceWithCurrency } from '~/utils/utilFunctions'
import InvoiceCreated from '~/components/invoiceCreated.vue'
import InvoicePayment from '~/components/invoicePayment.vue'
import PENDING from '~/assets/img/pending.png'
import PAID from '~/assets/img/success.png'
import EXPIRED from '~/assets/img/expired.png'
import FAILED from '~/assets/img/failed.png'

export default {
  components: {
    InvoiceCreated,
    InvoicePayment,
  },
  data() {
    return {
      timeout: 3000,
      snackbar: false,
      snackbarColor: 'primary',
      loading: true,
      userType: 'customer',
      // invoice created
      invoiceCode: '',
      requiredAction: '',
      invoiceData: null,
      snackbarText: '',
      vat: 0,
      // payment selected
      paymentState: null,
      selectedCustomerAddress: null,
      invoiceTotal: 0,
      // installments
      installments: [],
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
      paymentMessage: '',
      showTransactionSummary: true,
      selectedIdPayment: '',
      // shipping
      retryGetShippingService: 0,
      retryGetShippingServiceTimeout: 5000,
      // for seller
      authCode: '',
    }
  },
  computed: {
    paymentMethods: {
      set(val) {
        this.$store.commit('init/setData', {
          paymentMethods: val,
        })
      },
      get() {
        return this.initStore.paymentMethods
      },
    },
    getPaymentMethodsFromLocalStorage() {
      let paymentMethods = localStorage.getItem(storageNames.paymentMethods)
      if (paymentMethods) {
        paymentMethods = JSON.parse(paymentMethods)
        if (paymentMethods.lastUpdate) {
          const start = moment(paymentMethods.lastUpdate, 'YYYY-MM-DD HH')
          const end = moment()
          const duration = moment.duration(end.diff(start))
          const hours = duration.asHours()
          if (parseInt(hours) > 3) {
            return null
          } else {
            return paymentMethods.paymentMethods
          }
        } else {
          return null
        }
      }

      return null
    },
    requestHeader() {
      const headerUserType =
        this.initStore.user?.type === 'guest' ? 'GUEST' : 'CUSTOMER'

      return `Bearer ${headerUserType}_${this.initStore.user?.token || ''}`
    },
    initStore() {
      return this.$store.state.init
    },
  },
  watch: {},
  mounted() {
    this.getToken()

    if (!this.invoiceCode) {
      this.loading = false
      this.showSnackbar({ text: this.$t('errors.invoiceCodeNotFound') })
    } else {
      this.getInvoiceData()
    }
  },
  methods: {
    selectInstallment(installment) {
      this.selectedIdPayment = installment.idPayment
      this.loading = true
      this.getInvoiceData()
    },
    dateFormat(date) {
      const splitted = date.split(' ')
      if (splitted.length >= 4) {
        return `${splitted[0]} ${splitted[1]} ${splitted[2]}`
      }
      return date
    },
    backToDashboard() {
      window.location.href = process.env.MERCHANT_DASHBOARD
    },
    getInvoiceTotal() {
      let total = 0
      this.invoiceData?.details?.forEach((detail) => {
        if (this.userType === 'customer') {
          if (!detail.isDigitalProduct) {
            total += detail.selectedShippingService?.selectedService?.value || 0
          }

          detail.products.forEach((product) => {
            total += detail.isDigitalProduct
              ? parseInt(product.price)
              : parseInt(product.price) * parseInt(product.qty)
          })
        } else if (this.userType === 'seller') {
          total += detail.subtotal
        } else if (this.userType === 'ai-content-user') {
          total += detail.products.reduce((total, prod) => {
            return total + prod.price
          }, 0)
        }
      })

      if (this.userType === 'seller') {
        total += parseInt((total * this.vat) / 100)
      }
      this.invoiceTotal = total
    },
    getShippingServices() {
      if (
        this.initStore.selectedAddress &&
        this.initStore.selectedAddress?.idDistrict !==
          this.initStore.idDistrictDestination
      ) {
        const idDistrictsFromInvoice = this.invoiceData.details
          .filter((detail) => !detail.isPreOrder)
          .map((detail) => detail.idDistrict)

        if (idDistrictsFromInvoice.length) {
          this.fetchShippingServices(0, idDistrictsFromInvoice)
        }
      }
    },
    fetchShippingServices(index, idDistrictsFromInvoice) {
      if (idDistrictsFromInvoice[index]) {
        this.$store.commit('init/setData', {
          shippingServicesLoading: idDistrictsFromInvoice[index],
        })

        console.log('this.invoiceData?.details', this.invoiceData?.details)

        const invDetails = (this.invoiceData?.details || []).map((detail) => {
          return {
            idAddress: detail.idAddress,
            idDistrict: detail.idDistrict,
            products: detail.products,
            shippingServices: detail.shippingServices,
            totalWeight: detail.totalWeight || 0,
          }
        })
        requestData({
          type: 'customer',
          url: 'shipping/getShippingServices',
          body: {
            invoiceCode: this.invoiceCode,
            destination: this.initStore.selectedAddress.idDistrict,
            idDistrictFromInvoice: idDistrictsFromInvoice[index],
            invDetails: JSON.stringify(invDetails),
          },
          headers: {
            Authorization: this.requestHeader.replace(
              'Bearer',
              this.initStore.hostName
            ),
          },
        })
          .then((response) => {
            this.$store.commit('init/setData', {
              shippingServicesLoading: '',
            })
            if (response.data.success === 1) {
              this.retryGetShippingService = 0
              const data = response.data.data

              if (data.shippingServices) {
                const invoiceData = JSON.parse(JSON.stringify(this.invoiceData))
                const indexDetail = this.invoiceData.details.findIndex(
                  (detail) =>
                    detail.idDistrict === idDistrictsFromInvoice[index]
                )
                if (indexDetail >= 0) {
                  invoiceData.details[indexDetail].availableShippingServices =
                    data.shippingServices
                  if (
                    data.shippingServices.length &&
                    data.shippingServices[0]?.services?.length
                  ) {
                    const priceRange = getShippingPriceRange(
                      data.shippingServices[0].services
                    )

                    invoiceData.details[indexDetail].selectedShippingService = {
                      ...data.shippingServices[0],
                      selectedService: data.shippingServices[0].services[0],
                      priceRange,
                    }
                  }
                }

                this.invoiceData = invoiceData

                if (data.shippingServices.error) {
                  this.showSnackbar({ text: data.shippingServices.error })
                } else {
                  if (index === 0) {
                    this.$store.commit('init/setData', {
                      idDistrictDestination:
                        this.initStore.selectedAddress.idDistrict,
                    })
                  }

                  if (index + 1 <= idDistrictsFromInvoice.length - 1) {
                    this.fetchShippingServices(
                      index + 1,
                      idDistrictsFromInvoice
                    )
                  } else {
                    this.getPaymentMethods()
                  }
                }
              }
            } else {
              console.warn(response.data.msg)
              if (this.retryGetShippingService < 3) {
                this.retryGetShippingService++
                this.getInvoiceData()
              } else {
                this.$store.commit('init/setData', {
                  shippingServicesLoading: '',
                })
                this.showSnackbar({ text: response.data.msg })
              }
            }
          })
          .catch((error) => {
            if (this.retryGetShippingService < 3) {
              this.retryGetShippingService++
              this.getInvoiceData()
            } else {
              this.$store.commit('init/setData', {
                shippingServicesLoading: '',
              })
              this.showSnackbar({ type: 'serverIssue' })
              console.warn(error)
            }
          })
      } else {
        this.fetchShippingServices(index + 1, idDistrictsFromInvoice)
      }
    },
    getPaymentMethods() {
      const lastUpdate = moment().format('YYYY-MM-DD HH')
      const paymentMethods = this.getPaymentMethodsFromLocalStorage
      if (!paymentMethods) {
        requestData({
          type: this.userType,
          url: 'payment/getPaymentMethods',
          headers: {
            Authorization:
              this.userType === 'customer'
                ? this.requestHeader.replace('Bearer', this.initStore.hostName)
                : `Bearer ${this.initStore.user.sellerToken}`,
          },
        })
          .then((res) => {
            if (res.data.success === 1) {
              const data = res.data.data
              if (data.length > 0) {
                localStorage.setItem(
                  storageNames.paymentMethods,
                  JSON.stringify({
                    lastUpdate,
                    paymentMethods: data,
                  })
                )
              }
              this.paymentMethods = data
              this.calculateSummaryData()
            } else {
              this.showSnackbar({ text: res.data.msg })
            }
          })
          .catch((error) => {
            this.showSnackbar({ type: 'serverIssue' })
            console.warn(error)
          })
      } else {
        this.paymentMethods = paymentMethods
        this.calculateSummaryData()
      }
    },
    calculateSummaryData() {
      if (this.userType === 'customer') {
        let productTotal = 0
        let sinppingTotal = 0
        let countProduct = 0
        this.invoiceData.details?.forEach((detail) => {
          detail.products.forEach((product) => {
            countProduct++
            const qty = detail.isDigitalProduct ? 1 : product.qty || 1
            const price = product.preOrder?.downPayment || product.price
            productTotal += parseFloat(price) * parseFloat(qty)
          })
          if (!detail.isDigitalProduct) {
            sinppingTotal +=
              detail.selectedShippingService?.selectedService?.value || 0
          }
        })

        this.$store.commit('init/setData', {
          summaryData: [
            {
              title: this.$t('invoice.summary.productTotal').replace(
                '*',
                countProduct
              ),
              price: productTotal,
              discountPrice: 0,
            },
            {
              title: this.$t('invoice.summary.shippingTotal'),
              price: sinppingTotal,
              discountPrice: 0,
            },
            {
              title: this.$t('invoice.summary.serviceFee'),
              price: 0,
              discountPrice: 0,
            },
          ],
        })
      } else if (this.userType === 'seller') {
        let subtotal = 0
        let totalPrice = 0
        let hasDiscount = false
        this.invoiceData.details.forEach((detail) => {
          subtotal += detail.subtotal
          totalPrice += detail.price
          if (detail.discountAmount || detail.discountPercent) {
            hasDiscount = true
          }
        })

        this.$store.commit('init/setData', {
          summaryData: [
            {
              title: this.$t('invoice.summary.productTotal').replace(
                '*',
                this.invoiceData.details.length
              ),
              price: hasDiscount ? totalPrice : subtotal,
              discountPrice: hasDiscount ? subtotal : 0,
            },
            {
              title: `${this.$t('invoice.summary.vat')} (${this.vat}%)`,
              price: parseInt((subtotal * this.vat) / 100),
              discountPrice: 0,
            },
            {
              title: this.$t('invoice.summary.grandTotal'),
              price: subtotal + parseInt((subtotal * this.vat) / 100),
              discountPrice: 0,
            },
          ],
        })
      }
    },
    removePayment() {
      if (this.selectedIdPayment || this.paymentState?.idPayment) {
        this.loading = true

        const body = {
          invoiceCode: this.invoiceCode,
          authCode: this.authCode,
          idPayment: this.selectedIdPayment || this.paymentState.idPayment,
        }
        requestData({
          type: this.userType,
          url: 'invoice/removePayment',
          body,
          headers: {
            Authorization:
              this.userType === 'customer'
                ? this.requestHeader
                : `Bearer ${this.initStore.user?.sellerToken}`,
          },
        })
          .then((response) => {
            this.loading = false
            if (response.data.success === 1) {
              if (this.userType === 'customer') {
                this.getInvoiceData()
              } else if (this.userType === 'seller') {
                //
              }
            } else {
              console.warn(response.data.msg)
              this.showSnackbar({ text: response.data.msg })
            }
          })
          .catch((error) => {
            this.loading = false
            this.showSnackbar({ type: 'serverIssue' })
            console.warn(error)
          })
      }
    },
    getInvoiceData() {
      this.paymentState = null
      this.paymentMessage = ''
      this.showTransactionSummary = true
      const body = {
        invoiceCode: this.invoiceCode,
        authCode: this.authCode,
      }
      if (this.selectedIdPayment) {
        body.idPayment = this.selectedIdPayment
      }

      requestData({
        type: this.userType,
        url: 'invoice',
        body,
        headers: {
          Authorization:
            this.userType === 'customer'
              ? this.requestHeader
              : this.userType === 'seller'
              ? `Bearer ${this.initStore.user?.sellerToken}`
              : `Bearer ${this.initStore.user?.aiContentUserToken}`,
        },
      })
        .then((response) => {
          this.loading = false
          const data = response.data.data
          if (response.data.success === 1 || response.data.status) {
            if (this.userType === 'customer') {
              this.requiredAction = data.requiredAction || ''

              if (!data.requiredAction) {
                this.invoiceData = data.invoice

                const initDataStore = {
                  hostName: data.hostName,
                  isShippingNeeded: true,
                }

                if (data.isShippingNeeded !== undefined) {
                  initDataStore.isShippingNeeded = data.isShippingNeeded
                }

                if (data.installments?.length) {
                  this.installments = data.installments
                  this.selectedCustomerAddress = data.selectedCustomerAddress
                } else if (data.paymentState) {
                  this.paymentState = data.paymentState
                  this.selectedCustomerAddress = data.selectedCustomerAddress

                  this.getInvoiceTotal()
                  this.calculateSummaryData()

                  this.$store.commit('init/setPaymentData', {
                    paymentState: data.paymentState,
                    invoiceTotal: this.invoiceTotal,
                  })

                  if (
                    data.paymentState.paymentType === 'QRIS' &&
                    data.paymentState.qrString
                  ) {
                    const canvas = document.getElementById('canvas')

                    QRCode.toCanvas(
                      canvas,
                      data.paymentState.qrString,
                      function (error) {
                        if (error) console.error(error)
                        console.warn('success!')
                      }
                    )
                  }
                } else {
                  initDataStore.customerAddress = data.customerAddress
                }

                this.$store.commit('init/setData', initDataStore)

                let canPayFulfillment = true
                let isFulfillmentExpired = false
                if (this.invoiceData?.fulfillmentDate) {
                  const today = moment().startOf('day') // remove time
                  const fulfill = moment(
                    this.invoiceData.fulfillmentDate
                  ).startOf('day')

                  const diffDays = fulfill.diff(today, 'days')
                  canPayFulfillment = diffDays <= 2
                  isFulfillmentExpired = diffDays < 0
                }

                if (!canPayFulfillment) {
                  this.paymentMessage =
                    this.$t('invoice.payment.fulfillmentOpenAt') +
                    this.invoiceData.fulfillmentDate
                  this.showTransactionSummary = false
                } else if (isFulfillmentExpired) {
                  this.paymentMessage = this.$t(
                    'invoice.payment.fulfillmentExpired'
                  )
                  this.showTransactionSummary = false
                }

                if (
                  !this.paymentState &&
                  canPayFulfillment &&
                  !isFulfillmentExpired
                ) {
                  setTimeout(() => {
                    if (initDataStore.isShippingNeeded) {
                      this.getShippingServices()
                    } else {
                      this.getPaymentMethods()
                    }
                  }, 1000)
                }
              }
            } else if (this.userType === 'seller') {
              this.vat = data.vat

              localStorage.setItem(
                storageNames.sellerToken,
                JSON.stringify(data.token)
              )

              this.$store.commit('init/setUser', {
                user: {
                  sellerToken: data.token?.token,
                },
                userType: 'seller',
              })
              this.invoiceData = data.invoice

              if (data.paymentState) {
                this.paymentState = data.paymentState

                this.getInvoiceTotal()
                this.calculateSummaryData()

                this.$store.commit('init/setPaymentData', {
                  paymentState: data.paymentState,
                  invoiceTotal: this.invoiceTotal,
                })

                if (
                  data.paymentState.paymentType === 'QRIS' &&
                  data.paymentState.qrString
                ) {
                  const canvas = document.getElementById('canvas')

                  QRCode.toCanvas(
                    canvas,
                    data.paymentState.qrString,
                    function (error) {
                      if (error) console.error(error)
                      console.log('success!')
                    }
                  )
                }
              } else {
                setTimeout(() => {
                  this.getPaymentMethods()
                }, 1000)
              }
            } else if (this.userType === 'ai-content-user') {
              this.invoiceData = data.invoice

              const paymentState = data.paymentState
              if (paymentState) {
                this.paymentState = paymentState

                this.getInvoiceTotal()
                this.calculateSummaryData()

                this.$store.commit('init/setPaymentData', {
                  paymentState,
                  invoiceTotal: this.invoiceTotal,
                })

                if (
                  paymentState.paymentType === 'QRIS' &&
                  paymentState.qrString
                ) {
                  const canvas = document.getElementById('canvas')

                  QRCode.toCanvas(
                    canvas,
                    paymentState.qrString,
                    function (error) {
                      if (error) console.error(error)
                      console.log('success!')
                    }
                  )
                }
              } else {
                setTimeout(() => {
                  this.getPaymentMethods()
                }, 1000)
              }
            }
          } else if (response.data.success === 2) {
            // data.products
            localStorage.setItem(
              storageNames.sellerToken,
              JSON.stringify(data.token)
            )

            this.snackbarText = this.$t('invoice.expired')
            this.snackbarColor = 'red'
            this.snackbar = true

            setTimeout(() => {
              window.location.href = `${process.env.BUILDER_URL}domain-search/?domain=${data?.tempData?.domainName}`
            }, 3000)
          } else {
            console.warn(response.data.msg)
            this.showSnackbar({ text: response.data.msg })
          }
        })
        .catch((error) => {
          this.loading = false
          this.showSnackbar({ type: 'serverIssue' })
          console.warn(error)
        })
    },
    showSnackbar(params = {}) {
      const type = params.type || 'custom'
      let text = params.text || ''
      let color = params.color || '#E76F51'

      if (type === 'serverIssue') {
        text = this.$t('errors.serverIssue')
        color = 'error'
      }

      if (text) {
        this.snackbarText = text
        this.snackbarColor = color
        this.snackbar = true
      }
    },
    getToken() {
      this.invoiceCode = this.$route.query.inv
      this.authCode = this.$route.query.authCode
      const selectedIdPayment = localStorage.getItem(
        storageNames.selectedIdPayment
      )
      if (selectedIdPayment) {
        this.selectedIdPayment = selectedIdPayment
        localStorage.removeItem(storageNames.selectedIdPayment)
      }

      let userType = 'customer'

      const splittedInvCode = this.invoiceCode.split('-')
      if (splittedInvCode.length > 1) {
        if (splittedInvCode[0] === 'INVS') {
          userType = 'seller'
        } else if (splittedInvCode[0] === 'INVAI') {
          userType = 'ai-content-user'
        }
      }

      this.userType = userType

      let userStore = localStorage.getItem(
        userType === 'customer'
          ? storageNames.userStore
          : userType === 'seller'
          ? storageNames.sellerToken
          : storageNames.aiContentUser
      )

      const userData = {
        user: null,
        userType,
      }
      if (userStore) {
        userStore = JSON.parse(userStore)
        userData.user =
          userType === 'customer'
            ? {
                token: userStore.token,
              }
            : userType === 'seller'
            ? {
                sellerToken: userStore.token,
              }
            : {
                aiContentUserToken: userStore.token,
              }
      }

      this.$store.commit('init/setUser', userData)
    },
    priceWithCurrency(amount) {
      return priceWithCurrency(amount, false)
    },
  },
}
</script>
