"use strict";

function Board() {
    let squares = [Square("Départ"), Property("Rue des pommes", 60, "red"),
        Property("Rue des figues", 60, "red"), Station("Gare de Cornavin", 200),
        CommunityChest(), Tax("Impôts", 200),
        Station("Gare de Coppet", 200), Chance(),
        Property("Rue des poires", 60, "red"), Property("Rue des bananes", 60, "red"),
        Square("Prison"), Property("Rue des pommes", 60, "red"),
        Property("Rue des poires", 60, "blue"), Property("Rue des bananes", 60, "blue"),
        Station("Gare de Carouge", 200), Chance(),
        Property("Rue des figues", 60, "blue"), Station("Gare de Lancy", 200),
        CommunityChest(), Tax("Impôts", 200),
        Square("Aller en prison"), Property("Rue des pommes", 60, "yellow"),
        Property("Rue des figues", 60, "yellow"), Station("Gare de Lancy", 200),
        Property("Rue des poires", 60, "yellow"), Property("Rue des bananes", 60, "yellow"),
        CommunityChest(), Tax("Impôts", 200),
        Station("Gare de Carouge", 200), Chance(),
        Square("Parking"), Property("Rue des pommes", 60, "green"),
        Property("Rue des figues", 60, "green"), Station("Gare de Balexert", 200),
        Property("Rue de loin", 60, "red"), Property("Rue des bananes", 60, "green"),
        CommunityChest(), Tax("Impôts", 200),
        Station("Gare de Genève", 200), Chance()
    ];
    let activePlayer = 0;
    let endTurn = false;
    let midTurn = false;
    let same = 0;
    let double = false;

    function jail() {
        players[activePlayer].goJail();
        console.log("jail");
    }

    function end() {
        activePlayer += 1;
        activePlayer %= 4;
        endTurn = false;
        same = 0;
        console.log("end, active player = " + (activePlayer + 1));
    }

    function play() {
        let dice1 = Math.floor(Math.random() * 6) + 1;
        let dice2 = Math.floor(Math.random() * 6) + 1;
        double = dice1 === dice2;
        if (!players[activePlayer].isInJail() || double) {
            players[activePlayer].goOutJail();
            players[activePlayer].forward(dice1 + dice2);
        }
        console.log(dice1 + " " + dice2);
        if (dice1 === dice2) {
            same += 1;
            if (same === 3) {
                jail();
                end();
            }
        }
        let cell = squares[players[activePlayer].position()];
        if (cell.isTax()) {
            players[activePlayer].pay(cell.price());
            console.log("Joueur " + (activePlayer + 1) + " a payé " + cell.price() + " d'impôts");
            endTurn = true;
        } else if (cell.isBuyable()) {
            midTurn = true;
        } else if (cell.isChance()) {
            console.log("chance");
            endTurn = true;
        } else if (cell.isCommunityChest()) {
            console.log("community chest");
            endTurn = true;
        } else {
            endTurn = true;
        }
        if (endTurn && double) {
            endTurn = false;
        }
        return {dice1,dice2};
    }

    function payJail() {
        console.log("pay to go out of jail");
        players[activePlayer].pay(50);
        players[activePlayer].goOutJail();
    }

    function buy() {
        let position = players[activePlayer].position();
        console.log("player " + (activePlayer + 1) + " bought case " + squares[position].name());
        players[activePlayer].pay(squares[position].price());
        squares[position].owner = players[activePlayer];
        players[activePlayer].addProperty(position);
        midTurn = false;
        endTurn = !double;
    }

    function auction() {
        console.log("auction");
        midTurn = false;
        endTurn = true;
    }

    function pay() {
        let position = players[activePlayer].position();
        let price = squares[position].price();
        players[activePlayer].pay(price);
        squares[position].owner.receive(price);
        console.log(players[activePlayer].color() + " pay " + price + " to " + squares[position].owner.color());
        midTurn = false;
        endTurn = !double;
    }

    function useCard() {
        console.log("use card  to go out of jail");
    }


    return {
        squares: () => squares,
        actions: () => {
            let actionsList = [];
            if (midTurn) {
                if (squares[players[activePlayer].position()].owner === bank) {
                    if (players[activePlayer].money() >= squares[players[activePlayer].position()].price()) {
                        actionsList.push(buy);
                    }
                    actionsList.push(auction);
                } else if (players[activePlayer].money() >= squares[players[activePlayer].position()].rent()) {
                    actionsList.push(pay);
                }
            } else if (endTurn) {
                actionsList.push(end);
            } else if (players[activePlayer].isInJail()) {
                if (players[activePlayer].hasCard()) {
                    actionsList.push(useCard);
                } else if (players[activePlayer].money() > 50) {
                    actionsList.push(payJail);
                }
                actionsList.push(play);
            } else {
                actionsList.push(play);
            }
            return actionsList;
        },
        players: () => players,
        activePlayer: () => activePlayer,
        toJSON: () => JSON.stringify(squares),
        fromJSON(json) {
            squares = [];
            let test = JSON.parse(json);
            test.forEach(function (cell) {
                if (cell.type === "square") {
                    squares.push(Square(cell.name));
                } else if (cell.type === "property") {
                    squares.push(Property(cell.name, cell.price, cell.color));
                } else if (cell.type === "station") {
                    squares.push(Station(cell.name, cell.price));
                } else if (cell.type === "chance") {
                    squares.push(Chance());
                } else if (cell.type === "communitychest") {
                    squares.push(CommunityChest());
                } else if (cell.type === "tax") {
                    squares.push(Tax(cell.name, cell.price));
                }
                console.log(squares);
                console.log("test");
            });

        }
    };
}