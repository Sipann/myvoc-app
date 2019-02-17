import { store } from './../store/store';
import { localDB, remoteDB } from '@/utils/databases';
import { createContainerSync, getContainersSync } from '@/utils/containers';
import { getUserSession } from '@/utils/users';
import { resetChangesTracker } from '@/utils/words';

import cuid from 'cuid';

import PouchDB from 'pouchdb';
import findPlugin from "pouchdb-find";
PouchDB.plugin(findPlugin);


async function createToolList() {
  try {
    let subtypes = ['categories', 'history', 'tested', 'tests'];
    let subtypes_ids = [];
    for (let i=0; i<subtypes.length; i++) {
      let newContainerID = await createContainerSync(subtypes[i]);
      subtypes_ids.push(newContainerID);
    }

    let newToolList = {
      _id: cuid(),
      type: 'container',
      subtype: 'tool-list',
      containers: subtypes_ids,
      toolsAhead: [],
      data_values: [store.state.toolLocal._id],
      changes_values: [],
    };

    let putToolList = await localDB.put(newToolList);
    let storedToolList = Object.assign({}, newToolList);
    storedToolList._rev = putToolList.rev;
    store.commit('SET_TOOL_LIST', storedToolList);

  } catch (err) {}
}   // END OF createToolList()

async function createToolLocal() {
  console.log('enter createToolLocal');
  try {
    let newToolLocal = {
      _id: cuid(),
      username: '',
      email: '',
      type: 'container-local',
      subtype: 'tool-local'
    };

    let putToolLocal = await localDB.put(newToolLocal);
    if (putToolLocal.ok === true) {
      let storedToolLocal = Object.assign({}, newToolLocal);
      storedToolLocal._rev = putToolLocal.rev;
      store.commit('SET_TOOL_LOCAL', storedToolLocal);
      return storedToolLocal;
    }

  } catch (err) { console.log('err from createToolLocal', err); }
}   // END OF createToolLocal()



async function getToolList0(isOnline) {
  try {
    if (!isOnline) {
      // user is not connected. Must have used this tool already - can not use remote info.
      let result_localDB = await localDB.find({
        selector: { type: 'container', subtype: 'tool-list', },
        use_index: 'index-containers'
      });
      let storedToolList = result_localDB.docs[0];
      store.dispatch('SET_TOOL_LIST', storedToolList);

    } else {          // user isonline

      let syncToolList = await localDB.replicate.from(store.state.remoteDB, {
        filter: function(doc) { return doc.type == 'container' && doc.subtype == 'tool-list'; }
      });

      let toolListFromRemote = await localDB.find({
        selector: { type: 'container', subtype: 'tool-list' },
        use_index: 'index-containers'
      });

      if (toolListFromRemote.docs.length < 1) {
        // 1st connection ever - did not find a matching tool-list doc on remoteDB then on localDB, creating one
        // since 1st connection => must also create containers-sync
        let subtypes = ['categories', 'history', 'tested', 'tests'];
        let subtypes_ids = [];
        for (let i=0; i<subtypes.length; i++) {
          let newContainerID = await createContainerSync(subtypes[i]);
          subtypes_ids.push(newContainerID);
        }

        let newToolList = {
          _id: cuid(),
          type: 'container',
          subtype: 'tool-list',
          containers: subtypes_ids,
          toolsAhead: [],
          data_values: [store.state.toolLocal._id],
          changes_values: [],
        };

        let putToolList = await localDB.put(newToolList);
        let storedToolList = Object.assign({}, newToolList);
        storedToolList._rev = putToolList.rev;
        store.dispatch('SET_TOOL_LIST', storedToolList);

        let syncDB = await localDB.replicate.to(store.state.remoteDB, {
          filter: function (doc) { return doc.subtype != 'tool-local'; }
        });


      } else {  // !if (toolListFromRemote.docs[0].length
        // 1st connection with this tool => must update toolList before storing it OR has already been using this tool.

        let storedToolList = toolListFromRemote.docs[0];
        store.dispatch('SET_TOOL_LIST', storedToolList);

        // fetch containersSync from remote.
        let containers_ids = storedToolList.containers.slice();
        await getContainersSync(containers_ids);

        // check if toolLocal already registered in this toolList.
        let isToolLocalRegistered = storedToolList.data_values.indexOf(store.state.toolLocal._id);

        if (isToolLocalRegistered < 0) {
          // 1st connection with this tool - set state to warn App.vue.
          store.commit('INIT_TOOL', true);

          // update toolList per se.
          let newDataValues = store.state.toolList.data_values.slice();
          newDataValues.push(store.state.toolLocal._id);

          let updatedToolList = {
            _id: store.state.toolList._id,
            _rev: store.state.toolList._rev,
            type: 'container',
            subtype: 'tool-list',
            containers: store.state.toolList.containers,
            toolsAhead: store.state.toolList.toolsAhead,
            data_values: newDataValues,
            changes_values: store.state.toolList.changes_values,
          };

          await localDB.put(updatedToolList);
          storeToolList();
          await localDB.replicate.to(store.state.remoteDB, {
            filter: function(doc) { return doc.type == 'container' && doc.subtype == 'tool-list'; }
          });
        } // END OF if (isToolLocalRegistered.length < 0)

      }  // END OF // !if (toolListFromRemote.docs[0].length


    }   // END OF user is online

  } catch(err) { console.log('err from getToolList', err) };

}   // END OF getToolList0()

async function getToolList() {
  try {

    let syncToolList = await localDB.replicate.from(store.state.remoteDB, {
      filter: function(doc) { return doc.type == 'container' && doc.subtype == 'tool-list'; }
    });

    let toolListFromRemote = await localDB.find({
      selector: { type: 'container', subtype: 'tool-list' },
      use_index: 'index-containers'
    });

    // IF USER IS LOGGED IN THERE MUST BE A TOOLLIST ON REMOTE.
    let storedToolList = toolListFromRemote.docs[0];
    store.commit('SET_TOOL_LIST', storedToolList);

    let containers_ids = storedToolList.containers.slice();
    await getContainersSync(containers_ids);

    let isToolLocalRegistered = storedToolList.data_values.indexOf(store.state.toolLocal._id);

    if (isToolLocalRegistered < 0) {
      // 1st connection with this tool - set state to warn App.vue.
      store.commit('INIT_TOOL', true);
      let newDataValues = storedToolList.data_values.slice();
      newDataValues.push(store.state.toolLocal._id);

      let updatedToolList = {
        _id: storedToolList._id,
        _rev: storedToolList._rev,
        type: 'container',
        subtype: 'tool-list',
        containers: storedToolList.containers,
        toolsAhead: storedToolList.toolsAhead,
        data_values: newDataValues,
        changes_values: storedToolList.changes_values,
      };
      await localDB.put(updatedToolList);
      await localDB.replicate.to(store.state.remoteDB, {
        doc_ids: [storedToolList._id]
      }).on('complete', function (info) {
        storeToolList();
      }).on('error', function (err) {
        console.log('error from replicate.to(remoteDB) for getToolList', err);
      });
    }

  } catch (err) { console.log('err from getToolList', err); }
}   // END OF getToolList()


async function getToolLocal(username) {
  console.log('enter getToolLocal');
  try {
    let result_localDB = await localDB.find({
      selector: { type: 'container-local', subtype: 'tool-local', },
      use_index: 'index-containers'
    });

    if (result_localDB.docs.length < 1) {   // 1st connection ever or with this tool
      let storedToolLocal = createToolLocal();
      return storedToolLocal;

    } else { // already connected with this tool previously.
      let storedToolLocal = await result_localDB.docs[0];
      storeToolLocal(storedToolLocal);
      getUserSession(storedToolLocal.username);
      return storedToolLocal;
    }

  } catch(err) {
    console.log('err from getToolLocal', err);
  }

}   // END OF getToolLocal()

async function updateToolLocal(username, email) {
  try {
    let updatedToolLocal = {
      _id: store.state.toolLocal._id,
      _rev: store.state.toolLocal._rev,
      type: store.state.toolLocal.type,
      subtype: store.state.toolLocal.subtype,
      username: username,
      email: email,
    };

    let putToolLocal = await localDB.put(updatedToolLocal);
    let storedToolLocal = Object.assign({}, updatedToolLocal);
    storedToolLocal._rev = putToolLocal.rev;
    storeToolLocal(storedToolLocal);

  } catch(err) { console.log('err from refreshToolLocal', err); }
}   // END OF refreshToolLocal()

function storeToolLocal(toolLocal) {
  store.commit('SET_TOOL_LOCAL', toolLocal);
  if (toolLocal.username) {
    console.log('there is a username');
    store.commit('ADD_USER', toolLocal.username);
    store.commit('ADD_EMAIL', toolLocal.email);
    store.commit('ADD_REMOTEDB', `http://127.0.0.1:5984/myvoc-${toolLocal.username}`);
  } else { console.log('there is no username'); }
}

async function refreshToolList() {
  try {
    await localDB.replicate.from(store.state.remoteDB, {
      doc_ids: [store.state.toolList._id]
    }).on('complete', function (info) {
      // console.log('replicate.from(remoteDB) for refreshToolList complete with info: ', info);
      storeToolList();
    }).on('error', function (err) {
      console.log('error from replicate.from(remoteDB) for refreshToolList', err);
    });

  } catch (err) { console.log('error from refreshToolList', err); }

}     // END OF refreshToolList()



async function resetChangesValues(changesValues) {
  try {
    changesValues = changesValues.filter(item => item.comparedTo != store.state.toolLocal._id);
    return changesValues;
  } catch (err) { console.log('error from resetChangesValues', err); }
}   // END OF resetChangesValues()


async function resetEditedChanges(changesValues, editedOnLocal) {
  try {
    editedOnLocal.forEach(editedItem => {
        changesValues = changesValues.filter(item => item.editedWord != editedItem.word);
    });
    return changesValues;
  } catch (err) { console.log('error from resetEditedChanges', err); }
}   // END OF resetEditedChanges()


async function resetToolList(toolsAhead, changesValues) {
  try {
    let updatedToolList = {
      _id: store.state.toolList._id,
      _rev: store.state.toolList._rev,
      type: store.state.toolList.type,
      subtype: store.state.toolList.subtype,
      containers: store.state.toolList.containers,
      data_values: store.state.toolList.data_values,
      toolsAhead: toolsAhead,
      changes_values: changesValues,
    };


    await localDB.put(updatedToolList);
    await localDB.replicate.to(store.state.remoteDB, {
      doc_ids: [store.state.toolList._id]
    }).on('complete', function (info) {
      // console.log('replicate.to(remoteDB) complete for resetToolList with info - ', info);
      storeToolList();
    }).on('error', function (err) {
      console.log('error from replicate.to(remoteDB) for resetToolList: ', err);
    });

  } catch (err) { console.log('error from resetToolList', err); }

}     // END OF resetToolList()


async function resetToolsAhead(toolsAhead) {
  try {
    toolsAhead = toolsAhead.filter(item => item.comparedTo != store.state.toolLocal._id);
    return toolsAhead;
  } catch (err) { console.log('error from resetToolsAhead', err); }
}   // END OF resetToolsAhead()


async function setWarnings(localAhead, editConflicts) {
  try {
    let storedChangesTracker = Object.assign({}, store.state.changesTracker);
    let editedOnLocal = editConflicts.length > 0 ? editConflicts : storedChangesTracker.edited.slice();
    let deletedOnLocal = storedChangesTracker.deleted.slice();

    let storedToolList = Object.assign({}, store.state.toolList);
    let allTools = storedToolList.data_values.slice();
    let otherTools = allTools.filter(tool => tool != store.state.toolLocal._id);
    let toolsAhead = storedToolList.toolsAhead.slice();
    let changesValues = storedToolList.changes_values.slice();

    // toolList.toolsAhead.
    toolsAhead = await resetToolsAhead(toolsAhead);
    if (localAhead) {
      toolsAhead = await warningsToolsAhead(toolsAhead, otherTools);
    }

    // toolList.changes_values.
    changesValues = await resetChangesValues(changesValues);
    if (localAhead) {
      changesValues = await resetEditedChanges(changesValues, editedOnLocal);
      changesValues = await warningsChangesValues(changesValues, deletedOnLocal, editedOnLocal, otherTools)
    }

    await resetToolList(toolsAhead, changesValues);
    await resetChangesTracker();

  } catch (err) { console.log('error from setWarnings', err); }

}   // END OF setWarnings()


async function setWarningsDeleted(changesValues, deletedOnLocal, otherTools) {
  try {
    otherTools.forEach(tool => {
      deletedOnLocal.forEach(deletedWord => {
        changesValues.push({
          ahead: store.state.toolLocal._id,
          comparedTo: tool,
          deletedWord: deletedWord,
        });
      });
    });
    return changesValues;
  } catch (err) { console.log('error from setWarningsDelete', err); }
}   // END OF setWarningsDeleted()


async function setWarningsEdited(changesValues, editedOnLocal, otherTools) {
  try {
    otherTools.forEach(tool => {
      editedOnLocal.forEach(editedWord => {
        let isAlreadyWarnedAsBehind = changesValues.findIndex(item => {
          return item.ahead == store.state.toolLocal._id && item.comparedTo == tool && item.editedWord == editedWord._id;
        });
        if (isAlreadyWarnedAsBehind < 0) {  // no warning - set one.
          changesValues.push({
            ahead: store.state.toolLocal._id,
            comparedTo: tool,
            editedWord: editedWord._id,
            editedDate: editedWord.date,
          });
        } else {  // warning already set - change date.
          changesValues[isAlreadyWarnedAsBehind] = {
            ahead: store.state.toolLocal._id,
            comparedTo: tool,
            editedWord: editedWord._id,
            editedDate: Date.now(),
          };
        }
      });
    });
    return changesValues;

  } catch (err) { console.log('error from setWarningsEdited', err); }

}   // END OF setWarningsEdited()


async function storeToolList() {
  try {
    let storedToolList = await localDB.get(store.state.toolList._id);
    store.commit('SET_TOOL_LIST', storedToolList);
  } catch (err) { console.log('error from storeToolList', err); }
}   // END OF storeToolList()


async function warningsChangesValues(changesValues, deletedOnLocal, editedOnLocal, otherTools) {
  try {
    if (deletedOnLocal.length > 0) {
      changesValues = setWarningsDeleted(changesValues, deletedOnLocal, otherTools)
    }
    if (editedOnLocal.length > 0) {
      changesValues = setWarningsEdited(changesValues, editedOnLocal, otherTools);
    }
    return changesValues;
  } catch (err) { console.log('error from warningsChangesValues', err); }
}   // END OF warningsChangesValues()


async function warningsToolsAhead(toolsAhead, otherTools) {
  try {
    otherTools.forEach(tool => {
      let warningIsAlreadySet = toolsAhead.findIndex(item => {
        return item.ahead == store.state.toolLocal._id && item.comparedTo == tool;
      });
      if (warningIsAlreadySet < 0) {    // warning was not set - add it.
        toolsAhead.push({
          ahead: store.state.toolLocal._id,
          comparedTo: tool,
        });
      }
    });
    return toolsAhead;
  } catch (err) { console.log('error from warningsToolsAhead', err); }
}   // END OF warningsToolsAhead()



export {
  createToolList,
  getToolList,
  getToolLocal,
  refreshToolList,
  setWarnings,
  updateToolLocal,
}
