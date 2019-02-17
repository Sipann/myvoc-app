<template lang="html">

  <div class="card-test-add">

      <v-dialog persistent v-model="dialog"
                width="600" height="600">

        <v-btn slot="activator" color="#14a098" dark>
          New Custom Test
          <v-icon right dark>add_circle_outline</v-icon>
        </v-btn>

        <v-card>

          <v-card-title class="headline grey lighten-2"
                        primary-title>Enter Details of New Test</v-card-title>

          <v-card-text>

            <div class="no-register" v-if="currentNumberOfTests >= maxNumberOfTests">
              <p>You have reached your maximum number of registered tests.</p>
              <p>You can still launch a custom one.</p>
            </div>

            <v-form v-model="valid">
              <v-text-field v-model="testName"
                            label="Test Name (required)"
                            v-if="currentNumberOfTests < maxNumberOfTests"
                            required></v-text-field>
              <v-text-field v-model="numberOfWords"
                            label="Number of Words (required)"
                            required></v-text-field>
              <v-select v-model="selectedCategory"
                            :items="categories"
                            label="Category"></v-select>
              <v-select v-model="selectedTag"
                            :items="tags"
                            label="Tag"></v-select>
            </v-form>


          </v-card-text>

          <v-card-actions>
            <v-btn color="primary" flat @click="cancel">Cancel</v-btn>

            <v-tooltip top :disabled="!noRegister"
                      v-if="currentNumberOfTests < maxNumberOfTests">
              <v-btn color="primary" flat slot="activator" :disabled="noRegister"
                    @click="saveNewTest(testName, numberOfWords, selectedCategory, selectedTag, false)">Register Test</v-btn>
              <span>"Test name" and "Number of Words" fields are required.</span>
            </v-tooltip>

            <v-tooltip top :disabled="!noRegister"
                      v-if="currentNumberOfTests < maxNumberOfTests">
              <v-btn color="primary" flat slot="activator" :disabled="noRegister"
                    @click="saveNewTest(testName, numberOfWords, selectedCategory, selectedTag, true)">Register &amp; Launch Test</v-btn>
              <span>"Test name" and "Number of Words" fields are required.</span>
            </v-tooltip>


          <v-tooltip top :disabled="!noLaunch">
             <v-btn color="primary" flat slot="activator"
                     :disabled="noLaunch" @click="launchTest(numberOfWords, selectedCategory, selectedTag)">Launch Test</v-btn>
              <span>"Number of Words" field is required</span>
          </v-tooltip>

          </v-card-actions>

        </v-card>

      </v-dialog>

      <quick-test></quick-test>

  </div>

</template>

<script>

  import QuickTest from '@/components/tests/QuickTest.vue';
  import cuid from 'cuid';
  import { eventBus } from '@/main.js';

  import { launchTestGlobal } from '@/utils/runTest';
  import { updateContainerLocal } from '@/utils/containers';



  export default {
    name: 'add-test',

    components: {
      'quick-test': QuickTest,
    },

    data: () => ({
      dialog: false,
      numberOfWords: '',
      selectedCategory: '',
      selectedTag: '',
      testName: '',
      valid: false,
    }),

    computed: {

      categories() {
        if (this.$store.getters.availableCategories) {
          return this.$store.getters.availableCategories;
        } else { return []; }
      },

      currentNumberOfTests() {
        if (this.$store.state.testsLocal.data_values) {
          return this.$store.state.testsLocal.data_values.length;
        } else { return []; }
      },


      maxNumberOfTests() { return this.$store.state.maxNumberOfTests; },

      noLaunch() {
        return !this.numberOfWords || isNaN(this.numberOfWords) || (this.numberOfWords < 1);
      },

      noRegister() {
        return ( this.noLaunch || !this.testName || this.testNameAlreadyUsed );
      },

      tags() { return this.$store.state.availableTags; },

      testNameAlreadyUsed() {
        let registeredTests = this.$store.state.testsLocal.data_values.slice();
        let registeredTestsNames = registeredTests.map(item => item.name);
        if (registeredTestsNames.indexOf(this.testName) > -1) { return true; }
        else { return false; }
      },

    },

    methods: {

      // CANCEL ADDING NEW TEST.
      cancel() {
        this.dialog = false;
        this.numberOfWords = '';
        this.selectedCategory = '';
        this.selectedTag = '';
        this.testName = '';
      },

      // LAUNCH TEST EITHER DIRECTLY FROM LAUNCH OR FROM SAVE & LAUNCH.
      launchTest(numberOfWords, selectedCategory, selectedTag) {
        let vm = this;
        launchTestGlobal(numberOfWords, selectedCategory, selectedTag, vm);
      },


      // SAVE NEW CUSTOM TEST.
      async saveNewTest(testName, numberOfWords, category, tag, launch) {
        try {
          if(launch) { this.launchTest(this.numberOfWords, this.selectedCategory, this.selectedTag); }
          let change = {
            newValue: { _id: cuid(), name: testName, numberOfWords: numberOfWords, category: category, tag: tag },
          };
          // Reset instance's data.
          await updateContainerLocal('tests', change, 'add');
          this.cancel();
        } catch (err) {
          console.log('err from saveNewTest', err);
          eventBus.$emit('messageUser', { message: "Something's wrong. Could not create this test.", type: 'error' });
        }


      },

    },          // END OF methods()

  }             // END OF EXPORT DEFAULT SCRIPT

</script>

<style lang="css" scoped>

.card-test-add {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.over {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 200px;
  height: 150px;
  margin: auto;
  background: #00ffae;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  text-align: center;
}

.over p {
  color: #333;
  font-size: 1.2rem;
}

.over span {
  position: absolute;
  top: 0;
  right: 15px;
  font-size: 2rem;
  cursor: pointer;
}

.button-launch div:hover {
  background: blue;
  color: blue;
}

.no-register{
  width: 100%;
  position: relative;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: deeppink;
  margin-bottom: 2rem;
}

.no-register p {
  font-size: 1.2rem;
  color: #fff;
}

.no-register p:first-child {
  margin-top: 1rem;
}



</style>
