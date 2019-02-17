import Vue from 'vue';
import Vuex from 'vuex';

import * as getters from './getters';
import * as mutations from './mutations';
import * as actions from './actions';


Vue.use(Vuex);

export const store = new Vuex.Store({
  strict: true,

  state: {
    availableTags: ['Low', 'Medium', 'High'],
    categoriesLocal: {},
    categoriesSync: {},
    changesTracker: { added: [], deleted: [], edited: [] },
    comingFromRemote: false,
    email: '',
    historyLocal: {},
    historySync: {},
    initTool: false,
    isConnected: false,
    isLoggedIn: false,
    isTestRunning: false,
    language: 'EN',
    maxNumberOfTests: 125,
    categoriesRemoteAhead: false,
    historyRemoteAhead: false,
    remoteDB: '',
    subtypes: ['categories', 'history', 'tested', 'tests'],
    testedRemoteAhead: false,
    testsRemoteAhead: false,
    testContent: [],
    testedLocal: {},
    testedSync: {},
    testsLocal: {},
    testsSync: {},
    testWarning: '',
    toolList: {},
    toolLocal: {},
    username: '',
    vocLength: 0,

      // TBC
    // availableCategories: { data: [], _id: '', _rev: '' },
    // registered_tests: { data: [], _id: '', _rev: '' },
    // tested_count: { data: [], _id: '', _rev: '' },
    // tested_words: {},
    // testContentInitialValues: [],
    // trackerTests: { data: [], _id: '', _rev: '' },
    // vocabularyList: [],

  },

  getters,
  mutations,
  actions,
});


























//
