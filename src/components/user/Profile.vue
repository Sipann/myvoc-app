<template lang="html">
  <div class="inside-container">
    <myvoc-user-info class="card-info"></myvoc-user-info>
    <myvoc-user-history v-if="!isMobile" class="card-history"></myvoc-user-history>
  </div>
</template>

<script>

import UserInfo from '@/components/user/UserInfo.vue';
import UserHistory from '@/components/user/UserHistory.vue';

export default {
  name: 'profile',

  components: {
    'myvoc-user-info': UserInfo,
    'myvoc-user-history': UserHistory,
  },

  computed: {
    isMobile() {
      let agent = window.navigator.userAgent;
      return agent.includes('Mobi');
    },
  }

}

</script>

<style lang="css" scoped>

  .inside-container {
    display: grid;
    width: 100%;
    height: 100%;
    grid-template-columns: 7% 38% 10% 38% 7%;
    grid-template-rows: 20% 70% 10%;
  }

  .card-info {
    grid-column-start: 2;
    grid-row-start: 2;
  }

  .card-history {
    grid-column-start: 4;
    grid-row-start: 2;
  }


</style>
