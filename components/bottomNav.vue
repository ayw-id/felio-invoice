<template>
  <v-bottom-navigation v-model="showNav" color="primary" fixed shift large>
    <v-btn color="white">
      <span>Transaksi</span>

      <v-icon>mdi-book-open</v-icon>
    </v-btn>

    <v-btn color="white">
      <span>Profile</span>

      <v-icon>mdi-face</v-icon>
    </v-btn>

    <v-btn color="white">
      <span>Pengaturan</span>

      <v-icon>mdi-wrench</v-icon>
    </v-btn>
  </v-bottom-navigation>
</template>
<script>
export default {
  data() {
    return {
      showNav: 1,
    }
  },
}
</script>
