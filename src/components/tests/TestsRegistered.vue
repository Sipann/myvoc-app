<template lang="html">

  <div class="card-test-registered">

    <div v-if="currentNumberOfTests > 0" class="display-tests">

      <v-tooltip right v-for='test in tests' content-class="tooltip" :key="test._id">

        <div slot="activator" color="#85dcba" class="test-registered">

            <div class="test-name">
              <button type="button" @click="launchTest(test.numberOfWords, test.category, test.tag)">{{ test.name }}</button>
            </div>

            <div class="test-btn-icons">

              <v-dialog v-model="dialog" right persistent
                        width="600" height="600">

                <i class="material-icons" slot="activator"
                  @click="openEditModal(test._id, test._rev, test.name, test.numberOfWords, test.category, test.tag)">edit</i>

                <v-card>

                    <v-card-title class="headline grey lighten-2" primary-title>Update Details of Your Test</v-card-title>

                    <v-card-text>
                      <v-form v-model="valid">
                        <v-text-field v-model="testName"
                                      label="Test Name (required)"
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
                      <v-btn color="primary" flat @click="cancelEditModal">Cancel</v-btn>
                      <v-btn color="primary" flat slot="activator" :disabled="noRegister"
                            @click="editTest()">Save Changes</v-btn>
                      <p v-if="error" class="error-message">Oops, looks like something wrong happened.</p>
                    </v-card-actions>

                </v-card>

              </v-dialog>

              <v-dialog v-model="confirm" class="delete-dialog" content-class="confirm" width="250" height="180">
                <i class="material-icons delete-test" slot="activator" @click="openConfirmModal(test)">delete_forever</i>
                <v-card>
                  <v-card-title class="headline pink lighten-2" primary-title>Are you sure?</v-card-title>
                  <v-card-text>
                    <h3>This action can not be undone.</h3>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" flat @click="cancelConfirmModal">Cancel</v-btn>
                    <v-btn color="primary" flat @click="deleteTest(test._id)">Delete</v-btn>
                  </v-card-actions>
                </v-card>

              </v-dialog>



            </div>

        </div>

        <ul>
          <li>{{ test.numberOfWords }} words</li>
          <li>category: "{{ test.category }}"</li>
          <li>tag: "{{ test.tag }}"</li>
        </ul>

      </v-tooltip>

    </div>

    <div v-else class="no-tests">
      <p>You can customize and save up to 5 tests.</p>
      <p>They will appear right here.</p>
      <p>You currently have no registered test.</p>
    </div>

  </div>

</template>

<script>

import { eventBus } from '@/main.js';
import { launchTestGlobal } from '@/utils/runTest';
import { updateContainerLocal } from '@/utils/containers';

export default {
  name: 'tests-registered',

  data: () => ({
    confirm: false,
    dialog: false,
    error: false,
    initialValues: {},
    numberOfWords: '',
    previousTestName: '',
    selectedCategory: '',
    selectedTag: '',
    test_id: '',
    test_rev: '',
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
      if (this.tests) { return this.tests.length; }
      else { return 0; }
    },

    noRegister() {
      return (
        (!this.numberOfWords) ||
        (isNaN(this.numberOfWords)) ||
        (this.numberOfWords < 1 ) ||
        (!this.testName) ||
        this.noUpdate
      )
    },

    noUpdate() {
      return (
        (this.testName === this.initialValues.testName) &&
        (this.numberOfWords === this.initialValues.numberOfWords) &&
        (this.selectedCategory === this.initialValues.selectedCategory) &&
        (this.selectedTag === this.initialValues.selectedTag)
      )
    },

    tags() { return this.$store.state.availableTags; },

    tests() { return this.$store.state.testsLocal.data_values; },

  },


  methods: {

    openConfirmModal(test) {
      this.testName = test.name;
      this.test_id = test._id;
      this.confirm = true;
    },

    cancelConfirmModal() {
      this.confirm = false;
      this.testName = '';
      this.test_id = '';
    },

    cancelEditModal() {
      // EDIT TEST => CANCEL EDITING.
      this.dialog = false;
      this.error = false;
      this.initialValues = {};
      this.numberOfWords = '';
      this.selectedCategory = '';
      this.selectedTag = '';
      this.testName = '';
      this.test_id = '';
    },

    async deleteTest() {

      try {
        await updateContainerLocal('tests', { target: this.test_id }, 'delete');

        this.confirm = false;
        this.testName = '';
        this.test_id = '';
      } catch (err) {
        eventBus.$emit('messageUser', { message: "Something's wrong. Could not delete this test.", type: 'error' });
      }
    },    // END OF deleteTest() method.


    async editTest() {
      try {


        let change = {
          // oldValue: this.previousTestName,
          target: this.test_id,
          newValue: { _id: this.test_id, name: this.testName, numberOfWords: this.numberOfWords, category: this.selectedCategory, tag: this.selectedTag },
        };

        let updatedTest = await updateContainerLocal('tests', change, 'edit');


        eventBus.$emit('messageUser', { message: "Your test has been updated.", type: 'success' });
      } catch(err) {
        eventBus.$emit('messageUser', { message: "Something's wrong. Could not update this test.", type: 'error' });
        console.log('err from editTest method', err);
      } finally { this.cancelEditModal(); }
    },      // END OF editTest() method.


    launchTest (numberOfWords, category, tag) {
      let vm = this;
      // console.log(`numberOfWords: ${numberOfWords} - category: ${category} - tag: ${tag}`);
      launchTestGlobal(numberOfWords, category, tag, vm);
    },



    // EDIT TEST => OPEN EDIT MODAL WITH FORMER INFO.
    openEditModal (test_id, test_rev, test_testName, test_numberOfWords, test_category, test_tag) {
      this.test_id = test_id;
      this.test_rev = test_rev;
      this.testName = test_testName;
      this.previousTestName = test_testName;
      this.numberOfWords = test_numberOfWords;
      this.selectedCategory = test_category;
      this.selectedTag = test_tag;
      this.initialValues = {
        testName: test_testName,
        numberOfWords: test_numberOfWords,
        selectedCategory: test_category,
        selectedTag: test_tag
      };
      this.error = false;
    },

  },          // END OF METHODS

}   // END OF EXPORT SCRIPT

</script>

<style lang="css" scoped>

.card-test-registered {
  height: 100%;
  width: 100%;
}

.display-tests {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: space-around;
}

.test-registered {
  margin-top: 10px;
  display: flex;
}

.test-name {
  font-size: 1.3rem;
  margin-left: 10px;
}

i.material-icons {
  font-size: 2rem;
}

.test-btn-icons {
  margin-top: auto;
  margin-bottom: auto;
  margin-left: auto;
  margin-right: 1.4rem;
  display: flex;
  justify-content: space-around;
}

.test-btn-icons div:first-child {
  margin-right: 16px;
  color: blue;
}

i.material-icons {
  font-size: 2.3rem;
  cursor: pointer;
}

.delete-test {
  display: inline-block;
  color: deeppink;
}

.error-message {
  display: inline-block;
  margin-left: auto;
  color: red;
}

.tooltip {
  max-width: 200px;
}

.no-tests {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: 100%;
}

.no-tests p {
  text-align: center;
  font-size: 1.3rem;
}

.no-tests p:first-child {
  padding: 1rem;
  padding-bottom: .5rem;
}

.no-tests p:last-child {
  font-size: 1.1rem;
  margin-top: auto;
  margin-bottom: 1.5rem;
}


</style>
