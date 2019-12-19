import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import router from './router'
import axios from 'axios'
import store from './store'
import './permission' // permission control
// import echarts from 'echarts'
Vue.prototype.$axios= axios
// Vue.prototype.$echarts = echarts 
// 引入vuetify
import Vuetify from 'vuetify'
// 引入表单验证
import Vuelidate from 'vuelidate'
//使用vuetify
Vue.use(Vuetify)
Vue.use(Vuelidate)
Vue.use(VueRouter);
Vue.config.productionTip = false
//设置转场动画
// Vue.use(animated)
// vuetify样式
import 'vuetify/dist/vuetify.min.css'
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
