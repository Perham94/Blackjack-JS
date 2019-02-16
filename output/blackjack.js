

exports.createDeck = function (game, nrOfDecks = 10) {
    let suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
    let value = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
    let unicode = ['🂡', '🂢', '🂣', '🂤', '🂥', '🂦', '🂧', '🂨', '🂩', '🂪', '🂫', '🂭', '🂮', '🂱', '🂲', '🂳', '🂴', '🂵', '🂶', '🂷', '🂸', '🂹', '🂺', '🂻', '🂽', '🂾', '🃁', '🃂', '🃃', '🃄', '🃅', '🃆', '🃇', '🃈', '🃉', '🃊', '🃋', '🃍', '🃎', '🃑', '🃒', '🃓', '🃔', '🃕', '🃖', '🃗', '🃘', '🃙', '🃚', '🃛', '🃝', '🃞'];
    let k = 1;
    while (k <= nrOfDecks) {
        let c = 0;
        for (let i = 0; i < suits.length; i++) {
            for (let n = 0; n < value.length; n++) {
                let v = value[n];
                if (value[n] == 11) {
                    v = 1;

                }
                var card = {
                    suit: suits[i],
                    value: value[n],
                    unicode: "class='" + suits[i] + "'>" + unicode[c],
                    png: "/png/" + v + suits[i][0] + ".png"
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
        split: [],
        score: 0,
        name: name,
        bet: 0,
        balance: balance,
        active: active,
        surended: false
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
    calculateHand(game.dealer);
    game.dealer.hand.push(drawCard(game));
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
        if (player.hand[i].value == 11 && player.score > 21) {
            player.hand[i].value = 1;
            player.score -= 10;
            break;
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
            id = i;
            break;
        }
    }
    game.player[id].hand.push(drawCard(game));
    calculateHand(game.player[id]);
}


exports.stand = function (game, activePlayerAmount) {
    let areAllPlayersBusted = 0;
    let hasAllplayersSurended = 0;

    for (let i = 0; i < game.player.length; i++) {

        if (game.player[i].hand.length > 0) {
            if (game.player[i].score > 21) {
                areAllPlayersBusted++;
            }

            if (game.player[i].surended) {
                hasAllplayersSurended++;
            }
        }
    }
    let bustedAndSureended = areAllPlayersBusted + hasAllplayersSurended;
    calculateHand(game.dealer);
    if (bustedAndSureended !== activePlayerAmount && areAllPlayersBusted !== activePlayerAmount && hasAllplayersSurended !== activePlayerAmount) {
        while (game.dealer.score < 17) {
            game.dealer.hand.push(drawCard(game));
            calculateHand(game.dealer);
        }

    } else {
        calculateHand(game.dealer);
    }

    winingCondition(game);

}




function winingCondition(game) {

    for (let i = 0; i < game.player.length; i++) {
        if (game.player[i].hand.length > 0 && game.player[i].surended != true) {
            if (game.dealer.score <= 21 && game.player[i].score > game.dealer.score && game.player[i].score <= 21) {
                game.winnerList.push(game.player[i].name + " Won!");
                game.player[i].balance += game.player[i].bet * 2;
            }
            else if (game.dealer.score <= 21 && game.player[i].score == game.dealer.score && game.player[i].score <= 21) {
                game.winnerList.push(game.player[i].name + "Push!");
                game.player[i].balance += game.player[i].bet
            }
            else if (game.player[i].score <= 21 && game.player[i].score < game.dealer.score && game.dealer.score <= 21) {
                game.winnerList.push("Dealer Wins! " + game.player[i].name + " Lose!");
            }
            else if (game.player[i].score > 21) {
                game.winnerList.push(game.player[i].name + " Busted!");
            }
            else if (game.dealer.score > 21 && game.player[i].score <= 21) {
                game.winnerList.push("Dealer Busted! " + game.player[i].name + " Wins!");
                game.player[i].balance += game.player[i].bet * 2;
            }

            game.player[i].bet = 0;
            console.log(game.player[i].name + game.player[i].balance);
        }
    }

}






