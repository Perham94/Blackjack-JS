const app = require('express')();
const express = require('express');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000;
process.on('uncaughtException', function (err) {
  console.error('uncaughtException', err.stack);

});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.use(express.static(__dirname));

let userList = { users: [] };

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
});

http.listen(port, function () {
  console.log('listening on *: '+ port);
});

function sendUserList(userList) {
  io.emit('userList', userList);
}
