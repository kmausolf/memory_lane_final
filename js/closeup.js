var source = $("#display-template").html();
var template = Handlebars.compile(source);
var cat = JSON.parse(localStorage.getItem('cat'));
var obj = localStorage.getItem('img');
var index = localStorage.getItem('index');
var parentDiv = $("#display-result");
var ytprefix = "https://www.youtube.com/embed/";

function newPage() {
  for( var i = 0; i < cat.length; i++ ) {
    if( cat[i]['picture'] == obj ) {
      var temp = cat[i];
      break;
    }

  }
  var html = template(temp);
  //console.log(html);
  parentDiv.append(html);
}

function newPersonalPage() {
  for( var i = 0; i < cat.length; i++ ) {

    if( i == index ) {
      var temp = cat[i];
      temp['type'] = 'Personal';
      temp['picture'] = obj;
      break;
    }
  }
  var html = template(temp);
  parentDiv.append(html);
}

$(document).ready(function() {
  localStorage.setItem("previous_page", "closeup");
  if(JSON.parse(localStorage.getItem('getPersonal')) === false) {
    newPage();
  }
  else {
    newPersonalPage();
  }
});