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
  var readyForNewGame;
  var needNewGame;
  var wins=0;
  var losses=0;


  // the special firebase location that is updated when client connection states change
  var connectedRef = database.ref(".info/connected"); 
  // only fires when "i" get connected or disconnected
  // when the connection state changes (connectedRef is the firebase client connection list)
  connectedRef.on("value", function(snapshot){
    // if they are connected (meaning there is a value in the snapshot... its not null)... the val will be true
    if (snapshot.val()){
      // adds the user to our connections list
      var connection=connectionsRef.push({
        gameState: 'waiting',
        wins: '0',
        mySelection: 'nothing',
        opponentsSelection: 'nothing'
      });
     
      connection.onDisconnect().remove();

      drawWaitingScreen();
      sessionStorage.setItem('myKey',connection.key);//store myKey in my session's session storage

      var myConnectionRef=database.ref("/connections/"+sessionStorage.getItem('myKey'));
      myConnectionRef.on('value',function(snapshot){

        // get both players' picks
        var myPick=snapshot.val().mySelection;
        var opponentsPick=snapshot.val().opponentsSelection;

        // if both players have picked something... figure out who won
        if(myPick!='nothing'&&opponentsPick!='nothing'){
          //clear old status message
          $('#status').html("");
          $('#opponentsSelection').html("your opponent picked: "+opponentsPick);
          if((myPick==='rock'&&opponentsPick==='scissors')||
            (myPick==='paper'&&opponentsPick==='rock')||
            (myPick==='scissors'&&opponentsPick==='paper')){
              wins++;
              $('#wins').html("wins: "+wins);
          }
          if((myPick==='rock'&&opponentsPick==='paper')||
            (myPick==='paper'&&opponentsPick==='scissors')||
            (myPick==='scissors'&&opponentsPick==='rock')){
              losses++;
              $('#losses').html("losses: "+losses);
          }
          
          var $restartBtn=$("<button>");
          $restartBtn.addClass("restartButton");
          $restartBtn.attr('value','restart');
          $restartBtn.text('Play Again!');
          $('#restartContainer').append($restartBtn);

        //  snapshot.val().mySelection;
        //  snapshot.val().opponentsSelection;
        } 
      });
    }
  });

  // location for all connections and their data
  var connectionsRef = database.ref("/connections"); 
  // fires when 'anyone' adds or removes a child object from the list (IE. a connection is added or removed)
  connectionsRef.on('child_added',newGame);
  connectionsRef.on('child_removed',newGame);

  function newGame (snapshot){
    console.log("trying to start new game");
    // clear out old status message
    $('#status').html("");

    //grab just the first two connections
    var playerList=database.ref("/connections").limitToFirst(2);
    playerList.once('value',function(snapshot){
      if(snapshot.numChildren()<2){ // we don't have 2 players yet
        $('#status').html("waiting for an opponent");
        readyForNewGame=false;
        return;
      }

      needNewGame=false;
      snapshot.forEach(function(childSnapshot){
        //check if either of the first 2 connections has their game state set to waiting... 'cause that means we need to start a new game
        if (childSnapshot.val().gameState==='waiting'){
          needNewGame=true;
        }
      });
    
      // if we need a new game... reset the game state, mySelection and opponentsSelection
    //  if(needNewGame&&readyForNewGame){
        if(needNewGame){
          snapshot.forEach(function(childSnapshot){
            
            //check to see if either of the first 2 connections is my connection... and then draw the playing screen
            if(childSnapshot.key===sessionStorage.getItem('myKey')){
              drawPlayingScreen();
            }else{
              //whichever key, of the first two, isn't mine... must be my opponents... so store it
              sessionStorage.setItem('opponentsKey',childSnapshot.key);
            } //end if and else
            database.ref("/connections/"+childSnapshot.key).update({
              'gameState':'playing',  
              'mySelection': 'nothing',
              'opponentsSelection': 'nothing'
            });//end database.ref
      
          }) //end foreach
        } // end if(needNewGame...)
      }); //end playerList.once
    };//end function newGame
  
  

  //var myGameStateRef=database.ref("/connections/"+sessionStorage.getItem('myKey')+'/gameState');

  function drawPlayingScreen(){
    $("#gameContainer").empty();
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
    $('#wins').html("wins: "+wins);
    $('#losses').html("losses: "+losses);
    $('#status').html("waiting for your opponent to pick");
  }

  function drawWaitingScreen(){
    $('#gameContainer').html("waiting in the locker room");
  }

  //display the value of the clicked button, and store their selection under their connection key in the database
  $(document).on("click",".buttons",function(){
    var $element = $(this);
    var mySelection = $element.attr('value');
    $('.buttons').attr('disabled','disabled');
    $('#mySelection').html("You picked: "+mySelection);
    database.ref("/connections/"+sessionStorage.getItem('myKey')).update({  //grab my key from session storage and update the database
      'mySelection':mySelection
    });
    database.ref("/connections/"+sessionStorage.getItem('opponentsKey')).update({  //grab my opponent's key from session storage and update the database
        'opponentsSelection':mySelection
    });
  });

  $(document).on("click",".restartButton",function(){
    database.ref("/connections/"+sessionStorage.getItem('myKey')).update({
      mySelection: 'nothing',
      opponentsSelection: 'nothing',
      gameState:'waiting'
    });

    newGame();
  });
 