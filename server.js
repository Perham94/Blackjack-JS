const app = require('express')();
const express = require('express');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const blackjack = require('./blackjack.js');
const port = 3000;


process.on('uncaughtException', function (err) {
  console.error('uncaughtException', err.stack);

});
// GAME CODE
let game = {
  player: [],
  dealer: {},
  deck: [],
  active: false,
};
let activePlayers = [];

blackjack.createDeck(game);
blackjack.shuffleDeck(game);
blackjack.createDealer(game);

// console.log(game.dealer);

// END
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.use(express.static(__dirname));

let userList = { users: [] };
let id = 0;
io.on('connection', function (socket) {

  let userName = '';
  sendUserList(userList);
  socket.on('change_username', function (data) {
    {
      userName = data.username;
      socket.username = userName;
      userList.users.push(userName);
      sendUserList(userList);
      io.emit('chat message', socket.username + ' connected');
      console.log(socket.username + ' connected');
      blackjack.createPlayer(game, id, socket.id, userName, 1000, true);
      id++;

    }
  });

  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  socket.on('done typing', function () {
    socket.broadcast.emit('done typing', {
      username: socket.username
    });
  });

  socket.on('disconnect', function () {
    let index = userList.users.indexOf(userName);
    if (index > -1) {
      userList.users.splice(index, 1);
    }
    sendUserList(userList);
    console.log(socket.username + ' user disconnected');
    socket.username = '';
  });

  socket.on('chat message', function (msg) {
    console.log(socket.username + ': ' + msg);
    io.emit('chat message', socket.username + ': ' + msg);
  });


  // GAME 
  socket.on('newGame', function () {

    if (game.active === false) {
      // activePlayers.push({name:userName});
      game.active = true;
      blackjack.deal(game);
      enableButtons(socket);
    }
    showHand(game);


  });

  socket.on('hit', function (data) {
    blackjack.hit(game, socket.username);
    showHand(game);
  });

  socket.on('stand', function (data) {
    // activePlayers.shift();
    disableButtons();
    let player = socket.username;
    let id;
    for (let i = 0; i < game.player.length; i++) {
      if (game.player[i].name === player) {
        game.player[i].active = false;
        break;
      }
    }
    let obj = game.player.find(function (element) {
      return element.active
    });
    if (obj == undefined) {

      blackjack.stand(game);
      
    }else{
      io.to(`${obj.socketid}`).emit('enable');

    }
  });




});

http.listen(port, function () {
  console.log('listening on *: ' + port);
});

function sendUserList(userList) {
  io.emit('userList', userList);
}
function newGame() {

}

function showHand(game) {
  let showHand = {
    player: game.player,
    dealer: game.dealer
  }

  io.emit("showHand", showHand);
}

function enableButtons(socket) {
  socket.emit("enable");
}
function disableButtons(socket) {
  io.emit("disable");
}
