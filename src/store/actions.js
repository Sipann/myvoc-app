
const SET_CHANGES_TRACKER = (context, payload) => {
  context.commit('SET_CHANGES_TRACKER', payload);
};

const SET_LOCAL_categories = (context, payload) => {
  // console.log('enter SET_LOCAL_categories action with payload', payload);
  context.commit('SET_LOCAL_categories', payload);
};

const SET_LOCAL_history = (context, payload) => {
  // console.log('enter SET_LOCAL_history action with payload', payload);
  context.commit('SET_LOCAL_history', payload);
};

const SET_LOCAL_tested = (context, payload) => {
  // console.log('enter SET_LOCAL_tested action with payload', payload);
  context.commit('SET_LOCAL_tested', payload);
};

const SET_LOCAL_tests = (context, payload) => {
  // console.log('enter SET_LOCAL_tests action with payload', payload);
  context.commit('SET_LOCAL_tests', payload);
};

const SET_SYNC_categories = (context, payload) => {
  // console.log('enter SET_SYNC_categories action with payload', payload);
  context.commit('SET_SYNC_categories', payload);
};

const SET_SYNC_history = (context, payload) => {
  // console.log('enter SET_SYNC_history action with payload', payload);
  context.commit('SET_SYNC_history', payload);
};

const SET_SYNC_tested = (context, payload) => {
  // console.log('enter SET_SYNC_tested action with payload', payload);
  context.commit('SET_SYNC_tested', payload);
};

const SET_SYNC_tests = (context, payload) => {
  // console.log('enter SET_SYNC_tests action with payload', payload);
  context.commit('SET_SYNC_tests', payload);
};

const SET_TOOL_LIST = (context, payload) => {
  context.commit('SET_TOOL_LIST', payload);
};

const SET_TOOL_LOCAL = (context, payload) => {
  context.commit('SET_TOOL_LOCAL', payload);
};

const TOGGLE_TEST_RUNNING = (context, payload) => {
  context.commit('TOGGLE_TEST_RUNNING', payload);
};



/// TBC

const SET_AVAILABLE_CATEGORIES = (context, payload) => {
  // console.log('enter action SET_AVAILABLE_CATEGORIES action');
  // console.log('payload sent', payload);
  context.commit('SET_AVAILABLE_CATEGORIES', payload);
};

const SET_REGISTERED_TESTS = (context, payload) => {
  context.commit('SET_REGISTERED_TESTS', payload);
};

const SET_TRACKER_TESTS = (context, payload) => {
  context.commit('SET_TRACKER_TESTS', payload);
};

const SET_TESTED_TRACKER = (context, payload) => {
  context.commit('SET_TESTED_TRACKER', payload);
};

const SET_VOCLIST = (context, payload) => {
  // console.log('enter action SET_VOCLIST');
  // console.log('payload from SET_VOCLIST', payload);
  context.commit('SET_VOCLIST', payload);
};

const SET_TESTED_WORDS = (context, payload) => {
  context.commit('SET_TESTED_WORDS', payload);
};



export {
  SET_CHANGES_TRACKER,
  SET_LOCAL_categories,
  SET_LOCAL_history,
  SET_LOCAL_tested,
  SET_LOCAL_tests,
  SET_SYNC_categories,
  SET_SYNC_history,
  SET_SYNC_tested,
  SET_SYNC_tests,
  SET_TOOL_LIST,
  SET_TOOL_LOCAL,
  TOGGLE_TEST_RUNNING,

  // TBC
  // SET_AVAILABLE_CATEGORIES,
  // SET_REGISTERED_TESTS,
  // SET_TRACKER_TESTS,
  // SET_TESTED_WORDS,
  // SET_TESTED_TRACKER,
  // SET_VOCLIST,
};
