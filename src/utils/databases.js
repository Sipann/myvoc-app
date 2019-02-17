import PouchDB from 'pouchdb';
import { authKey } from '@/utils/keys';
import { store } from './../store/store';

const localDB = new PouchDB('myvoc-app', {auto_compaction: true});
const remoteDB = store.state.username ? `http://127.0.0.1:5984/myvoc-${store.state.username}` : '';


async function getLocalDBInfo() {
  try {
    let containersLocal = await localDB.find({
      selector: { type: 'container-local' },
      use_index: 'index-containers',
    });
    let containersSync = await localDB.find({
      selector: { type: 'container' },
      use_index: 'index-containers',
    });
    let containersNumber = containersLocal.docs.length + containersSync.docs.length;
    let localDBInfo = await localDB.info();

    let indexesSet = await localDB.getIndexes();
    let indexesNumber = indexesSet.indexes.length - 1;    // -1 because of indexesSet has 1 more doc with ddoc: null, name: _all_docs.

    let numberWords = localDBInfo.doc_count - containersNumber - indexesNumber;
    store.commit('SET_VOC_LENGTH', numberWords);
  } catch (err) { console.log('error from getLocalDBInfo: ', err); }

}


export {
  localDB,
  remoteDB,

  getLocalDBInfo,
};
