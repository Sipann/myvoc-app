import Vue from 'vue';
import Router from 'vue-router';

import { store } from './../store/store';
import { getUserSession } from '@/utils/users';

import Home from '@/components/general/Home.vue';
import Demo from '@/components/general/Demo.vue';
import Dashboard from '@/components/general/Dashboard.vue';
import Login from '@/components/user/Login.vue';
import Register from '@/components/user/Register.vue';
import VocList from '@/components/vocabulary/VocList.vue';
import Profile from '@/components/user/Profile.vue';
import NotFound from '@/components/general/NotFound.vue';


Vue.use(Router);


function userIsOnMobile(to, from, next) {
  let agent = window.navigator.userAgent;
  if (agent.includes('Mobi')) { next('/dashboard'); }
  else { next(); }
}

function userIsLoggedIn(to, from, next) {
  if (window.navigator.onLine) {
    getUserSession(store.state.username);
    if (store.state.isLoggedIn) { next('/dashboard'); }
    else { next(); }
  } else {
    next('/dashboard');
  }
}

function userIsRegistered(to, from, next) {
  if (window.navigator.onLine) {
    if (store.state.username) { next('/dashboard'); }
    else { next(); }
  } else {
    next('/dashboard');
  }
}

export default new Router({
  routes: [
    { path: '/', component: Home },
    {
      path: '/demo',
      component: Demo,
      beforeEnter: userIsOnMobile,
    },
    { path: '/dashboard', component: Dashboard },
    {
      path: '/login',
      component: Login,
      beforeEnter: userIsLoggedIn,
    },
    {
      path: '/register',
      component: Register,
      beforeEnter: userIsRegistered,
    },
    { path: '/vocabulary-list', component: VocList },
    { path: '/profile', component: Profile },
    { path: '*', component: NotFound }
  ]
});
