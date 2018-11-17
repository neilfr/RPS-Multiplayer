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
 
  var counter=0;
  var myKey;
  var opponentKey;

  // the special firebase location that is updated when client connection states change
  var connectedRef = database.ref(".info/connected"); 
  // only fires when "i" get connected or disconnected
  // when the connection state changes (connectedRef is the firebase client connection list)
  connectedRef.on("value", function(snapshot){
    // if they are connected (meaning there is a value in the snapshot... its not null)... the val will be true
    if (snapshot.val()){
      // adds the user to our connections list
      var connection=connectionsRef.push(true); // is there any significance to this being set to 'true'... or could it be anything?
      connection.onDisconnect().remove();
      connection.set({
        gameState: 'waiting',
        wins: '0',
        mySelection: 'nothing',
        opponentsSelection: 'nothing'
      });
      drawWaitingScreen();
      sessionStorage.setItem('myKey',connection.key);//store myKey in my session's session storage


      var myConnectionRef=database.ref("/connections/"+sessionStorage.getItem('myKey'))
      myConnectionRef.on('value',function(snapshot){
        console.log(snapshot.val());
        console.log("myConnectionRef is trying to be:"+"/connections/"+sessionStorage.getItem('myKey'));
        console.log("the snapshot key is: "+snapshot.key);  
        console.log("get any snapshot value from the database please!!!!: "+snapshot.child('mySelection'));  
      });
    }
  });

  var gameState = "hello";
  // location for all connections and their data
  var connectionsRef = database.ref("/connections"); 
  // fires when 'anyone' connects or disconnects... or other changes occur to the children
  //fires everytime there are any changes to connectionsRef or its children
  
  connectionsRef.on('child_added',newGame);
  connectionsRef.on('child_removed',newGame);

  function newGame (snapshot){
    //grab just the first two connections
    var playerList=database.ref("/connections").limitToFirst(2);
    playerList.once('value',function(snapshot){
      // for each of the first two connections, update their gameState to 'playing'
      var needNewGame=false;
      snapshot.forEach(function(childSnapshot){
        if (childSnapshot.val().gameState==='waiting'){
          needNewGame=true;
          }
        if(childSnapshot.key===sessionStorage.getItem('myKey')){
          drawPlayingScreen();
          console.log('drew playing screen for child snapshot key:'+childSnapshot.key);
        }else{
          sessionStorage.setItem('opponentsKey',childSnapshot.key);
        }
      });
      if(needNewGame){
        snapshot.forEach(function(childSnapshot){
          database.ref("/connections/"+childSnapshot.key).update({
            'gameState':'playing',  
            'mySelection': 'nothing',
            'opponentsSelection': 'nothing'
          });
        })
      }    
    });
  };
  

  //var myGameStateRef=database.ref("/connections/"+sessionStorage.getItem('myKey')+'/gameState');

  function drawPlayingScreen(){
    $("#gameContainer").empty()
    var $rockBtn=$("<button>");
    $rockBtn.addClass("buttons");
    $rockBtn.attr('value','rock');
    $rockBtn.text('rock');
    var $paperBtn=$("<button>");
    $paperBtn.addClass("buttons");
    $paperBtn.attr('value','paper');
    $paperBtn.text('paper');
    var $scissorsBtn=$("<button>");
    $scissorsBtn.addClass("buttons");
    $scissorsBtn.attr('value','scissors');
    $scissorsBtn.text('scissors');
    $('#gameContainer').append($rockBtn);
    $('#gameContainer').append($paperBtn);
    $('#gameContainer').append($scissorsBtn);
  }

  function drawWaitingScreen(){
    $('#gameContainer').html("the ring is occupied, waiting in the locker room");
  }

  //display the value of the clicked button, and store their selection under their connection key in the database
  $(document).on("click",".buttons",function(){
  //$('.buttons').on("click",function(){
    var $element = $(this);
    var mySelection = $element.attr('value');
  //  console.log("my selection from the button is:"+mySelection);
  console.log("mykey from the click event is:"+sessionStorage.getItem('myKey'));
    $('#mySelection').html(mySelection);
    database.ref("/connections/"+sessionStorage.getItem('myKey')).update({  //grab my key from session storage and update the database
      'mySelection':mySelection
    });
    database.ref("/connections/"+sessionStorage.getItem('opponentsKey')).update({  //grab my key from session storage and update the database
        'opponentsSelection':mySelection
    });
  });
