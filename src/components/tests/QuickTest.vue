<template lang="html">

  <div>

    <v-btn color="primary" @click="launchTest()">
      Quick Test
      <v-icon right dark>play_circle_outline</v-icon>
    </v-btn>

  </div>

</template>

<script>

  import { launchTestGlobal } from '@/utils/runTest';

  export default {
    name: 'quick-test',

    methods: {

      launchTest() {
        let vm = this;
        launchTestGlobal(10, '', '', vm);
      }

    },

  }

</script>

<style lang="css" scoped>
</style>
