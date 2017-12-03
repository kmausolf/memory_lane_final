//Submits the user-entered data from the personal page form
function submitForm() {
  var form = document.getElementById('personal_form');
  //checks to see that the user entered the data correctly
  if(form.checkValidity()) {
    //only submits data after confirming with the user
    if(confirm("Are you sure this is the memory you want to keep?")) {
      //creates variables for each part of the memory
      var year = document.getElementById('year').value;
      var title = document.getElementById('title').value;
      var description = document.getElementById('description').value;
      var databaseYear = determineDatabaseYear(year);

      //attempts to submit the data to database
      try {
        writeUserData('/personal_memories' + '/' + databaseYear + '/' + title, 'year', year);
        writeUserData('/personal_memories' + '/' + databaseYear + '/' + title, 'title', title);
        writeUserData('/personal_memories' + '/' + databaseYear + '/' + title, 'description', description);
        //logs
        console.log('personal memory form submitted');
        alert('Memory Submitted!');
        //form.submit();
      }
      //logs error in case data submission failed
      catch(e) {
        console.log(e);
      }
    }
    //in case the user cancels the memory submission
    else {
      console.log('personal memory form not submitted');
    }
  }
  //in case the user did not enter the data correctly
  else {
    document.getElementById('submit_handler').click();
  }
};