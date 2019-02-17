import _ from 'lodash';
import { store } from './../store/store';
import { localDB } from './databases';

import { filterWordsQueryLimit } from '@/utils/words';

function launchTestGlobal(numberOfWords, selectedCategory, selectedTag, vm) {
  let selector = {};

  if ( (selectedCategory === '' && selectedTag === '') ) { selector = { type: 'word' }; }
  else if ( (selectedCategory !== '') && (selectedTag === '') ) { selector = { type: 'word', category: selectedCategory }; }
  else if ( (selectedCategory === '') && (selectedTag !== '') ) { selector = { type: 'word', tag: selectedTag };}
  else if ( (selectedCategory !== '') && (selectedTag !== '') ) { selector = { type: 'word', category: selectedCategory, tag: selectedTag }; }
  else { console.log('unanticipated choice'); }
  testFilter(numberOfWords, selector, vm);

}   // END OF launchTestGlobal()


async function testFilter(numberOfWords, selector, vm) {
  // @TODO skip random plutôt que 0 ?
  let listWords = await filterWordsQueryLimit(selector, numberOfWords, 0);
  listWords = _.shuffle(listWords);
  dispatchTestList(listWords, numberOfWords, vm);
}     // END OF testFilter()


function dispatchTestList(listWords, numberOfWords, vm) {
  console.log('listWords from dispatchTestList', listWords);
  let warningLackWords = '';
  if (listWords.length === 0) {         // no matching word for this test
    console.log('listWords is empty');
    if (store.state.vocLength === 0) {
      warningLackWords = 'Your vocabulary list is empty! Please enter some words or expressions.';
    } else {
      warningLackWords = `Oops... No word meets your request. You should enlarge your criteria.`;
    }
    // @TODO => disclose warning alert to user
  } else {                                              // sends back some words...
    let listWordsForTest = listWords;
    if (listWords.length < numberOfWords) {             // ...but not enough
      warningLackWords = warningAvailable(listWords, numberOfWords);
      store.dispatch('TOGGLE_TEST_RUNNING', { listWordsForTest, warningLackWords });
    } else {                                    // ... just fine: listWords.length == numberOfWords
      store.dispatch('TOGGLE_TEST_RUNNING', { listWordsForTest });
    }
    clearFields(vm);
  }

}   // END OF dispatchTestList()



///// UTILS

function clearFields(vm) {
  // reset instance's data
  vm.dialog = false;
  vm.numberOfWords = '';
  vm.selectedCategory = '';
  vm.selectedTag = '';
  vm.testName = '';
}

function warningAvailable(listWords, numberOfWords) {
  let listWordsSentence = listWords.length === 1 ? `${listWords.length} meets` : `${listWords.length} meet`;
  let numberOfWordsSentence = numberOfWords === 1 ? `${numberOfWords} word` : `${numberOfWords} words`;
  let warningLackWords = `Just so you know... You asked for ${numberOfWordsSentence} but only ${listWordsSentence} your criteria. Your test might be a little shorter than expected...`;
  return warningLackWords;
}




export {
  launchTestGlobal,
};




//
