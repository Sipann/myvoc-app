import { store } from './../store/store';
import { localDB, remoteDB } from '@/utils/databases';
import { setWarnings } from '@/utils/toolList';
import cuid from 'cuid';

import PouchDB from 'pouchdb';
import findPlugin from "pouchdb-find";
PouchDB.plugin(findPlugin);


// fetch remote containerSync to check status of remote ahead.
async function checkRemoteAhead(subtype) {
  try {
    await refreshContainer(subtype);
    let storedContainerSync = await localDB.get(store.state[`${subtype}Sync`]._id);

    let remoteAhead = await compareRemoteAhead(storedContainerSync);
    if ( (remoteAhead.addedRemote.length > 0) || (remoteAhead.deletedRemote.length > 0) || (remoteAhead.editedRemote.length > 0) ) {
      store.commit(`REMOTE_AHEAD_${subtype}`, true);
    }
    return remoteAhead;

  } catch (err) { console.log(`err from checkRemoteAhead for subtype: ${subtype}`, err); }

}   // END OF checkRemoteAhead()


async function compareRemoteAhead(storedContainerSync) {
  let addedToSync = storedContainerSync.added.filter(item => item.comparedTo == store.state.toolLocal._id);
  let deletedToSync = storedContainerSync.deleted.filter(item => item.comparedTo == store.state.toolLocal._id);
  let editedToSync = storedContainerSync.edited.filter(item => item.comparedTo == store.state.toolLocal._id);
  return { addedRemote: addedToSync, deletedRemote: deletedToSync, editedRemote: editedToSync };
}   // END OF compareRemoteAhead()


async function createContainerSync(subtype) {
  try {
    let newContainerSync = {
      _id: cuid(),
      type: 'container',
      subtype: `${subtype}-sync`,
      added: [],
      deleted: [],
      edited: [],
      data_values: [],
    };

    let putContainerSync = await localDB.put(newContainerSync);
    let storedContainerSync = Object.assign({}, newContainerSync);
    storedContainerSync._rev = putContainerSync.rev;
    store.commit(`SET_SYNC_${subtype}`, storedContainerSync);

    return newContainerSync._id;

  } catch (err) { console.log('error from createContainerSync', err);  }

}     // END OF createContainerSync()

async function createContainerLocal(subtype) {
  try {
    let newContainerLocal = {
      _id: cuid(),
      type: 'container-local',
      subtype: `${subtype}-local`,
      added: [],
      edited: [],
      deleted: [],
      data_values: [],
    };

    let putContainerLocal = await localDB.put(newContainerLocal);
    if (putContainerLocal.ok === true) {
      let storedContainerLocal = Object.assign({}, newContainerLocal);
      storedContainerLocal._rev = putContainerLocal.rev;
      store.commit(`SET_LOCAL_${subtype}`, storedContainerLocal);
    }
  } catch (err) { console.log(`err from createContainerLocal for ${subtype}`, err); }
}

// subtype => "categories"
async function getContainerLocal(subtype) {
  try {
    let result_localDB = await localDB.find({
      selector: {  type: 'container-local', subtype: `${subtype}-local`, },
      use_index: 'index-containers',
    });

    if (result_localDB.docs.length < 1) { // 1st connection ever or with this tool. Did not find matching container - creating one.
      createContainerLocal(subtype);
    } else {
      // has already been connected with this tool. Found a matching container - Fetching it.
      let storedContainerLocal = result_localDB.docs[0];
      store.commit(`SET_LOCAL_${subtype}`, storedContainerLocal);
    }

  } catch (err) {
    console.log(`err from getContainerLocal for ${subtype}`, err);
  }

}     // END OF getContainerLocal()


async function getContainersSync(subtypes_ids) {
  try {
    await localDB.replicate.from(store.state.remoteDB, {
      doc_ids: subtypes_ids
    }).on('complete', function (info) {
      // console.log('replicate.from(remoteDB) for getContainersSync complete with info: ', info);
      storeContainersSync(subtypes_ids);
    }).on('error', function (err) { console.log('error from replicate.from(remoteDB) for getContainersRemote: ', err); });

  } catch (err) {
    console.log('error from getContainersRemote', err);
  }

}   // END OF getContainersSync()


async function initContainers(subtypes_ids) {
  try {
    for (let i=0; i<subtypes_ids.length; i++) {
      let containerSync = await localDB.get(subtypes_ids[i]);

      let searchTerm = '-sync';
      let indexOfFirst = containerSync.subtype.indexOf(searchTerm);
      let subtype = containerSync.subtype.substring(0, indexOfFirst);

      let dataRemote = containerSync.data_values.slice();
      let containerLocal = Object.assign({}, store.state[`${subtype}Local`]);
      resetContainerLocal(subtype, containerLocal, { allValuesLocal: dataRemote });
    }
  } catch (err) {
    console.log('error from initContainrs0', err);
  }
}   // END OF initContainers()


async function refreshContainer(subtype) {
  try {
    await localDB.replicate.from(store.state.remoteDB, {
      doc_ids: [store.state[`${subtype}Sync`]._id]
    }).on('complete', function (info) {
      // console.log(`replicate.from(remoteDB) for refreshContainer ${subtype}Sync complete with info: `, info);
      storeContainer(subtype);
    }).on('error', function (err) {
      console.log(`error from replicate.from(remoteDB) for refreshContainer ${subtype}Sync: `, err);
    });

  } catch (err) { console.log(`error from refreshContainer for ${subtype}Sync`, err); }

}   // END OF refreshContainer()


async function replicateContainers(subtype) {
  try {
    let containerLocal = await localDB.get(store.state[`${subtype}Local`]._id);
    let allValuesLocal = containerLocal.data_values.slice();
    let addedLocal = containerLocal.added.slice();
    let deletedLocal = containerLocal.deleted.slice();
    let editedLocal = containerLocal.edited.slice();

    let containerSync = await localDB.get(store.state[`${subtype}Sync`]._id);
    let allValuesRemote = containerSync.data_values.slice();
    let addedRemote = containerSync.added.slice();
    let addedToSync = addedRemote.filter(item => item.comparedTo == store.state.toolLocal._id);
    let deletedRemote = containerSync.deleted.slice();
    let deletedToSync = deletedRemote.filter(item => item.comparedTo == store.state.toolLocal._id);
    let editedRemote = containerSync.edited.slice();
    let editedToSync = editedRemote.filter(item => item.comparedTo == store.state.toolLocal._id);

    // update info from global on local.
    // return allValuesLocal post replicating from remoteDB.
    // return addedRemote, deletedRemote, editedRemote sans les warnings pour le current tool.
    let replicatedFrom = await replicateFrom(addedRemote, addedToSync, deletedRemote, deletedToSync, editedRemote, editedToSync, allValuesLocal);

    // update info from local on global.
    // return allValuesRemote, addedRemote, deletedRemote, editedRemote post replicating to remoteDB.
    let replicatedTo = await replicateTo(addedLocal, deletedLocal, editedLocal, allValuesRemote, replicatedFrom.addedRemote, replicatedFrom.deletedRemote, replicatedFrom.editedRemote);

    // update ContainerLocal
    await resetContainerLocal(subtype, containerLocal, replicatedFrom);


    // update ContainerSync after replicateFrom.
    await resetContainerSync(subtype, containerSync, replicatedTo);

    store.commit(`REMOTE_AHEAD_${subtype}`, false);

  } catch (err) { console.log('error from replicateContainers', err); }

}     // END OF replicateContainers()


async function replicateFrom(addedRemote, addedToSync, deletedRemote, deletedToSync, editedRemote, editedToSync, allValuesLocal) {
  try {
    // update data_values on containerLocal.
    addedToSync.forEach(addedItem => {
      allValuesLocal.push(addedItem.added);
    });
    deletedToSync.forEach(deletedItem => {
      allValuesLocal = allValuesLocal.filter(item => item._id != deletedItem.deleted);
    });
    editedToSync.forEach(editedItem => {
      let index = allValuesLocal.findIndex(item => item._id == editedItem.edited.newValue._id);
      if (index > -1) {
        allValuesLocal[index] = editedItem.edited.newValue;
      }
    });

    // reset warnings on containerSync.
    addedRemote = addedRemote.filter(item => item.comparedTo != store.state.toolLocal._id);
    deletedRemote = deletedRemote.filter(item => item.comparedTo != store.state.toolLocal._id);
    editedRemote = editedRemote.filter(item => item.comparedTo != store.state.toolLocal._id);

    return {
      allValuesLocal: allValuesLocal,
      addedRemote: addedRemote,
      deletedRemote: deletedRemote,
      editedRemote: editedRemote,
    };

  } catch (err) { console.log('error from replicateFrom', err); }

}   // END OF replicateFrom()


async function replicateTo(addedLocal, deletedLocal, editedLocal, allValuesRemote, addedRemote, deletedRemote, editedRemote, otherTools) {
  try {
    let allTools = store.state.toolList.data_values.slice();
    let otherTools = allTools.filter(tool => tool != store.state.toolLocal._id);

    // update data_values on containerSync.
    addedLocal.forEach(addedItem => {
      allValuesRemote.push(addedItem);
    });
    deletedLocal.forEach(deletedItem => {
      allValuesRemote = allValuesRemote.filter(item => item._id != deletedItem);
    });
    editedLocal.forEach(editedItem => {
      let index = allValuesRemote.findIndex(item => item._id == editedItem.newValue._id);
      allValuesRemote[index] = editedItem.newValue;
    });

    // set warnings on containerSync.
    otherTools.forEach(tool => {
      addedLocal.forEach(addedItem => {
        addedRemote.push({
          ahead: store.state.toolLocal._id,
          comparedTo: tool,
          added: addedItem,
        });
      });
    });
    otherTools.forEach(tool => {
      deletedLocal.forEach(deletedItem => {
        deletedRemote.push({
          ahead: store.state.toolLocal._id,
          comparedTo: tool,
          deleted: deletedItem,
        });
      });
    });
    otherTools.forEach(tool => {
      editedLocal.forEach(editedItem => {
        editedRemote.push({
          ahead: store.state.toolLocal._id,
          comparedTo: tool,
          edited: editedItem,
        });
      });
    });

    return { allValuesRemote: allValuesRemote, addedRemote: addedRemote, deletedRemote: deletedRemote, editedRemote: editedRemote };

  } catch (err) { console.log('error from replicateTo', err); }

}     // END OF replicateTo()


async function resetContainerLocal(subtype, containerLocal, replicatedFrom) {
  try {
    let updatedContainerLocal = {
      _id: containerLocal._id,
      _rev: containerLocal._rev,
      type: containerLocal.type,
      subtype: containerLocal.subtype,
      data_values: replicatedFrom.allValuesLocal,
      added: [],
      deleted: [],
      edited: [],
    };

    let putContainerLocal = await localDB.put(updatedContainerLocal);
    let storedContainerLocal = Object.assign({}, updatedContainerLocal);
    storedContainerLocal._rev = putContainerLocal.rev;
    store.dispatch(`SET_LOCAL_${subtype}`, storedContainerLocal);

  } catch(err) { console.log('error from resetContainerLocal', err); }

}     // END OF resetContainerLocal()


async function resetContainerSync(subtype, containerSync, replicatedTo) {
  try {
    let updatedContainerSync = {
      _id: containerSync._id,
      _rev: containerSync._rev,
      type: containerSync.type,
      subtype: containerSync.subtype,
      data_values: replicatedTo.allValuesRemote,
      added: replicatedTo.addedRemote,
      deleted: replicatedTo.deletedRemote,
      edited: replicatedTo.editedRemote,
    };

    let putContainerSync = await localDB.put(updatedContainerSync);
    let storedContainerSync = Object.assign({}, updatedContainerSync);
    storedContainerSync._rev = putContainerSync.rev;
    store.dispatch(`SET_SYNC_${subtype}`, storedContainerSync);

    let syncDB = await localDB.replicate.to(store.state.remoteDB, {
      filter: function (doc) { return doc.type == 'container' && doc.subtype == `${subtype}-sync`; },
    })
    // .on('complete', function (info) { console.log(`replicate.to(remoteDB) for ${subtype}-sync complete with info: `, info); })
    // .on('error', function (err) { console.log(`error from replicate.to(remoteDB) for ${subtype}-sync: `, err); });

  } catch (err) { console.log('error from resetContainerSync', err); }

}     // END OF resetContainerSync()


async function storeContainer(subtype) {
  try {
    let storedContainer = await localDB.get(store.state[`${subtype}Sync`]._id);
    store.commit(`SET_SYNC_${subtype}`, storedContainer);
  } catch (err) { console.log(`error from storeContainer ${subtype}Sync`); }
}     // END OF storeContainer()


async function storeContainersSync(subtypes_ids) {
  try {
    for (let i=0; i<subtypes_ids.length; i++) {
      let container = await localDB.get(subtypes_ids[i])
      let searchTerm = '-sync';
      let indexOfFirst = container.subtype.indexOf(searchTerm);
      let subtype = container.subtype.substring(0, indexOfFirst);
      store.commit(`SET_SYNC_${subtype}`, container);

      let remoteAhead = await compareRemoteAhead(container);
      if ( (remoteAhead.addedRemote.length > 0) ||
           (remoteAhead.deletedRemote.length > 0) ||
           (remoteAhead.editedRemote.length > 0) ) {
        if (store.state[`${subtype}RemoteAhead`] === false) { store.commit(`REMOTE_AHEAD_${subtype}`, true); }

      } else { store.commit(`REMOTE_AHEAD_${subtype}`, false); }
    }

  } catch (err) { console.log(`error from storeContainerSync for subtype: ${subtype}`, err)}

}   // END OF storeContainersSync()


// update only local container.
async function updateContainerLocal(subtype, change, action) {
  try {
    let containerLocal = Object.assign({}, store.state[`${subtype}Local`]);
    let allLocalValues = containerLocal.data_values.slice();
    let addedLocalValues = containerLocal.added.slice();
    let deletedLocalValues = containerLocal.deleted.slice();
    let editedLocalValues = containerLocal.edited.slice();

    switch (action) {
      case 'add':
        allLocalValues.push(change.newValue);
        if (store.state.username) { addedLocalValues.push(change.newValue); }
        break;

      case 'delete':
        allLocalValues = allLocalValues.filter(item => item._id != change.target);
        if (store.state.username) {
          if (addedLocalValues.findIndex(item => item._id == change.target) > -1) {
            // in case this value had been added and not synced yet.
            addedLocalValues = addedLocalValues.filter(item => item._id != change.target);
          } else {
            deletedLocalValues.push(change.target);
          }
        }
        break;

      case 'edit':
        let indexAll = allLocalValues.findIndex(item => item._id == change.target);
        allLocalValues[indexAll] = change.newValue;
        if (store.state.username) {
          let indexAdded = addedLocalValues.findIndex(item => item._id == change.target);
          if (indexAdded > -1) {
            // in case this value had been added and not synced yet.
            addedLocalValues[indexAdded] = change.newValue;
          } else {
            editedLocalValues.push({
              newValue: change.newValue,
              date: Date.now(),
            });
          }
        }
        break;

      default:
        console.log('unanticipated choice');
    }

    let updatedContainerLocal = {
      _id: containerLocal._id,
      _rev: containerLocal._rev,
      type: containerLocal.type,
      subtype: containerLocal.subtype,
      data_values: allLocalValues,
      added: addedLocalValues,
      deleted: deletedLocalValues,
      edited: editedLocalValues,
    };

    let putContainerLocal = await localDB.put(updatedContainerLocal);
    let storedContainerLocal = updatedContainerLocal;
    storedContainerLocal._rev = putContainerLocal.rev;
    store.dispatch(`SET_LOCAL_${subtype}`, storedContainerLocal);

  } catch(err) { console.log('error from updateContainers', err); }
}       // END OF updateContainerLocal()



export {
  checkRemoteAhead,
  createContainerSync,
  getContainerLocal,
  getContainersSync,
  initContainers,
  replicateContainers,
  resetContainerLocal,
  updateContainerLocal,
}
