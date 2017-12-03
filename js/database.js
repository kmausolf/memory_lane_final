/*jslint devel: true */

//NOTE for future reference: firebase.auth().currentUser.uid is the user's ID, unique to the Firebase project. Do NOT use this value to authenticate with your backend server, if you have one. Use User.getToken() instead.

//closure for javascript
//(function () {

/****************************** Setup ******************************/

//variable to store the current user (currently only used by settings.js)
var currentUser;

//calls functions on page load
//$(document).ready(function(){

//Tries to use previously initialized firebaseApp
var app;
try {
  app = firebase.app();
}
//If firebaseApp has not yet been initialized, initializes it
catch(e) {
  console.log('initializing firebaseApp...');
  config = {
    //NOTE: public apiKey is a security issue
    apiKey: "AIzaSyABzPj3JJjsth_x7iEEeus_diIj_Hx3ajg",
    authDomain: "cse-170.firebaseapp.com",
    databaseURL: "https://cse-170.firebaseio.com",
    projectId: "cse-170",
    storageBucket: "cse-170.appspot.com"
  };
  app = firebase.initializeApp(config);
}

//})();//end of ready function

/****************************** Functions ******************************/

//Initializes user data in firebase with the user's email and uid.
function initializeUserData() {

  //Declare variables
  var user, email, uid;
  //Initialize variables
  user = firebase.auth().currentUser;
  if (user != null) {
    //variables
    email = user.email;
    uid = user.uid;
  }
  else {
    console.log('User is null. Cannot initialize user data.');
    return;
  }

  //writes to firebase
  console.log('Initializing user data with:');
  console.log('   email : ' + email);
  console.log('   user id: ' + uid);
  firebase.database().ref('users/' + uid).update({
    email: email,
    userID: uid
  });
}

/*
Description:
  Updates data in the database
@param "path":
  The (string) path to get to the key you want to update.
  (Uses "users/<uid>" as the root of the path.)
  To specify keys/fields in settings, use path = "/settings"
@param "field":
  The (string) key/field that you want to update.
  Example keys/field for "settings":
    music_setting
@param "value":
  The new value of the key/field.
  Example value for music_setting:
    true
@return: 
  none
Example use: writeUserData('/settings', 'music_setting', true);
*/
function writeUserData(path, field, value) {
  //Attempts to initialize user and get user's uid
  var uid;
  var user = firebase.auth().currentUser;
  if (user != null) {
    uid = user.uid;
  }
  else {
    console.log('User is null. Cannot write user data to database.');
    return;
  }

  //Uses uid to update firebase
  console.log('Updating user ' + field + ' field to: ' + value)
  firebase.database().ref('users/' + uid + path).update({
    [field]: value
  });
}

/*
Description:
  Gets a PROMISE of the data from firebase
@param "path":
  The (string) path to get to the key specified by field param.
  (Uses "users/<uid>" as the root of the path.)
  To get keys/fields in settings, use path = "/settings"
@param "field":
  The (string) key/field that you want data from.
  Example keys/field for "settings":
    music_setting
@return:
  The value specified by path/field param combination
Example Use: var promise = getUserData('/settings', 'music_setting');
*/
function getUserData(path, field) {
  //Attempts to initialize user and get user's uid
  var uid;
  var user = firebase.auth().currentUser;
  if (user == null) {
    console.log('User is null. Cannot get user data.');
    return;
  }
  var uid = user.uid;
  //Creates firebase database reference to appropriate data in firebase
  var ref = firebase.database().ref('/users/' + uid + path).child(field);

  //Returns a promise of the data pointed to by firebase reference
  return ref.once('value').then(function(dataSnapshot) {
    console.log('getUserData returned: ' + dataSnapshot.val());
    return Promise.resolve(dataSnapshot.val());
    //error handling if promise was rejected
  }, function(error) {
    console.log('The promise was rejected.');
    console.log(error);
    return null;
  });
};

//helper function to determine which decade to store data in
function determineDatabaseYear(year) {
  //turns string parameter into int
  var decade = parseInt(year);
  if (decade > 1969){
    decade = 1970
  }
  else if (decade > 1959) {
    decade = 1960
  }
  else {
    decade = 1950
  } 
  console.log('year being used: ' + decade);
  return decade.toString();
}

/****************************** Test Code ******************************/

function fill_personal_section() {
  //Attempts to initialize user and get user's uid
  try {
    var uid;
    var user = firebase.auth().currentUser;
    if (user == null) {
      console.log('User is null. Cannot get user data.');
      return null;
    }
    var uid = user.uid;
    //builds the path
    var exploreYear = localStorage.getItem('explore_year');
    var path = '/personal_memories/' + exploreYear;
    //builds the path to the data
    path = '/users/' + uid + path;
    //Creates firebase database reference to appropriate data in firebase
    var ref = firebase.database().ref(path);

    //create a temp variable to fill allMemories with
    //var singleMemory = {};
    //create a JSON object to be returned
    var allMemories = [];

    // Get the list of data from database
    return ref.once('value', function(snapshot) {

      // Iterate over the list
      snapshot.forEach(function(childSnapshot) {
        //get data from the child snapshot
        var year = childSnapshot.child('year').val();
        var title = childSnapshot.child('title').val();
        var description = childSnapshot.child('description').val();
        //create a temp variable to fill allMemories with
        var singleMemory = {};

        //creates a "memory" out of the year, title, description
        singleMemory['title'] = title;
        singleMemory['year'] = year;
        singleMemory['description'] = description;
        //adds the single memory to list of memories
        allMemories.push(singleMemory);
      });
      console.log(allMemories);
      return Promise.resolve(allMemories);
    });
  }
  catch(e) {
    console.log(e);
    return null;
  }
}

/****************************** Old Code ******************************/

/*
  firebase.auth().currentUser.once('value').then(function(snapshot) {
    console.log('first part of promise');
    console.log(snapshot.val());
  }, function(error) {
    console.log('error occurred while initializing app:');
    console.log(error);
  });
  console.log('creating current user instance...')
*/

/*
//fires when the user is logged in
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log('User is signed in');
  } else {
    console.log('No user is signed in');
  }
});

if(user == null){
  console.log('User not yet logged in');
}
else {
  console.log('getCurrentUser returned logged in');
}
*/

/*
  //attempt at sync function
  var syncRef = new Firebase("https://cse-170.firebaseio.com");
  var authData = syncRef.getAuth();
  if (authData) {
    console.log('synchronous call successful');
    console.log("User " + authData.uid + " is logged in with " + authData.provider);
  } else {
    console.log('synchronous call unsuccessful');
    console.log("User is logged out");
  }
  */

/*
  //delay script
  var start = new Date().getTime();
  var end = start;
  while(end < start + 1000) {
    end = new Date().getTime();
  }
  */