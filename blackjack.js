
let suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
let value = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
let unicode = ['🂡', '🂢', '🂣', '🂤', '🂥', '🂦', '🂧', '🂨', '🂩', '🂪', '🂫', '🂭', '🂮', '🂱', '🂲', '🂳', '🂴', '🂵', '🂶', '🂷', '🂸', '🂹', '🂺', '🂻', '🂽', '🂾', '🃁', '🃂', '🃃', '🃄', '🃅', '🃆', '🃇', '🃈', '🃉', '🃊', '🃋', '🃍', '🃎', '🃑', '🃒', '🃓', '🃔', '🃕', '🃖', '🃗', '🃘', '🃙', '🃚', '🃛', '🃝', '🃞'];

 exports.createDeck = function (game,nrOfDecks = 6) {
    let k = 1;
    while (k <= nrOfDecks) {
        let c = 0;
        for (let i = 0; i < suits.length; i++) {
            for (let n = 0; n < value.length; n++) {
                var card = {
                    suit: suits[i],
                    value: value[n],
                    unicode: "<span class='" + suits[i] + "'>" + unicode[c] + '</span>'
                };
                game.deck.push(card);
                c++;
            }
        }
        k++;
    }
}

exports.createPlayer = function (game, name, balance) {
   
    let player = {
        hand: [],
        score: 0,
        name: name,
        bet: 0,
        balance: balance,
        active:false
    };
    
    game.player.push(player);
}

exports.createDealer = function (game) {
    let dealer = {
        hand: [],
        score: 0,
        name: "Dealer",
        active:false
    };
    game.dealer = dealer;
}

exports.shuffleDeck = function (game) {
    game.deck.sort(function (a, b) {
        return 0.5 - Math.random();
    });
}

function drawCard(game) {
    return game.deck.shift();
}

exports.deal = function (game) {

    for (let i = 0; i < game.player.length; i++) {
        game.player[i].hand.push(drawCard(game));
        game.player[i].hand.push(drawCard(game));
        game.player[i].score = calculateHand(game.player[i].hand);
        earlyCondition(game.player[i]);
    }
    game.dealer.hand.push(drawCard(game));
    game.dealer.hand.push(drawCard(game));
    game.dealer.score = calculateHand(game.dealer.hand);
}

function calculateHand(cards) {
    let score = 0;
    cards.forEach(card => {
        score += card.value;
    })
  checkAce(cards);
    return score;
}
 function checkAce(hand) {
    for (let i = 0; i < hand.length; i++) {
        if (hand.score > 21 && hand[i].value == 11) {
            hand.score -= 10;
            hand[i].value = 1;
        }
    }
}

function earlyCondition(player) {
    if (player.score == 21) {
        return console.log("Black Jack "  + player.name);
    }
}

exports.hit = function (game,player) { 

    game.player[0].hand.push(drawCard(game))

}


function winingCondition(game,player,dealer) {

if(game.player[0].score > game.dealer.score || game.player[0].score == 21){

    console.log(game.player[0] + " Won!");
}
    
}

exports.stand =  function (game,player){

   if( game.player[0].active === true){
       game
   }
    
}




// createDeck();
// shuffleDeck();
// createDealer();
// createPlayer("kalle", 5000);
// createPlayer("Anka", 10000);
// deal();

// console.log(game.player[0].score);
// console.log(game.player[1].score);
// console.log(game.dealer.score);

