import Vue from 'vue'
import App from './App.vue'

//Axios
import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)

// CSS
import '@/assets/css/App.css'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
