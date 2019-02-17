<template lang="html">

  <div class="card-voc">

    <div class="card-title">
      <h2>MyVoc<span>...{{vocWordEnd}}</span></h2>
    </div>

    <div class="card-content">
      <div class="stats">
        <p>{{ vocLength }} words or expressions</p>
        <p>{{ tested_count }} tested / {{ untested_count }} untested</p>
      </div>
      <div class="see-more">
        <i class="material-icons" @click="goVocList">search</i>
      </div>
      <div class="import-data">
        <voc-modal-add-word></voc-modal-add-word>
        <voc-modal-add-list></voc-modal-add-list>
      </div>
    </div>

  </div>

</template>

<script>

import ModalAddWord from '@/components/vocabulary/ModalAddWord.vue';
import ModalAddList from '@/components/vocabulary/ModalAddList.vue';

import { eventBus } from '@/main.js';

export default {
  name: 'card-vocabulary',

  components: {
    'voc-modal-add-word': ModalAddWord,
    'voc-modal-add-list': ModalAddList,
  },

  computed: {

    tested_count() {
      if (this.$store.state.testedLocal.data_values) {
        return this.$store.state.testedLocal.data_values.length;
      } else {
        return 0;
      }

    },

    untested_count() {
      return this.vocLength - this.tested_count;
    },

    vocLength() {
        return this.$store.state.vocLength;
    },

    vocWordEnd() {
      if (this.$store.state.language === 'FR') { return 'abulaire'; }
      else { return 'abulary'; }
    },

  },      // END OF computed

  created() {
    eventBus.$on('message', (status, message) => {
        if (status === 'success') { console.log('status is success'); }
        console.log('message from eventBus: ', message);
      });
  },

  methods: {

    goVocList() {
      this.$router.push('/vocabulary-list');
    },

  },      // END OF methods

}
</script>

<style lang="css" scoped>

.card-voc {
  display: flex;
  flex-direction: column;
  color: #333;
  border: 4px solid #33385a;
  border-top-left-radius: 7px;
  border-top-right-radius: 7px;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.card-title {

  text-align: center;
  background-color: #33385a;
  color: #fff;
  margin-bottom: auto;
  height: 6rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-title h2 {
  text-transform: uppercase;
}

.card-content {
  background-color: #f2f2f2;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  flex-grow: 1;
}

.card-content p {
  font-size: 1.3rem;
  margin-top: 10px;
  margin-bottom: 1rem;
}

.card-content i.material-icons {
  cursor: pointer;
}

.card-content .import-data {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  margin-bottom: 1rem;
}

.stats {
  width: 100%;
  text-align: center;
}

.see-more {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-grow: 1;
}

i.material-icons {
  font-size: 4.5rem;
}


</style>
