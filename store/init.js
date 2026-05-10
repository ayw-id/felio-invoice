export const state = () => ({
  header: {
    title: '',
    description: '',
    image: '',
    link: [],
    fonts: [],
  },
  userType: 'customer',
  user: null,
  hostName: '',
  customerAddress: [],
  selectedAddress: null,
  idDistrictDestination: '',
  paymentMethods: [],
  selectedPaymentMethod: null,
  summaryData: [],
  shippingServicesLoading: '',
  // payment
  paymentState: null,
  invoiceTotal: 0,
  initDataStore: true,

  // live
  url_api: 'https://felio.id/t_back_end/customer/',
  url_rov: 'https://hijrah-clothee.com/s_back_end/rovelio/',
  root_: 'https://felio.id',
  base_: 'https://felio.id',
  url_assets: 'https://felio.id/t_back_end/assets/',
  // dev live
  // url_api: 'https://felio.id/t_back_end/test/customer/',
  // url_rov: 'https://hijrah-clothee.com/s_back_end/rovelio/',
  // root_: 'http://localhost:3000/JuztPay/profile',
  // base_: 'http://localhost:3000/JuztPay',
  // url_assets: 'https://felio.id/t_back_end/assets/',
  // dev local
  // url_api: 'http://localhost/t_back_end/felio/customer/',
  // url_rov: 'https://hijrah-clothee.com/s_back_end/rovelio/',
  // root_: 'http://localhost:3000/JuztPay/profile',
  // base_: 'http://localhost:3000/JuztPay',
  // url_assets: 'http://localhost/t_back_end/assets/',
  //
  blur: 'https://hijrah-clothee.com/s_back_end/assets/images/blur4.jpg',
  show_logo: true,
  show_back_btn: false,
  param_show_bottom_nav: true,
  titleLogin: '',
})

export const mutations = {
  setHeader(state, data) {
    state.header = data
  },
  setUser(state, data) {
    state.user = data.user
    state.userType = data.userType
  },
  setData(state, data) {
    if (data.hostName !== undefined) {
      state.hostName = data.hostName
    }
    if (data.selectedAddress !== undefined) {
      state.selectedAddress = data.selectedAddress
    }
    if (data.customerAddress !== undefined) {
      const indexSelectedAddress = data.customerAddress.findIndex(
        (address) => address.primary
      )
      if (indexSelectedAddress === -1) {
        state.selectedAddress =
          data.customerAddress[data.customerAddress.length - 1]
      } else {
        state.selectedAddress = data.customerAddress[indexSelectedAddress]
      }
      state.customerAddress = data.customerAddress
    }
    if (data.selectedAddress !== undefined) {
      state.selectedAddress = data.selectedAddress
    }
    if (data.idDistrictDestination !== undefined) {
      state.idDistrictDestination = data.idDistrictDestination
    }
    if (data.paymentMethods !== undefined) {
      state.paymentMethods = data.paymentMethods
    }
    if (data.selectedPaymentMethod !== undefined) {
      state.selectedPaymentMethod = data.selectedPaymentMethod
    }
    if (data.summaryData !== undefined) {
      state.summaryData = data.summaryData
    }
    if (data.shippingServicesLoading !== undefined) {
      state.shippingServicesLoading = data.shippingServicesLoading
    }
    if (data.isShippingNeeded !== undefined) {
      state.isShippingNeeded = data.isShippingNeeded
    }
  },
  setPaymentData(state, data) {
    if (data.paymentState !== undefined) {
      state.paymentState = data.paymentState
    }
    if (data.invoiceTotal !== undefined) {
      state.invoiceTotal = data.invoiceTotal
    }
  },
  addAddress(state, address) {
    if (address.primary) {
      state.customerAddress.map((address) => {
        address.primary = false
        return address
      })

      state.selectedAddress = address
    }

    state.customerAddress.push(address)
  },
  editAddress(state, data) {
    const { id, address } = data
    state.customerAddress = state.customerAddress.map((add) => {
      return id === add.id
        ? {
            ...address,
            id,
          }
        : add
    })
  },
  deleteAddress(state, idAddress) {
    state.customerAddress = state.customerAddress.filter(
      (address) => address.id !== idAddress
    )
  },

  change_param_show_bottom_nav(state, data) {
    state.param_show_bottom_nav = data
    if (!data) {
      state.show_back_btn = true
      state.show_logo = false
    } else {
      state.show_back_btn = false
      state.show_logo = true
    }
  },
  change_param_show_bottom_nav1(state, data) {
    state.param_show_bottom_nav = data
    state.show_back_btn = false
    state.show_logo = true
  },
  set_title_login(state, data) {
    state.titleLogin = data
  },
  change_page(state, page) {
    state.page = page
  },
  share_(state, data) {
    state.share = data
  },
  add(state, text) {
    state.list.push({
      text,
      done: false,
    })
  },
  remove(state, { todo }) {
    state.list.splice(state.list.indexOf(todo), 1)
  },
  toggle(state, todo) {
    todo.done = !todo.done
  },
}
