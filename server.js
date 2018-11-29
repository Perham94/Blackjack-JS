const app = require('express')();
const express = require('express');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000;
const blackjack = require('./blackjack');


process.on('uncaughtException', function (err) {
  console.error('uncaughtException', err.stack);
});

// GAME CODE
let game = {
  player: [],
  dealer: {},
  deck: [],
  active: false,
  winnerList: [],

};
let activePlayers = [];

blackjack.createDeck(game);
blackjack.shuffleDeck(game);
blackjack.createDealer(game);

// END

http.listen(port, function () {
  console.log('listening on *: ' + port); // listen on port wait for client
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html'); // Send Index.html to client
});
app.use(express.static(__dirname)); //Creates a communication handler between server and html client



let userList = { users: [] };
let id = 0;

io.on('connection', function (socket) {

  let userName = '';
  sendUserList(userList);
  socket.on('change_username', function (data) {
    // console.log(userList.users.indexOf(userName));
    if(userList.users.indexOf(data.username) === -1){
      userName = data.username;
      userList.users.push(userName);
      sendUserList(userList);
      io.emit('chat message', userName + ' connected');
      console.log(userName + ' connected');
      blackjack.createPlayer(game, id, socket.id, userName, 1000, false);
      id++;
    }else{
      socket.emit("user already exist");
      socket.disconnect(true);
      // socketIOService.connect(SERVER_IP, {'force new connection': true});

    }
  });

  function sendUserList(userList) {
    io.emit('userList', userList);
  }


  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: userName
    });
  });

  socket.on('done typing', function () {
    socket.broadcast.emit('done typing', {
      username: userName
    });
  });

  socket.on('disconnect', function () {
    let index = userList.users.indexOf(userName);
    if (index > -1) {
      userList.users.splice(index, 1);
    }
    sendUserList(userList);
    console.log(userName + ' user disconnected');

  });

  socket.on('chat message', function (msg) {
    // console.log(userName + ': ' + msg);
    io.emit('chat message', userName + ': ' + msg);
  });



  // GAME 
  socket.on('newGame', function () {

    if (game.active === false && activePlayers.length > 0) {

      for (let i = 0; i < game.player.length; i++) {
        for (let n = 0; n < activePlayers.length; n++) {
          if (game.player[i].name === activePlayers[n]) {
            game.player[i].active = true;
          }
        }
      }
      let active = game.player.find(function(player){return player.active === true});
      game.active = true;
      blackjack.deal(game);
      disableButtons();
      enableButtons(active.socketid);
      showHand(game);
    }


  });
  socket.on('active', function () {
    activePlayers.push(userName);
    console.log(activePlayers);
  });

  socket.on('not active', function () {
    let idx = activePlayers.indexOf(userName);
    activePlayers.splice(idx, 1);
  });

  socket.on('hit', function (data) {
    blackjack.hit(game, userName);
    showHand(game);
    let player = game.player.find(function (player)
     { return player.name == userName });
    if (player.score > 21) {
      stand();
    }
  });

  socket.on('stand', function (data) {
    stand();
  });

  socket.on('bet',function(data){

    let player = game.player.find(function (player)
     { return player.name == userName });

     player.bet = data;
     player.balance -= data;

  });



  function showHand(game) {
    let showHand = {
      player: game.player,
      dealer: game.dealer
    }
    io.emit("showHand", showHand);
  }



  function enableButtons(socketid) {
    io.to(`${socketid}`).emit('enable');
  }
  function disableButtons() {
    io.emit("disable");
  }

  function winners(game) {
    io.emit("won", game);
  }

  function reset(game) {

    for (let i = 0; i < game.player.length; i++) {
      game.player[i].hand = [];
      game.player[i].score = 0;
    }
    game.dealer.hand = [];
    game.dealer.score = 0;
    game.winnerList = [];
  }
  function stand() {

    disableButtons();
    let player = userName;
    let id;
    for (let i = 0; i < game.player.length; i++) {
      if (game.player[i].name === player) {
        game.player[i].active = false;
        break;
      }
    }
    let obj = game.player.find(function (player) {
      return player.active
    });


    if (obj == undefined) {//Game ends
      blackjack.stand(game);
      showHand(game);
      io.emit('enable newGame');
      winners(game);
      reset(game);
      game.active = false;
    } else {
      io.to(`${obj.socketid}`).emit('enable');
    }
  }
});


