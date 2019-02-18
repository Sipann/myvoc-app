<template lang="html">

  <div>

    <v-dialog persistent v-model="dialog"
              width="600" height="600">

        <v-btn color="primary" slot="activator">
          Add a Word
          <v-icon right dark>add_circle_outline</v-icon>
        </v-btn>

        <v-card>
          <v-card-title class="headline grey lighten-2" primary-title>Enter Details of New Word</v-card-title>
          <v-card-text>
            <v-form v-model="valid">
              <!-- English Word Field -->
              <v-text-field v-model="englishWord" required autofocus
                            label="English Word (Required)"></v-text-field>
              <!-- French Word Field -->
              <v-text-field v-model="frenchWord" required
                            label="French Word (Required)"></v-text-field>
              <!-- Category Fields -->
              <v-select :items="availableCategories"
                        v-model="selectedCategory"
                        label="Category"
                        @change="watchSelectedCategory"></v-select>
              <v-text-field v-if="enter_new_category"
                            v-model="newCategory"
                            label="Enter Name of Your New Category"></v-text-field>

              <!-- Tag Field -->
              <v-select :items="availableTags"
                        v-model="selectedTag"
                        label="Tag"></v-select>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-btn color="primary" flat @click="cancelAddWord">Cancel</v-btn>
            <v-btn color="primary" flat :disabled="noSave" @click="saveNewWord">Add Word</v-btn>
          </v-card-actions>

        </v-card>

    </v-dialog>

  </div>

</template>

<script>

import { eventBus } from '@/main.js';
import { saveNewWordQuery } from '@/utils/words';
import { updateContainerLocal } from '@/utils/containers';
import { getLocalDBInfo } from '@/utils/databases';

export default {
  name: 'add-word',

  data: () => ({
    dialog: false,
    englishWord: '',
    enter_new_category: false,
    frenchWord: '',
    newCategory: '',
    selectedCategory: 'None',
    selectedTag: 'Medium',
    selectedTag_standard: 'Medium',
    valid: false,

  }),

  computed: {

    availableCategories() {
      if (this.$store.getters.availableCategories) {
        if (this.$store.state.language === 'FR') {
          return ['Aucune', ...this.$store.getters.availableCategories, 'Nouvelle Catégorie'];
        } else {
          return ['None', ...this.$store.getters.availableCategories, 'New Category'];
        }
      } else { return []; }
    },

    availableTags() { return this.$store.getters.availableTags_locale; },

    language() { return this.$store.state.language; },

    noSave() { return (!this.englishWord || !this.frenchWord); },

  },      // END OF computed()

  methods: {

    cancelAddWord() {
      this.dialog = false;
      this.englishWord = '';
      this.frenchWord = '';
      this.selectedCategory = this.language === 'FR' ? 'Aucune' : 'None';
      this.selectedTag = 'Medium';
      this.enter_new_category = false;
    },


    async saveNewWord() {

      try {

        let finalCategory = this.newCategory ? this.newCategory : this.selectedCategory === 'Aucune' ? 'None' : this.selectedCategory;
        await saveNewWordQuery(this.englishWord, this.frenchWord, finalCategory, this.selectedTag, false);
        eventBus.$emit('messageUser', { message: '1 word has been successfully added!', type: 'success' });
        if (this.newCategory) {
          console.log('this.newCategory => calling updateContainerLocal');
          let change = {
            newValue: { _id: this.newCategory},
          };
          await updateContainerLocal('categories', change, 'add');
        }
      } catch (err) {
        eventBus.$emit('messageUser', { message: "Something's wrong. Could not save this word.", type: 'error' });
      } finally {
        // reset instance's data.
        this.cancelAddWord();
        getLocalDBInfo();
      }

    },  // END OF saveNewWord() method


    watchSelectedCategory() {
      if (this.selectedCategory === 'New Category' || this.selectedCategory === 'Nouvelle Catégorie') {
        this.enter_new_category = true;
      } else {
        this.enter_new_category = false;
        this.newCategory = '';
      }
    },


},      // END OF methods()


}
</script>

<style lang="css" scoped>
</style>
