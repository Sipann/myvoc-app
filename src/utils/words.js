import { store } from './../store/store';
import { localDB, remoteDB } from '@/utils/databases';
import { setWarnings } from '@/utils/toolList';
import cuid from 'cuid';

import PouchDB from 'pouchdb';
import findPlugin from "pouchdb-find";
PouchDB.plugin(findPlugin);


async function deleteWordQuery(word) {
  localDB.get(word._id)
        .then(function (doc) { return localDB.remove(doc); })
        .catch(function(err) { return err; });
}   // END OF deleteWordQuery()


async function filterWordsQueryLimit(selector, limit, skip) {
  try {
    let result = null;
    if (limit) {
      result = await localDB.find({
        selector: selector,
        limit: parseInt(limit),
        skip: skip,
        use_index: 'index-filtered-words',
      });
    } else {
      result = await localDB.find({
        selector: selector,
        use_index: 'index-filtered-words',
      });
    }
    if (result.docs) { return result.docs; }
    else { return []; }
  } catch (err) { return err; };
}     // END OF filterWordsQueryLimit()


async function getChangesTracker() {
  try {
    let result_localDB = await localDB.find({
      selector: { type: 'container-local', subtype: 'changes-tracker', },
      user_index: 'index-containers'
    });

    if (result_localDB.docs.length < 1) {
      // 1st connection ever or with this tool. Did not find matching doc, creating one.
      let newChangesTracker = {
        _id: cuid(),
        type: 'container-local',
        subtype: 'changes-tracker',
        data_values: [],
        // changes_values: [],
        added: [],
        deleted: [],
        edited: [],
      };

      let putChangesTracker = await localDB.put(newChangesTracker);
      if (putChangesTracker.ok === true) {
        let storedChangesTracker = Object.assign({}, newChangesTracker);
        storedChangesTracker._rev = putChangesTracker.rev;
        store.dispatch('SET_CHANGES_TRACKER', storedChangesTracker);
      }

    } else {
      // already connected with this tool previously. Found a matching changesTracker doc. Fetching it.
      let storedChangesTracker = result_localDB.docs[0];
      store.dispatch('SET_CHANGES_TRACKER', storedChangesTracker);
    }

  } catch(err) { console.log('err from getChangesTracker', err) };

}   // END OF getChangesTracker()


async function modifyWordQuery(target, english, french, category, tag, tested) {
  try {
    let updatedWord = {
      _id: target._id,
      _rev: target._rev,
      type: 'word',
      english: english,
      french: french,
      category: category,
      tag: tag,
      tested: tested,
    };
    let modifyLocalDB = await localDB.put(updatedWord);
    return modifyLocalDB;
  } catch (err) { return err; };
}   // END OF modifyWordQuery()


async function resetChangesTracker() {
  try {
    let updatedChangesTracker = {
      _id: store.state.changesTracker._id,
      _rev: store.state.changesTracker._rev,
      type: store.state.changesTracker.type,
      subtype: store.state.changesTracker.subtype,
      added: [],
      deleted: [],
      edited: [],
      data_values: [],
      changes_values: [],
    };
    let putChangesTracker = await localDB.put(updatedChangesTracker);
    let storedChangesTracker = Object.assign({}, updatedChangesTracker);
    storedChangesTracker._rev = putChangesTracker.rev;
    store.dispatch('SET_CHANGES_TRACKER', storedChangesTracker);

  } catch (err) { console.log('error from resetChangesTracker', err); }

}      // END OF resetChangesTracker()


async function saveNewWordQuery(english, french, category, tag) {
  try {
    let id = cuid();
    let newWord = {
      _id: id,
      type: 'word',
      english,
      french,
      category,
      tag,
      tested: false,
    };

    let putWord = await localDB.put(newWord);
    if (putWord.ok === true) { updateChangesTracker2(id, 'add'); }
    else { throw 'Something is wrong. Can\'t save this word in localDB.'}
  } catch (err) { return err; };
} // END OF saveNewWordQuery()


async function sendtoAppropriateSync(localAheadWords) {
  try {
    let storedToolList = await localDB.get(store.state.toolList._id);
    let toolsAhead = storedToolList.toolsAhead.slice();
    // retain only relevant toolsAhead warnings.
    toolsAhead = toolsAhead.filter(item => item.comparedTo == store.state.toolLocal._id);

    if (toolsAhead.length > 0) { // remote is ahead vs this specific current tool.
      if (localAheadWords) { // local is also ahead.
        await syncWordsMerge();
      } else { // only remote is ahead.
        await syncWordsFrom(true);  // call syncWordsFrom(with warnings)
      }
    } else { // remote is not ahead - local is ahead.
      await syncWordsTo(true, []);  // call syncWordsTo(with warnings)
    }

  } catch (err) { return { error: 'Could not sync DB' }; }

}   // END OF sendtoAppropriateSync()


async function syncDeletedWords(deletedFromRemote) {
  try {
    // block tracking / db_changes
    store.commit('IS_FROM_REMOTE', true);
    // Manage deleted words (no longer on remoteDB => replicate.from() does not update them since no more in remoteDB.
    for (let i=0; i<deletedFromRemote.length; i++) {
      await localDB.get(deletedFromRemote[i].deletedWord)
                   .then(function (doc) { return localDB.remove(doc); })
                   .catch(function (err) { console.log('err from deletedFromRemote', err); });
    }

  } catch (err) { console.log('error from syncDeletedWords', err); }

}   // END OF syncDeletedWords()


async function syncEditedWords(editedOnLocal) {
  try {
    let changesFromRemote = store.state.toolList.changes_values.slice();
    // retain only relevant changes_values warnings.
    changesFromRemote = changesFromRemote.filter(item => item.comparedTo == store.state.toolLocal._id);
    let editedOnRemote = changesFromRemote.filter(item => item.hasOwnProperty('editedWord'));

    let editConflicts = [];
    for (let i=0; i<editedOnLocal.length; i++) {
      let isAlsoEditedOnRemote = editedOnRemote.findIndex(item => item.editedWord == editedOnLocal[i]._id);

      if (isAlsoEditedOnRemote > -1) {
        // real conflict - edited versions of same word on remote and on local.
        let remoteDate = editedOnRemote[isAlsoEditedOnRemote].editedDate;
        let localDate = editedOnLocal[i].date;
        if (localDate > remoteDate) {
          // edit on local has been made more recently. Keep the local version.
          let editedWord = await localDB.get(editedOnLocal[i]._id);
          editConflicts.push({
            _id: editedWord._id,
            english: editedWord.english,
            french: editedWord.french,
            category: editedWord.category,
            tag: editedWord.tag,
            tested: editedWord.tested,
          });
        }   // else do nothing => change on remote has been made more recently. Keep the remote version.
      } else {
        // no conflict but keep editedWord on local to replace info after syncing from remoteDB.
        // @TODO => problème avec ._rev + avancé en local qu'en remote quand on va faire le replicate.from(remoteDB) ?
        let editedWord = await localDB.get(editedOnLocal[i]._id);
        editConflicts.push({
          _id: editedWord._id,
          english: editedWord.english,
          french: editedWord.french,
          category: editedWord.category,
          tag: editedWord.tag,
          tested: editedWord.tested,
        });
      }
    }
    return editConflicts;

  } catch (err) { console.log('error from syncEditedWords', err); }

}   // END OF syncEditedWords()


async function syncWordsFrom(warnings) {
  try {
    // block tracking / db_changes.
    store.commit('IS_FROM_REMOTE', true);

    // manage words deleted from remoteDB.
    let changesFromRemote = store.state.toolList.changes_values.slice();
    // retain only relevant changes_values warnings.
    changesFromRemote = changesFromRemote.filter(item => item.comparedTo == store.state.toolLocal._id);
    // check if there are 'deleted' changes.
    let deletedFromRemote = changesFromRemote.filter(item => item.hasOwnProperty('deletedWord'));
    if (deletedFromRemote.length > 0) {
      await syncDeletedWords(deletedFromRemote);
    }

    let syncDB = await localDB.replicate.from(store.state.remoteDB, {
      filter: function(doc) { return doc.type != 'container'; },
    }).on('complete', function(info) {
      // console.log('replicate.from(remoteDB) from global replicate - info: ', info);
      if (warnings) { setWarnings(false, []); }  // call setWarnings(!localDBAhead)
      // stop blocking tracking / db_changes.
      store.commit('IS_FROM_REMOTE', false);
    }).on('error', function(err) {
      console.log('error on replicate.from(remoteDB) from global replicate - err: ', err);
    });

  } catch (err) { console.log('error from syncWordsFrom', err); }

}   // END OF syncWordsFrom()


async function syncWordsMerge() {

  try {
    // check if there are 'edited' changes .
    let editedOnLocal = store.state.changesTracker.edited.slice();
    let editConflicts = [];

    if (editedOnLocal.length > 0) {
      editConflicts = await syncEditedWords(editedOnLocal);
    }

    await syncWordsFrom(false); // replicate.from(remoteDB) - no warnings (yet)

    if (editConflicts.length > 0) {
      for (let i=0; i<editConflicts.length; i++) {
        let editedWord = await localDB.get(editConflicts[i]._id);
        await localDB.put({
           _id: editedWord._id,
           _rev: editedWord._rev,
           type: 'word',
           english: editConflicts[i].english,
           french: editConflicts[i].french,
           category: editConflicts[i].category,
           tag: editConflicts[i].tag,
           tested: editConflicts[i].tested,
         });
      }
      // call replicate.to(remoteDB) - set warnings including for editConflicts.
      await syncWordsTo(true, editConflicts);
    } else {
      // replicate.to(remoteDB) - set warnings but none for editConflicts
      await syncWordsTo(true, []);
    }

  } catch (err) { console.log('error from syncWordsMerge', err); }

}   // END OF syncWordsMerge()


async function syncWordsTo(warnings, editConflicts) {
  console.log('enter syncWordsTo');
  console.log('remoteDB', store.state.remoteDB);
  try {
    let syncDB = await localDB.replicate.to(store.state.remoteDB, {
      // filter: function (doc) { return doc.type != 'container'; }
      filter: function (doc) { return doc.type == 'word'; }
    }).on('complete', function(info) {
      console.log('replicate.to(remoteDB) from syncWords replicate - info: ', info);
      if (warnings) { setWarnings(true, editConflicts); }  // call setWarnings(localDBAhead, editConflicts)
    }).on('error', function(err) {
      console.log('error on replicate.to(remoteDB) from syncWords replicate - err: ', err);
    });

  } catch (err) { console.log('error from syncWordsTo', err); }

}   // END OF syncWordsTo()


async function updateChangesTracker2(changeID, action) {
  if (store.state.comingFromRemote) {
    // change is coming from remote - do not track them.
    return;
  } else {
    // change has been made locally - track them.
    try {
      let changesTracker = Object.assign({}, store.state.changesTracker);
      let addedChanges = changesTracker.added.slice();
      let deletedChanges = changesTracker.deleted.slice();
      let editedChanges = changesTracker.edited.slice();

      let isAlreadyInAdded = addedChanges.findIndex(item => item == changeID);
      let isAlreadyInEdited = editedChanges.findIndex(item => item._id == changeID);

      switch (action) {

        case 'add':
          // a new word can't be in 'added', 'deleted' or 'edited' since it is new. Can only add it.
          addedChanges.push(changeID);
          break;

        case 'delete':
          // can delete a word that just been added then deleted.
          // or edited then finally deleted.
          // or delete a word that has no current change on changesTracker and is already synced on remote.
          if (isAlreadyInAdded < 0) {
            if (isAlreadyInEdited < 0) { // neither in added nor in edited tracked changes.
              deletedChanges.push(changeID);
            } else { // not in added - already in edited tracked changes.
              editedChanges = editedChanges.filter(item => item._id != changeID);
            }
          } else { // is already in added tracked changes
            addedChanges = addedChanges.filter(item => item != changeID);
          }
          break;

        case 'edit':
          // can edit a word that has just been added (then edited).
          // or edit a word that has already been edited
          // or edit a word that has no current change on changesTracker and is already synced on remote.
          if (isAlreadyInAdded < 0) {
            if (isAlreadyInEdited < 0) { // neither in added nor in edited tracked changes.
              editedChanges.push({ _id: changeID, date: Date.now() });
            } else { // not in added - already in edited tracked changes.
              editedChanges[isAlreadyInEdited] = { _id: changeID, date: Date.now() };
            }
          } else { // is already in added tracked changes (has just been added and not synced yet) - do nothing.
            return;
          }
          break;

        default:
          console.log('unanticipated choice');
      }

      let updatedChangesTracker = {
        _id: changesTracker._id,
        _rev: changesTracker._rev,
        type: changesTracker.type,
        subtype: changesTracker.subtype,
        data_values: changesTracker.data_values,
        changes_values: changesTracker.changes_values,
        added: addedChanges,
        deleted: deletedChanges,
        edited: editedChanges,
      };

      let putChangesTracker = await localDB.put(updatedChangesTracker);
      let storedChangesTracker = Object.assign({}, updatedChangesTracker);
      storedChangesTracker._rev = putChangesTracker.rev;
      store.dispatch('SET_CHANGES_TRACKER', storedChangesTracker);


    } catch (err) { console.log('error from updateChangesTracker2 - changes made locally - track them'); }

  }   // END OF else {} => changes made locally - track them.

}   // END OF updateChangesTracker2()


export {
  deleteWordQuery,
  filterWordsQueryLimit,
  getChangesTracker,
  modifyWordQuery,
  resetChangesTracker,
  saveNewWordQuery,
  sendtoAppropriateSync,
  syncWordsFrom,
  updateChangesTracker2,
};
