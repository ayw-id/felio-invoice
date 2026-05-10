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

    <v-row v-if="!loading" class="text-brown justify-center align-center">
      <v-col cols="12" sm="10" md="8">
        <v-card style="border-radius: 12px">
          <v-card-actions
            v-if="requiredAction === 'REGISTRATION'"
            class="justify-center"
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
          </v-card-actions>
          <v-card-text>
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
            <InvoiceData
              v-else
              :invoice-details="invoiceData?.details || []"
              :show-snackbar="showSnackbar"
              :request-header="requestHeader"
              :get-shipping-services="getShippingServices"
              :shipping-services-loading="shippingServicesLoading"
              :update-selected-shipping-estimate="
                updateSelectedShippingEstimate
              "
              :update-selected-shipping-service="updateSelectedShippingService"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row
      v-show="!loading && !requiredAction"
      class="text-brown justify-center align-center"
    >
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-text>
            <v-window v-model="step" class="">
              <v-window-item :value="1">
                <v-row class="justify-center align-center">
                  <v-col cols="12" xs="12">
                    <p class="text-center text-lg">
                      {{ $t('invoice.detailOrders') }}
                    </p>
                  </v-col>
                  <v-col
                    v-for="(product, p) in products"
                    :key="'product-' + p"
                    cols="12"
                    xs="12"
                  >
                    <v-row class="justify-center align-center">
                      <v-col cols="6" xs="6">
                        <p class="mb-0">{{ product.nama }}</p>
                        <p v-if="product.berat !== '0'" class="mb-0">
                          {{ product.berat }} gram
                        </p>
                      </v-col>
                      <v-col cols="2" xs="2">
                        <p class="mb-0">X {{ product.qty }}</p>
                      </v-col>
                      <v-col cols="4" xs="4">
                        <p class="mb-0">
                          {{ get_rp(product.qty * product.harga, true) }}
                        </p>
                        <p v-if="product.berat !== '0'" class="mb-0">
                          {{ get_rp(product.berat * product.qty, false) }} gram
                        </p>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col
                    v-for="(op, p) in other_price.filter(
                      (price) => price.tipe !== 'Diskon Ongkir'
                    )"
                    :key="'other_price-' + p"
                    cols="12"
                    xs="12"
                  >
                    <v-row class="justify-center align-center">
                      <v-col cols="8" xs="8">
                        <p
                          class="mb-0"
                          :style="
                            'color: ' +
                            (op.is_discount
                              ? $vuetify.theme.themes.light.primary
                              : 'black')
                          "
                        >
                          {{ op.nama }}
                        </p>
                      </v-col>
                      <v-col cols="4" xs="4">
                        <p
                          class="mb-0"
                          :style="
                            'color: ' +
                            (op.is_discount
                              ? $vuetify.theme.themes.light.primary
                              : 'black')
                          "
                        >
                          {{ op.is_discount ? '-' : ''
                          }}{{ get_rp(op.nominal, true) }}
                        </p>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="12" xs="12">
                    <v-row justify="center" align="center">
                      <v-col cols="8" xs="8">
                        <p class="mb-0"><b>Grand Total</b></p>
                      </v-col>
                      <v-col cols="4" xs="4">
                        <p class="mb-0">
                          <b>{{ get_rp(grand_total, true) }}</b>
                        </p>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-window-item>
              <v-window-item :value="2">
                <v-row justify="center" align="center" class="">
                  <v-col cols="12" xs="12" class="text-center">
                    <p class="text-lg">Alamat Pengiriman</p>
                    <v-btn
                      v-if="customer !== null"
                      text
                      style="text-transform: none"
                      :color="show_address ? 'grey' : 'blue'"
                      @click="do_show_address()"
                      >{{
                        show_address ? 'sembunyikan' : 'lihat detail'
                      }}</v-btn
                    >
                  </v-col>
                  <v-col cols="12" xs="12">
                    <v-row justify="center" align="center">
                      <v-col
                        v-if="customer !== null && show_address"
                        cols="12"
                        xs="12"
                      >
                        <p class="mb-0">Penerima</p>
                        <p class="text-brown text-lg">
                          <b>{{
                            customer.penerima !== '' ? customer.penerima : '-'
                          }}</b>
                        </p>
                        <p class="mb-0">Email</p>
                        <p class="text-brown text-lg">
                          <b>{{
                            customer.email !== '' ? customer.email : '-'
                          }}</b>
                        </p>
                        <p class="mb-0">Phone</p>
                        <p class="text-brown text-lg">
                          <b>{{
                            customer.phone !== ''
                              ? '+62 ' + customer.phone
                              : '-'
                          }}</b>
                        </p>
                        <p class="mb-0">Alamat</p>
                        <p class="mb-0 text-brown text-lg">
                          <b>{{
                            customer.address !== '' ? customer.address : '-'
                          }}</b>
                        </p>
                        <p class="text-brown">
                          {{
                            customer.kec !== null
                              ? customer.kec +
                                ', ' +
                                customer.city +
                                ', ' +
                                customer.prov
                              : ''
                          }}
                        </p>
                        <v-btn color="info" @click="show_customer_from_()"
                          >ubah alamat pengirman</v-btn
                        >
                      </v-col>
                      <v-col v-if="customer === null" cols="12" xs="12">
                        <v-btn color="info" @click="show_customer_from_()"
                          >alamat pengiriman</v-btn
                        >
                      </v-col>
                      <v-col
                        v-if="shipping_services.length > 0"
                        cols="12"
                        xs="12"
                      >
                        <hr />
                        <p class="text-brown text-lg text-center mt-8">
                          Pilih Layanan Pengiriman
                        </p>
                        <v-row justify="center" align="center" class="mt-4">
                          <v-col
                            v-for="(ship, a) in shipping_services"
                            :key="ship.est"
                            cols="12"
                            xs="12"
                          >
                            <v-card
                              text
                              flat
                              @click="
                                shipping_services[a].expand =
                                  !shipping_services[a].expand
                              "
                            >
                              <v-row justify="center" align="center">
                                <v-col cols="10" xs="10">
                                  <p class="text-brown text-lg pl-2">
                                    {{ ship.est }}
                                  </p>
                                </v-col>
                                <v-col cols="2" xs="2" class="mt-n4">
                                  <v-icon v-if="ship.expand"
                                    >mdi-chevron-up</v-icon
                                  >
                                  <v-icon v-else>mdi-chevron-down</v-icon>
                                </v-col>
                              </v-row>
                            </v-card>
                            <v-row
                              v-if="ship.expand"
                              justify="center"
                              align="center"
                            >
                              <v-list-item
                                v-for="(services, i) in ship.services || []"
                                :key="services.name"
                                @click="select_shipping_service(a, i)"
                              >
                                <v-list-item-icon class="pl-3"
                                  ><v-icon
                                    :color="services.selected ? 'teal' : ''"
                                    >mdi-check-circle</v-icon
                                  ></v-list-item-icon
                                >
                                <v-list-item-content>
                                  <v-list-item-subtitle
                                    >{{ services.name }} ({{
                                      services.service
                                    }})</v-list-item-subtitle
                                  >
                                  <v-list-item-subtitle
                                    >{{ get_rp(services.value, true) }} ({{
                                      services.etd
                                    }}
                                    hari)</v-list-item-subtitle
                                  >
                                </v-list-item-content>
                              </v-list-item>
                            </v-row>
                          </v-col>
                        </v-row>
                      </v-col>

                      <v-col
                        v-if="shipping_services_by_product.length > 0"
                        cols="12"
                        xs="12"
                      >
                        <hr />
                        <p class="text-brown text-lg text-center mt-8">
                          Layanan Pengiriman
                        </p>
                        <v-row justify="center" align="center" class="mt-4">
                          <v-col
                            v-for="(ship, a) in shipping_services_by_product"
                            :key="ship.est"
                            cols="12"
                            xs="12"
                          >
                            <p
                              v-for="(product, b) in ship.products"
                              :key="`prod${b}`"
                              class="mb-0"
                            >
                              {{ product.name }}
                            </p>
                            <p>{{ get_rp(ship.total_berat, false) }} gram</p>

                            <div
                              v-if="
                                ship.selected_shipping_by_product !==
                                  undefined &&
                                ship.selected_shipping_by_product !== null
                              "
                              style="background-color: #eaeaea"
                            >
                              <p class="mb-0">
                                {{ ship.selected_shipping_by_product.name }} ({{
                                  ship.selected_shipping_by_product.service
                                }})
                              </p>
                              <p>
                                {{
                                  get_rp(
                                    ship.selected_shipping_by_product.value
                                  )
                                }}
                                -
                                {{ ship.selected_shipping_by_product.etd }} hari
                              </p>
                            </div>

                            <v-btn
                              block
                              outlined
                              color="primary"
                              style="border-radius: 12px; text-transform: none"
                              @click="choose_shipping_by_product(a)"
                              ><v-icon>mdi-truck-fast</v-icon> Pilih Layanan
                              Pengiriman</v-btn
                            >
                            <v-divider class="mt-2"></v-divider>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-dialog
                  v-model="show_shipping_service"
                  fullscreen
                  hide-overlay
                  transition="dialog-bottom-transition"
                >
                  <template #activator="{}">
                    <!-- <v-btn color="primary" dark v-on="on">Open Dialog</v-btn> -->
                  </template>
                  <v-card>
                    <v-card-title>
                      <v-layout justify-space-between align-center>
                        <span class="subheading" style=""
                          >Pilih pengiriman</span
                        >
                        <v-btn
                          depressed
                          color="primary"
                          style="margin: -12px"
                          text
                          fab
                          @click="show_shipping_service = false"
                          ><v-icon>mdi-close</v-icon></v-btn
                        >
                      </v-layout>
                    </v-card-title>
                    <v-card-text>
                      <v-row
                        v-if="index_choose_shipping !== -1"
                        align="center"
                        justify="center"
                        class="mt-2"
                      >
                        <v-col
                          v-for="(ship_, a) in shipping_services_by_product[
                            index_choose_shipping
                          ].shipping_service"
                          :key="`ship${a}`"
                          cols="12"
                        >
                          <v-card
                            text
                            flat
                            @click="
                              shipping_services_by_product[
                                index_choose_shipping
                              ].shipping_service[a].expand =
                                !shipping_services_by_product[
                                  index_choose_shipping
                                ].shipping_service[a].expand
                            "
                          >
                            <v-row class="justify-center align-center">
                              <v-col cols="10" xs="10">
                                <p class="text-brown text-lg pl-2">
                                  {{ ship_.est }}
                                </p>
                              </v-col>
                              <v-col cols="2" xs="2" class="mt-n4">
                                <v-icon v-if="ship_.expand"
                                  >mdi-chevron-up</v-icon
                                >
                                <v-icon v-else>mdi-chevron-down</v-icon>
                              </v-col>
                            </v-row>
                          </v-card>
                          <v-row
                            v-if="ship_.expand"
                            class="mt-2 justify-center align-center"
                          >
                            <v-list-item
                              v-for="(services, i) in ship_.services"
                              :key="`service_${i}`"
                              @click="select_shipping_service_by_product(a, i)"
                            >
                              <v-list-item-icon class="pl-3"
                                ><v-icon
                                  :color="services.selected ? 'teal' : ''"
                                  >{{
                                    services.selected
                                      ? 'mdi-check-circle'
                                      : 'mdi-check'
                                  }}</v-icon
                                ></v-list-item-icon
                              >
                              <v-list-item-content>
                                <v-list-item-subtitle
                                  >{{ services.name }} ({{
                                    services.service
                                  }})</v-list-item-subtitle
                                >
                                <v-list-item-subtitle
                                  >{{ get_rp(services.value, true) }} ({{
                                    services.etd
                                  }}
                                  hari)</v-list-item-subtitle
                                >
                              </v-list-item-content>
                            </v-list-item>
                          </v-row>
                        </v-col>
                        <v-col cols="12">
                          <v-btn
                            color="teal"
                            block
                            dark
                            @click="save_shipping()"
                            >ok</v-btn
                          >
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-dialog>
              </v-window-item>
              <v-window-item :value="3">
                <v-row justify="center" align="center" class="">
                  <v-col cols="12" xs="12">
                    <p class="text-center text-lg">Pilih Metode Pembayaran</p>
                  </v-col>
                  <v-col cols="12" xs="12">
                    <v-row justify="center" align="center" class="mt-4">
                      <v-col
                        v-for="(pay, a) in payment_method"
                        :key="'payment' + a"
                        cols="12"
                        xs="12"
                      >
                        <v-card
                          text
                          flat
                          @click="
                            payment_method[a].is_selected =
                              !payment_method[a].is_selected
                          "
                        >
                          <v-row class="justify-center align-center">
                            <v-col cols="10" xs="10">
                              <p class="text-brown text-lg pl-2">
                                {{ pay.nama }}
                              </p>
                            </v-col>
                            <v-col cols="2" xs="2" class="mt-n4">
                              <v-icon v-if="pay.is_selected"
                                >mdi-chevron-up</v-icon
                              >
                              <v-icon v-else>mdi-chevron-down</v-icon>
                            </v-col>
                          </v-row>
                        </v-card>
                        <v-row
                          v-if="pay.is_selected"
                          class="justify-center align-center"
                        >
                          <v-list-item
                            v-for="(pay_, i) in pay.payment_method"
                            :key="'payment_' + i"
                            @click="select_payment_method(a, i)"
                          >
                            <v-list-item-icon class="pl-3"
                              ><v-icon :color="pay_.is_selected ? 'teal' : ''"
                                >mdi-check-circle</v-icon
                              ></v-list-item-icon
                            >
                            <v-list-item-content>
                              <v-list-item-subtitle>{{
                                pay_.code
                              }}</v-list-item-subtitle>
                            </v-list-item-content>
                          </v-list-item>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-window-item>
              <v-window-item v-if="invoice !== null" :value="4">
                <v-row justify="center" align="center" class="">
                  <v-col cols="12" xs="12" class="white text-center">
                    <p class="text-center mb-2 mt-4">
                      Nomor Tagihan:
                      <b class="text-lg">{{ $route.query.inv }}</b>
                    </p>
                    <p class="text-center mb-2">
                      Bayar sebelum
                      <b class="text-lg" style="color: red">{{
                        invoice.due_date
                      }}</b>
                    </p>
                    <v-divider class="mb-8"></v-divider>
                    <p class="text-center mb-8">
                      <b class="text-xxlg">{{
                        get_rp(invoice.grand_total, true)
                      }}</b>
                    </p>
                    <v-btn
                      v-if="invoice.data_payment.status === 'PENDING'"
                      rounded
                      class="mt-n4 mb-4"
                      color="primary"
                      @click="show_change_payment = true"
                      >Ubah Pembayaran</v-btn
                    >

                    <v-btn
                      v-if="
                        invoice.data_payment.status === 'PENDING' &&
                        invoice.data_payment.method_nama !== 'OVO' &&
                        invoice.data_payment.type_nama === 'E-Wallet'
                      "
                      rounded
                      class="mt-0 mb-4"
                      color="blue"
                      dark
                      @click="continue_payment_process()"
                      >Lanjutkan Pembayaran</v-btn
                    >
                  </v-col>
                  <v-col
                    v-if="invoice.data_payment.status === 'PAID'"
                    cols="12"
                    xs="12"
                    class="justify-center text-center"
                  >
                    <img src="~/assets/img/check.jpg" />
                  </v-col>
                  <v-col cols="12" xs="12">
                    <p class="text-center text-lg">Detail Pembayaran</p>
                  </v-col>
                  <v-col
                    v-if="invoice.data_payment.status === 'PENDING'"
                    cols="12"
                    xs="12"
                  >
                    <p
                      v-if="invoice.data_payment.method_nama === 'OVO'"
                      class="text-center"
                      style="color: red"
                    >
                      Silahkan periksa aplikasi OVO Anda untuk melanjutkan
                      pembayaran
                    </p>
                    <p
                      v-else-if="invoice.data_payment.type_nama !== 'E-Wallet'"
                      class="text-center"
                      style="color: red"
                    >
                      Silahkan lakukan pembayaran ke nomor rekening berikut
                    </p>
                  </v-col>
                  <v-col cols="12" xs="12" class="mt-n4">
                    <v-row justify="center" align="center">
                      <v-col cols="12" xs="12">
                        <p class="mb-0 text-sm">Metode Pembayaran</p>
                      </v-col>
                      <v-col cols="12" xs="12" class="mt-n6 ml-6">
                        <p class="mb-0">
                          {{
                            invoice.data_payment.type_nama === 'E-Wallet' ||
                            invoice.data_payment.type_nama === 'Retail Outlet'
                              ? invoice.data_payment.method_nama
                              : invoice.data_payment.type_nama +
                                ' | ' +
                                invoice.data_payment.method_nama
                          }}
                        </p>
                      </v-col>
                      <v-col cols="12" xs="12">
                        <p class="mb-0 mt-n4 text-sm">
                          {{
                            invoice.data_payment.type_nama === 'E-Wallet'
                              ? 'Nomor Handphone'
                              : invoice.data_payment.type_nama ===
                                'Retail Outlet'
                              ? 'Kode Pembayaran'
                              : 'Nomor VA'
                          }}
                        </p>
                      </v-col>
                      <v-col cols="12" xs="12" class="mt-n6 ml-6">
                        <p class="mb-0" style="color: orange; font-size: 18px">
                          <b>{{
                            invoice.data_payment.type_nama === 'E-Wallet'
                              ? invoice.data_payment.phone
                              : invoice.data_payment.account_number
                          }}</b>
                        </p>
                      </v-col>
                      <v-col cols="12" xs="12">
                        <p class="mb-0 mt-n4 text-sm">Status Pembayaran</p>
                      </v-col>
                      <v-col cols="12" xs="12" class="mt-n6 ml-6">
                        <v-chip
                          class="mb-0"
                          :color="check_color(invoice.data_payment.status)"
                          style="color: white"
                          >{{ invoice.data_payment.status }}</v-chip
                        >
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col cols="12" xs="12" class=""><hr /></v-col>
                  <v-col cols="12" xs="12" class="mt-0">
                    <p class="text-center text-lg">Detail Pesanan</p>
                  </v-col>
                  <v-col
                    v-for="(dp, i) in invoice.detail_pesanan"
                    :key="'dp' + i"
                    cols="12"
                    xs="12"
                  >
                    <v-row justify="center" align="center">
                      <v-col
                        v-if="dp.is_product === 1"
                        cols="6"
                        xs="6"
                        class="mt-n4"
                      >
                        <p class="mb-0">{{ dp.nama }}</p>
                      </v-col>
                      <v-col v-else cols="8" xs="8" class="mt-n4">
                        <p
                          class="mb-0"
                          :style="
                            dp.is_discount === '1'
                              ? 'color: ' + $vuetify.theme.themes.light.primary
                              : ''
                          "
                        >
                          {{ dp.nama }}
                        </p>
                      </v-col>
                      <v-col
                        v-if="dp.is_product === 1"
                        cols="2"
                        xs="2"
                        class="mt-n4"
                      >
                        <p class="mb-0">X {{ dp.qty }}</p>
                      </v-col>
                      <v-col cols="4" xs="4" class="mt-n4">
                        <p
                          class="mb-0"
                          :style="
                            dp.is_discount === '1'
                              ? 'color: ' + $vuetify.theme.themes.light.primary
                              : ''
                          "
                        >
                          {{
                            (dp.is_discount === '1' ? '-' : '') +
                            get_rp(dp.harga, true)
                          }}
                        </p>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="12" xs="12">
                    <v-row justify="center" align="center">
                      <v-col cols="6" xs="6" class="mt-n4">
                        <p class="mb-0 text-lg"><b>Grand Total</b></p>
                      </v-col>
                      <v-col cols="6" xs="6" class="mt-n4">
                        <p class="mb-0 text-lg">
                          <b>{{ get_rp(invoice.grand_total, true) }}</b>
                        </p>
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col
                    v-if="invoice.shipping !== null"
                    cols="12"
                    xs="12"
                    class=""
                    ><hr
                  /></v-col>
                  <v-col
                    v-if="invoice.shipping !== null"
                    cols="12"
                    xs="12"
                    class="mt-0"
                  >
                    <p class="text-center text-lg">Detail Pengiriman</p>
                  </v-col>
                  <v-col v-if="invoice.shipping !== null" cols="12" xs="12">
                    <v-row justify="center" align="center">
                      <!-- <v-col cols="6" xs="6">
                        <p class="mb-0 mt-n4">Dikirim Dari</p>
                      </v-col> -->
                      <!-- <v-col cols="6" xs="6">
                        <p class="mb-0 mt-n4">{{invoice.shipping.sender}}</p>
                      </v-col> -->
                      <v-col cols="6" xs="6">
                        <p class="mb-0 mt-n4">Penerima</p>
                      </v-col>
                      <v-col cols="6" xs="6">
                        <p class="mb-0 mt-n4">
                          {{ invoice.shipping.penerima }}
                        </p>
                      </v-col>
                      <v-col cols="6" xs="6">
                        <p class="mb-0 mt-n4">Nomor Handphone</p>
                      </v-col>
                      <v-col cols="6" xs="6">
                        <p class="mb-0 mt-n4">{{ invoice.shipping.phone }}</p>
                      </v-col>
                      <v-col cols="6" xs="6">
                        <p class="mb-0 mt-n4">Layanan Pengiriman</p>
                      </v-col>
                      <v-col cols="6" xs="6">
                        <p class="mb-0 mt-n4">
                          {{ invoice.shipping.selected_shipping }}
                        </p>
                      </v-col>
                      <v-col cols="6" xs="6">
                        <p class="mb-0 mt-n4">Alamat Pengiriman</p>
                      </v-col>
                      <v-col cols="6" xs="6">
                        <p class="mb-0 mt-n4">{{ invoice.shipping.address }}</p>
                        <p class="mb-0">{{ invoice.shipping.address_ }}</p>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-window-item>
            </v-window>

            <hr v-if="step !== 4" class="my-3" />
          </v-card-text>
          <v-card-actions>
            <v-btn v-if="step > 1 && step !== 4" outlined nuxt @click="back()">
              Kembali
            </v-btn>
            <v-spacer />
            <v-btn
              v-if="use_shipping && step === 1"
              color="primary"
              nuxt
              :loading="loading_ongkir"
              :disabled="invoice_error"
              @click="choose_shipping()"
            >
              Pilih Pengiriman
            </v-btn>
            <v-btn
              v-if="
                (use_shipping && step === 2) || (!use_shipping && step === 1)
              "
              color="primary"
              nuxt
              :loading="loading_payment"
              :disabled="invoice_error"
              @click="choose_payment()"
            >
              Pilih Pembayaran
            </v-btn>
            <v-btn
              v-if="step === 3"
              color="primary"
              nuxt
              :disabled="invoice_error"
              @click="create_invoice(true)"
            >
              Lanjutkan
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-dialog
        v-model="show_customer_from"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <template #activator="{}">
          <!-- <v-btn color="primary" dark v-on="on">Open Dialog</v-btn> -->
        </template>
        <v-card>
          <v-card-title>
            <v-layout justify-space-between align-center>
              <span class="subheading" style="">{{
                !show_address_search_customer
                  ? 'Data Profile'
                  : 'Alamat Pengiriman'
              }}</span>
              <v-btn
                depressed
                color="primary"
                style="margin: -12px"
                text
                fab
                @click="hide_customer_form()"
                ><v-icon>mdi-close</v-icon></v-btn
              >
            </v-layout>
          </v-card-title>
          <v-card-text>
            <v-row
              v-if="!show_address_search_customer"
              align="center"
              justify="center"
              class=""
            >
              <v-col cols="12" xs="12" md="6" class="text-center mb-n8">
                <v-text-field
                  v-model="nama_customer"
                  label="Nama"
                  :rules="requiredRules"
                ></v-text-field>
                <v-text-field
                  v-if="check_email_customer"
                  v-model="email_customer"
                  label="Email"
                  :rules="emailRules"
                ></v-text-field>
                <v-text-field
                  v-model="phone_customer"
                  label="Nomor Ponsel*"
                  type="number"
                  :rules="requiredRules"
                >
                  <template #prepend>
                    <p class="text-brown text-xlg mt-2">+62</p>
                  </template>
                </v-text-field>
                <v-btn
                  outlined
                  color="primary"
                  class="mb-4"
                  style="text-transform: none"
                  @click="show_address_search_customer = true"
                  >Alamat Pengiriman</v-btn
                >
                <p
                  v-if="selected_address_customer !== null"
                  class="text-brown mt-2"
                >
                  {{
                    selected_address_customer.kec +
                    ', ' +
                    selected_address_customer.city +
                    ',' +
                    selected_address_customer.prov
                  }}
                </p>
                <v-textarea
                  v-if="selected_address_customer !== null"
                  v-model="complete_address_customer"
                  outlined
                  name="input-7-4"
                  label="Alamat Lengkap"
                  class=""
                ></v-textarea>
                <v-btn
                  color="primary"
                  class=""
                  block
                  @click="save_data_customer()"
                  >simpan</v-btn
                >
              </v-col>
            </v-row>

            <v-row v-else align="center" justify="center" class="">
              <v-col cols="12" xs="12" md="6" lg="5" class="text-center mb-n8">
                <v-text-field
                  v-model="search_district_customer"
                  class="mt-7"
                  solo
                  prepend-inner-icon="mdi-map-marker"
                  placeholder="Provinsi / Kota / Kecamatan"
                ></v-text-field>
                <v-list-item
                  v-for="(address, a) in list_address_customer"
                  :key="'address_cust' + a"
                  @click="select_address_customer(address)"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ address.prov }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      address.city + ', ' + address.kec
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog v-model="show_phone" persistent max-width="480">
        <v-card>
          <v-card-title class="title">Mohon Cek Ulang Data Anda</v-card-title>
          <v-card-text>
            <v-row align="center" justify="center" class="">
              <v-col cols="12" xs="12" md="6" class="text-center">
                <p class="text-brown text-left">
                  Untuk mengamankan transaksi Anda, tolong lengkapi form berikut
                  ini
                </p>
                <p v-if="customer !== null" class="text-brown text-lg">
                  {{ customer.email }}
                </p>
                <v-text-field
                  v-else
                  v-model="email_payment"
                  label="Email"
                  :rules="emailRules"
                ></v-text-field>
                <v-text-field
                  v-model="phone_payment"
                  label="Nomor Ponsel*"
                  type="number"
                  :rules="requiredRules"
                >
                  <template #prepend>
                    <p class="text-brown text-xlg mt-2">+62</p>
                  </template>
                </v-text-field>
                <v-text-field
                  v-model="customer_name_payment"
                  label="Nama Pembayar"
                  :rules="requiredRules"
                ></v-text-field>
                <v-text-field
                  v-if="need_password"
                  v-model="password"
                  label="Password*"
                  :type="password_type"
                  :rules="requiredRules"
                  :append-icon="
                    password_type === 'password' ? 'mdi-eye' : 'mdi-eye-off'
                  "
                  @click:append="
                    password_type =
                      password_type === 'password' ? 'text' : 'password'
                  "
                ></v-text-field>
                <v-text-field
                  v-if="need_password"
                  v-model="password_"
                  label="Ulangi Password*"
                  :type="password_type_"
                  :rules="requiredRules"
                  :append-icon="
                    password_type_ === 'password' ? 'mdi-eye' : 'mdi-eye-off'
                  "
                  @click:append="
                    password_type_ =
                      password_type_ === 'password' ? 'text' : 'password'
                  "
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click.native="show_phone = false"
              >kembali</v-btn
            >
            <v-btn color="green lighten-4" @click.native="create_invoice(false)"
              >lanjutkan</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="show_change_payment" max-width="480">
        <v-card>
          <v-card-title class="title"
            >Ingin Mengubah Metode Pembayaran ?</v-card-title
          >

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click.native="show_change_payment = false"
              >kembali</v-btn
            >
            <v-btn color="green lighten-4" @click.native="change_payment()"
              >lanjutkan</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
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
import * as axios from 'axios'
import moment from 'moment'
import { storageNames } from '~/utils/constants'
import { requestData } from '~/utils/serverAccess'
import { getShippingPriceRange } from '~/utils/utilFunctions'
import LoginForm from '~/components/Forms/loginForm.vue'
import RegisterForm from '~/components/Forms/registerForm.vue'
import InvoiceData from '~/components/TransactionSteps/Step1/invoiceData.vue'
export default {
  components: {
    LoginForm,
    RegisterForm,
    InvoiceData,
  },
  data() {
    return {
      invoiceCode: '',
      requiredAction: '',
      showLoginForm: false,
      invoiceData: null,
      shippingServicesLoading: '',

      snackbarText: '',
      timeout: 3000,
      snackbar: false,
      snackbarColor: 'primary',
      loading: true,
      typingTimeout: 0,
      requiredRules: [(v) => !!v || 'This Field is required'],
      emailRules: [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+/.test(v) || 'E-mail must be valid',
      ],
      invoice_error: true,
      step: 1,
      products: [],
      other_price: [],
      use_shipping: false,
      shipping: null,
      customer: null,
      voucher: [],
      selected_voucher: null,
      grand_total: 0,
      show_customer_from: false,
      show_address_search_customer: false,
      show_address: false,
      selected_address_customer: null,
      nama_customer: '',
      email_customer: '',
      phone_customer: '',
      complete_address_customer: '',
      search_district_customer: '',
      list_address_customer: [],
      loading_shipping: false,
      loading_ongkir: false,
      loading_payment: false,
      shipping_services: [],
      shipping_services_by_product: [],
      index_choose_shipping: -1,
      show_shipping_service: false,
      payment_method: [],
      email_payment: '',
      phone_payment: '',
      customer_name_payment: '',
      need_password: true,
      password: '',
      password_: '',
      password_type: 'password',
      password_type_: 'password',
      show_phone: false,
      invoice: null,
      show_change_payment: false,
      need_login: false,
      email_login: '',
      password_login: '',
      payment_redirect_url: '',
    }
  },
  computed: {
    requestHeader() {
      const headerUserType =
        this.initStore.user?.type === 'guest' ? 'GUEST' : 'CUSTOMER'

      return `Bearer ${headerUserType}_${this.initStore.user?.token || ''}`
    },
    initStore() {
      return this.$store.state.init
    },

    login_disabled() {
      if (
        this.email_login === '' ||
        !/.+@.+/.test(this.email_login) ||
        this.password_login === ''
      ) {
        return true
      }
      return false
    },
    get_payment_method() {
      let paymentMethod = localStorage.getItem('data_paymentMethod')
      if (
        paymentMethod === undefined ||
        paymentMethod === 'undefined' ||
        paymentMethod === 'null' ||
        paymentMethod === null ||
        paymentMethod === ''
      ) {
        return null
      } else {
        paymentMethod = JSON.parse(paymentMethod)
        if (paymentMethod.last_update) {
          const start = moment(paymentMethod.last_update, 'YYYY-MM-DD HH')
          const end = moment()
          const duration = moment.duration(end.diff(start))
          const hours = duration.asHours()
          if (parseInt(hours) > 3) {
            return null
          } else {
            return paymentMethod.payment_method
          }
        } else {
          return null
        }
      }
    },
    get_selected_shipping_service_by_product() {
      const selectedShippingServices = []
      this.shipping_services_by_product.forEach((item, key) => {
        if (
          item.selected_shipping_by_product !== undefined &&
          item.selected_shipping_by_product !== null
        ) {
          const idProducts = []
          item.products.forEach((item1, key1) => {
            idProducts.push(item1.id_product)
          })
          selectedShippingServices.push({
            id_products: idProducts,
            selected_shipping_service: item.selected_shipping_by_product,
          })
        }
      })
      if (
        this.shipping_services_by_product.length ===
        selectedShippingServices.length
      ) {
        return selectedShippingServices
      } else {
        return null
      }
    },
    get_selectedShippingService() {
      let selectedShippingService = null
      this.shipping_services.forEach((shippingService) => {
        shippingService.services?.forEach((service) => {
          if (service.selected) {
            selectedShippingService = {
              est: shippingService.est,
              name: service.name,
              service: service.service,
              etd: service.etd,
              value: service.value,
            }
          }
        })
      })

      return selectedShippingService
    },
    check_email_customer() {
      if (this.customer === null) {
        return true
      } else if (this.customer.id === '0' || this.customer.id === 0) {
        return true
      } else {
        return false
      }
    },
  },
  watch: {
    step: function (val) {
      if (val === 3) {
        const lastUpdate = moment().format('YYYY-MM-DD HH')
        const paymentMethod = this.get_payment_method
        if (paymentMethod === null) {
          this.loading = true
          this.do_request('transaction/get_payment_method', {})
            .then((res) => {
              this.loading = false
              if (res.data.success === 1) {
                const pm = res.data.data
                if (pm.length > 0) {
                  localStorage.setItem(
                    'data_payment_method',
                    JSON.stringify({
                      last_update: lastUpdate,
                      payment_method: pm,
                    })
                  )
                }
                if (parseInt(this.grand_total) < 20000) {
                  this.paymentMethod = []
                  for (let a = 0; a < pm.length; a++) {
                    if (pm[a].nama === 'E-Wallet') {
                      this.paymentMethod.push(pm[a])
                    }
                  }
                } else {
                  this.paymentMethod = pm
                }
              } else {
                this.showSnackbar({ text: res.data.msg })
              }
            })
            .catch((err) => {
              console.warn('err', err)
              this.loading = false
              this.showSnackbar({
                text: 'Server sedang bermasalah',
                color: 'error',
              })
            })
        } else {
          const pm = paymentMethod
          if (parseInt(this.grand_total) < 30000) {
            this.paymentMethod = []
            for (let a = 0; a < pm.length; a++) {
              if (pm[a].nama === 'E-Wallet') {
                this.paymentMethod.push(pm[a])
              }
            }
          } else {
            this.paymentMethod = pm
          }
          // this.paymentMethod = paymentMethod
        }
      }
    },
    search_district_customer: function (val) {
      if (val !== '' && val !== null) {
        const self = this
        if (this.typingTimeout) {
          clearTimeout(this.typingTimeout)
        }
        this.typingTimeout = setTimeout(function () {
          self.search_district_customer_()
        }, 1000)
      }
    },
  },
  mounted() {
    this.getToken()
    this.invoiceCode = this.$route.query.inv

    if (!this.invoiceCode) {
      this.loading = false
      this.showSnackbar({ text: this.$t('errors.invoiceCodeNotFound') })
    } else {
      this.getInvoiceData()
    }
  },
  methods: {
    updateSelectedShippingService(params) {
      console.warn('ppp', params)
      const { idDistrict, shippingService } = params
      const invoiceData = JSON.parse(JSON.stringify(this.invoiceData))
      const indexDetail = invoiceData.details.findIndex(
        (detail) => detail.idDistrict === idDistrict
      )
      if (indexDetail >= 0) {
        invoiceData.details[
          indexDetail
        ].selectedShippingService.selectedService = shippingService

        this.invoiceData = invoiceData
      }
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

        this.invoiceData = invoiceData
      }
    },
    fetchShippingServices(index, idDistrictsFromInvoice) {
      this.shippingServicesLoading = idDistrictsFromInvoice[index]
      requestData({
        type: 'customer',
        url: 'shipping/getShippingServices',
        body: {
          invoiceCode: this.invoiceCode,
          destination: this.initStore.selectedAddress.idDistrict,
          idDistrictFromInvoice: idDistrictsFromInvoice[index],
        },
        headers: {
          Authorization: this.requestHeader.replace(
            'Bearer',
            this.initStore.hostName
          ),
        },
      })
        .then((response) => {
          this.shippingServicesLoading = ''
          if (response.data.success === 1) {
            const data = response.data.data

            if (data.shippingServices) {
              const invoiceData = JSON.parse(JSON.stringify(this.invoiceData))
              const indexDetail = this.invoiceData.details.findIndex(
                (detail) => detail.idDistrict === idDistrictsFromInvoice[index]
              )
              if (indexDetail >= 0) {
                invoiceData.details[indexDetail].shippingServices =
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

              if (index === 0) {
                this.$store.commit('init/setData', {
                  idDistrictDestination:
                    this.initStore.selectedAddress.idDistrict,
                })
              }

              if (index + 1 <= idDistrictsFromInvoice.length - 1) {
                this.fetchShippingServices(index + 1, idDistrictsFromInvoice)
              }
            }
          } else {
            console.warn(response.data.msg)
            this.showSnackbar({ text: response.data.msg })
          }
        })
        .catch((error) => {
          this.shippingServicesLoading = ''
          this.showSnackbar({ type: 'serverIssue' })
          console.warn(error)
        })
    },
    getShippingServices() {
      if (
        this.initStore.selectedAddress &&
        this.initStore.selectedAddress?.idDistrict !==
          this.initStore.idDistrictDestination
      ) {
        const idDistrictsFromInvoice = this.invoiceData.details.map(
          (detail) => detail.idDistrict
        )

        if (idDistrictsFromInvoice.length) {
          this.fetchShippingServices(0, idDistrictsFromInvoice)
        }
      }
    },
    setToken(userStore) {
      localStorage.setItem(storageNames.userStore, JSON.stringify(userStore))
      this.$store.commit('init/setUser', userStore)
      this.requiredAction = ''
      this.getInvoiceData()
    },
    getInvoiceData() {
      requestData({
        type: 'customer',
        url: 'invoice',
        body: {
          invoiceCode: this.invoiceCode,
        },
        headers: {
          Authorization: this.requestHeader,
        },
      })
        .then((response) => {
          this.loading = false
          if (response.data.success === 1) {
            const data = response.data.data

            this.requiredAction = data.requiredAction || ''

            if (!data.requiredAction) {
              this.invoiceData = data.invoice
              this.$store.commit('init/setData', {
                hostName: data.hostName,
                customerAddress: data.customerAddress,
              })

              setTimeout(() => {
                this.getShippingServices()
              }, 1000)
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
      let userStore = localStorage.getItem(storageNames.userStore)
      if (userStore) {
        userStore = JSON.parse(userStore)
        this.$store.commit('init/setUser', userStore)
      }
    },

    continue_payment_process() {
      if (this.payment_redirect_url !== '') {
        window.open(this.payment_redirect_url, '_blank')
      } else {
        this.showSnackbar({
          text: 'Saat ini pembayaran tidak dapat dilanjutkan',
        })
      }
    },
    save_shipping() {
      let selectedShippingByProduct = null
      this.shipping_services_by_product[
        this.index_choose_shipping
      ].shipping_service.forEach((item, key) => {
        item.services.forEach((item1, key1) => {
          if (item1.selected) {
            item1.est = item.est
            selectedShippingByProduct = item1
          }
        })
      })
      if (selectedShippingByProduct !== null) {
        this.shipping_services_by_product[
          this.index_choose_shipping
        ].selected_shipping_by_product = selectedShippingByProduct
        this.show_shipping_service = false
      } else {
        this.showSnackbar({ text: 'Silahkan pilih pengiriman', color: 'red' })
      }
    },
    choose_shipping_by_product(indexChooseShipping) {
      const shippingServoce = []
      this.shipping_services_by_product[
        indexChooseShipping
      ].shipping_service.forEach((item, key) => {
        item.expand = false
        shippingServoce.push(item)
      })
      this.shipping_services_by_product[indexChooseShipping].shipping_service =
        shippingServoce
      this.index_choose_shipping = indexChooseShipping
      this.show_shipping_service = true
    },
    do_show_address() {
      this.show_address = !this.show_address
    },
    login() {
      this.loading = true
      this.do_request('transaction/check_auth_invoice', {
        inv: this.$route.query.inv,
        email: this.email_login,
        password: this.encryption(true, this.password_login),
      })
        .then((res) => {
          this.loading = false
          if (res.data.success === 1) {
            const token = res.data.data
            const dataAuthCustomer = {
              token,
              email: this.email_login,
              role: 'BUYER',
            }
            localStorage.setItem(
              'dataAuthCustomer',
              JSON.stringify(dataAuthCustomer)
            )
            this.need_login = false
            window.location.reload()
          } else {
            this.showSnackbar({ text: res.data.msg })
          }
        })
        .catch((err) => {
          console.warn('err', err)
          this.loading = false
          this.showSnackbar({
            text: 'Server sedang bermasalah',
            color: 'error',
          })
        })
    },
    change_payment() {
      this.show_change_payment = false
      this.loading = true
      const dataAuthCustomer = JSON.parse(
        localStorage.getItem('dataAuthCustomer')
      )
      this.do_request('payment/change_payment', {
        token: dataAuthCustomer.token,
        inv: this.$route.query.inv,
      })
        .then((res) => {
          this.loading = false
          if (res.data.success === 1) {
            window.location.reload()
          } else {
            this.showSnackbar({ text: res.data.msg })
          }
        })
        .catch((err) => {
          console.warn('err', err)
          this.loading = false
          this.showSnackbar({
            text: 'Server sedang bermasalah',
            color: 'error',
          })
        })
    },
    check_color(status) {
      if (status === 'PENDING') {
        return 'orange'
      } else if (status === 'EXPIRED') {
        return 'error'
      } else {
        return 'teal'
      }
    },
    create_invoice(confirm) {
      let paymentMethod = null
      for (let a = 0; a < this.payment_method.length; a++) {
        const a_ = this.payment_method[a]
        for (let b = 0; b < a_.payment_method.length; b++) {
          const b_ = a_.payment_method[b]
          if (b_.is_selected) {
            paymentMethod = {
              channel_category: a_.channel_category,
              id: a_.id,
              type_nama: a_.nama,
              source: a_.source,
              deskripsi: b_.deskripsi,
              id_: b_.id,
              method_nama: b_.nama,
              phone: this.phone_payment,
              customer_name: this.customer_name_payment,
            }
          }
        }
      }
      if (paymentMethod === null) {
        this.showSnackbar({
          text: 'Silahkan pilih metode pembayaran terlebih dahulu',
        })
      } else if (confirm) {
        const dataAuthCustomer = this.get_dataAuthCustomer()
        if (this.customer !== null) {
          this.phone_payment = this.customer.phone
          this.customer_name_payment = this.customer.penerima
          this.email_payment = this.customer.email
        } else if (dataAuthCustomer !== null) {
          this.phone_payment = dataAuthCustomer.phone
          this.customer_name_payment = dataAuthCustomer.nama
          this.email_payment = this.customer.email
        } else {
          this.phone_payment = ''
          this.customer_name_payment = ''
          this.email_payment = ''
        }
        this.password = ''
        this.password_ = ''
        this.show_phone = true
      } else {
        let error = ''
        if (this.customer === null) {
          if (this.email_payment === '') {
            error = 'Email Belum Diisi'
          }
        }
        if (this.phone_payment === '') {
          error = 'Phone Belum Diisi'
        }
        if (this.customer_name_payment === '') {
          error = 'Nama Belum Diisi'
        }
        if (this.need_password) {
          if (this.password === '') {
            error = 'Password masih kosong'
          } else if (this.password.length < 8) {
            error = 'Password minimal 8 karakter'
          } else if (this.password !== this.password_) {
            error = 'Password tidak sama'
          }
        }
        if (error !== '') {
          this.showSnackbar({ text: error })
        } else {
          this.show_phone = false
          let deviceType = 0
          if (this.$ua === undefined) {
            console.log('ua', 'a')
          } else if (this.$ua.deviceType() === 'pc') {
            deviceType = 1
          } else if (this.$ua.deviceType() === 'smartphone') {
            deviceType = 2
          }
          this.loading = true
          this.do_request('payment/save', {
            inv: this.$route.query.inv,
            payment_method: paymentMethod,
            type_d: deviceType,
            email:
              this.customer !== null ? this.customer.email : this.email_payment,
            password: this.encryption(true, this.password),
          })
            .then((res) => {
              this.loading = false
              if (res.data.success === 1) {
                if (res.data.data.new_token !== null) {
                  localStorage.setItem(
                    'dataAuthCustomer',
                    JSON.stringify(res.data.data.new_token)
                  )
                }
                if (res.data.data.redirect_to === '') {
                  window.location.reload()
                } else {
                  window.location = res.data.data.redirect_to
                }
              } else {
                this.showSnackbar({ text: res.data.msg })
              }
            })
            .catch((err) => {
              console.warn('err', err)
              this.loading = false
              this.showSnackbar({
                text: 'Server sedang bermasalah',
                color: 'error',
              })
            })
        }
      }
    },
    select_payment_method(index1, index2) {
      this.payment_method.forEach((payment) => {
        payment.payment_method.forEach((paymentMethod) => {
          if (payment === index1 && paymentMethod === index2) {
            this.payment_method[payment].payment_method[
              paymentMethod
            ].is_selected = true
          } else {
            this.payment_method[payment].payment_method[
              paymentMethod
            ].is_selected = false
          }
        })
      })
    },
    choose_payment() {
      this.loading_payment = true
      let error = ''
      let selectedShippingService = null
      if (this.use_shipping) {
        if (this.shipping_services.length > 0) {
          selectedShippingService = this.get_selected_shipping_service
          if (selectedShippingService === null) {
            error = 'Silahkan pilih layanan pengiriman terlebih dahulu'
          }
          if (error === '') {
            this.do_request('shipping/select_service', {
              inv: this.$route.query.inv,
              selectedShippingService,
            })
              .then((res) => {
                this.loading_payment = false
                if (res.data.success === 1) {
                  this.step = 3
                } else {
                  this.showSnackbar({ text: res.data.msg })
                }
              })
              .catch((err) => {
                console.warn('err', err)
                this.loading_payment = false
                this.showSnackbar({
                  text: 'Server sedang bermasalah',
                  color: 'error',
                })
              })
          } else {
            this.loading_payment = false
            this.showSnackbar({ text: error })
          }
        } else if (this.shipping_services_by_product.length > 0) {
          selectedShippingService =
            this.get_selected_shipping_service_by_product
          if (selectedShippingService === null) {
            error = 'Silahkan pilih layanan pengiriman terlebih dahulu'
          }
          if (error === '') {
            this.do_request('shipping/select_service_by_product', {
              inv: this.$route.query.inv,
              selectedShippingService,
            })
              .then((res) => {
                this.loading_payment = false
                if (res.data.success === 1) {
                  this.step = 3
                } else {
                  this.showSnackbar({ text: res.data.msg })
                }
              })
              .catch((err) => {
                console.warn('err', err)
                this.loading_payment = false
                this.showSnackbar({
                  text: 'Server sedang bermasalah',
                  color: 'error',
                })
              })
          } else {
            this.loading_payment = false
            this.showSnackbar({ text: error })
          }
        } else {
          this.loading_payment = false
          this.showSnackbar({
            text: 'Tidak ada jasa pengiriman yang tersedia di alamat Anda',
          })
        }
      } else {
        this.loading_payment = false
        this.step = 3
      }
    },
    select_shipping_service_by_product(a, i) {
      for (
        let z = 0;
        z <
        this.shipping_services_by_product[this.index_choose_shipping]
          .shipping_service.length;
        z++
      ) {
        const z_ =
          this.shipping_services_by_product[this.index_choose_shipping]
            .shipping_service[z]
        for (let y = 0; y < z_.services.length; y++) {
          if (z === a && i === y) {
            this.shipping_services_by_product[
              this.index_choose_shipping
            ].shipping_service[z].services[y].selected = true
          } else {
            this.shipping_services_by_product[
              this.index_choose_shipping
            ].shipping_service[z].services[y].selected = false
          }
        }
      }
    },
    select_shipping_service(a, i) {
      for (let z = 0; z < this.shipping_services.length; z++) {
        const z_ = this.shipping_services[z]
        for (let y = 0; y < z_.services.length; y++) {
          if (z === a && i === y) {
            this.shipping_services[z].services[y].selected = true
          } else {
            this.shipping_services[z].services[y].selected = false
          }
        }
      }
    },
    get_estimated(etd) {
      let etd_ = etd.toLowerCase()
      etd_ = etd_.replace('hari', '')
      etd_ = etd_.replace(' ', '')
      return etd_ + ' hari'
    },
    choose_shipping() {
      let recheckShippingFee = false
      if (this.customer !== null) {
        if (this.customer.id_district !== '0' && this.address !== '') {
          this.loading_shipping = true
          recheckShippingFee = true
        }
      }
      if (recheckShippingFee) {
        this.recheck_ongkir()
        // this.step = 2
      } else {
        this.step = 2
      }
    },
    save_data_customer() {
      let error = ''
      if (!/.+@.+/.test(this.email_customer) || this.email_customer === '') {
        error = 'E-mail wajib diisi'
      } else if (this.nama_customer === '') {
        error = 'Nama Penerima wajib diisi'
      } else if (this.phone_customer === '') {
        error = 'Nomor Handphone wajib diisi'
      } else if (
        this.selected_address_customer === null ||
        this.complete_address_customer === ''
      ) {
        error = 'Alamat Belum Lengkap'
      }
      if (error === '') {
        const customer = {
          id: this.customer === null ? 0 : this.customer.id,
          penerima: this.nama_customer,
          email: this.email_customer,
          phone: this.phone_customer,
          id_district: this.selected_address_customer.id_district,
          kec: this.selected_address_customer.kec,
          city: this.selected_address_customer.city,
          prov: this.selected_address_customer.prov,
          address: this.complete_address_customer,
        }
        this.loading = true
        const dataAuthCustomer = this.get_dataAuthCustomer()
        this.do_request('address/save', {
          token: dataAuthCustomer === null ? '' : dataAuthCustomer.token,
          customer,
          inv: this.$route.query.inv,
        })
          .then((res) => {
            if (res.data.success === 1) {
              this.customer = customer
              if (res.data.data.new_token !== null) {
                localStorage.setItem(
                  'dataAuthCustomer',
                  JSON.stringify(res.data.data.new_token)
                )
              }
              this.recheck_ongkir()
              this.show_customer_from = false
            } else {
              this.loading = false
              this.showSnackbar({ text: res.data.msg })
            }
          })
          .catch((err) => {
            console.warn('err', err)
            this.loading = false
            this.showSnackbar({
              text: 'Server sedang bermasalah',
              color: 'error',
            })
          })
      } else {
        this.showSnackbar({ text: error, color: 'error' })
      }
    },
    recheck_ongkir() {
      const idProducts = []
      this.products.forEach((item, key) => {
        if (
          item.id_product !== undefined &&
          item.id_product !== '' &&
          item.id_product !== null
        ) {
          idProducts.push(item.id_product)
        }
      })
      this.loading_ongkir = true
      const dataAuthCustomer = localStorage.getItem('dataAuthCustomer')
      this.do_request('shipping/check_ongkir', {
        token: dataAuthCustomer === null ? '' : dataAuthCustomer.token,
        inv: this.$route.query.inv,
        id_products: idProducts,
      })
        .then((res) => {
          this.loading_ongkir = false
          if (res.data.success === 1) {
            this.loading = false
            this.loading_shipping = false
            this.shipping_services = res.data.data
            if (this.shipping_services.length === 0) {
              this.showSnackbar({
                text: 'Tidak ada jasa pengiriman yang tersedia di alamat Anda',
              })
            }
            this.step = 2
          } else if (res.data.success === 2) {
            this.loading = false
            this.loading_shipping = false
            this.shipping_services_by_product = res.data.data
            if (this.shipping_services_by_product.length === 0) {
              this.showSnackbar({
                text: 'Tidak ada jasa pengiriman yang tersedia di alamat Anda',
              })
            }
            this.step = 2
          } else {
            this.loading = false
            this.showSnackbar({ text: res.data.msg })
          }
        })
        .catch((err) => {
          console.warn('err', err)
          this.loading_ongkir = false
          this.loading = false
          this.showSnackbar({
            text: 'Server sedang bermasalah',
            color: 'error',
          })
        })
    },
    search_district_customer_() {
      this.do_request('address/search', {
        query: this.search_district_customer,
      })
        .then((res) => {
          if (res.data.success === 1) {
            this.list_address_customer = res.data.data
          } else {
            this.showSnackbar({ text: res.data.msg })
          }
        })
        .catch((err) => {
          console.warn('err', err)
          this.showSnackbar({
            text: 'Server sedang bermasalah',
            color: 'error',
          })
        })
    },
    select_address_customer(address) {
      this.selected_address_customer = address
      this.show_address_search_customer = false
    },
    hide_customer_form() {
      if (this.show_address_search_customer) {
        this.show_address_search_customer = false
      } else {
        this.show_customer_from = false
      }
    },
    show_customer_from_() {
      if (this.customer !== null) {
        this.nama_customer = this.customer.penerima
        this.email_customer = this.customer.email
        this.phone_customer = this.customer.phone
        if (this.customer.id_district !== '0') {
          this.selected_address_customer = {
            id_district: this.customer.id_district,
            kec: this.customer.kec,
            city: this.customer.city,
            prov: this.customer.prov,
          }
          this.complete_address_customer = this.customer.address
        } else {
          this.selected_address_customer = null
          this.complete_address_customer = ''
        }
      } else {
        this.nama_customer = ''
        this.email_customer = ''
        this.phone_customer = ''
        this.selected_address_customer = null
        this.complete_address_customer = ''
      }
      this.show_customer_from = true
    },
    back() {
      if (this.step === 3) {
        this.step = this.use_shipping ? 2 : 1
      } else {
        this.step--
      }
    },
    count_grand_total() {
      let grandTotal = 0
      for (let a = 0; a < this.products.length; a++) {
        const a_ = this.products[a]
        grandTotal += parseInt(a_.qty) * parseInt(a_.harga)
      }
      for (let a = 0; a < this.other_price.length; a++) {
        const a_ = this.other_price[a]
        if (a_.tipe !== 'Diskon Ongkir') {
          if (a_.is_discount) {
            grandTotal -= parseInt(a_.nominal)
          } else {
            grandTotal += parseInt(a_.nominal)
          }
        }
      }
      this.grand_total = grandTotal
    },
    do_request(url, body) {
      const qs = require('qs')
      return axios({
        method: 'post',
        url: this.$store.state.init.url_api + url,
        data: qs.stringify(body),
      })
    },
    request_rov(url, body) {
      const qs = require('qs')
      return axios({
        method: 'post',
        url: this.$store.state.init.url_rov + url,
        data: qs.stringify(body),
      })
    },
    get_dataAuthCustomer() {
      const dataAuthCustomer = localStorage.getItem('dataAuthCustomer')
      if (
        dataAuthCustomer === undefined ||
        dataAuthCustomer === 'undefined' ||
        dataAuthCustomer === 'null' ||
        dataAuthCustomer === '' ||
        dataAuthCustomer === null
      ) {
        return null
      } else {
        // console.log(dataAuthCustomer, 'qqq')
        return JSON.parse(dataAuthCustomer)
      }
    },
    get_rp(number_, useCurrency) {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      })
      return formatter.format(number_).replace('IDR', useCurrency ? 'Rp.' : '')
    },
    encryption(encode, param) {
      const encryption_ = {
        // private property
        _keyStr: 'b8e70c06e5ce7d45969fbe73d751b395',
        // public method for encoding
        encode: function (input) {
          let sResult = ''
          for (let i = 0; i < input.length; i++) {
            let sChar = input.substring(i, i + 1)
            // var sKeyChar = this._keyStr.substring(((i % this._keyStr.length) - 1), (i % this._keyStr.length));
            const sKeyChar = this._keyStr.substring(i, i + 1)
            // console.log(this._keyStr.substring(i, i+1));
            sChar = String.fromCharCode(
              parseInt(sChar.charCodeAt(0)) + parseInt(sKeyChar.charCodeAt(0))
            )
            sResult += sChar
          }
          return window.btoa(sResult)
        },
        // public method for decoding
        decode: function (input) {
          let sResult = ''
          const sData = window.atob(input)
          for (let i = 0; i < sData.length; i++) {
            let sChar = sData.substring(i, i + 1)
            const sKeyChar = this._keyStr.substring(i, i + 1)
            sChar = String.fromCharCode(
              parseInt(sChar.charCodeAt(0)) - parseInt(sKeyChar.charCodeAt(0))
            )
            sResult += sChar
          }
          return sResult
        },
        // private method for UTF-8 encoding
        _utf8_encode: function (string) {
          return false
        },
        // private method for UTF-8 decoding
        _utf8_decode: function (utftext) {
          return false
        },
      }
      return encode ? encryption_.encode(param) : encryption_.decode(param)
    },
  },
}
</script>
