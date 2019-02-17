<template lang="html">

  <v-toolbar color="#b5c6e8" fixed app>

    <p class="logo" @click="goHome">M<span>y</span>V<span>OC</span></p>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <v-tooltip bottom>
        <v-btn @click="syncDB" :disabled="!canSync" slot="activator" fab>
          <i v-if="canSync" class="material-icons">sync</i>
          <i v-else class="material-icons">sync_disabled</i>
        </v-btn>
        <span>{{ syncMessage }}</span>
      </v-tooltip>

      <v-btn flat to="/demo" v-if="!isMobile">Demo</v-btn>
      <v-btn flat to="/dashboard">{{ dashboard }}</v-btn>
      <v-btn flat to="/vocabulary-list">{{ myVocList }}</v-btn>
      <v-btn flat to="/profile">{{ profile }}</v-btn>
      <v-btn flat v-if="isLoggedIn" @click="endSession">{{ logout }}</v-btn>
      <v-btn flat v-else to="/login">{{ login }}</v-btn>
      <v-tooltip bottom>
       <v-btn id="fr-or-en" flat slot="activator"
              @click="setLanguageInterface">
          <span>EN</span>
          <span>FR</span>
       </v-btn>
        <span>{{ info_language }}</span>
      </v-tooltip>

    </v-toolbar-items>
  </v-toolbar>

</template>

<script>

import { eventBus } from '@/main.js';

import { localDB, remoteDB, getLocalDBInfo } from '@/utils/databases';
import { checkRemoteAhead, replicateContainers } from '@/utils/containers';
import { refreshToolList } from '@/utils/toolList';
import { logoutUser } from '@/utils/users';
import { sendtoAppropriateSync } from '@/utils/words';

  export default {
    name: 'myvoc-header',

    computed: {

      // remote

      isLoggedIn() { return this.$store.state.isLoggedIn; },

      // localAhead() {
      localAheadContainers() {
        if ( this.$store.state.categoriesLocal.added &&
             this.$store.state.categoriesLocal.deleted &&
             this.$store.state.categoriesLocal.edited &&
             this.$store.state.historyLocal.added &&
             this.$store.state.testedLocal.added &&
             this.$store.state.testedLocal.deleted &&
             this.$store.state.testsLocal.added &&
             this.$store.state.testsLocal.deleted &&
             this.$store.state.testsLocal.edited) {

            if (
                 (this.$store.state.categoriesLocal.added.length > 0) ||
                 (this.$store.state.categoriesLocal.deleted.length > 0) ||
                 (this.$store.state.categoriesLocal.edited.length > 0) ||

                 (this.$store.state.historyLocal.added.length > 0) ||

                 (this.$store.state.testedLocal.added.length > 0) ||
                 (this.$store.state.testedLocal.deleted.length > 0) ||

                 (this.$store.state.testsLocal.added.length > 0) ||
                 (this.$store.state.testsLocal.deleted.length > 0 ) ||
                 (this.$store.state.testsLocal.edited.length > 0)
               ) { return true; }

            else { return false; }

      } else { return false;}

      },

      remoteAheadContainers() {
        return this.$store.state.categoriesRemoteAhead || this.$store.state.historyRemoteAhead || this.$store.state.testedRemoteAhead || this.$store.state.testsRemoteAhead;
      },

      localAheadWords() {
        if ( (this.$store.state.changesTracker.added.length > 0) ||
             (this.$store.state.changesTracker.deleted.length > 0) ||
             (this.$store.state.changesTracker.edited.length > 0) ) { return true; }
        else { return false;}
      },

      remoteAheadWords() {
        if (this.$store.state.toolList.toolsAhead) {
          let registeredToolsAhead = this.$store.state.toolList.toolsAhead.slice();
          let remoteAheadData = registeredToolsAhead.filter(tool =>  tool.comparedTo == this.$store.state.toolLocal._id );
          if (remoteAheadData.length > 0) { return true; }
          else { return false; }
        } else {
          return false;
        }
      },

      localAhead() { return this.localAheadContainers || this.localAheadWords; },

      remoteAhead() { return this.remoteAheadContainers || this.remoteAheadWords; },

      isConnected() { return window.navigator.onLine; },

      canSync() {
        return this.$store.state.isLoggedIn && this.isConnected && this.$store.state.remoteDB && (this.localAhead || this.remoteAhead);
      },

      syncMessage() {
        if (!this.isLoggedIn) { return 'You must log in to enable remote saving'; }
        else if (!this.isConnected) { return 'You must be online to sync your db.'; }
        else if (this.localAhead && this.remoteAhead) { return 'you have data ahead in both remote and localDB. Well done!' }
        else if (this.localAhead) { return `You have made changes on your localDB. Don't forget to sync!`; }
        else if (this.remoteAhead) { return 'You have more info on your remoteDB that you should download'; }
        else { return 'Your localDB is in sync with your remoteDB. Nothing to sync. '; }
      },




      dashboard() {
        if (this.$store.state.language == 'FR') { return 'Tableau de bord'; }
        else { return 'Dashboard'; }
      },

      info_language() {
        if (this.$store.state.language == 'FR') { return 'Set Interface Language to English'; }
        else { return 'Afficher l\'interface en français'; }
      },


      login() {
        if (this.$store.state.language == 'FR') { return 'S\'identifier'; }
        else { return 'Login'; }
      },


      logout() {
        if (this.$store.state.language == 'FR') { return 'Déconnexion'; }
        else { return 'Logout'; }
      },

      myVocList() {
        if (this.$store.state.language == 'FR') { return 'MyVoc-Liste'; }
        else { return 'MyVoc-List'; }
      },

      profile() {
        if (this.$store.state.language == 'FR') { return 'Profil'; }
        else { return 'Profile'; }
      },


      isMobile() {
        let agent = window.navigator.userAgent;
        return agent.includes('Mobi');
      },

    },    // END OF computed()

    methods: {

      endSession() {
        logoutUser();
      },

      goHome() { this.$router.push('/'); },

      setLanguageInterface() {
        this.$store.commit('SWITCH_LANGUAGE');
      },

      async syncDB() {

        try {
          // synchronizing words.
          await this.syncWords();
          let subtypes = ['categories', 'history', 'tested', 'tests'];
          // synchronizing containers.
          for (let i=0; i<subtypes.length; i++) {
            await checkRemoteAhead(subtypes[i]);
            await replicateContainers(subtypes[i]);
          }
          eventBus.$emit('messageUser', { message: "All Done!", type: 'success' });

        } catch (err) {
          console.log('error from syncDB', err);
          eventBus.$emit('messageUser', { message: "Something's wrong. Could not sync databases.", type: 'error' });
        }

      },

      async syncWords() {

        try {
          await refreshToolList();
          await sendtoAppropriateSync(this.localAheadWords);
          await getLocalDBInfo();
          eventBus.$emit('updatedList');
        } catch (err) {
          console.log('error from refreshToolList', err);
        }


      },


    },  // END OF methods()

  }   // END of export default.

</script>

<style lang="css" scoped>

@font-face {
    font-family: "RecipeDailyBold";
    src: url(../../assets/RecipeDaily-BOLD.otf) format("truetype");
}


p.logo {
  font-family: 'RecipeDailyBold', sans-serif;
  font-size: 3.5rem;
  color: #fff;
  padding-top: 1rem;
  cursor: pointer;
}

p.logo span {
  font-size: 2.7rem;
}



#fr-or-en::after {
  content: '';
  height: 100%;
  width: 4%;
  background: #fff;
  position: absolute;
  transform: rotate(45deg);
}

#fr-or-en span:first-child {
  transform: translate(-45%, -45%);
}

#fr-or-en span:nth-child(2) {
  transform: translate(45%, 45%);
}

</style>
