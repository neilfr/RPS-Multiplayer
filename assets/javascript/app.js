
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
  var myConnectionRef;

//  var numPlayers=0;
 
  // location for all connections
  var connectionsRef = database.ref("/connections"); // fire when 'anyone' connects or disconnects (see line 31)

  // the special firebase location that is updated when client connection states change
  var connectedRef = database.ref(".info/connected"); //only fires when "i" get connected or disconnected

  // when the connection state changes (connectedRef is the firebase client connection list)
  connectedRef.on("value", function(snapshot){
        // if they are connected (meaning there is a value in the snapshot... its not null)... the val will be true
      if (snapshot.val()){
          // adds the user to our connections list
          //  don't need this?  database.ref('/connections');
          // the 'true' value is irrelevant
          var connection=connectionsRef.push(true);

          connection.onDisconnect().remove();



            myConnectionRef=database.ref('/player/'+connection.key);
            myConnectionRef.set({
              gameState: 'waiting'
            });
            myConnectionRef.onDisconnect().remove();

          sessionStorage.setItem('myKeyPath',myConnectionRef);

          database.ref(myConnectionRef).on('value',function(snapshot){

          });




          
          
          
      }
  });

  database.ref("/connections").on('value',(function(snapshot){
    var numPlayers=snapshot.numChildren();
    console.log("child count of /connections is:"+numPlayers);
    sessionStorage.setItem('playerCount',numPlayers);
  }));

//  database.ref("/connections").once('value').then(function(snapshot){
//    sessionStorage.setItem("playerNum",snapshot.numChildren());
// get playerNum from session storage... if null get a player number... numchildren

/*    var connectionNumber = sessionStorage.getItem('playerNum');
    $('#playerNumber').html('I am player number:'+connectionNumber);
    console.log("ARG grabbing from session storage"+connectionNumber);
    if (connectionNumber<3){
      $('#gameState').html('I am playing');
      gameOpen=true;
    }else{
      $('#gameState').html('I am locked out');
      gameOpen=false;
    }
  });
*/

  // when our connections list changes
/*  connectionsRef.on("value", function(snapshot){
    numPlayers=snapshot.numChildren();
    $('#numChildren').html('Number of players is:'+numPlayers);
  });
*/

  //display the value of the clicked button
  $('.buttons').on("click",function(){
        var $element = $(this);
        var selection = $element.attr('value');
        $('#selection').html(selection);
        database.ref(myConnectionRef).update({
          'selection':selection
        });

  });


 database.ref('/test').set({
      testValue:'hello world'
  });