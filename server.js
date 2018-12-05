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
    if (userList.users.indexOf(data.username) === -1) {
      userName = data.username;
      userList.users.push(userName);
      sendUserList(userList);
      io.emit('chat message', userName + ' connected');
      console.log(userName + ' connected');
      blackjack.createPlayer(game, id, socket.id, userName, 1000, false);
      balance(game);
      id++;
      if (game.active) {
        showHand(game);
      }

    } else {
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

  socket.on('chat message', (msg) => {
    //console.log(userName + ': ' + msg);
    let time = new Date();
    let hours = time.getHours();
    let minutes = time.getMinutes();
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    io.emit('chat message', hours + ":" + minutes + " " + userName + ': ' + msg);
  });

  // GAME 
  socket.on('newGame', () => {

    if (game.active === false && activePlayers.length > 0) {
      balance(game);
      for (let i = 0; i < game.player.length; i++) {
        for (let n = 0; n < activePlayers.length; n++) {
          if (game.player[i].name === activePlayers[n]) {
            game.player[i].active = true;
          }
        }
      }
      let activePlayer = findActivePlayer(game)
      game.active = true;
      game.dealer.activ = false;
      blackjack.deal(game);
      disableButtons();
      enableButtons(activePlayer.socketid);
      showHand(game);
    }

  });
  socket.on('active', () => {
    activePlayers.push(userName);
    console.log(activePlayers);
  });

  socket.on('not active', () => {
    let idx = activePlayers.indexOf(userName);
    activePlayers.splice(idx, 1);
    console.log(activePlayers);
  });

  socket.on('hit', function (data) {
    blackjack.hit(game, userName);
    showHand(game);
    let player = findPlayer(game, userName);
    if (player.score > 21) {
      stand();
    }
  });

  socket.on('stand', function (data) {
    stand();
  });

  socket.on('bet', function (betAmount) {
    let player = findPlayer(game, userName);
    player.bet += parseInt(betAmount);
    if (player.balance >= betAmount) {
      player.balance -= betAmount;
      balance(game);
    }
  });

  socket.on('doubleDown', function (data) {
    let player = findPlayer(game, userName);

    if (player.balance >= player.bet) {
      player.balance -= player.bet;
      player.bet = player.bet * 2;
      blackjack.hit(game, userName);
      showHand(game);
      stand();
    }
  });


  socket.on('surrender',function(data){
    
    let player = findPlayer(game, userName);
    player.bet = player.bet * 0.5;
    player.balance += player.bet;
    player.bet =0;
    player.active = false;
    player.surended = true;
    stand();
    
  });

  function showHand(game) {

    if (game.dealer.active) {
      var showHand = {
        player: game.player,
        dealer: game.dealer
      }
    } else {
      var showHand = {
        player: game.player,
        dealer: {
          name: "dealer", hand: [game.dealer.hand[0], { unicode: "<span class='cardBack'>🂠</span>", png: "/png/blue_back.png" }],
          score: game.dealer.score
        }
      }
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
      game.player[i].surended = false;
    }
    game.dealer.active = false;
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
    let activePlayer = findActivePlayer(game);

    if (activePlayer == undefined) {//Game ends No active players
      game.dealer.active = true;
      blackjack.stand(game,activePlayers.length);
      showHand(game);
      io.emit('enable newGame');
      winners(game);
      reset(game);
      game.active = false;
      balance(game);

    } else {
      io.to(`${activePlayer.socketid}`).emit('enable');
    }
  }

  function balance(game) {
    for (let i = 0; i < game.player.length; i++) {
      io.to(`${game.player[i].socketid}`).emit('updateBalance', game.player[i].balance);
    }
  }
  function findPlayer(game, player) {
    return game.player.find(function (player) { return player.name == userName })
  }
  function findActivePlayer(game) {
    return game.player.find(function (player) { return player.active });
  }
});