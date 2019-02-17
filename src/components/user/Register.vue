<template lang="html">
  <div class="section-register">

    <v-card width="600" height="600">
      <v-card-title
        class="headline grey lighten-2"
        primary-title>Sign Up to Allow Remote Syncing</v-card-title>
      <v-card-text>
        <v-text-field v-model="username" required autofocus @blur="checkUsername"
                      label="Pick a Username at least 3 characters long"></v-text-field>
        <p class="error-message" v-show="errorUsername">{{ errorMessageUsername }}</p>
        <v-text-field v-model="email" required @blur="checkEmail" @keyup="dblecheckEmail"
                      type="email" label="Enter your Email address"></v-text-field>
        <p class="error-message" v-show="errorEmail">{{ errorMessageEmail }}</p>
        <p>Just in case you forget your password. We won't send you email otherwise (we have a life too).</p>
        <v-text-field v-model="password" required @keyup="checkPassword"
                      type="password" label="Choose your Password Wisely"></v-text-field>
        <p class="error-message" v-show="errorPassword">{{ errorMessagePasssword }}</p>
        <v-text-field required v-model="confirmPassword" @keyup="checkConfirmPassword"
                      type="password" label="Confirm your Password"></v-text-field>
        <p class="error-message" v-show="errorConfirmPassword">{{ errorMessageConfirmPassword }}</p>

        <v-btn :disabled="!canRegister" @click="register">Register</v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>

import { checkSignUpUser } from '@/utils/users';

export default {

data() {
  return {
    confirmPassword: '',
    email: '',

    errorConfirmPassword: '',
    errorEmail: '',
    errorPassword: '',
    errorUsername: false,

    errorMessageConfirmPassword: '',
    errorMessageEmail: '',
    errorMessagePasssword: '',
    errorMessageUsername: '',

    password: '',
    username: '',

  }
},

computed: {

  canRegister() {
    return this.emailCouchRules && this.username.length > 2 && this.password.length > 2 && this.password === this.confirmPassword;
  },

  emailCouchRules() {
    return !this.username.includes(':');
  },

},

methods: {

  checkUsername() {
    if (this.username.length < 3) {
      this.errorUsername = true;
      this.errorMessageUsername = 'Your username must be at least 3 characters long.';
    } else {
      this.errorUsername = false;
      this.errorMessageUsername = '';
    }
  },

  checkEmail() {
    // source: https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
    let lastAtPos = this.email.lastIndexOf('@');
    let lastDotPos = this.email.lastIndexOf('.');
    let validation = (lastAtPos < lastDotPos && lastAtPos > 0 && this.email.indexOf('@@') == -1 && lastDotPos > 2 && (this.email.length - lastDotPos) > 2);
    if (!validation) {
      this.errorEmail = true;
      this.errorMessageEmail = 'This doesn\'t look like an email address...';
    } else {
      this.errorEmail = false;
      this.errorMessageEmail = '';
    }
  },

  dblecheckEmail() {
    if (this.errorMessageEmail) { this.checkEmail(); }
  },

  checkPassword() {
    if (this.password.length < 3) {
      this.errorPassword = true;
      this.errorMessagePasssword = 'Your password must be at least 3 characters long.';
    } else if (this.confirmPassword && this.password !== this.confirmPassword) {
      this.errorPassword = true;
      this.errorMessagePasssword = 'Your password does not match the confirming field below';
    } else {
      this.errorConfirmPassword = false;
      this.errorPassword = false;
      this.errorMessagePasssword = '';
    }
  },

  checkConfirmPassword() {
    if (this.confirmPassword != this.password) {
      this.errorConfirmPassword = true;
      this.errorMessageConfirmPassword = 'Your confirming password must match your password';
    } else {
      this.errorMessage = false;
      this.errorConfirmPassword = false;
      this.errorMessageConfirmPassword = '';
    }
  },

  async register() {
    let result = await checkSignUpUser(this.username, this.password, this.email);
    console.log('result', result);
    if (result && result.status === 'user already exists') {
      this.error = true;
      this.errorMessage = 'This username is already used. Please pick another one.';
    } else if (result && result.status === 'issue with request') {
      this.error = true;
      this.errorMessage = 'Well... That\'s strange, but there has been an issue. Try again later and let us know!';
    }
  },
}


}

</script>

<style lang="css" scoped>

.error-message {
  color: red;
}


</style>
