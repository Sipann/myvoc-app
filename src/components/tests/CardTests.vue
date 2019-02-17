<template lang="html">

  <div class="card-tests">

    <div class="card-title">
      <h2>MyVoc Tests</h2>
    </div>

    <div class="card-content">
      <voc-tests-registered id="tests-registered"></voc-tests-registered>
      <voc-modal-add-test id="modal-add-test"></voc-modal-add-test>
    </div>

  </div>

</template>

<script>

  import TestsRegistered from '@/components/tests/TestsRegistered';
  import ModalAddTest from '@/components/tests/ModalAddTest.vue';

  export default {
    name: 'card-tests',

    components: {
      'voc-tests-registered': TestsRegistered,
      'voc-modal-add-test': ModalAddTest,
    },

  }

</script>

<style lang="css" scoped>

.card-tests {
  display: flex;
  flex-direction: column;
  color: #333;
  min-height: 100%;

  /* border: 4px solid rgba(216, 27, 96, 1); */
  border: 4px solid #6780b3;
  border-top-left-radius: 7px;
  border-top-right-radius: 7px;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.card-title {
  text-align: center;
  /* background-color: rgba(216, 27, 96, 1); */
  background-color: #6780b3;
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
  flex-grow: 1;
  justify-content: space-around;
  flex-direction: column;
}


#tests-registered {
  flex-grow: 1;

  margin-left: auto;
  margin-right: auto;
  width: 80%
}

#modal-add-test {
  margin-top: auto;
  margin-bottom: 1rem;
  width: 100%;
}

/* .manage-tests {
  margin-right: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
} */

/* To style message tooltip */
/* .v-tooltip__content {
  background-color: rgba(133, 220, 186, 1);
  max-width: 150px;
  margin-left: 30px;
} */


</style>
