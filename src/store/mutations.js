const ADD_EMAIL = (state, payload) => {
  state.email = payload;
};

const ADD_USER = (state, payload) => {
  state.username = payload;
};

const ADD_REMOTEDB = (state, payload) => {
  state.remoteDB = payload;
};

const EDIT_TAG = (state, payload) => {
  // console.log('payload from EDIT_TAG', payload);
  state.testContent[payload.index].tag = payload.tag;
};

const EDIT_WORD = (state, payload) => {
  // console.log('payload from EDIT_WORD', payload);
  state.testContent[payload.position] = {
    _id: payload.target._id,
    _rev: payload.target._rev,
    category: payload.category,
    english: payload.english,
    french: payload.french,
    position: payload.position,
    tag: payload.tag,
    tested: true,
    type: 'word',
  };
};

const INIT_TOOL = (state, payload) => {
  // console.log('enter INIT_TOOL mutation with payload', payload);
  state.initTool = payload;
};

const IS_FROM_REMOTE = (state, payload) => {
  // console.log('enter IS_FROM_REMOTE mutation with payload: ', payload);
  state.comingFromRemote = payload;
};

const IS_LOGGEDIN = (state, payload) => {
  state.isLoggedIn = payload;
};

const IS_ONLINE = (state, payload) => {
  state.isConnected = payload;
};

const REMOTE_AHEAD_categories = (state, payload) => {
  // console.log('ENTER REMOTE_AHEAD_categories mutation with payload', payload);
  state.categoriesRemoteAhead = payload;
};

const REMOTE_AHEAD_history = (state, payload) => {
  // console.log('ENTER REMOTE_AHEAD_history mutation with payload', payload);
  state.historyRemoteAhead = payload;
};

const REMOTE_AHEAD_tested = (state, payload) => {
  // console.log('ENTER REMOTE_AHEAD_tested mutation with payload', payload);
  state.testedRemoteAhead = payload;
};

const REMOTE_AHEAD_tests = (state, payload) => {
  // console.log('ENTER REMOTE_AHEAD_tests mutation with payload', payload);
  state.testsRemoteAhead = payload;
};

const SET_CHANGES_TRACKER = (state, payload) => {
  // console.log('enter SET_CHANGES_TRACKER mutation with payload: ', payload);
  state.changesTracker = payload;
  // console.log('go out of SET_CHANGES_TRACKER mutation');
};

const SET_LOCAL_categories = (state, payload) => {
  // console.log('enter SET_LOCAL_categories mutation with payload', payload);
  state.categoriesLocal = payload;
};

const SET_LOCAL_history = (state, payload) => {
  // console.log('enter SET_LOCAL_history mutation with payload', payload);
  state.historyLocal = payload;
};

const SET_LOCAL_tested = (state, payload) => {
  // console.log('enter SET_LOCAL_tested mutation with payload', payload);
  state.testedLocal = payload;
};

const SET_LOCAL_tests = (state, payload) => {
  // console.log('enter SET_LOCAL_tests mutation with payload', payload);
  state.testsLocal = payload;
};

const SET_TOOL_LIST = (state, payload) => {
  state.toolList = payload;
};

const SET_TOOL_LOCAL = (state, payload) => {
  state.toolLocal = payload;
};

const SET_SYNC_categories = (state, payload) => {
  // console.log('enter SET_SYNC_categories mutation with payload', payload);
  state.categoriesSync = payload;
};

const SET_SYNC_history = (state, payload) => {
  // console.log('enter SET_SYNC_history mutation with payload', payload);
  state.historySync = payload;
};

const SET_SYNC_tested = (state, payload) => {
  // console.log('enter SET_SYNC_tested mutation with payload', payload);
  state.testedSync = payload;
};

const SET_SYNC_tests = (state, payload) => {
  // console.log('enter SET_SYNC_tests mutation with payload', payload);
  state.testsSync = payload;
};

const SET_VOC_LENGTH = (state, payload) => {
  state.vocLength = payload;
};

const SWITCH_LANGUAGE = (state, payload) => {
  state.language = state.language == 'EN' ? 'FR' : 'EN';
};

const TOGGLE_TEST_RUNNING = (state, payload) => {
  if (payload) {
    state.isTestRunning = true;
    let listOfWords = payload.listWordsForTest;
    for (let word of listOfWords) {
      let position = listOfWords.indexOf(word);
      word.position = position;
    }
    state.testContent = listOfWords;
    state.testWarning = payload.warningLackWords;
  } else {
    state.isTestRunning = false;
    state.testContent = [];
    state.testWarning = '';
  }
};





//// TBC

const SET_AVAILABLE_CATEGORIES = (state, payload) => {
  // console.log('enter SET_AVAILABLE_CATEGORIES mutation', payload);
  state.availableCategories = {
    data: payload.data_values,
    _id: payload._id,
    _rev: payload._rev,
  };
};

const SET_REGISTERED_TESTS = (state, payload) => {
  state.registered_tests.data = payload.data_values;
  state.registered_tests._id = payload._id;
  state.registered_tests._rev = payload._rev;
};


const SET_TRACKER_TESTS = (state, payload) => {
  state.trackerTests.data = payload.data_values;
  state.trackerTests._id = payload._id;
  state.trackerTests._rev = payload._rev;
};

const EDIT_ENGLISH = (state, payload) => {
  state.testContent[payload.index].english = payload.englishUpdated;
};

const EDIT_FRENCH = (state, payload) => {
  console.log('enter EDIT_FRENCH');
  state.testContent[payload.index].french = payload.frenchUpdated;
};

const EDIT_CATEGORY = (state, payload) => {
  state.testContent[payload.index].category = payload.selectedCategory;
}

const SET_TESTED_TRACKER = (state, payload) => {
  state.tested_count.data = payload.data_values;
  state.tested_count._id = payload._id;
  state.tested_count._rev = payload._rev;
};

const SET_VOCLIST = (state, payload) => {
  state.vocabularyList = payload;
};

const SET_TESTED_WORDS = (state, payload) => {
  // console.log('enter SET_TESTED_WORDS mutation with payload: ', payload);
  state.tested_words = payload;
};


export {
  ADD_EMAIL,
  ADD_USER,
  ADD_REMOTEDB,
  EDIT_TAG,
  EDIT_WORD,
  INIT_TOOL,
  IS_FROM_REMOTE,
  IS_LOGGEDIN,
  IS_ONLINE,
  REMOTE_AHEAD_categories,
  REMOTE_AHEAD_history,
  REMOTE_AHEAD_tested,
  REMOTE_AHEAD_tests,
  SET_CHANGES_TRACKER,
  SET_LOCAL_categories,
  SET_LOCAL_history,
  SET_LOCAL_tested,
  SET_LOCAL_tests,
  SET_TOOL_LIST,
  SET_TOOL_LOCAL,
  SET_SYNC_categories,
  SET_SYNC_history,
  SET_SYNC_tested,
  SET_SYNC_tests,
  SET_VOC_LENGTH,
  SWITCH_LANGUAGE,
  TOGGLE_TEST_RUNNING,


// TBC

  // SET_AVAILABLE_CATEGORIES,
  // SET_REGISTERED_TESTS,
  // SET_TRACKER_TESTS,
  //
  // SET_TESTED_WORDS,
  //
  // EDIT_ENGLISH,
  // EDIT_FRENCH,
  // EDIT_CATEGORY,
  // SET_TESTED_TRACKER,
  // SET_VOCLIST,
};
