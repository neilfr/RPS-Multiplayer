  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBOpVVj2k7ONn7xFzicQomvok7rr11e1vs",
    authDomain: "rock-paper-scissors-34162.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-34162.firebaseio.com",
    projectId: "rock-paper-scissors-34162",
    storageBucket: "rock-paper-scissors-34162.appspot.com",
    messagingSenderId: "798109536929"
  };
  firebase.initializeApp(config);
  var database=firebase.database();

  // the special firebase location that is updated when client connection states change
  var connectedRef = database.ref(".info/connected"); //only fires when "i" get connected or disconnected

  // location for all connections
  var connectionsRef = database.ref("/connections"); // fires when 'anyone' connects or disconnects (see line 28)

  // when the connection state changes (connectedRef is the firebase client connection list) only fires when 'i' get connected or disconnected
  connectedRef.on("value", function(snapshot){
    // if they are connected (meaning there is a value in the snapshot... its not null)... the val will be true
    if (snapshot.val()){
      // adds the user to our connections list
      var connection=connectionsRef.push(true); // is there any significance to this being set to 'true'... or could it be anything?
      connection.onDisconnect().remove();
      connection.set({
        gameState: 'waiting'
      });
      sessionStorage.setItem('myKey',connection.key);//store myKey in my session's session storage
    }
  });

  //fires everytime there are any changes to the connections list
  connectionsRef.on('value',function(snapshot){
    //grab just the first two connections
    var playerList=database.ref("/connections").limitToFirst(2);
    playerList.on('value',function(snapshot){
      // for each of the first two connections, update their gameState to 'playing'
      snapshot.forEach(function(childSnapshot){
        database.ref("/connections/"+childSnapshot.key).update({
          'gameState':'playing'
        })
      });
    });
  });

  var gameStateRef = database.ref("/connections/"+sessionStorage.getItem('myKey'));
  console.log("gameStateRef is:"+gameStateRef);

  //display the value of the clicked button, and store their selection under their connection key in the database
  $('.buttons').on("click",function(){
    var $element = $(this);
    var selection = $element.attr('value');
    $('#selection').html(selection);
    database.ref("/connections/"+sessionStorage.getItem('myKey')).update({  //grab my key from session storage
      'selection':selection
    });
  });
