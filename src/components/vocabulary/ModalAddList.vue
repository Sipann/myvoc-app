<template lang="html">

  <div>

    <v-dialog persistent v-model="dialog"
              width="600" height="600">

      <v-btn color="primary" slot="activator">
        Import a List of Words
        <v-icon right dark>archive</v-icon>
      </v-btn>

      <v-card>

        <v-card-title class="headline grey lighten-2" primary-title>Browse to select your .txt file</v-card-title>

        <v-card-text>
          <v-form v-model="valid">
            <input @change="changeLabelInput" ref="inputHTML" type="file" name="file" id="file" class="inputfile" accept=".txt" />
            <label for="file">{{ labelInput }}</label>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" flat @click="cancelNewList">Cancel</v-btn>
          <v-btn color="primary" flat :disabled="noImport" @click="readNewList">Import List</v-btn>
        </v-card-actions>

      </v-card>

    </v-dialog>

  </div>

</template>

<script>

import cuid from 'cuid';
import { eventBus } from '@/main.js';

export default {
  name: 'add-list',

  data: () => ({
    dialog: false,
    file: {},
    labelInput: 'Choose a file',
    noFile: true,
    valid: false,
  }),

  computed: {

    noImport() {
      let fileSize = !this.file.size;
      let fileType = !(this.file.type == 'text/plain');
      let isFile = !this.file;   // useless
      let isUndefined = this.file === undefined;  // useless
      return (fileSize || isFile || isUndefined || fileType );
    }

  },

  methods: {

    // CANCEL IMPORT NEW LIST.
    cancelNewList() {
      this.dialog = false;
      this.file = {};
      this.labelInput = 'Choose a file';
      this.$refs.inputHTML.value = '';
    },

    // CHANGE LABEL ON BUTTON TO NAME OF ADDED FILE.
    changeLabelInput: function(e) {
      this.labelInput = e.srcElement.files[0].name;
      this.file = e.srcElement.files[0];
    },

    readNewList() {
      this.dialog = false;
      let vm = this;

      let file = this.file;
      if (file && file.type === 'text/plain') {
        // @TODO Allow for more type of files (.csv, xls ?)
        let reader = new FileReader();

        reader.readAsArrayBuffer(file);

        reader.onload = function (e) {
          let win1252decoder = new TextDecoder('windows-1252');
          let decodedString = win1252decoder.decode(e.srcElement.result);

          let decodedArray = [];

          decodedString.split(/\r\n|\r|\n/)
                      .forEach(line => {
                        let newItem = line.split('\t')
                        decodedArray.push(newItem);
                      });

          if (decodedArray.length > 0) {
            // @TODO Allow for no label line => then automatically put "english" for column 1 and "french" for column 2.
            // tick a checkbox => my file has not labels => if(decodedArray.length > 0 && nolabel) {...}

            let language1 = decodedArray[0][0];
            let language2 = decodedArray[0][1];
            let vocList = [];

            for (let i=1; i<decodedArray.length; i++) {
              if (decodedArray[i][0].length > 0) {
                let newWord = {
                  _id: cuid(),
                  type: 'word',
                  english: decodedArray[i][0],
                  french: decodedArray[i][1],
                  category: 'None',
                  tag: 'Medium',
                  tested: false
                };
                vocList.push(newWord);
              }
            }

            vm.saveNewList(vocList);

          }  // END OF if (decodedArray.length > 0)

        };    // END OF reader.onload

        reader.onerror = function(e) { console.log('e from error', e); };

      } else {      // if !(file && file.type === 'text/plain')
        // error message to user
        eventBus.$emit('message', 'error', 'No file found or not in .txt format');
        vm.labelInput = 'Choose a file';
        vm.file = {};
      }

    },      // END OF readNewList() method

    async saveNewList(vocList) {
      try {
        // update localDB
        let result = await this.localDB.bulkDocs(vocList);
        let sentence = vocList.length === 1 ? 'word has' : 'words have';
        eventBus.$emit('messageUser', { message: `${vocList.length} ${sentence} been successfully added!`, type: 'success' });
      } catch (err) {
        eventBus.$emit('messageUser', { message: "Something's wrong. Could not save this list of words", type: 'error' });
      } finally {
        // reset instance's data
        this.labelInput = 'Choose a file';
        this.file = {};
      }
    },    // END OF saveNewList() method

  },        // END OF methods()

}

</script>

<style lang="css" scoped>

.inputfile {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.inputfile + label {
  font-size: 1.25em;
  font-weight: 700;
  color: #fff;
  background-color: pink;
  padding: 0.5rem;
  border-radius: 5px;
  display: inline-block;
  min-width: 170px;
  text-align: center;
  cursor: pointer;
}

.inputfile:focus + label,
.inputfile + label:hover {
  background-color: deeppink;
}

.inputfile:focus + label {
  outline: 1px dotted #000;
  outline: -webkit-focus-ring-color auto 5px;
}

</style>
