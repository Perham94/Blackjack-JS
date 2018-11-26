
let game = {
    player: [],
    dealer: {},
    deck: []
};

let suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
let value = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
let unicode = ['🂡', '🂢', '🂣', '🂤', '🂥', '🂦', '🂧', '🂨', '🂩', '🂪', '🂫', '🂭', '🂮', '🂱', '🂲', '🂳', '🂴', '🂵', '🂶', '🂷', '🂸', '🂹', '🂺', '🂻', '🂽', '🂾', '🃁', '🃂', '🃃', '🃄', '🃅', '🃆', '🃇', '🃈', '🃉', '🃊', '🃋', '🃍', '🃎', '🃑', '🃒', '🃓', '🃔', '🃕', '🃖', '🃗', '🃘', '🃙', '🃚', '🃛', '🃝', '🃞'];

function createDeck(nrOfDecks = 6) {
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

function createPlayer(name, balance) {
    let player = {
        hand: [],
        score: 0,
        name: name,
        bet: 0,
        balance: balance
    };
    game.player.push(player);
}

function createDealer() {
    let dealer = {
        hand: [],
        score: 0,
        name: "Dealer"
    };
    game.dealer = dealer;
}

function shuffleDeck() {
    game.deck.sort(function (a, b) {
        return 0.5 - Math.random();
    });
}

function drawCard() {
    return game.deck.shift();
}

function deal() {

    for (let i = 0; i < game.player.length; i++) {
        game.player[i].hand.push(drawCard());
        game.player[i].hand.push(drawCard());
        game.player[i].score = calculateHand(game.player[i].hand);
        earlyCondition(game.player[i]);
    }
    game.dealer.hand.push(drawCard());
    game.dealer.hand.push(drawCard());
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

function hit() {
    
}

createDeck();
shuffleDeck();
createDealer();
createPlayer("kalle", 5000);
createPlayer("Anka", 10000);
deal();

console.log(game.player[0].score);
console.log(game.player[1].score);
console.log(game.dealer.score);
