(function(){

  var app = angular.module('explore', []);

  app.controller("DivHider", function($scope){

    $scope.checkSettings = function(cat){
      if(cat == "music"){
        if(localStorage.getItem("show_music") === null){
          return true;
        }//end if
        else if(localStorage.getItem("show_music") == "true"){
          return true;
        }//end else if
        else{
          return false;
        }//end else
      }//end music if
      else if(cat == "movies"){
        if(localStorage.getItem("show_movies") === null){
          return true;
        }//end if
        else if(localStorage.getItem("show_movies") == "true"){
          return true;
        }//end else if
        else{
          return false;
        }//end else
      }//end movies if
      else if(cat == "shows"){
        if(localStorage.getItem("show_shows") === null){
          return true;
        }//end if
        else if(localStorage.getItem("show_shows") == "true"){
          return true;
        }//end else if
        else{
          return false;
        }//end else
      }//end shows if
    };//end checkSettings
  });
})();
