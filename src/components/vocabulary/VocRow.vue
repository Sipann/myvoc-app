<template lang="html">

  <div class="myrow">

    <v-checkbox class="checkbox" v-model="checked" @change="changeSelectWord"></v-checkbox>
    <p class="p1">{{ item.english }}</p>
    <p class="p2">{{ item.french }}</p>
    <p class="p3">{{ item.category }}</p>
    <p class="p4">{{ item.tag }}</p>
    <p class="p5">{{ item.tested ? 'Yes' : 'Not Yet' }}</p>

    <v-dialog v-model="dialog" class="edit-dialog"  persistent
              :disabled="checked"
              width="600" height="600">
      <i class="material-icons" slot="activator" :class="{unactive: checked}"
         @click="openEditModal(item)">edit</i>

      <v-card>
        <v-card-title class="headline grey lighten-2"
                      primary-title>Update Details of This Word</v-card-title>

        <v-card-text>
          <v-form v-model="valid">
            <v-text-field v-model="english" required
                          label="English (required)"></v-text-field>
            <v-text-field v-model="french" required
                          label="French (required)"></v-text-field>
            <v-select v-model="selectedCategory" :items="categories"
                      @change="watchSelectedCategory"
                      label="Category"></v-select>
            <v-text-field v-if="enter_new_category"
                          v-model="newCategory"
                          label="Name of New Category"></v-text-field>
            <v-select v-model="selectedTag" :items="tags"
                      label="Tag"></v-select>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" flat
                @click="cancelEditModal">Cancel</v-btn>
          <v-btn color="primary" flat  slot="activator" :disabled="noSave"
                @click="editWord(item)">Save Changes</v-btn>
          <p v-if="error" class="error-message">Oops, looks like something wrong happened.</p>
        </v-card-actions>

      </v-card>
    </v-dialog>

    <v-dialog v-model="confirm" :disabled="checked"
              class="delete-dialog" content-class="confirm"
              width="250" height="180">
      <i class="material-icons" slot="activator"
        :class="{unactive: checked}" @click="openConfirmModal">delete_forever</i>
        <v-card>
          <v-card-title class="headline pink lighten-2" primary-title>Are you sure?</v-card-title>

          <v-card-text>
            <h3>This action can not be undone.</h3>
          </v-card-text>

          <v-card-actions>
            <v-btn color="primary" flat @click="cancelConfirmModal">Cancel</v-btn>
            <v-btn color="primary" flat slot="activator"
                  @click="deleteWord(item)">Delete</v-btn>
          </v-card-actions>
        </v-card>

    </v-dialog>

  </div>

</template>

<script>

  import { eventBus } from '@/main.js';
  import { updateContainerLocal } from '@/utils/containers';
  import { deleteWordQuery, modifyWordQuery, updateChangesTracker2 } from '@/utils/words';
  import { getLocalDBInfo } from '@/utils/databases';

  export default {
    name: 'voc-row',

    props: ['item'],

    data: () => ({
      _id: '',
      checked: false,
      confirm: false,
      dialog: false,
      english: '',
      enter_new_category: false,
      error: false,
      french: '',
      key: '',
      newCategory: '',
      selectedCategory: '',
      selectedTag: '',
      valid: false,
    }),

    computed: {

      categories() {
        if (this.$store.getters.availableCategories) {
          if (this.$store.state.language === 'FR') {
            return ['Aucune', ...this.$store.getters.availableCategories, 'Nouvelle Catégorie'];
          } else {
            return ['None', ...this.$store.getters.availableCategories, 'New Category'];
          }
        } else { return []; }
      },

      finalCategory() {
        return this.selectedCategory === 'New Category' ? this.newCategory : this.selectedCategory;
      },

      noSave() { return !this.english || !this.french || this.valueNotChanged; },

      tags() { return this.$store.state.availableTags; },

      valueNotChanged() {
        return (
        (this.english == this.item.english) &&
        (this.french == this.item.french) &&
        (this.selectedCategory == this.item.category) &&
        (this.selectedTag == this.item.tag));
      },

    },

    created() {
      eventBus.$on('unselectAll', () => { this.checked = false; });
      eventBus.$on('selectAll', () => { this.checked = true; });
    },


    methods: {

      cancelConfirmModal() { this.confirm = false; },

      // EDIT WORD => CANCEL EDITING.
      cancelEditModal() {
        this.dialog = false;
        this.english = '';
        this.french = '';
        this.selectedCategory = '';
        this.selectedTag = '';
        this.error = false;
      },

      changeSelectWord() {
        if (this.checked === true) { eventBus.$emit('selectWord', this.item); }
        else { eventBus.$emit('unselectWord', this.item); }
      },

      async deleteWord(word) {
        try {
          await deleteWordQuery(word);

          // UPDATE CHANGESTRACKER.
          updateChangesTracker2(word._id, 'delete');

          // DELETE WORD FROM TESTEDLOCAL IF NEEDED.
          let alreadyTestedWords = this.$store.state.testedLocal.data_values.slice();
          let index = alreadyTestedWords.findIndex(item => item._id == word._id);
          if (index > -1) {
            // word is in the list of tested words. Must be deleted.
            updateContainerLocal('tested', { target: word._id }, 'delete');
          }

          // fetch updated list to refresh UI.
          eventBus.$emit('updatedList');

          // get updated number of words.
          await getLocalDBInfo();

        } catch (err) {
          // console.log('err from deleteWord')
          eventBus.$emit('messageUser', { message: "Something's wrong. Could not delete this word.", type: 'error' });

        } finally {
          this.cancelConfirmModal();
        }
      },    // END OF deleteWord() method.


      async editWord(word) {

        try {

          let updatedWord = await modifyWordQuery(word, this.english, this.french, this.finalCategory, this.selectedTag, this.tested);

          if (updatedWord.ok === true) {
            // track change.
            updateChangesTracker2(word._id, 'edit');

            // add new category if needed.
            if (this.selectedCategory === 'New Category') {
              let change = { newValue: { _id: this.newCategory } };
              updateContainerLocal('categories', change, 'add');
            }

            // fetch updated list to refresh UI.
            eventBus.$emit('updatedList');
          }

        } catch (err) {
          console.log('err from editWord', err)
          eventBus.$emit('messageUser', { message: "Something's wrong. Could not update this word.", type: 'error' });

        } finally {
          this.cancelEditModal();
        }
      },    // END OF editWord() method

      // EDIT WORD => OPEN EDIT MODAL WITH FORMER INFO.
      openEditModal(item) {
          this._id = item._id;
          this.english = item.english;
          this.french = item.french;
          this.selectedCategory = item.category;
          this.selectedTag = item.tag;
          this.error = false;
      },   // END OF openEditModal() method.

      openConfirmModal() { this.confirm = true; },

      // EDIT WORD => ALLOWS USER TO ENTER A NEW CATEGORY.
      watchSelectedCategory() {
        if (this.selectedCategory === 'New Category') { this.enter_new_category = true; }
        else { this.enter_new_category = false; }
      },   // END OF watchSelectedCategory() method


    },      // END OF methods

  } // END OF export default script

</script>

<style lang="css" scoped>

.myrow {
  width: 100%;
  display: flex;
  align-items: center;
}

.myrow > * {
  display: inline-block;
  margin-bottom: 0;
}

.myrow .checkbox,
.myrow .edit-dialog,
.myrow .delete-dialog {
  flex-basis: 5%;
}

.myrow .checkbox {
  max-width: 30px;
  margin-bottom: .25rem;
}

.myrow p {
  flex-basis: 17%;
}

.myrow p:nth-child(n+4),
.myrow .edit-dialog,
.myrow .delete-dialog  {
  text-align: center;
}

.confirm .v-card__title {
  justify-content: center;
}

.confirm h3 {
  text-align: center;
}

.confirm .v-card__actions {
  justify-content: center;
}

i.material-icons {
  cursor: pointer;
}

i.unactive {
  color: #ddd;
  cursor: not-allowed;
}


</style>
