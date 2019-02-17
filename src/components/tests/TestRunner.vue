<template lang="html">

  <div class="test-runner">

    <div v-for="word in testContent">

      <div v-if="is_test_over" class="test-over">
        <div class="test-over-title">
          <h2>Well Done!</h2>
        </div>
        <div class="test-over-content">
          <p>You have been tested on {{ wordsListLength }} words and/or expressions.</p>
          <div class="test-over-anim"></div>
          <p>Keep Up the Good Work!</p>
        </div>
        <div class="test-over-buttons">
          <v-btn @click="endGame($event, true)" content-class="button-text">
            Go Back to Dashboard
            <i class="material-icons">home</i>
          </v-btn>
          <v-btn @click="endGame">
            Start again this Test
            <i class="material-icons">loop</i>
          </v-btn>
        </div>
      </div>

      <div v-if="(question_index === word.position) && (question_index < testContent.length) && !is_test_over" class="test-content">

        <div>
          <v-tooltip left>
            <v-icon slot="activator" right @click="exitTest">close</v-icon>
            <span>Exit</span>
          </v-tooltip>
        </div>

        <div v-if="question_index == 0">
          {{ testWarning }}
        </div>


        <!-- Actions Buttons -->
        <div class="tools">

          <v-btn :disabled="is_editing" color="primary"
                 @click="nextWord(word)">{{ labelNext }}</v-btn>

          <v-btn :color="word.tag == 'Low' ? 'pink lighten-1' : 'purple darken-1'"
                @click="changeTag(word, 'Low')">{{ tagLow_locale }}</v-btn>

          <v-btn :color="word.tag == 'Medium' ? 'pink lighten-1' : 'purple darken-1'"
                @click="changeTag(word, 'Medium')">Medium</v-btn>

          <v-btn :color="word.tag == 'High' ? 'pink lighten-1' : 'purple darken-1'"
                @click="changeTag(word, 'High')">{{ tagHigh_locale }}</v-btn>
                </div>

          <div class="">

            <v-btn v-if="is_question" color="primary"
                     @click="checkWord">Check</v-btn>

            <v-btn v-else color="primary"
                   :disabled="valueNotChanged"
                   @click="editWord(word)">{{ editWordLabel }}</v-btn>
          </div>

        <!-- English Word Field -->
        <v-text-field v-if="!is_editing" disabled
                      :value="word.english"></v-text-field>
        <v-text-field v-if="is_editing"
                      v-model="englishWord"
                      label="English"></v-text-field>

        <!-- Displays answer -->
        <div v-if="!is_question">

          <!-- French Word Field -->
          <v-text-field v-if="!is_editing" disabled
                        :value="word.french"></v-text-field>
          <v-text-field v-if="is_editing"
                        v-model="frenchWord"
                        label="French"></v-text-field>

          <!-- Category Field -->
          <v-text-field v-if="!is_editing" disabled
                        :value="word.category"></v-text-field>
          <v-select v-if="is_editing"
                    :items="availableCategories"
                    v-model="selectedCategory"
                    @change="watchSelectedCategory"></v-select>
          <v-text-field v-if="enter_new_category"
                        v-model="newCategory"
                        label="Name of New Category"></v-text-field>

          <!-- Action on Editing Only -->
          <v-btn v-if="is_editing"
                 @click="cancelEditWord">Cancel Edit Word</v-btn>

        </div>  <!-- END div v-if="!is_question" -->

      </div>

    </div>  <!-- div v-for="word in testContent" -->

  </div>

</template>

<script>

  import { eventBus } from '@/main.js';
  import { modifyWordQuery, updateChangesTracker2 } from '@/utils/words';
  import { updateContainerLocal } from '@/utils/containers';


  export default {
    name: 'test-runner',

    data: () => ({
      editWordLabel: 'Edit Word',
      enter_new_category: false,
      englishWord: '',
      frenchWord: '',
      is_editing: false,
      is_question: true,
      is_test_over: false,
      newCategory: '',
      question_index: 0,
      selectedCategory: '',
      selectedTag: '',

      // initial: {},
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

      availableTags() { return this.$store.state.availableTags; },

      finalCategory() {
        return this.selectedCategory === 'New Category' ? this.newCategory : this.selectedCategory;
      },

      labelNext() {
        if (this.question_index < this.wordsListLength-1) { return 'Next'; }
        else if (this.question_index == this.wordsListLength-1) { return 'Finish'; }
        else { console.log('unanticipated choice'); }
      },

      tagLow_locale() {
        if (this.$store.state.language === 'FR') { return 'Faible'; } else { return 'Low'; };
      },

      tagHigh_locale() {
        if (this.$store.state.language === 'FR') { return 'Fréquent'; } else { return 'High'; }
      },

      testContent() { return this.$store.state.testContent; },

      testWarning() { return this.$store.state.testWarning; },

      valueNotChanged() {
        return (
          (this.editWordLabel === 'Save Changes') &&
          (this.englishWord === this.$store.state.testContent[this.question_index].english) &&
          (this.frenchWord === this.$store.state.testContent[this.question_index].french) &&
          (this.selectedCategory === this.$store.state.testContent[this.question_index].category)
        );
      },

      wordsListLength() { return this.$store.state.testContent.length; },


    },        // END OF computed()

    methods: {

      // CANCEL EDITING WORD.
      cancelEditWord() {
        this.is_editing = false;
        this.editWordLabel = 'Edit Word';
      },

      // CHANGE TAG FROM TOP OF TEST CARD.
      async changeTag(word, newTag) {
        try {
          let updatedWord = await modifyWordQuery(word, word.english, word.french, word.category, newTag, word.tested);
          console.log('updatedWord', updatedWord);
          if (updatedWord.ok === true) {
            // track change.
            updateChangesTracker2(word._id, 'edit');

            // update $store for UI.
            this.$store.commit('EDIT_TAG', { index: word.position, tag: newTag });
          }
        } catch (err) {
          console.log('err from changeTag', err);
          eventBus.$emit('messageUser', { message: "Something's wrong. Could not update this word.", type: 'error' });
        };
      },

      // GOING THROUGH THE TEST => DISPLAYS ANSWER.
      checkWord: function() {
        this.is_question = false;
      },

      // RESET UI FIELDS OF CARD.
      clearFields: function() {
        this.editWordLabel = 'Edit Word';
        this.enter_new_category = false;
        this.is_question = true;
        this.is_editing = false;
        this.newCategory = '';
      },

      // EDIT WORD
      editWord: function(word) {
        if (this.is_editing == false) {
          this.is_editing = true;
          this.editWordLabel = 'Save Changes';
          this.englishWord = word.english;
          this.frenchWord = word.french;
          this.selectedCategory = word.category;
          this.selectedTag = word.tag;
        } else {
          this.updateWord(word);
        }
      },   // END OF editWord() method


      // END GAME => SAVE TEST HISTORY & GET OUT.
      async endGame($event, dashboard) {

        try {
          // RECORD TEST IN HISTORYLOCAL.
          let day = new Date();
          let cleanDay = day.toDateString();
          let change = {
            newValue: {
              date: Date.now(),
              cleanDay: cleanDay,
              numberOfWords: this.testContent.length,
            },
          };
          await updateContainerLocal('history', change, 'add');

          // GO BACK TO DASHBOARD OR BACK TO BEGINNING OF TEST.
          if (dashboard) {  this.$store.dispatch('TOGGLE_TEST_RUNNING'); }

        } catch (err) {
          console.log('error from endGame', err);
          eventBus.$emit('messageUser', { message: "Something's wrong. Could not end this game.", type: 'error' });

        } finally {
          // RESET INSTANCE'S DATA.
          this.is_question = true;
          this.is_test_over = false;
          this.question_index = 0;
        }

      },    // END OF endGame() method


      // EXIT TEST BEFORE IT ENDS WITH CLOSE BUTTON.
      exitTest: function() {
        // reset instance's data
        this.is_question = true;
        this.is_test_over = false;
        this.question_index = 0;
        this.$store.dispatch('TOGGLE_TEST_RUNNING');
      }, // END OF exitTest()


      // GOING THROUGH THE TEST.
      async nextWord (word) {

        try {
          // ADD WORD TO TESTEDLOCAL IF NEEDED.
          let alreadyTestedWords = this.$store.state.testedLocal.data_values.slice();
          let index = alreadyTestedWords.findIndex(item => item._id == word._id);
          if (index < 0) {
            // word had never been tested before - update tested container.
            let change = { newValue: { _id: word._id } };
            await updateContainerLocal('tested', change, 'add');
          }

          // THEN GO TO NEXT WORD OR TO FINAL BOARD
          if (word.position === this.testContent.length - 1) { this.is_test_over = true; }
          else { this.question_index += 1; }

        } catch (err) {
          console.log('error from nextWord method', err);
          eventBus.$emit('messageUser', { message: "Something's wrong. Could not go to next word.", type: 'error' });

        } finally {
          // RESET INSTANCE'S DATA.
          this.clearFields();
        }
      },    // END OF nextWord()


      async updateWord (word) {
        console.log('word from updateWord', word);

        try {

          let updatedWord = await modifyWordQuery(word, this.englishWord, this.frenchWord, this.finalCategory, this.selectedTag, true);
          console.log('updatedWord', updatedWord);

          if (updatedWord.ok === true) {
            // track change.
            updateChangesTracker2(word._id, 'edit');

            // update $store for UI.
            this.$store.commit('EDIT_WORD', {
              target: { _id: updatedWord.id, _rev: updatedWord.rev },
              english: this.englishWord,
              french: this.frenchWord,
              category: this.finalCategory,
              tag: this.selectedTag,
              position: word.position,
              tested: true });

            // add new category if needed.
            if (this.selectedCategory === 'New Category') {
              let change = { newValue: { _id: this.newCategory } };
              updateContainerLocal('categories', change, 'add');
            }

          }

        } catch (err) {
            console.log('err from updateWord', err);
            eventBus.$emit('messageUser', { message: "Something's wrong. Could not update this word.", type: 'error' });

        } finally {
          // reset instance's data
          this.is_editing = false;
          this.editWordLabel = 'Edit Word';
          this.selectedCategory = this.newCategory ? this.newCategory : this.selectedCategory;
          this.enter_new_category = false;
        }
      },    // END OF updateWord() method


      // EDIT WORD FROM TEST CARD => ALLOWS USER TO ENTER A NEW CATEGORY.
      watchSelectedCategory: function() {
        if (this.selectedCategory === 'New Category') { this.enter_new_category = true; }
        else { this.enter_new_category = false; }
      },   // END OF watchSelectedCategory() method


    }     // END OF METHODS

  }       // END OF EXPORT DEFAULT SCRIPT


</script>

<style lang="css" scoped>

.test-runner {
  width: 100%;
  height: 100%;
  z-index: 100;
  background: rgba(0, 0, 0, 0.4);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.test-content,
.test-over {
  background: #ccc;
  border: 1px solid deeppink;
  width: 40%;
  height: 75%;
  position: absolute;
  margin: auto;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.test-content {
  padding: 20px;
}

.new_category {
  width: 50%;
  height: 50%;
  z-index: 200;
  background: rgba(0,0,0,0.4);
  position: fixed;
  top: 50%;
  left: 50%;
}

.new-category-content {
  padding: 20px;
  border: 1px solid black;
  width: 100%;
  height: 100%;
  position: absolute;
  margin: auto;
}

.test-over {
  display: flex;
  flex-direction: column;
}

.test-over .test-over-title {
  margin-bottom: auto;
  width: 100%;
  background: deeppink;
  text-transform: uppercase;
  text-align: center;
  padding: 1rem;
}

.test-over .test-over-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

.test-over .test-over-content p:first-child{
  font-size: 1.3rem;
}

.test-over .test-over-content p:last-child{
  animation: textDisplay .4s .5s forwards;
  font-size: 1.3rem;
}

@keyframes textDisplay {
  0% { opacity: 0; }
}

.test-over .test-over-anim {
  width: 100px;
  height: 100px;
  background: url('../../assets/anim-sprite.png');
  animation: play .6s steps(10);
}

@keyframes play {
  from { background-position: 0px; }
  to { background-position: -1000px; }
}

.test-over .test-over-buttons {
  margin-bottom: top;
  /* background: orange; */
  text-align: center;
}

.test-over i.material-icons {
  margin-left: 1rem;
}

.button-text {
  font-size: 1.5rem;
}


</style>
