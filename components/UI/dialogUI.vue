<template>
  <v-dialog
    v-model="stateMutation"
    :fullscreen="dialogState.isFullWidth"
    :width="!dialogState.isFullWidth && dialogState.width"
    transition="dialog-bottom-transition"
  >
    <v-card style="border-radius: 12px">
      <v-card-title>
        <v-layout justify-space-between align-center>
          <span class="subheading" style="">{{ dialogState.header }}</span>
          <v-btn
            depressed
            color="primary"
            style="margin: -12px"
            text
            fab
            @click="stateMutation = false"
            ><v-icon>mdi-close</v-icon></v-btn
          >
        </v-layout>
      </v-card-title>
      <v-card-text>
        <p v-if="dialogState.description">{{ dialogState.description }}</p>
        <AddressForm
          v-if="
            dialogState.type === 'form' &&
            dialogState.formType === 'addressForm'
          "
          :formState.sync="formMutation"
          :showActionButton.sync="showActionButtonMutation"
        />

        <AddressList
          v-if="
            dialogState.type === 'list' &&
            dialogState.formType === 'addressList'
          "
          :actions="dialogState.actions"
        />

        <ShippingEstimateList
          v-if="
            dialogState.type === 'list' &&
            dialogState.formType === 'shippingEstimate'
          "
          :shipping-estimates="dialogState.data"
          :item-selected="dialogState.actions.itemSelected"
        />

        <ShippingServiceList
          v-if="
            dialogState.type === 'list' &&
            dialogState.formType === 'shippingService'
          "
          :shipping-services="dialogState.data"
          :item-selected="dialogState.actions.itemSelected"
        />

        <PaymentMethodList
          v-if="
            dialogState.type === 'list' &&
            dialogState.formType === 'paymentList'
          "
          :payment-methods="dialogState.data"
          :item-selected="dialogState.actions.itemSelected"
          :item-child-selected="dialogState.actions.itemChildSelected"
        />

        <OvoForm
          v-if="
            dialogState.type === 'form' && dialogState.formType === 'ovoForm'
          "
          :loading="dialogState.isLoading"
          :success-button-action="dialogState.successButtonAction"
        />

        <AlfamartForm
          v-if="
            dialogState.type === 'form' &&
            dialogState.formType === 'alfamartForm'
          "
          :loading="dialogState.isLoading"
          :success-button-action="dialogState.successButtonAction"
        />
      </v-card-text>
      <v-card-actions
        v-if="
          showActionButtonMutation === undefined || showActionButtonMutation
        "
        class="pb-4"
      >
        <v-row class="mb-4 justify-center">
          <v-btn
            :loading="formMutation?.loading"
            style="text-transform: none; width: 160px; border-radius: 12px"
            :color="dialogState.cancelButtonColor || ''"
            class="mx-2"
            @click="
              dialogState.cancelButtonAction && dialogState.cancelButtonAction()
            "
            >{{ dialogState.cancelButtonText || $t('general.cancel') }}</v-btn
          >
          <v-btn
            :loading="formMutation?.loading"
            style="text-transform: none; width: 160px; border-radius: 12px"
            :color="dialogState.successButtonColor || 'teal'"
            dark
            class="mx-2"
            @click="
              dialogState.successButtonAction &&
                dialogState.successButtonAction()
            "
            >{{ dialogState.successButtonText || $t('general.yes') }}</v-btn
          >
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import AddressForm from '~/components/Forms/addressForm.vue'
import AddressList from '~/components/Checkout/addressList.vue'
import ShippingEstimateList from '~/components/Checkout/shippingEstimateList.vue'
import ShippingServiceList from '~/components/Checkout/shippingServiceList.vue'
import PaymentMethodList from '~/components/Checkout/paymentMethodList.vue'
import OvoForm from '~/components/Forms/ovoForm.vue'
import AlfamartForm from '~/components/Forms/alfamartForm.vue'
export default {
  components: {
    AddressForm,
    AddressList,
    ShippingEstimateList,
    ShippingServiceList,
    PaymentMethodList,
    OvoForm,
    AlfamartForm,
  },
  props: {
    showSnackbar: {
      type: Function,
      default(r) {
        return r
      },
    },
    dialogState: {
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
    stateMutation: {
      set(val) {
        this.$emit('update:dialogState', {
          ...this.dialogState,
          state: val,
        })
      },
      get() {
        return this.dialogState.state
      },
    },
    formMutation: {
      set(val) {
        this.$emit('update:dialogState', {
          ...this.dialogState,
          formState: val,
        })
      },
      get() {
        return this.dialogState.formState
      },
    },
    showActionButtonMutation: {
      set(val) {
        this.$emit('update:dialogState', {
          ...this.dialogState,
          showActionButton: val,
        })
      },
      get() {
        return this.dialogState.showActionButton
      },
    },
  },
  methods: {},
}
</script>
