<template>

  <v-app id="inspire">
    <app-header></app-header>
    <v-content>
      <router-view></router-view>
    </v-content>
    <v-footer color="indigo" app>
      <span class="white--text"> &copy; {{ current_year }}</span>
    </v-footer>

  </v-app>

</template>

<script>
import Header from '@/components/general/Header.vue';
import { localDB, getLocalDBInfo } from '@/utils/databases';
import { getContainerLocal, initContainers, resetContainerLocal } from '@/utils/containers';
import { getToolList, getToolLocal } from '@/utils/toolList';
import { getChangesTracker, syncWordsFrom, updateChangesTracker2 } from '@/utils/words';
import { getUserSession } from '@/utils/users';

export default {
  name: 'app',

  components: {
    'app-header': Header,
  },

  computed: {

    current_year() {
      let now = new Date();
      return now.getFullYear();
    },

    isConnected() {
      let isOnline = window.navigator.onLine && this.isLoggedIn;
      this.$store.commit('IS_ONLINE', isOnline);
      return isOnline;
    },

    isLoggedIn() { return this.$store.state.isLoggedIn; },
  },

  beforeMount() {
    let vm = this;

    localDB.createIndex({
      index: {
        fields: ['type', 'category', 'tag'],
        ddoc: 'index-filtered-words',
      }
    }).then((result) => { console.log('result', result) })
    .catch ((err) => { console.log('err from index-filtered-words', err) });

    localDB.createIndex({
      index: {
        fields: ['type', 'subtype'],
        ddoc: 'index-containers',
      }
    }).then((result) => { console.log('result', result) })
    .catch((err) => { console.log('err from index-containers', err) });


    localDB.createIndex({
      index: {
        fields: ['type', 'category', 'tested'],
        ddoc: 'index-tested-words-cat',
      }
    }).then((result) => { console.log('result', result) })
    .catch((err) => { console.log('err from index-tested-words-cat') });


    localDB.createIndex({
      index: {
        fields: ['type', 'tag', 'tested'],
        ddoc: 'index-tested-words-tag',
      }
    }).then((result) => { console.log('result', result) })
    .catch((err) => { console.log('err from index-tested-words-tag') });

  },

  mounted() {

    this.indexReady();

    let changes = localDB.changes({
      filter: function(doc) { return doc.type == 'word' ; },
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', function(change) {
      console.log('on change: ', change);
    }).on('complete', function(info) {
      console.log('on complete: ', info);
    }).on('error', function(err) {
      console.log('error: ', err);
    });
  },

  methods: {


    async indexReady() {
      try {
        let i = 0;
        let result = await localDB.getIndexes();
        let indexes = result.indexes.slice();

        if (indexes.findIndex(item => item.ddoc == '_design/index-containers') > -1) {
          console.log('index-containers ready - calling setContainers');
          this.setContainers();
        } else if (i == 15) {
          throw "Can't create or fetch indexes. Try again";
        } else {
          console.log('index-containers not ready - looping');
         this.indexReady();
         i += 1;
       }

      } catch (err) { console.log('error from setContainers', err); }
    },

    async setContainers() {

      // FOR ALL
      let storedToolLocal = await getToolLocal();
      console.log('storedToolLocal', storedToolLocal);



      let subtypes = this.$store.state.subtypes.slice();
      for (let i=0; i<subtypes.length; i++) {
        await getContainerLocal(subtypes[i]);
      }


      // ONLY FOR LOGGEDIN && ONLINE USERS
      if (this.isConnected) {
        if (storedToolLocal.username) {
          await getUserSession(storedToolLocal.username);
        }
        await getToolList();
        if (this.$store.state.initTool == true) {
          let subtypes_ids = this.$store.state.toolList.containers.slice();
          this.initData(subtypes_ids);
          this.$store.commit('INIT_TOOL', false);
        }
      }

      // FOR ALL USERS
      await getChangesTracker();
      await getLocalDBInfo();

    },


    async setContainers0() {

      await getToolLocal();
      if (this.isLoggedIn) {
        await getToolList(this.isConnected);
        let subtypes = ['categories', 'history', 'tested', 'tests'];
        for (let i=0; i<subtypes.length; i++) {
          await getContainerLocal(subtypes[i]);
        }
        if (this.$store.state.initTool == true) {
          let subtypes_ids = this.$store.state.toolList.containers.slice();
          this.initData(subtypes_ids);
        }
        await getChangesTracker();
      }

      await getLocalDBInfo();
      this.$store.commit('INIT_TOOL', false);
    },

    async initData(subtypes_ids) {
      await syncWordsFrom(false, []);
      await initContainers(subtypes_ids);
    },

  },

}
</script>

<style>

</style>
