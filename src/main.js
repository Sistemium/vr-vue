import Vue from 'vue';
import { authorize as authorizeJSDataStore } from 'sistemium-telegram/jsdata/store';

import '@/lib/element-ui';

import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

authorizeJSDataStore('anonymous', 'vr');

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
