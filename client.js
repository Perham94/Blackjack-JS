$(document).ready(function () {
  let userName = prompt('Username', 'AnonymousX');
  if (userName == null || userName == '') { alert('User canceled'); } else {
    connect(userName);
  }
});

function connect(userName) {
  const socket = io();
  let message = $('#m');
  socket.emit('change_username', {
    username: userName
  });

  message.bind('keypress', function () {
    socket.emit('typing');
  });
  socket.on('user already exist',function(){
    alert("user already exist");
    location.reload();
  });

  socket.on('typing', function (data) {
    $('#feedBack').html($('<li>').text(data.username + ' is typing'));
    $('#messages').scrollTop($('#messages').prop("scrollHeight"));
  });

  socket.on('done typing', function (data) {
    $('#feedBack').html($('<li>').text());
  });

 
  socket.on('chat message', function (msg) {
    $('#messages').append($('<li>').text(msg));
    $('#messages').scrollTop($('#messages').prop("scrollHeight"));
  });

  socket.on('userList', function (userList) {
    $('#users').html('');
    for (let i = 0; i < userList.users.length; i++) {
      $('#users').append($('<li>').text(userList.users[i]));
    }
  });

  socket.on('updateBalance',function(balance){
    $("#balanceArea").html("");
    $("#balanceArea").append(balance);

  });

  // GAME
  socket.on("showHand", function (data) {

    let player = data.player;
    let dealer = data.dealer;

    $("#dealerHand").html("");
    $("#dealerScore").text("");
    $("#dealerScore").text(dealer.score);

    let dealerHTML ="";
    // "<p>"+dealer.name + " : " + " Score = " + dealer.score + " : </p>";
    // $("#outputAreaDealer").append(text);

    for (let i = 0; i < dealer.hand.length; i++) {
      let margin = 30 *i;
      dealerHTML+="<img style='left:"+ margin+ "px' src='"+ dealer.hand[i].png+"'></img>";
    }
    // dealerHTML+="";
    
    $("#dealerHand").append(dealerHTML);

    // let h =$("#outputAreaDealer").find("span").height()+$("#outputAreaDealer").find("p").height();
    // $("#outputAreaDealer").height(h);

    for (let l = 0; l < player.length; l++) {
      
      if (player[l].hand.length>0) {
        let nr = l+1;

        let score = $("#player"+nr+"Score");
        score.text("");
        let hand = $("#player"+nr+"Hand");
        hand.html("");
        let playerHTML="";
        // "<p>"+ player[l].name + " : " + " Score = " + player[l].score + " : </p>";
    score.text(player[l].score);
        for (let i = 0; i < player[l].hand.length; i++) {
          let margin = 30 *i;
          playerHTML+="<img style='left:"+ margin+ "px' src='"+ player[l].hand[i].png+"'></img>";
        }
        // playerHTML+="<br>";
        hand.append(playerHTML);
        // let h =$("#outputArea").find("span").height()+$("#outputArea").find("p").height();
        // $("#outputArea").height(h);
      }
    }
  });

  socket.on("enable", function () {
    $("#hit").attr("disabled", false);
    $("#stand").attr("disabled", false);
    $("#doubleDown").prop("disabled", false);
    $("#surender").prop("disabled", false);
  });

  socket.on("enable newGame", function (data) {
    if ($("#play").prop("checked")) {
      $("#newGame").prop("disabled", false);
    }
    $("#play").prop("disabled", false);
  });

  socket.on("disable", function () {
    $("#hit").attr("disabled", true);
    $("#stand").attr("disabled", true);
    $("#newGame").prop("disabled", true);
    $("#play").prop("disabled", true);
    $("#doubleDown").prop("disabled", true);
    $("#surender").prop("disabled", true);
  });

  $("#hit").on("click", function () {
    socket.emit('hit');
  });

  $("#stand").on("click", function () {
    $("#stand,#hit").attr("disabled", true);

    socket.emit('stand');

  });


  $("#surender").on("click",function(){

  socket.emit("surrender");
  });

  $("#doubleDown").on("click",function(){

socket.emit("doubleDown");
  });

  $("#newGame").on("click", function () {
    socket.emit("newGame");
  });

  $('#bet').submit(function () {
    let regex = new RegExp('[0-9]');
    if(regex.test($('#betInput').val())){
     socket.emit('bet', $('#betInput').val());
     $('#betInput').val('');
    }else{ alert("Accepts numbers only!");$('#betInput').val('');}
    return false;
   });
   
   $('#chatMsg').submit(function () {
    socket.emit('done typing');
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });

  $("#play").on("change", function () {
    if ($(this).prop("checked")) {
      socket.emit('active');
      $("#newGame").attr("disabled", false);
    } else {
      socket.emit('not active');
      $("#newGame").attr("disabled", true);
    }
  });

  socket.on("won", function (game) {
    $('#winnerArea').html('');
    for (let i = 0; i < game.winnerList.length; i++) {
      $("#winnerArea").append(game.winnerList[i]+"<br>");  
    }
  });


}