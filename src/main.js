import Vue from 'vue'
import App from './App.vue'
import {Wavelet,Contract} from "wavelet-client";

Vue.config.productionTip = false

const client = new Wavelet('https://testnet.perlin.net');
const wallet = Wavelet.loadWalletFromPrivateKey("43f5699a788ab63376f683b23921102c33ba7aa90da34b1d146100a04312056b2f24a207ac8c253948c0aad85b6a0a56cda0191dc65bb6730158ff8e6e18c6c5");
const contract = new Contract(client, "97f293b44e7b9f1d000d45e0f44059d35526f4367546f9c919ba2d0f154f1001");

Vue.use({
  install (Vue) {
    Vue.prototype.$contract = contract
    Vue.prototype.$wallet = wallet
    Vue.prototype.$client = client
  }
})

new Vue({
  render: h => h(App),
}).$mount('#app')
