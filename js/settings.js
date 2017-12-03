//calls functions on page load
$(document).ready(function(){

  //Firebase promise that fires once it's determined if the user is logged in or out
  firebase.auth().onAuthStateChanged(firebaseUser => {
    //localStorage.clear();
    console.log('firebase.auth().onAuthStateChanged:');
    //currentUser is a variable from the file, personal.js
    currentUser = firebaseUser;

    //hides personal buttons if the user isn't logged in
    if(!currentUser) {
      document.getElementById('personal_button').classList.add('hide');
      document.getElementById('add_personal_button').classList.add('hide');
    }
    else {
      getSetting('personal').then(function(status) {
        setButtonState('personal', status);
      });
    }

    getSetting('music').then(function(status) {
      setButtonState('music', status);
    });
    getSetting('shows').then(function(status) {
      setButtonState('shows', status);
    });
    getSetting('movies').then(function(status) {
      setButtonState('movies', status);
    });



    localStorage.setItem('previous_page', 'settings');
    console.log('----- page setup complete -----');
  });
});

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

//(untested) function to set the specified setting for the user
function setSetting(setting, value) {
  //sets settings for logged-in users
  if(currentUser) {
    writeUserData('/settings', setting, value);
  }
  //sets settings for non-logged-in users
  else {
    localStorage.setItem(setting, JSON.stringify(value));
  }
}

//function to toggle the specified setting for the user
function toggleSetting(setting) {
  //if the user is logged in, toggles user's settings in database
  if(currentUser) {
    var promise = getSetting(setting);
    var buttonID = setting + '_button';
    try {
      //once the data has been gotten
      promise.then(function(status) {
        //toggles the status and sets the button color and setting to new status
        status = !status;
        setButtonState(setting, status);
        setSetting(setting, status);
      }).catch(function(error) {
        console.log(error);
      });
    }
    catch(e) {
      console.log('promise.then error:')
      console.log(e);
    }
  }
  //otherwise toggles settings in local storage
  else {
    try {
      var status = JSON.parse(localStorage.getItem(setting));
      status = !status;
      setButtonState(setting, status);
      setSetting(setting, status);
      console.log("toggled localStorage setting \'" + setting + "\'\nfrom " + !status + " to " + status);
    }
    catch(e) {
      console.log(e);
    }
  }
}

//helper function to set a button's color
function setButtonState(button, status) {
  var buttonID = button + '_button';
  if(status) {
    document.getElementById(buttonID).style.backgroundColor = 'rgba(88, 146, 74, .3)';
    document.getElementById(buttonID).style.border = "thick solid #58924A";
    document.getElementById(buttonID).style.color = '#000000';    
    document.getElementById(buttonID).firstChild.data = button + ' (on)';
  }
  else {
    document.getElementById(buttonID).style.backgroundColor = 'rgba(187, 199, 192)';
    document.getElementById(buttonID).style.border = 'thick solid #BBC7C0';
    document.getElementById(buttonID).style.color = '#828282';    
    document.getElementById(buttonID).firstChild.data = button + ' (off)';
  }
}

/****************************** Old Code ******************************/

/*
function togglerandom(string) {
  console.log('test function');
}

(function() {

  var app = angular.module('settings', []);
  app.controller("ButtonCtrl", function($scope){

    //sets the active state of the music button
    if(localStorage.getItem("show_music") === null){
      $scope.musicActive = true;
    }
    else{
      $scope.musicActive = localStorage.getItem("show_music");
    }
    //sets the active state of the movies button
    if(localStorage.getItem("show_movies") === null){
      $scope.moviesActive = true;
    }
    else{
      $scope.moviesActive = localStorage.getItem("show_movies");
    }
    //sets the active state of the shows button
    if(localStorage.getItem("show_shows") === null){
      $scope.showsActive = true;
    }
    else{
      $scope.showsActive = localStorage.getItem("show_shows");
    }

    //functionality to toggle the buttons on-click
    $scope.toggleActive = function(section){
      //Toggle the musicActive button, and save its state in localStorage
      if(section == "music"){
        $scope.musicActive = !$scope.musicActive;
        localStorage.setItem("show_music", $scope.musicActive);
      }
      //Toggle the moviesActive button, and save its state in localStorage
      else if (section == "movies") {
        $scope.moviesActive = !$scope.moviesActive;
        localStorage.setItem("show_movies", $scope.moviesActive);
      }
      //Toggle the musicActive button, and save its state in localStorage
      else if(section == "shows"){
        $scope.showsActive = !$scope.showsActive;
        localStorage.setItem("show_shows", $scope.showsActive);
      }//end shows if
    };//end toggleMusic

  });//end Buttons
})();
*/