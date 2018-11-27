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
  socket.on('typing', function (data) {
    $('#feedBack').html($('<li>').text(data.username + ' is typing'));
    $('#chat').scrollTop($('#messages').height());
  });
  socket.on('done typing', function (data) {
    $('#feedBack').html($('<li>').text());
  });
  $('form').submit(function () {
    socket.emit('done typing');
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });

  socket.on('chat message', function (msg) {
    $('#messages').append($('<li>').text(msg));
    $('#chat').scrollTop($('#messages').height());

  });

  socket.on('userList', function (user) {
    $('#users').html('');
    for (let i = 0; i < user.users.length; i++) {
      $('#users').append($('<li>').text(user.users[i]));
    }
  });

  // GAME
  socket.on("showHand", function (data) {
    $("#outputArea").html("");
    let player = data.player;
    //let dealer = data.dealer;
    for (let l = 0; l < data.player.length; l++) {
     
      $("#outputArea").append(data.player[l].name +":");
      for (let i = 0; i < data.player[l].hand.length; i++) {
        $("#outputArea").append(player[l].hand[i].unicode);
      }
    }
  });
  
  socket.on("enable", function () {
    $("#hit").attr("disabled", false);
    $("#stand").attr("disabled", false);
  });

  $("#hit").on("click", function () {
    socket.emit('hit');
  })


  $("#stand").on("click", function () {
    $("#stand,#hit").attr("disabled", true);
  })

}