<template>
  <div id="app">
    <div class="container">
      <router-view />
      <div class="qrcode">
        <img class="qrcode__image" :src="qrCodeData" alt="QR Code" />
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from "qrcode";

export default {
  data() {
    return {
      qrCodeData: "" // QR 코드 데이터 URI
    };
  },
  async mounted() {
    this.qrCodeData = await QRCode.toDataURL("http://jacqueline-chat-app.s3-website.eu-central-1.amazonaws.com/");
  }
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  overflow: hidden;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100svh;
}

.qrcode {
  display: none;
  width: 280px;
  height: 280px;

  &__image {
    height: 100%;
    width: 100%;
  }

  @media (min-width: 1024px) {
    display: block;
  }
}
</style>
