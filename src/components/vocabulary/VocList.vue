<template lang="html">

    <div class="inside-container">

      <div class="filters">
        <v-select :items="categories"
                  v-model="filterCategory"></v-select>
        <v-select :items="tags"
                  v-model="filterTag"></v-select>
        <v-btn @click="filterList">Filter</v-btn>
      </div>

      <div class="update-multiple">
        <v-select :items="categoriesForUpdate" @change="watchSelectedCategory"
                  v-model="updateCategory"></v-select>

        <v-dialog v-model="enter_new_category" persistent width="600" height="400" v-if="enter_new_category">
          <v-card>
            <v-card-title primary-title>Enter New Category</v-card-title>
            <v-card-text>
              <v-text-field label="Enter New Category" v-model="newCategory"></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" flat @click="cancelNewCat">Cancel</v-btn>
              <v-btn color="primary" flat @click="saveNewCat">Add Category</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>


        <v-select :items="tags"
                  v-model="updateTag"></v-select>

        <v-btn @click = "updateList"
              :disabled="noUpdate">Apply Changes To All Selected</v-btn>
      </div>


      <div class="paginate">
        <v-btn @click="previousPage" :disabled="pageNumber==0">Previous</v-btn>
        <ul>
          <li v-for="n in pageCount" :key="n"
              @click="targetPage(n)"
              :class="{current: pageNumber == n-1}">page {{n}}</li>
        </ul>
        <v-btn @click="nextPage" :disabled="pageNumber >= pageCount - 1">Next</v-btn>
      </div>


      <v-list>

        <v-list-tile>
          <div class="myrow">
            <v-tooltip top class="checkbox">

              <v-checkbox v-model="checkedAll" slot="activator" @change="selection"></v-checkbox>
              <span v-if="checkedAll">Unselect All</span>
              <span v-else>Select All</span>
            </v-tooltip>
            <p>English</p>
            <p>French</p>
            <p>Category</p>
            <p>Tag</p>
            <p>Already Tested?</p>
            <p class="edit-dialog">Edit</p>
            <p class="delete-dialog">Delete</p>
          </div>
        </v-list-tile>


        <v-list-tile v-for="word in filteredList"
                     v-bind:key="word._id">
          <new-voc-row :item="word"></new-voc-row>
        </v-list-tile>

      </v-list>

    </div>

</template>

<script>

  import VocRow from '@/components/vocabulary/VocRow.vue';

  import { eventBus } from '@/main.js';
  import { filterWordsQueryLimit } from '@/utils/words';
  import { updateContainerLocal } from '@/utils/containers';

  export default {
    name: 'voc-list',

    components: {
      'new-voc-row': VocRow,
    },

    data: () => ({

      checkedAll: false,
      enter_new_category: false,
      filterCategory: 'All Categories',
      filteredList: [],
      filterTag: 'All Tags',
      newCategory: '',
      pageNumber: 0,
      selectedWords: [],
      size: 10,
      updateCategory: 'All Categories',
      updateTag: 'All Tags',

    }),


    computed: {

      categories() {
        if (this.$store.getters.availableCategories) {
          if (this.$store.state.language === 'FR') {
            return ['Toutes les Catégories', ...this.$store.getters.availableCategories, 'Aucune'];
          } else {
            return ['All Categories', ...this.$store.getters.availableCategories, 'None'];
          }
        } else { return []; }

      },

      categoriesForUpdate() {
        if (this.$store.getters.availableCategories) {
          if (this.$store.state.language == 'FR') {
            return ['Toutes les Catégories', ...this.$store.getters.availableCategories, 'Nouvelle Catégorie'];
          } else {
            return ['All Categories', ...this.$store.getters.availableCategories, 'New Category'];
          }
        } else { return []; }
      },

      tags() { return ['All Tags', ...this.$store.state.availableTags]; },

      noUpdate() {
        return (
          (this.updateCategory === 'All Categories' && this.updateTag === 'All Tags') ||
          (this.selectedWords.length === 0)
        );
      },

      pageCount() {
        return Math.ceil(this.filteredList.length / this.size);
      },
      // paginatedData() { return this.displayed_list.slice(this.pageNumber*this.size, this.pageNumber*this.size + this.size); },

    },

    created() {

      this.filterList();

      eventBus.$on('updatedList', () => { this.filterList() });

      eventBus.$on('selectWord', (data) => {
        this.selectedWords.push(data);
        this.checkedAll = this.selectedWords.length === this.filteredList.length;
      });

      eventBus.$on('unselectWord', (data) => {
        this.selectedWords.splice(this.selectedWords.indexOf(data), 1);
        this.checkedAll = false;
      });
    },

    methods: {

      cancelNewCat() {
        this.updateCategory = 'All Categories';
        this.newCategory = '';
        this.enter_new_category = false;
      },

      async saveNewCat() {
        let change = { newValue: { _id: this.newCategory} };
        await updateContainerLocal('categories', change, 'add');
        this.cancelNewCat();
      },

      targetPage(n) {
        this.pageNumber = n - 1;
        this.checkedAll = false;
        this.filterList();
      },

      previousPage() {
        this.pageNumber--;
        this.checkedAll = false;
        this.filterList();
      },

      nextPage() {
        this.pageNumber++;
        this.checkedAll = false;
        this.filterList();
      },

      selection() {
        if (this.checkedAll === true) {
          eventBus.$emit('selectAll');
          this.selectedWords = [];
          this.filteredList.forEach(item => {
            this.selectedWords.push(item);
          });
        } else {
          eventBus.$emit('unselectAll');
          this.selectedWords = [];
        }
      },   // END OF selection() method.


      async updateList() {

        let bulkList = [];

        for (let i=0; i<this.selectedWords.length; i++) {
          bulkList.push({
            _id: this.selectedWords[i]._id,
            _rev: this.selectedWords[i]._rev,
            category: this.updateCategory === 'All Categories' ? this.selectedWords[i].category : this.updateCategory,
            english: this.selectedWords[i].english,
            french: this.selectedWords[i].french,
            tag: this.updateTag === 'All Tags' ? this.selectedWords[i].tag: this.updateTag,
            type: 'word',
            tested: this.selectedWords[i].tested,
          });
        }
        try {
          let modifyList = await this.localDB.bulkDocs(bulkList);
          if (modifyList.every((response) => response.ok === true)) {
            bulkList.forEach(editedWord => {
              updateChangesTracker2(editedWord._id, 'edit');
            });
            this.filterList();
            // reset instance's data
            this.updateCategory = 'All Categories';
            this.updateTag = 'All Tags';
            eventBus.$emit('unselectAll');
          }
        } catch (err) { console.log('err from updateList', err); }

      },      // END OF updateList() method.


      watchSelectedCategory() {
        if (this.updateCategory === 'New Category') {
          this.enter_new_category = true;
        } else { this.enter_new_category = false; }
      },    // END OF watchSelectedCategory() method.


      async filterList() {
        let selector = {};
        if (this.filterCategory === 'All Categories' && this.filterTag === 'All Tags') { selector = { type: 'word' }; }
        else if (this.filterCategory !== 'All Categories' && this.filterTag !== 'All Tags') { selector = { type: 'word', category: this.filterCategory, tag: this.filterTag }; }
        else if (this.filterCategory !== 'All Categories' && this.filterTag === 'All Tags') { selector = { type: 'word', category: this.filterCategory }; }
        else if (this.filterCategory === 'All Categories' && this.filterTag !== 'All Tags') {  selector = { type: 'word', category: {$in: this.$store.getters.availableCategories}, tag: this.filterTag }; }

        else { console.log('unanticipated choice'); return; }

        let skip = this.pageNumber * this.size;

        let returnedList = await filterWordsQueryLimit(selector, this.size, skip);
        console.log('returnedList', returnedList);
        this.filteredList = returnedList;
      },

    },      // END OF METHODS.


  } // END OF EXPORT DEFAULT SCRIPT.

</script>

<style lang="css" scoped>


  .inside-container {
    width: 100%;
    margin-bottom: auto;
  }


  .update-multiple,
  .filters,
  .paginate {
    display: flex;
    align-items: center;
  }

  .filters,
  .update-multiple {
    justify-content: space-between;
  }

  .filters > *,
  .update-multiple > * {
    flex-basis: 30%;
    flex-grow: 0;
  }

  .myrow {
    width: 100%;
    display: flex;
    align-items: center;
  }

  .myrow > * {
    display: inline-block;
    margin-bottom: 0;
  }



  .myrow .checkbox {
    max-width: 30px;
  }

  .myrow p {
    flex-basis: 17%;
    font-weight: 700;
  }

  .myrow .checkbox,
  .myrow .edit-dialog,
  .myrow .delete-dialog {
    flex-basis: 5%;
  }

  .myrow p:nth-child(n+4) {
    text-align: center;
  }

  li {
    list-style-type: none;
    display: inline-block;
    margin-right: 1rem;
    cursor: pointer;
  }

  li.current {
    font-weight: bold;
  }






</style>
