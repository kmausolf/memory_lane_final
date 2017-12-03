/*jslint devel: true */

/****************************** Setup ******************************/

//calls function upon page load
$(document).ready(function(){

  //localStorage.clear();

  determineYear();
  fill_section('music');
  fill_section('shows');
  fill_section('movies');

  //fires when it's detected that the user is or isn't logged in
  firebase.auth().onAuthStateChanged(firebaseUser => {
    //localStorage.clear();
    console.log('firebase.auth().onAuthStateChanged:');
    //currentUser is a variable from the file, personal.js
    currentUser = firebaseUser;
    //hides or shows explore page sections based on user settings
    try {
      getSetting('music').then(function(status) {
        setWrapperState('music', status);
      });
      getSetting('shows').then(function(status) {
        setWrapperState('shows', status);
      });
      getSetting('movies').then(function(status) {
        setWrapperState('movies', status);
      });
    }
    catch(e) {
      console.log(e);
    }

    //only applies to logged-in users
    if(currentUser){

      //displays the personal Section
      getSetting('personal').then(function(status) {
        setWrapperState('personal', status);
      });

      //pulls the user's data from database and fills localStorage with it
      if(localStorage.getItem('previous_page') == 'home'){
        //???what is the value of personalData???
        get_personal_data().then(function(personalData) {
          fill_personal_section();
          hidePersonal();
        }).catch(function(e) {
          console.log(e);
        });
      }
      else {
        hidePersonal();
      }
    }

    console.log('----- page setup complete -----');
  });  
});

/****************************** Helper Functions ******************************/

//Fisher-Yates shuffle to shuffle an array
//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle_array(array, string) {
  "use strict";
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  //store the shuffled array into localStorage
  localStorage.setItem(string, JSON.stringify(array));
}

//helper function for refresh button
function set_prev(string) {
  localStorage.setItem("previous_page", string);
}

//temporary function for default year values
function determineYear() {
  var temp = localStorage.selected_year;
  var year = parseInt(temp);
  if (year > 1969){
    localStorage.setItem('explore_year', 1970);
  }
  else if (year > 1959) {
    localStorage.setItem('explore_year', 1960);
  }
  else {
    localStorage.setItem('explore_year', 1950);
  } 
  console.log('year being used: ' + localStorage.explore_year);
}

//adds or removes explore page categories based on settings
function setWrapperState(section, status) {
  var divID = section + '_wrapper';
  if(status) {
    document.getElementById(divID).classList.remove('hide');
  }
  else {
    document.getElementById(divID).classList.add('hide');
  }
}

//function to get a promise of the specified setting of the user
function getSetting(setting) {

  //If the user is logged in, pulls setting from database
  if(currentUser) {
    //Gets promise of user settings data specified by "setting" param
    console.log('Getting ' + setting + ' setting from database.');
    var promise = getUserData('/settings', setting);
    //Attempts to get value of promise
    try{
      return promise.then(function(resolveValue) {
        //returns setting if the promise value resulted in !null
        if(resolveValue != null) {
          console.log('Returning found setting for ' + setting + ': ' + resolveValue);
          return Promise.resolve(resolveValue);
        }
        //else set the setting in database to true and returns true
        else {
          console.log(setting + ' was previous null or undefined (in database).\nSetting it to true.');
          writeUserData('/settings', setting, true);
          return Promise.resolve(true);
        }
        //catches that resulted in rejection
      }).catch(function(error) {
        console.log(error);
      });
    }
    //logs error if attempt failed
    catch(e) {
      console.log('promise.then error:')
      console.log(e);
    }
  }

  //else if the user is not logged in, pulls the setting from localStorage
  else {
    console.log('User is logged out.\nGetting ' + setting + ' setting from localStorage.');
    currSetting = JSON.parse(localStorage.getItem(setting));
    //returns setting if the setting is found in localStorage
    if(currSetting != null) {
      console.log('Returning found setting for ' + setting + ': ' + currSetting);
      return Promise.resolve(currSetting);
    }
    //else set the setting in localStorage to be true and returns true
    else {
      console.log(setting + ' was previous null or undefined (in localStorage). Setting it to true.');
      localStorage.setItem(setting, JSON.stringify(true));
      return Promise.resolve(true);
    }
  }
}

//hides pictures in personal memories section of explore page
//if there aren't enough memories
function hidePersonal() {
  var array = JSON.parse(localStorage.getItem('personalArray'));
  var numMemories = array.length;
  var i;
  for(i = 3; i > -1; ++i) {
    if(i > numMemories) {
      var content = 'personal_content_' + i;
      document.getElementById(content).classList.add('hide');
    }
  }
}

//shuffles the thumbnails in the personal category of the explore page
function shufflePersonalImages() {
  if(localStorage.getItem('previous_page') == 'home' ||
     localStorage.getItem('previous_page') == 'explore') {
    var pics = [0, 1, 2, 3];
    shuffle_array(pics, 'personalThumbnails');
    pics = JSON.parse(localStorage.getItem('personalThumbnails'));
    document.getElementById("personal_thumbnail1").src = "images/nostalgia" + pics[0] + ".jpg";
    document.getElementById("personal_thumbnail2").src = "images/nostalgia" + pics[1] + ".jpg";
    document.getElementById("personal_thumbnail3").src = "images/nostalgia" + pics[2] + ".jpg";
    document.getElementById("personal_thumbnail4").src = "images/nostalgia" + pics[3] + ".jpg";
  }
  else {
    var pics = JSON.parse(localStorage.getItem('personalThumbnails'));
    document.getElementById("personal_thumbnail1").src = "images/nostalgia" + pics[0] + ".jpg";
    document.getElementById("personal_thumbnail2").src = "images/nostalgia" + pics[1] + ".jpg";
    document.getElementById("personal_thumbnail3").src = "images/nostalgia" + pics[2] + ".jpg";
    document.getElementById("personal_thumbnail4").src = "images/nostalgia" + pics[3] + ".jpg";
  }
}

/****************************** Fills Content Sections ******************************/

//fills in the section of the explore page corresponding to the string parameter
function fill_section(string) {
  "use strict";
  //setup variables
  var arrayName = string + 'Array';
  var currArray = localStorage.getItem(arrayName);

  //if the function was called from the home or explore pages or
  //if the data for the string parameter is not in localStorage,
  if(localStorage.getItem('previous_page') == 'home' ||
     localStorage.getItem('previous_page') == 'explore' ||
     currArray == null || currArray == undefined) {

    //builds the name of the array
    var fileArray = string + localStorage.explore_year;
    //gets the respective array object from local js file ("displays.js")
    currArray = window[fileArray];
    //shuffles this json array object and stores it in localStorage
    shuffle_array(currArray, arrayName);
  }

  //uses data from localStorage instead of the js data file
  currArray = JSON.parse(window.localStorage.getItem(arrayName));

  //fills the section of explore page specified by string parameter
  document.getElementById(string + "_thumbnail1").src = currArray[0].picture;
  document.getElementById(string + "_thumbnail2").src = currArray[1].picture;
  document.getElementById(string + "_thumbnail3").src = currArray[2].picture;
  document.getElementById(string + "_thumbnail4").src = currArray[3].picture;
}

/****************************** Fills Personal Section ******************************/

//Helper function that returns a promise of an array 
//of the current user's personal data
function get_personal_data() {

  console.log('getting personal data');

  //Attempts to initialize user and get user's uid
  try {
    var uid;
    var user = firebase.auth().currentUser;
    if (user == null) {
      console.log('User is null. Cannot get user data.');
      return Promise.reject(null);
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
      //shuffles the array and stores it in localStorage
      shuffle_array(allMemories, 'personalArray');
      return Promise.resolve(JSON.stringify(allMemories));
    });
  }
  catch(e) {
    console.log(e);
    return Promise.reject(null);
  }
}

//loads the explore page based on personal data
function fill_personal_section() {

  //set up user-specific variables
  var user = JSON.stringify(currentUser.uid);
  //set up other variables
  var arrayName =  'personalArray';
  var currArray = localStorage.getItem(arrayName);

  try {
    //When a new user calls this function
    //or when this function was called from the home page
    if(localStorage.getItem('currentUser') !== user ||
       localStorage.getItem('previous_page)' == 'home') ||
       localStorage.getItem('previous_page') == 'explore' ||
       currArray !== null || currArray == undefined) {

      //sets the current user
      localStorage.setItem('currentUser', user);
      //gets the user's data
      currArray = JSON.parse(localStorage.getItem(arrayName));
      console.log('shuffling array');
      shuffle_array(currArray, arrayName);
    }
    //uses data from localStorage instead of database
    currArray = JSON.parse(window.localStorage.getItem(arrayName));
  }
  catch(e) {
    console.log(e);
  }

  shufflePersonalImages();
}

/****************************** Content On-Click ******************************/

//functionality for when a thumbnail in a section is clicked
function newPage(cat, img) {
  for( var i = 0; i < cat.length; i++ ) {
    if( cat[i][picture] == img ) {
      var temp = object[0];
      break;
    }
  }
  //fill in template from closeup.html
  var html = template(temp);
  console.log(html);
  parentDiv.append(html);
}

//functionality for when a thumbnail in a section is clicked
function onCatClick(cat, img) {
  //variable for section+year (ex: movies1970)
  cat = cat + localStorage.explore_year;
  //set up data for closeup page load
  localStorage.setItem('cat', JSON.stringify(window[cat]));
  localStorage.setItem('img', img);
  localStorage.setItem('getPersonal', JSON.stringify(false));
  location.assign("closeup.html");
};

//functionality for when a thumbnail in the personal section is clicked
function onCatClickPersonal(index, cat, img) {
  //variable for section+year (ex: movies1970)
  //cat = cat + localStorage.explore_year;
  var personalArray = JSON.parse(localStorage.getItem('personalArray'));
  //set up data for closeup page load
  localStorage.setItem('cat', JSON.stringify(personalArray));
  localStorage.setItem('img', img);
  localStorage.setItem('index', index);
  localStorage.setItem('getPersonal', JSON.stringify(true));
  location.assign("closeup_original.html");
};

/****************************** OLD CODE ******************************/

/*
//loads the explore page based on personal data
function fill_personal_section() {

  //set up user-specific variables
  var user = JSON.stringify(currentUser.uid);
  var promise = get_personal_data();
  //set up other variables
  var arrayName =  'personalArray';
  var currArray = localStorage.getItem(arrayName);

  console.log('filling personal section');
  try {
    //When a new user calls this function
    //or when this function was called from the home page
    if(localStorage.getItem('currentUser') !== user ||
       localStorage.getItem('previous_page)' == 'home') ||
       currArray !== null || currArray == undefined) {

      //sets the current user
      localStorage.setItem('currentUser', user);

      //waits for data from database
      promise.then(function(personalData) {

        //???what is the value of personalData???

        console.log('toString(): ' + personalData.toString());
        console.log('personalData: ' + personalData);
        //console.log('stringify: ' + JSON.stringify(personalData));

        var test1 = localStorage.getItem('personalArray');
        console.log('test1: ' + test1);
        console.log('toString: ' + test1.toString());
        console.log('stringify: ' + JSON.stringify(test1));

        var test2 = JSON.parse(test1);
        console.log('title: ' + test2[0].title)

/*
        //then shuffles the array and stores it in localStorage
        shuffle_array(personalData, arrayName);

        //uses data from localStorage instead of database
        currArray = JSON.parse(window.localStorage.getItem(arrayName));
* /

      });
    }
  }
  catch(e) {
    console.log(e);
  }
}
*/
/*
  //if coming from home page or 
  //if the data for the string parameter is not in localStorage,
  if(localStorage.getItem('previous_page') == 'home' || 
     currArray == null || currArray == 'undefined'){
    //gets json object from js file and stores it in localStorage
    var fileArray = string + localStorage.explore_year;
    console.log('adding ' + fileArray + ' to localStorage...');
    localStorage.setItem(arrayName, JSON.stringify(window[fileArray]));
  }

  //uses data from localStorage instead of the js data file
  currArray = JSON.parse(window.localStorage.getItem(arrayName));

  //if function was called from home page GO button or explore page refresh button
  if(localStorage.getItem("previous_page") != "closeup"){
    //shuffles the array and stores it in localStorage
    shuffle_array(currArray, arrayName);
  }
*/
/*
//declares variables to retrieve the correct data from the js data file
var musicArray = 'music' + localStorage.selected_year;
var showsArray = 'shows' + localStorage.selected_year;
var moviesArray = 'movies' + localStorage.selected_year;

  //fills in music section
  function fill_music() {
  "use strict";

  //if localStorage has no data for this section, populates localStorage
  var currArray = localStorage.getItem('musicArray');
  if(currArray == null || currArray == 'undefined'){
    console.log('adding musicArray to localStorage...');
    localStorage.setItem('musicArray', JSON.stringify(window[musicArray]));
  }

  //uses data from localStorage instead of the js data file
  musicArray = JSON.parse(window.localStorage.getItem('musicArray'));

  //only shuffles musicArray if called from home page or refresh button
  if(localStorage.getItem("previous_page") != "closeup"){
    shuffle_array(musicArray, "musicArray");
  }

  //fills the Music section of explore page
  document.getElementById("music_thumbnail1").src = musicArray[0].picture;
  document.getElementById("music_thumbnail2").src = musicArray[1].picture;
  document.getElementById("music_thumbnail3").src = musicArray[2].picture;
  document.getElementById("music_thumbnail4").src = musicArray[3].picture;
}

  //fills in the shows section
  function fill_shows() {
  "use strict";

  //if localStorage has no data for this section, populates localStorage
  var currArray = localStorage.getItem('showsArray');
  if(currArray == null || currArray == 'undefined'){
    console.log('adding showsArray to localStorage...');
    localStorage.setItem('showsArray', JSON.stringify(window[showsArray]));
  }

  //uses data from localStorage instead of the js data file
  showsArray = JSON.parse(window.localStorage.getItem("showsArray"));

  //only shuffles showsArray if called from home page or refresh button
  if(localStorage.getItem("previous_page") != "closeup"){
    shuffle_array(showsArray, "showsArray");
  }

  //fills the Shows section of explore page
  document.getElementById("shows_thumbnail1").src = showsArray[0].picture;
  document.getElementById("shows_thumbnail2").src = showsArray[1].picture;
  document.getElementById("shows_thumbnail3").src = showsArray[2].picture;
  document.getElementById("shows_thumbnail4").src = showsArray[3].picture;

}

  //fills in the movies section
  function fill_movies() {
  "use strict";

  //if localStorage has no data for this section, populates localStorage
  var currArray = localStorage.getItem('moviesArray');
  if(currArray == null || currArray == 'undefined'){
    console.log('adding moviesArray to localStorage...');
    localStorage.setItem('moviesArray', JSON.stringify(window[moviesArray]));
  }

  //uses data from localStorage instead of the js data file
  moviesArray = JSON.parse(window.localStorage.getItem("moviesArray"));

  //only shuffles moviesArray if called from home page or refresh button
  if(localStorage.getItem("previous_page") != "closeup"){
    shuffle_array(moviesArray, "moviesArray");
  }

  //fills the Movies section of explore page
  document.getElementById("movies_thumbnail1").src = moviesArray[0].picture;
  document.getElementById("movies_thumbnail2").src = moviesArray[1].picture;
  document.getElementById("movies_thumbnail3").src = moviesArray[2].picture;
  document.getElementById("movies_thumbnail4").src = moviesArray[3].picture;
}
*/
