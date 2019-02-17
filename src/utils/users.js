import PouchDB from 'pouchdb';
import pouchDBAuthentication from 'pouchdb-authentication';
PouchDB.plugin(pouchDBAuthentication);

import { store } from './../store/store';
import { localDB } from '@/utils/databases';
import { authKey } from '@/utils/keys';
import { keys } from '@/utils/keys_public';
import router from './../router';

import { createToolList, updateToolLocal } from '@/utils/toolList';
import { getToolList } from '@/utils/toolList';

async function checkSignUpUser(username, password, email) {
  let result = fetch(`${keys.baseURL}/_users/org.couchdb.user:${username}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${authKey.username}:${authKey.password}`),
    },
    credentials: 'include'
  }).then(res => res.json())
    .then(response => {
      console.log('response', response);
      if (response._id) {
        return { status: 'user already exists' };
      } else if (response.error === 'not_found') {
        createRemoteDB(username, password, email);
      } else {
        return { status: 'issue with request' };
      }
  }).catch(err => console.error('error from fetch _users', err) );
  return result;
}


async function createRemoteDB(username, password, email) {
  try {
    let newRemoteDB = new PouchDB(`http://${authKey.username}:${authKey.password}@127.0.0.1:5984/myvoc-${username}`);
    await updateToolLocal(username, email);
    await createToolList();    //create toolList && containers-sync.
    await replicateDB(username, password, email, newRemoteDB);
  } catch (err) { console.log('err from createRemoteDB', err); }
}

async function replicateDB(username, password, email, remoteDB) {
  localDB.replicate.to(remoteDB, {
    filter: function (doc) { return doc.type == 'word'; },
    filter: function (doc) { return doc.type == 'container'; }
  }).on('complete', function (info) {
      signUpUser(username, password, email);
    })
    .on('error', function (err) {
      // @TODO Warn user
      return { status: 'error' };
    });
}


async function signUpUser(username, password, email) {
  let remoteDB = new PouchDB(`${keys.baseURL}/myvoc-${username}`, { skip_setup: true });
  remoteDB.signUp(username, password, {
    metadata: { email: email }
  },function (err, response) {
    if (err) {
      return { status: 'error' };
    } else {
      secureDB(username, password);
    }
  });
}


function secureDB(username, password) {
  let url = `${keys.baseURL}/myvoc-${username}/_security`;
  let data = {
    "admins": {},
    "members": {
      "names": [`${username}`],
      "roles": ["dataOwner"]
    }
  };

  fetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${authKey.username}:${authKey.password}`),
    },
    credentials: 'include'
  }).then(res => res.json())
    .then(response => {
      if (response.ok) { loginUser(username, password); }
      else { console.log('! success.ok'); return { status: 'error' }; }
    }).catch(error => console.error('Error:', error));
}   // END OF secureDB


function loginUser(username, password) {
  let remoteDB = new PouchDB(`${keys.baseURL}/myvoc-${username}`, {skip_setup: true});
    remoteDB.logIn(username, password, function (err, response) {
      if (err) { console.log('err from login', err); }
    }).then(response => {
      console.log('response from login', response);
      if (response.ok && response.name === store.state.username) {
        getUserSession(username);
        getToolList();
        router.push('/dashboard');
        return { status: 'ok' };
      } else {
        console.log('not allowed - not a correct user for this db');
      }
    });
}


function logoutUser() {

  let remoteDB = new PouchDB(`${keys.baseURL}/myvoc-${store.state.username}`, { skip_setup: true });
  remoteDB.logout(function (err, response) {
    if (err) { console.log('err on logoutUser', err); }
    else {
      console.log('response from logoutUser', response);
      store.commit('IS_LOGGEDIN', false);
    }
  });
}
//@TODO TO BE TESTED
function updateUsername(oldUsername, newUsername) {
  let remoteDB = new PouchDB(`http://${authKey.username}:${authKey.password}@127.0.0.1:5984/myvoc-${username}`, { skip_setup: true });
  let result = remoteDB.changeUsername(oldUsername, newUsername, function(err) {
    if (err) {
      if (err.name === 'not_found') {
        return { error: 'Initial name not found' };
      } else if (err.taken) {
        return { error: 'New name is already taken, try another one' };
      } else {
        return { error: 'There has been an unidentified error' };
      }
    }
    else {
      console.log('username has been successfully changed');
      return { status: 'ok' };
    }
  });
  return result;
}

function updateMetaData(username, email) {
  let remoteDB = new PouchDB(`${keys.baseURL}/myvoc-${store.state.username}`, { skip_setup: true });
  let result = remoteDB.putUser(username, {
    metadata: { email: email }
  }, function (err, response) {
    if (err) { console.log('err on updateMetaData', err); }
    console.log('response from within putUser', response);
  });
  return result;
}

//@TODO TO BE TESTED
function updatePassword(username, password) {
  let remoteDB = new PouchDB(`${keys.baseURL}/myvoc-${store.state.username}`, { skip_setup: true });
  let result = remoteDB.changePassword(username, password, function(err, response) {
    if (err) {
      if (err.name === 'not_found') { return { error: 'No user found' }; }
      else { return { error: 'unidentified error' }; }
    } else {
      console.log('response from within changePassword', response);
      return response;
    }
  });
  return result;
}


function getUserSession(username) {
  console.log('enter getUserSession with username', username);
  let remoteDB = new PouchDB(`http://${authKey.username}:${authKey.password}@127.0.0.1:5984/myvoc-${username}`, { skip_setup: true });

  let result = remoteDB.getSession(function (err, response) {
    console.log('response from getSession', response);
    if (!err && response.userCtx.name == username) {
      store.commit('IS_LOGGEDIN', true);
      return { status: 'ok' };
    } else {
      console.log('err from getSession', err);
      return { status: 'none' };
      store.commit('IS_LOGGEDIN', false);
    }
  });
  return result;
}


export {
  createRemoteDB,
  deleteAccount,
  getUserSession,
  loginUser,
  logoutUser,
  updateMetaData,
  updatePassword,
  updateUsername,
  checkSignUpUser,
}























//
