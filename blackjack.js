

exports.createDeck = function (game, nrOfDecks = 6) {
    let suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
    let value = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
    let unicode = ['🂡', '🂢', '🂣', '🂤', '🂥', '🂦', '🂧', '🂨', '🂩', '🂪', '🂫', '🂭', '🂮', '🂱', '🂲', '🂳', '🂴', '🂵', '🂶', '🂷', '🂸', '🂹', '🂺', '🂻', '🂽', '🂾', '🃁', '🃂', '🃃', '🃄', '🃅', '🃆', '🃇', '🃈', '🃉', '🃊', '🃋', '🃍', '🃎', '🃑', '🃒', '🃓', '🃔', '🃕', '🃖', '🃗', '🃘', '🃙', '🃚', '🃛', '🃝', '🃞'];
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

exports.createPlayer = function (game, id, socketid, name, balance, active) {

    let player = {
        id: id,
        socketid: socketid,
        hand: [],
        score: 0,
        name: name,
        bet: 0,
        balance: balance,
        active: active
    };

    game.player.push(player);
}

exports.createDealer = function (game) {
    let dealer = {
        hand: [],
        score: 0,
        name: "Dealer",
        active: false
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
        if (game.player[i].active) {
            game.player[i].hand.push(drawCard(game));
            game.player[i].hand.push(drawCard(game));
            calculateHand(game.player[i]);
            earlyCondition(game.player[i]);
        }
    }

    game.dealer.hand.push(drawCard(game));
    game.dealer.hand.push(drawCard(game));
    calculateHand(game.dealer);
}

function calculateHand(player) {
    let score = 0;

    player.hand.forEach(card => {
        score += card.value;
    })
    player.score = score;
    checkAce(player);
}

function checkAce(player) {
    for (let i = 0; i < player.hand.length; i++) {
        if (player.score > 21 && player.hand[i].value == 11) {
            player.score -= 10;
            player.hand[i].value = 1;
        }
    }

}

function earlyCondition(player) {
    if (player.score == 21) {
        return console.log("Black Jack " + player.name);
    }
}

exports.hit = function (game, player) {
    let id;
    for (let i = 0; i < game.player.length; i++) {
        if (game.player[i].name === player) {
            id = game.player[i].id;
            break;
        }
    }
    game.player[id].hand.push(drawCard(game));
    calculateHand(game.player[id]);

}


exports.stand = function (game) {

    while (game.dealer.score <= 17) {
        game.dealer.hand.push(drawCard(game));
        calculateHand(game.dealer);
    }

    winingCondition(game);

}

function winingCondition(game) {

    for (let i = 0; i < game.player.length; i++) {
        if (game.player[i].hand.length > 0) {
            if (game.player[i].score > game.dealer.score && game.player[i].score <= 21 || game.dealer.score >21) {
                game.winnerList.push(game.player[i].name + " Won!");
            }
            else if (game.player[i].score == game.dealer.score && game.player[i].score <= 21) {
                game.winnerList.push(game.player[i].name + "Push!");
            }
            else if (game.player[i].score < game.dealer.score && game.dealer.score <= 21) {
                game.winnerList.push("Dealer Wins! " + game.player[i].name + " Lose!");
            }
            else if (game.player[i].score > 21) {
                game.winnerList.push(game.player[i].name + " Busted!");
            }

        }
    }
    if (game.dealer.score > 21) {
        game.winnerList.push("Dealer Busted!");

    }
}






