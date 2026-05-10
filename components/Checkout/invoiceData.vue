<template>
  <v-row class="justify-center align-center mb-4">
    <v-col cols="12">
      <AddressBox
        v-if="initStore.userType === 'customer' && initStore.isShippingNeeded"
        :address="initStore.selectedAddress"
        :click-action="onSelectedAddressClicked"
        :on-add-address="onAddAddress"
        :show-buttons="false"
        :title="$t('invoice.address.title')"
      />

      <v-card style="border-radius: 12px">
        <v-row class="ma-4 py-4">
          <v-col cols="12" style="text-align: center">
            <p class="text-center text-lg">
              {{ $t('invoice.detailOrders.title') }}
            </p>
          </v-col>
          <v-col
            v-for="(invDetail, indexDetail) in invoiceDetails"
            :key="`details-${indexDetail}`"
            cols="12"
            class="pa-4"
          >
            <InvoiceDetailBox
              v-if="initStore.userType === 'customer'"
              :inv-detail="invDetail"
              :update-selected-shipping-estimate="
                updateSelectedShippingEstimate
              "
              :update-selected-shipping-service="updateSelectedShippingService"
            />
            <InvoiceProductBox v-else :product="invDetail" />
          </v-col>
        </v-row>
      </v-card>

      <PaymentMethods
        v-if="
          initStore.userType !== 'customer' ||
          !initStore.isShippingNeeded ||
          (initStore.isShippingNeeded && initStore.selectedAddress)
        "
        :payment-message="paymentMessage"
      />

      <TransactionSummary
        v-if="
          showTransactionSummary &&
          (initStore.userType !== 'customer' ||
            !initStore.isShippingNeeded ||
            (initStore.isShippingNeeded && initStore.selectedAddress))
        "
        :loading="loading || !paymentMethods?.length"
      />
    </v-col>

    <DialogUI :dialogState.sync="addressDialogState"></DialogUI>

    <DialogUI :dialogState.sync="addressListDialogState"></DialogUI>

    <DialogUI :dialogState.sync="deleteAddressDialogState"></DialogUI>
  </v-row>
</template>
<script>
import InvoiceDetailBox from '~/components/invoiceDetailBox.vue'
import DialogUI from '~/components/UI/dialogUI.vue'
import AddressBox from '~/components/addressBox.vue'
import PaymentMethods from '~/components/Checkout/paymentMethods.vue'
import TransactionSummary from '~/components/transactionSummary.vue'
import InvoiceProductBox from '~/components/invoiceProductBox.vue'
import { requestData } from '~/utils/serverAccess'
import { filterPhoneNumber, validate } from '~/utils/validation'
export default {
  components: {
    InvoiceDetailBox,
    DialogUI,
    AddressBox,
    PaymentMethods,
    TransactionSummary,
    InvoiceProductBox,
  },
  props: {
    showSnackbar: {
      type: Function,
      default(r) {
        return r
      },
    },
    invoiceDetails: {
      type: Array,
      default(r) {
        return r
      },
    },
    requestHeader: {
      type: String,
      default: '',
    },
    getShippingServices: {
      type: Function,
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
    loading: {
      type: Boolean,
      default: false,
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
      deleteAddressDialogState: {
        state: false,
        isLoading: false,
        header: this.$t('invoice.address.deleteAddress'),
        description: this.$t('invoice.address.deleteAddressConfirmation'),
        width: 480,
        isFullWidth: false,
        type: 'confirm',
        showActionButton: true,
        cancelButtonAction: () => {
          this.deleteAddressDialogState.isLoading = false
          this.deleteAddressDialogState.state = false
        },
        successButtonAction: this.deleteAddress,
        data: null,
      },
      addressListDialogState: {
        state: false,
        isLoading: false,
        header: this.$t('invoice.address.listTitle'),
        // description: '',
        width: 480,
        isFullWidth: false,
        type: 'list',
        showActionButton: false,
        formType: 'addressList',
        data: [],
        actions: {
          itemSelected: this.onAddressSelected,
          addItem: this.onAddAddressClicked,
          deleteItem: this.onDeleteAddressClicked,
          editItem: this.showAddressDialog,
        },
      },
      addressDialogState: {
        state: false,
        isLoading: false,
        header: this.$t('invoice.address.title'),
        // description: '',
        width: 480,
        isFullWidth: false,
        type: 'form',
        showActionButton: false,
        // cancelButtonText: this.$t('general.cancel'),
        // cancelButtonColor: string;
        cancelButtonAction: () => {
          this.addressDialogState.isLoading = false
          this.addressDialogState.state = false
        },
        successButtonText: this.$t('general.save'),
        // successButtonColor:
        successButtonAction: this.submitAddress,
        formType: 'addressForm',
        formState: {
          idAddress: '',
          saveAs: '',
          callingCode: '',
          phone: '',
          filteredPhone: '',
          receiver: '',
          district: null,
          address: '',
          postalCode: '',
          queryAddress: '',
          isPrimary: true,
          loading: false,
        },
      },
    }
  },
  computed: {
    paymentMethods() {
      return this.initStore.paymentMethods
    },
    initStore() {
      return this.$store.state.init
    },
  },
  methods: {
    onAddAddress() {
      this.addressListDialogState.state = true
    },
    deleteAddress() {
      this.deleteAddressDialogState.isLoading = true
      requestData({
        type: 'customer',
        url: 'user/deleteAddress',
        body: {
          idAddress: this.deleteAddressDialogState.data.id,
        },
        headers: {
          Authorization: this.requestHeader.replace(
            'Bearer',
            this.initStore.hostName
          ),
        },
      })
        .then((response) => {
          this.deleteAddressDialogState.isLoading = false
          if (response.data.success === 1) {
            this.$store.commit(
              'init/deleteAddress',
              this.deleteAddressDialogState.data.id
            )
            this.deleteAddressDialogState.state = false
          } else {
            this.showSnackbar({ text: response.data.msg })
          }
        })
        .catch((error) => {
          this.deleteAddressDialogState.isLoading = false
          this.showSnackbar({ type: 'serverIssue' })
          console.warn(error)
        })
    },
    onDeleteAddressClicked(address) {
      this.deleteAddressDialogState = {
        ...this.deleteAddressDialogState,
        state: true,
        data: address,
      }
    },
    onAddAddressClicked() {
      this.addressListDialogState.state = false
      this.showAddressDialog()
    },
    onAddressSelected(address) {
      this.$store.commit('init/setData', {
        selectedAddress: address,
      })
      this.addressListDialogState.state = false
      this.getShippingServices()
    },
    onSelectedAddressClicked() {
      this.addressListDialogState = {
        ...this.addressListDialogState,
        state: true,
        data: this.initStore.customerAddress,
      }
    },
    showAddressDialog(address = null) {
      this.addressDialogState = {
        ...this.addressDialogState,
        state: true,
        showActionButton: !!address,
        formState: {
          idAddress: address?.id || '',
          saveAs: address?.saveAs || '',
          callingCode: address?.callingCode || '',
          phone: address?.phone || '',
          filteredPhone: '',
          receiver: address?.receiver,
          district: address
            ? {
                idDistrict: address.idDistrict,
                district: address.district,
                city: address.city,
                province: address.province,
              }
            : null,
          address: address?.address || '',
          postalCode: address?.postalCode || '',
          queryAddress: '',
          isPrimary: address ? address.primary : true,
          loading: false,
        },
      }
    },
    submitAddress() {
      const error = this.validateAddAddress()
      if (error) {
        this.showSnackbar({
          text: this.error,
        })
      } else {
        this.saveAddress()
      }
    },
    saveAddress() {
      this.addressDialogState.formState.loading = true
      const {
        saveAs,
        callingCode,
        filteredPhone,
        receiver,
        district,
        address,
        postalCode,
        isPrimary,
        idAddress,
      } = this.addressDialogState.formState

      requestData({
        type: 'customer',
        url: `user/${idAddress ? 'updateAddress' : 'addAddress'}`,
        body: {
          idAddress,
          saveAs,
          callingCode,
          phone: filteredPhone,
          receiver,
          idDistrict: district.idDistrict,
          address,
          postalCode,
          isPrimary: isPrimary ? 1 : 0,
        },
        headers: {
          Authorization: this.requestHeader.replace(
            'Bearer',
            this.initStore.hostName
          ),
        },
      })
        .then((response) => {
          this.addressDialogState.formState.loading = false
          if (response.data.success === 1) {
            const data = response.data.data

            if (idAddress) {
              this.$store.commit('init/editAddress', {
                id: idAddress,
                address: data.address,
              })
            } else {
              this.$store.commit('init/addAddress', data.address)
            }

            this.getShippingServices()

            this.addressDialogState.state = false
          } else {
            this.showSnackbar({ text: response.data.msg })
          }
        })
        .catch((error) => {
          this.addressDialogState.formState.loading = false
          this.showSnackbar({ type: 'serverIssue' })
          console.warn(error)
        })
    },
    validateAddAddress() {
      const { saveAs, callingCode, phone, receiver, address, postalCode } =
        this.addressDialogState.formState

      const filteredPhone = filterPhoneNumber(phone, callingCode || '')

      const error = validate(this, {
        name: receiver,
        phone: filteredPhone,
        postalCode,
      })

      if (error) {
        return error
      }

      if (!saveAs) {
        return this.$t('errors.requiredSaveAs')
      }

      if (!address) {
        return this.$t('errors.requiredAddress')
      }

      this.addressDialogState.formState.filteredPhone = filteredPhone

      return ''
    },
  },
}
</script>
