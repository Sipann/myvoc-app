<template lang="html">
  <div class="inside-container">
    <voc-test-runner v-if="isTestRunning"></voc-test-runner>
    <div class="message-user" :class="type" v-if="messageUser">{{ message }}</div>
    <voc-card-vocabulary class="card-voc"></voc-card-vocabulary>
    <voc-card-tests class="card-test"></voc-card-tests>
  </div>
</template>

<script>

import { eventBus } from '@/main.js';

import TestRunner from '@/components/tests/TestRunner.vue';
import CardVocabulary from '@/components/vocabulary/CardVocabulary.vue';
import CardTests from '@/components/tests/CardTests.vue';

export default {
  name: 'dashboard',

  data: () => ({
    message: '',
    messageUser: false,
    type: '',     // success or error - used for styling div.
  }),

  created() {
    eventBus.$on('messageUser', payload => {
      this.messageUser = true;
      this.message = payload.message;
      this.type = payload.type;
      setTimeout( () => {
        this.messageUser = false;
        this.message = '';
      }, 3000);
    });
  },

  components: {
    'voc-test-runner': TestRunner,
    'voc-card-vocabulary': CardVocabulary,
    'voc-card-tests': CardTests,
  },

  computed: {
    isTestRunning() { return this.$store.state.isTestRunning; },
  },

}
</script>

<style lang="css" scoped>

.inside-container {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 15% 30% 10% 30% 15%;
  grid-template-rows: 22% 60% 18%;
}



.message-user {
  position: absolute;
  left: calc(50% - 142px);
  top: 15px;
  font-size: 1.3rem;
  padding: 1rem 1.5rem;
  border-radius: 7px;
  color: #333;
}


.card-voc {
  grid-column-start: 2;
  grid-row-start: 2;
}

.card-test {
  grid-column-start: 4;
  grid-row-start: 2;
}

.message-user.success {
  background: green;
}

.message-user.error {
  background: red;
}

</style>
