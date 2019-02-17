import Vue from 'vue';
import App from './App.vue';

import router from './router';
import { store } from './store/store';

// PouchDB
// import { localDB } from '@/utils/databases';


// Vuetify
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
Vue.use(Vuetify);

// D3
import VueD3 from 'vue-d3';
Vue.use(VueD3);

import './registerServiceWorker'

Vue.config.productionTip = false;

// eventBus
export const eventBus = new Vue();

// Vue instance
new Vue({
  render: h => h(App),
  store,
  router,
}).$mount('#app')
