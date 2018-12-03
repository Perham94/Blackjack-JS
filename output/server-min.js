const app=require("express")(),express=require("express"),http=require("http").Server(app),io=require("socket.io")(http),port=3e3,blackjack=require("./blackjack-min");process.on("uncaughtException",function(e){console.error("uncaughtException",e.stack)});let game={player:[],dealer:{},deck:[],active:!1,winnerList:[]},activePlayers=[];blackjack.createDeck(game),blackjack.shuffleDeck(game),blackjack.createDealer(game),http.listen(3e3,function(){console.log("listening on *: 3000")}),app.get("/",function(e,a){a.sendFile(__dirname+"/index.html")}),app.use(express.static(__dirname));let userList={users:[]},id=0;io.on("connection",function(e){let a="";function t(e){io.emit("userList",e)}function n(e){if(e.dealer.active)var a={player:e.player,dealer:e.dealer};else a={player:e.player,dealer:{name:"dealer",hand:[e.dealer.hand[0],{unicode:"<span class='cardBack'>🂠</span>",png:"/png/blue_back.png"}],score:e.dealer.score}};io.emit("showHand",a)}function i(){io.emit("disable")}function c(){i();let e=a;for(let a=0;a<game.player.length;a++)if(game.player[a].name===e){game.player[a].active=!1;break}let t=game.player.find(function(e){return e.active});null==t?(game.dealer.active=!0,blackjack.stand(game),n(game),io.emit("enable newGame"),function(e){io.emit("won",e)}(game),function(e){for(let a=0;a<e.player.length;a++)e.player[a].hand=[],e.player[a].score=0;e.dealer.active=!1,e.dealer.hand=[],e.dealer.score=0,e.winnerList=[]}(game),game.active=!1,r(game)):io.to(`${t.socketid}`).emit("enable")}function r(e){for(let a=0;a<e.player.length;a++)io.to(`${e.player[a].socketid}`).emit("updateBalance",e.player[a].balance)}t(userList),e.on("change_username",function(i){-1===userList.users.indexOf(i.username)?(a=i.username,userList.users.push(a),t(userList),io.emit("chat message",a+" connected"),console.log(a+" connected"),blackjack.createPlayer(game,id,e.id,a,1e3,!1),r(game),id++,game.active&&n(game)):(e.emit("user already exist"),e.disconnect(!0))}),e.on("typing",function(){e.broadcast.emit("typing",{username:a})}),e.on("done typing",function(){e.broadcast.emit("done typing",{username:a})}),e.on("disconnect",function(){let e=userList.users.indexOf(a);e>-1&&userList.users.splice(e,1),t(userList),console.log(a+" user disconnected")}),e.on("chat message",e=>{let t=new Date,n=t.getHours(),i=t.getMinutes();i<10&&(i="0"+i),io.emit("chat message",n+":"+i+" "+a+": "+e)}),e.on("newGame",()=>{if(!1===game.active&&activePlayers.length>0){r(game);for(let e=0;e<game.player.length;e++)for(let a=0;a<activePlayers.length;a++)game.player[e].name===activePlayers[a]&&(game.player[e].active=!0);let e=game.player.find(e=>!0===e.active);game.active=!0,game.dealer.activ=!1,blackjack.deal(game),i(),function(e){io.to(`${e}`).emit("enable")}(e.socketid),n(game)}}),e.on("active",()=>{activePlayers.push(a),console.log(activePlayers)}),e.on("not active",()=>{let e=activePlayers.indexOf(a);activePlayers.splice(e,1),console.log(activePlayers)}),e.on("hit",function(e){blackjack.hit(game,a),n(game),game.player.find(e=>e.name==a).score>21&&c()}),e.on("stand",function(e){c()}),e.on("bet",function(e){let t=game.player.find(function(e){return e.name==a});t.bet+=parseInt(e),t.balance>=e&&(t.balance-=e,r(game))})});