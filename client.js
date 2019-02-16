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
  socket.on('user already exist', function () {
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

  socket.on('updateBalance', function (balance) {
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

    let dealerHTML = "";

    for (let i = 0; i < dealer.hand.length; i++) {
      let margin = 30 * i;
      dealerHTML += "<img style='left:" + margin + "px' src='" + dealer.hand[i].png + "'></img>";
    }

    $("#dealerHand").append(dealerHTML);

    $("#player1Name").text("");
    $("#player2Name").text("");
    $("#player3Name").text("");
    $("#player1Score").text("");
    $("#player2Score").text("");
    $("#player3Score").text("");
    $("#player1Hand").html("");
    $("#player2Hand").html("");
    $("#player3Hand").html("");

    for (let l = 0; l < player.length; l++) {

      if (player[l].hand.length > 0) {
        let nr = player[l].id+1;
        let name = $("#player" + nr + "Name");
        let score = $("#player" + nr + "Score");
        score.text("");
        let hand = $("#player" + nr + "Hand");
        hand.html("");
        let playerHTML = "";
        name.text(player[l].name);
        score.text(player[l].score);
        for (let i = 0; i < player[l].hand.length; i++) {
          let margin = 30 * i;
          playerHTML += "<img style='left:" + margin + "px' src='" + player[l].hand[i].png + "'></img>";
        }
        hand.append(playerHTML);
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

  $("#surender").on("click", function () {

    socket.emit("surrender");
  });

  $("#doubleDown").on("click", function () {
    socket.emit("doubleDown");
  });

  $("#newGame").on("click", function () {
    socket.emit("newGame");
  });
  $("#reset").on("click", function () {
    socket.emit("reset");
    $("#hit").attr("disabled", true);
    $("#stand").attr("disabled", true);
    $("#newGame").prop("disabled", true);
    $("#play").prop("disabled", true);
    $("#doubleDown").prop("disabled", true);
    $("#surender").prop("disabled", true);
  });

  $('#bet').submit(function () {
    let regex = new RegExp('[0-9]+');
    if (regex.test($('#betInput').val())) {
      socket.emit('bet', $('#betInput').val());
      $('#betInput').val('');
    } else { alert("Accepts numbers only!"); $('#betInput').val(''); }
    return false;
  });

  $('#chatMsg').submit(function () {
    socket.emit('done typing');
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });

  socket.on("to many active players", function () {
    if ($("#play").prop("checked")) {
      $("#play").prop("checked",false);
      $("#newGame").attr("disabled", true);
    }
  });
//    if ($(this).prop("checked")) {
  $("#play").on("change", function () {
    if ($("#play").prop("checked")) {
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
      $("#winnerArea").append(game.winnerList[i] + "<br>");
    }
  });


}