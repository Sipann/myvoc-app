<template lang="html">
  <div class="section-info">
    <v-card v-if="isLoggedIn">
      <v-card-title class="headline grey lighten-2" primary-title>Your Infos</v-card-title>
      <v-card-text>
        <p>Username: {{ usernameInitial }}</p>
        <p>Email: {{ emailInitial }}</p>
      </v-card-text>
      <v-card-actions>
        <v-dialog v-model="dialog" class="edit-dialog" persistent width="500" height="500">
          <v-btn :disabled="!isConnected" slot="activator" @click="openEditModal">Change your details info</v-btn>
          <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>Update your Personal Info</v-card-title>
            <v-card-text>
              <v-text-field v-model="username" required label="Your username"></v-text-field>
              <v-text-field v-model="email" required label="Your email"></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn :disabled="!infoHasChanged" @click="updateUserInfo">Update</v-btn>
              <v-btn @click="closeEditModal">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-actions>
      <v-card-actions>
        <v-dialog v-model="dialogPassword" class="password-dialog" persistent width="500" height="500">
          <v-btn :disabled="!isConnected" slot="activator">Change your password</v-btn>
          <v-card class="headline grey lighten-2" primary-title>
            <v-card-title>Update Your password</v-card-title>
            <v-card-text>
              <v-text-field v-model="password" type="password" label="Enter your new password"></v-text-field>
              <v-text-field v-model="confirmPassword" type="password" label="Confirm your password"></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn :disabled="!canUpdatePassword" @click="modifyPassword">Update</v-btn>
              <v-btn @click="closePasswordModal">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-actions>
    </v-card>

    <v-card v-else>
      <v-card-title class="headlne grey lighten-2" primary-title>Your Infos</v-card-title>
      <v-card-text>
        Login to access your info or Register to create an account.
      </v-card-text>
      <v-card-actions>
        <v-btn to="/login">Login</v-btn>
        <v-btn to="/register">Register</v-btn>
      </v-card-actions>
    </v-card>

  </div>
</template>

<script>

  import { updateToolLocal } from '@/utils/toolList';
  import { updateMetaData, updatePassword, updateUsername } from '@/utils/users';

  export default {
    name: 'user-info',

    data: () => ({
      confirmPassword: '',
      dialog: false,
      dialogPassword: false,
      email: '',
      password: '',
      username: '',
    }),

    computed: {
      canUpdatePassword() { return this.password.length && (this.password === this.confirmPassword); },
      emailInitial() { return this.$store.state.email; },
      emailHasChanged() { return this.emailInitial !== this.email; },
      infoHasChanged() { return this.emailHasChanged || this.usernameHasChanged; },
      isConnected() { return window.navigator.onLine; },
      isLoggedIn() { return this.$store.state.isLoggedIn; },
      usernameHasChanged() { return this.usernameInitial !== this.username; },
      usernameInitial() { return this.$store.state.username; },
    },

    methods: {

      closeEditModal() {
        this.dialog = false;
        this.email = '';
        this.username = '';
      },

      closePasswordModal() {
        this.dialogPassword = false;
      },

      openEditModal() {
        this.username = this.usernameInitial;
        this.email = this.emailInitial;
      },

      async modifyPassword() {
        console.log('this new password', this.password);
        let result = await updatePassword(this.usernameInitial, this.password);
        console.log('result from modifyPassword', result);
        if (result.ok) {
          // @TODO Warn user that everything ok
        } else {
          // @TODO Warn user that there has been an issue.
        }
        this.closePasswordModal();
      },

      async updateUserInfo() {
        if (this.usernameHasChanged && this.emailHasChanged) {
          updateMetaData(this.usernameInitial, this.email);
        } else if (this.usernameHasChanged) {
          updateUsername(this.usernameInitial, this.username);
        } else if (this.emailHasChanged) {
          let result = await updateMetaData(this.usernameInitial, this.email);
          console.log('result from emailHasChanged', result);
          if (result.ok) {
            updateToolLocal(this.usernameInitial, this.email);
            this.closeEditModal();
          } else {
            // @TODO Warn user that there has been an issue.
            this.closeEditModal();
          }
        } else {
          console.log('unanticipated choice');
        }
      },

    },

  }

</script>

<style lang="css" scoped>

  .section-info {
    grid-column-start: 1;
  }

</style>
