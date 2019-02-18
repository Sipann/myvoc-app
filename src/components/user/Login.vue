<template lang="html">

    <div class="section-login">
      <v-card width="600" height="600">
        <v-card-title class="headline grey lighten-2" primary-title>Login to your Account</v-card-title>
        <v-card-text>
          <v-text-field v-model="usernameLogin" required autofocus
                        label="Enter your Username"></v-text-field>
          <v-text-field v-model="passwordLogin" required
                        type="password"
                        label="Enter your Password"></v-text-field>
          <v-btn :disabled="!canLogin" @click="login">Login</v-btn>
          <p>No Account yet? Sign Up</p>
          <v-btn to="/register">Sign Up</v-btn>
        </v-card-text>
      </v-card>
    </div>

</template>

<script>

import { loginUser } from '@/utils/users';

export default {

  name: 'login',

  data: () => ({
    usernameLogin: '',
    passwordLogin: '',
  }),

  computed: {
    canLogin() {
      return this.usernameLogin.length > 2 && this.passwordLogin.length > 2;
    },

  },

  methods: {
    login() { loginUser(this.usernameLogin, this.passwordLogin); },

  }

}

</script>

<style lang="css">

</style>
