{
    //----Cards Arrays----
    colors = ['blue', 'red', 'yellow', 'green'];
    types = [1, 3, 4, 5, 6, 7, 8, 9, "changesDirection", "2plush", "stop", "taki"];

    //------Global Variables----
    image_pth = '"images/';
    turn = 1; //1 for p1, -1 for p2
    var player_cards_num = 8;
    var counter = 1; //counting player numbers
    var is_Game = false; //true when game starts
    var opening_card; //the top card on the table to showcase
    var TableDeck = []; //list of revieled cards on the table
    var TopTableCard = []; //list of 1 top card to showcase on top of all revieled cards
    var is_chashier_pic_on = false; //display once in a game
    var choosedColor = "";
    var lastTurnWasColorchanger = false;
    var otherPName = "";
    var currentName = "";
    var isGameOver = false; //indicates if the table deck and cashier is empty, so the game restarts 
    var isLastGameCompleted = true;//indicate if last game didnt closed in the middle
    var resumeGame = false; //indicates whether the game is continuing from a past one 
    var commonColor; //indicates the commonColor of the PC when choosing color changer
    var pc_card; //pc chosen card 
    var colorChoosed; //the color choosed by the PC after color changer


    //-----Constructors--------
    //constructor card
    function Card(type, color, img, name) {
        this.type = type; //from types list
        this.color = color; //from colors list
        this.img = img;
        this.name = name; //type_color
        this.setColor = function (Color_)
        {
            this.color = Color_;
        }
        //this.setType = function (Type_)
        //{
        //    this.type = Type_;
        //}
    }

    //constructor deck
    function Deck() {
        this.Cards = [];
        //field
        this.createDeck = function () {
            //create every possible card using any combination of type and color
            //except color changer
            for (var i = 0; i < colors.length; i++) {
                for (var j = 0; j < types.length; j++) {
                    image_path = 'images/' + types[j] + "_" + colors[i] + '.jpg';
                    temp_name = types[j] + "_" + colors[i];
                    temp_card = new Card(types[j], colors[i], image_path, temp_name);
                    this.addCard(temp_card);
                }
            }
            //handling color changer
            color_changer_path = "images/color_changer.jpg";
            color_changer1 = new Card("color_changer", "color_changer", color_changer_path, "colorchanger_1");
            color_changer2 = new Card("color_changer", "color_changer", color_changer_path, "colorchanger_2");
            this.addCard(color_changer1);
            this.addCard(color_changer2);

        }
        //field
        this.Shuffle = function () {
            for (var i = this.Cards.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * i);
                var temp = this.Cards[i];
                this.Cards[i] = this.Cards[j];
                this.Cards[j] = temp;
            }
        }
        //field
        this.addCard = function (card) {
            this.Cards.push(card);
        }
        //field
        this.removeCard = function (card) {
            this.Cards.pop(card);
        }
    }

    //constructor player
    function Player() {
        this.num = counter;
        this.cards = [];
        counter++;
    }

    //-------game objects---------
    var playerOne = new Player();//player one
    var playerTwo = new Player();//PC
    var Cashier = new Deck(); //cashier deck
    var CahiserCard = new Card('cashier', 'cashier', 'cashier', 'cashier')



    //------Functions------
    //function handing out 8 cards for a player from a given deck
    function cards_for_player(deck, player) {
        for (var i = 0; i < player_cards_num; i++) {
            player.cards.push(deck.Cards[i]); //assuming deck is shuffled
        }
        //remove the cards of the player from the cashier
        for (var i = 0; i < player.cards.length; i++) {
            idx = deck.Cards.indexOf(player.cards[i]);
            deck.Cards.splice(idx, 1);
        }
    }

    //function write to div
    function writeToDiv(divId, htmlStr, override) {
        let d = document.getElementById(divId);
        if (override)
            d.innerHTML = htmlStr;
        else
            d.innerHTML += htmlStr;
    }

    //function getting a color choosed by the user
    function UserColor(color)
    {
        // only if game started
        if (is_Game)
        {
            document.getElementById("colorChoose").style.display = "none";
            colorChoosed = color; //setting the chosen color to the color chosed by the user
            // for a case we need to resume game
            //initialing new card - specially for resumed game for the function "setColor" to be defined
            var tempCard = new Card("color_changer", "color_changer", "images/color_changer.jpg", "colorchanger_1");
            TableDeck[TableDeck.length - 1] = tempCard;
            TableDeck[TableDeck.length - 1].setColor(color);

            turn = -1;   
            document.getElementById("update_turn").innerHTML = `Turn: Player Two`;            //playing PC turn with a delay of 3 seconds            setTimeout(function () { pcGame(TopTableCard[0].type); }, 3000);            //updating turn after setTimeOut            turn = -1;            //writing to local storage the color the user chosed            localStorage.setItem('colorChoosed', JSON.stringify(colorChoosed));
            if (playerTwo.cards.length == 0) { //in case PC won the game after colorChanger
                alert("Computer wins the game! Restarting Game. ");
                isLastGameCompleted = true;// updateing that the game ended correctly
                localStorage.setItem('isLastGameCompleted', JSON.stringify(isLastGameCompleted));// writing that game ended correctly to local storage
                start(50, false);
            }
        }
    }

    //function presnting colors after picking color changer card
    function renderColors(div, array) {
        str = "<p>Choose Color</p>";
        for (var i = 0; i < array.length; i++) {
            picClass = 'class ="' + 'color' + '_pic"';
            str += "<img src='" + 'images/' + array[i] + '.png' + "'" + picClass + 'onclick="UserColor(' + "'" + array[i] + "'" + ')"' + "/>";
        }
        writeToDiv(div, str, true);
        document.getElementById("colorChoose").style.display = "none";
    }
        
    //function managing the cashier if it is empty - or close to being empty
    function cashierManager() {
        //if the cashier cards array is almost empty
        if (Cashier.Cards.length == 2) {
            alert("Cashier is about to get empty!");
        }
        //if the cashier is empty and table deck has only 1 card
        if (Cashier.Cards.length == 0 && TableDeck.length == 1) {
            alert("Cashier is empty! There is only one card in table Deck. Can't refiil Cashier. GAME OVER!");
            start(50,false);
            isGameOver = true;
        }

        //if the cashier cards array is empty - take cards from the table deck
        if (Cashier.Cards.length == 0) {
            //keeping the last card
            last_revield_card = TopTableCard[0];
            //removing the last card from the table deck so it won't be passed to the cashier
            TableDeck.splice(TableDeck.length - 1, 1);
            //adding all the cards from table deck to the cashier
            for (var i = 0; i < TableDeck.length; i++) {
                Cashier.Cards.push(TableDeck[i]);
            }
            var len = TableDeck.length;
            //removing all the cards from table deck
            for (var i = 0; i < len; i++) {
                TableDeck.pop();
            }
            //leaving the last revield card of the table cards on the table
            TableDeck.push(last_revield_card);
            //shuffle the cashier
            Cashier.Shuffle();
            //display images update
            document.getElementById("Deck").innerHTML = "<p>Table Deck</p>"; //removing the last top card
            renderImages("Deck", TopTableCard); //rendering new top card on table
            //alerting the user what has happened since nothing changed on the screen
            alert("Cashier is empty! taking cards from the table deck for the cashier")
        }
    }

    //function writing objects into local storage - gets the values of the game
    function localStorageWriter(Cashier, TableDeck, Player1, Player2, turn, lastTurnWasColorchanger, colorChoosed) {
        localStorage.setItem('TableDeck', JSON.stringify(TableDeck));
        localStorage.setItem('Cashier', JSON.stringify(Cashier));
        localStorage.setItem('playerOne', JSON.stringify(playerOne));
        localStorage.setItem('playerTwo', JSON.stringify(playerTwo));
        localStorage.setItem('Turn', JSON.stringify(turn));
        localStorage.setItem('lastTurnWasColorchanger', JSON.stringify(lastTurnWasColorchanger));
        localStorage.setItem('colorChoosed', JSON.stringify(colorChoosed));
    }

    //function get objects from local storage
    function localStorageReader() {
        let tableDeckTemp = localStorage.getItem("TableDeck");// geting GameObjects fron local storage
        let cahiserTemp = localStorage.getItem("Cashier");// geting GameObjects fron local storage
        let playerOneTemp = localStorage.getItem("playerOne");// geting GameObjects fron local storage
        let playerTwoTemp = localStorage.getItem("playerTwo");// geting GameObjects fron local storage
        let turnTemp = localStorage.getItem("Turn");// geting GameObjects fron locl storage
        let lastTurnWasColorchangerTemp = localStorage.getItem("lastTurnWasColorchanger");// geting GameObjects fron locl storage

        let colorChoosedtemp = localStorage.getItem("colorChoosed");
        TableDeck = JSON.parse(tableDeckTemp);
        Cashier = JSON.parse(cahiserTemp);
        playerOne = JSON.parse(playerOneTemp);
        playerTwo = JSON.parse(playerTwoTemp);
        turn = JSON.parse(turnTemp);
        lastTurnWasColorchanger = JSON.parse(lastTurnWasColorchangerTemp);
        //in case color choosed is not chosen before the refresh - it is undefined
        if (colorChoosed != undefined) {
            colorChoosed = JSON.parse(colorChoosedtemp);
        }
        else {
            colorChoosed = "render"; //else put a value we chose that indicates this situation
        }
    }

    //function plays a turn automaticly for the PC (Player two)
    function pcTurn()
    {   
        //checking if pc have taki card
        let takiColorCount = 0;
        for (var i = 0; i < playerTwo.cards.length; i++)
        {
            // if taki card is found in pc deck and it is the same color or type with top table card
            if ((playerTwo.cards[i].type == 'taki' && playerTwo.cards[i].color == TableDeck[TableDeck.length - 1].color) || (playerTwo.cards[i].type == 'taki' && playerTwo.cards[i].type == TableDeck[TableDeck.length - 1].type))
            {
                // checking if there is at least 2 colors with the same color of the taki
                for (var j = 0; j < playerTwo.cards.length; j++)
                {
                    if (playerTwo.cards[j].color == playerTwo.cards[i].color)
                    {
                        takiColorCount++;
                    }
                    // if there are more then 2 cards with the same color of taki card
                    if (takiColorCount >= 3)
                    {
                        return playerTwo.cards[i]; // return TAKI card
                    }           
                }
            }
        }

        //checking if pc have a stop card 
        for (var i = 0; i < playerTwo.cards.length; i++)
        {
            // if stop card is found in pc deck and it is the same color or type with top table card
            if ((playerTwo.cards[i].type == 'stop' && playerTwo.cards[i].color == TableDeck[TableDeck.length - 1].color) || (playerTwo.cards[i].type == 'stop' && playerTwo.cards[i].type == TableDeck[TableDeck.length - 1].type))
            {
                return playerTwo.cards[i];
            }
        }

        //checking if pc have a change direction card 
        for (var i = 0; i < playerTwo.cards.length; i++) {
            // if changesDirection card is found in pc deck and it is the same color or type with top table card
            if ((playerTwo.cards[i].type == 'changesDirection' && playerTwo.cards[i].color == TableDeck[TableDeck.length - 1].color) || (playerTwo.cards[i].type == 'changesDirection' && playerTwo.cards[i].type == TableDeck[TableDeck.length - 1].type)) {
                return playerTwo.cards[i];
            }
        }

        //checking if pc have a 2 plush  card 
        for (var i = 0; i < playerTwo.cards.length; i++) {
            // if 2plush card is found in pc deck and it is the same color or type with top table card
            if ((playerTwo.cards[i].type == '2plush' && playerTwo.cards[i].color == TableDeck[TableDeck.length - 1].color) || (playerTwo.cards[i].type == '2plush' && playerTwo.cards[i].type == TableDeck[TableDeck.length - 1].type)) {
                return playerTwo.cards[i];
            }
        }

        //checking if pc have a card with the same color 
        for (var i = 0; i < playerTwo.cards.length; i++) {
            // if card with the same color is found
            if (playerTwo.cards[i].color == TableDeck[TableDeck.length - 1].color)
            {
                return playerTwo.cards[i];
            }
        }

        //checking if pc have a card with the same type 
        for (var i = 0; i < playerTwo.cards.length; i++) {
            // if card with the same color is found
            if (playerTwo.cards[i].type == TableDeck[TableDeck.length - 1].type) {
                return playerTwo.cards[i];
            }
        }

        //checking if pc have a color changer 
        let colorDict = { yellow: 0, blue: 0, red: 0, green: 0 }
        var i = 0;
        for (; i < playerTwo.cards.length; i++) {
            //if color changer has found
            if (playerTwo.cards[i].type == 'color_changer') {
                // count which is the most common color
                for (var j = 0; j < playerTwo.cards.length; j++) {
                    if (playerTwo.cards[j].color == 'yellow') {
                        colorDict.yellow++;
                    }
                    if (playerTwo.cards[j].color == 'blue') {
                        colorDict.blue++;
                    }
                    if (playerTwo.cards[j].color == 'red') {
                        colorDict.red++;
                    }
                    if (playerTwo.cards[j].color == 'green') {
                        colorDict.green++;
                    }
                }
                //choosing the most common color in the PC deck, setting it to be the colorChoosed
                var keys = Object.keys(colorDict);
                var max = colorDict[keys[0]];                var k = 1;                var idxMax = 0;                for (; k < keys.length; k++) {                    var value = colorDict[keys[k]];                    if (value > max) {                        max = value;                        idxMax = k;
                    }                }
                commonColor = keys[idxMax];
                colorChoosed = commonColor;
                playerTwo.cards[i].setColor(commonColor); 
                return playerTwo.cards[i];
            }
        }
        // if there is no valid card after color changer picked color>> return first invalid card
        if (lastTurnWasColorchanger)
        {
            return playerTwo.cards[0];
        }
        else  //if there is no valid card ask for a card from the cashier by return cashier card
        return CahiserCard;
    }

    //function managing a turn - checks if the turn is valid, and the choosed card is valid
    function playerTurn(Player, identity, clicked_card_color, clicked_card_type) {
        document.getElementById("message").innerHTML = "";
        var otherPNum;
        var otherP;
        if (Player.num == 1) { //updating the paragraphs to display
            otherNum = 2;
            otherP = playerTwo;
            otherPName = "Player Two";
            currentName = "Player One";
        }
        else {
            otherNum = 1;
            otherP = playerOne;
            otherPName = "Player One";
            currentName = "Player Two";
        }

        //if player clicked on cashier
        if (clicked_card_color == 'cashier') {
            //is the cashier is empty - handle it
            cashierManager();
            //if the game has restarted because the cashier was empty and tabledeck had only 1 deck,
            //there no need to add a card to a player
            if (!isGameOver) {
                //draw card from cashier and add it to the player array
                drawed_card = Cashier.Cards.pop();
                Player.cards.push(drawed_card);
                document.getElementById(`p${Player.num}`).innerHTML = `<p>Player ${Player.num}</p>`;
                renderImages(`p${Player.num}`, Player.cards); //rendering new cards
                //update the turn
                turn = turn * -1;
                document.getElementById("update_turn").innerHTML = `Turn: ${otherPName}`;
                return;
            }
            isGameOver = false;
            return; 
        }
        //------ if picked card is not color changer------------
        if (clicked_card_type != "color_changer") {
            //---- if last turn player picked color changer---
            if (lastTurnWasColorchanger) {
                // if the player choosed the valid card after color changer
                if (clicked_card_color == colorChoosed)
                {
                    //searching the card to remove from player array of cards
                    document.getElementById("display_name_color_choosed").style.display = "none";
                    var i = 0;
                    var idx;
                    for (; i < Player.cards.length; i++) //find the chosen card in the player array
                    {
                        if (Player.cards[i].color == clicked_card_color && Player.cards[i].type == clicked_card_type) {
                            idx = i;
                            break;
                        }
                    }
                    //updating table deck
                    TableDeck.push(Player.cards[idx]);
                    Player.cards.splice(idx, 1);
                    TopTableCard = []; //always has one card only - empty the last one
                    TopTableCard.push(TableDeck[TableDeck.length - 1]); //update
                    document.getElementById("Deck").innerHTML = "<p>Table Deck</p>"; //removing the last top card
                    document.getElementById(`p${Player.num}`).innerHTML = `<p>Player ${Player.num} </p>`; //removing the last cards
                    renderImages(`p${Player.num}`, Player.cards); //rendering new cards
                    renderImages("Deck", TopTableCard); //rendering new top card on table
                    lastTurnWasColorchanger = false;
                    //reset color choosed
                    colorChoosed = 'undefined';
                }

                else // if the player choosed an invalid card after color changer
                //add a card to the player array from the cashier
                {
                    //if the cashier is empty handle it
                    cashierManager();
                    drawed_card = Cashier.Cards.pop();
                    Player.cards.push(drawed_card);
                    document.getElementById(`p${Player.num}`).innerHTML = `<p>Player ${Player.num} </p>`;
                    renderImages(`p${Player.num}`, Player.cards); //rendering new cards
                    document.getElementById("update_turn").innerHTML = `Turn: ${otherPName}`;   
                    lastTurnWasColorchanger = true;
                    pcTurn();
                }
            }

            //if last turn player didn't pick color changer - check if the clicked card is matching to the top table card
            else if (TopTableCard[0].color == clicked_card_color || TopTableCard[0].type == clicked_card_type) {
                //search for the card to remove from the player array and add it to the table top
                var i = 0;
                var idx;
                for (; i < Player.cards.length; i++) { //find the chosen card in the player array
                    if (Player.cards[i].color == clicked_card_color && Player.cards[i].type == clicked_card_type) {
                        idx = i;
                        break;
                    }
                }
                TableDeck.push(Player.cards[idx]);
                Player.cards.splice(idx, 1);
                TopTableCard = []; //always has one card only - empty the last one
                TopTableCard.push(TableDeck[TableDeck.length - 1]); //update
                document.getElementById("Deck").innerHTML = "<p>Table Deck</p>"; //removing the last top card
                document.getElementById(`p${Player.num}`).innerHTML = `<p>Player ${Player.num} </p>`; //removing the last cards
                renderImages(`p${Player.num}`, Player.cards); //rendering new cards
                renderImages("Deck", TopTableCard); //rendering new top card on table

            }
            else { //the player chose an invalid card 
                cashierManager();
                drawed_card = Cashier.Cards.pop();
                Player.cards.push(drawed_card);
                document.getElementById(`p${Player.num}`).innerHTML = `<p>Player ${Player.num} </p>`;
                renderImages(`p${Player.num}`, Player.cards); //rendering new cards
                pcTurn();
            }
        }
        //if picked card is color changer
        else { //the player put color changer on the table - can be put on any card - no matter type/color 
            if (lastTurnWasColorchanger && turn == -1)
            { //if we put cholor chager on color changer
                //search for the most common card in the PC deck
                let colorDict = { yellow: 0, blue: 0, red: 0, green: 0 }
                var i = 0;
                for (; i < playerTwo.cards.length; i++)
                {
                    if (playerTwo.cards[i].color == 'yellow') {
                        colorDict.yellow++;
                    }
                    if (playerTwo.cards[i].color == 'blue') {
                        colorDict.blue++;
                    }
                    if (playerTwo.cards[i].color == 'red') {
                        colorDict.red++;
                    }
                    if (playerTwo.cards[i].color == 'green') {
                        colorDict.green++;
                    }
                }
                var keys = Object.keys(colorDict);
                var max = colorDict[keys[0]];                var k = 1;                var idxMax = 0;                for (; k < keys.length; k++)                {                    var value = colorDict[keys[k]];                    if (value > max) {                        max = value;                        idxMax = k;
                    }                }
                commonColor = keys[idxMax];
                colorChoosed = commonColor;
            } 

            document.getElementById("display_name_color_choosed").style.display = "none";
            lastTurnWasColorchanger = true;
            var i = 0;
            var idx;
            //search for the crad to remove
            for (; i < Player.cards.length; i++) {
                if (Player.cards[i].type == "color_changer") {
                    idx = i;
                    break;
                }
            }
            TableDeck.push(Player.cards[idx]);
            Player.cards.splice(idx, 1);
            TopTableCard = []; //always has one card only - empty the last one
            TopTableCard.push(TableDeck[TableDeck.length - 1]); //update
            document.getElementById("Deck").innerHTML = "<p>Table Deck</p>"; //removing the last top card
            document.getElementById(`p${Player.num}`).innerHTML = `<p>Player ${Player.num} <p>`; //removing the last cards
            renderImages(`p${Player.num}`, Player.cards); //rendering new cards
            renderImages("Deck", TopTableCard); //rendering new top card on table
            document.getElementById("colorChoose").style.display = "block";
            document.getElementById("display_name_color_choosed").innerHTML = "Chosen color: " + colorChoosed;
            document.getElementById("display_name_color_choosed").style.display = "block";
            //if pc picked color changer
            if (turn == -1) {
                document.getElementById("colorChoose").style.display = "none";
                colorChoosed = commonColor;
                document.getElementById("update_turn").innerHTML = `Turn: ${otherPName}`;
            }
            //if p1 picked color changer
            else {
                document.getElementById("display_name_color_choosed").style.display = "none";
                localStorageWriter(Cashier, TableDeck, playerOne, playerTwo, turn, lastTurnWasColorchanger, colorChoosed);//writing game object to local storage
                isLastGameCompleted = false;// updateing that the game has not ended
                localStorage.setItem('isLastGameCompleted', JSON.stringify(isLastGameCompleted));// writing that game hasnd ended to local storage
            }
        }

        // if the clicked card is 2plush and >> a valid card
        if (clicked_card_type == "2plush" && (TopTableCard[0].color == clicked_card_color || TopTableCard[0].type == clicked_card_type)) {
            //draw 2 cards from cashier and add them to the other player array
            cashierManager();
            drawed_card = Cashier.Cards.pop();
            otherP.cards.push(drawed_card);
            document.getElementById(`p${otherP.num}`).innerHTML = `<p>Player ${otherP.num} </p>`;
            renderImages(`p${otherP.num}`, otherP.cards); //rendering new cards
            //check if there are any cards in the cashier
            cashierManager();
            drawed_card = Cashier.Cards.pop();
            otherP.cards.push(drawed_card);
            document.getElementById(`p${otherP.num}`).innerHTML = `<p>Player ${otherP.num} </p>`;
            renderImages(`p${otherP.num}`, otherP.cards); //rendering new cards
        }

        // if the clicked card is taki and >> a valid card
        if (clicked_card_type == "taki" && (TopTableCard[0].color == clicked_card_color || TopTableCard[0].type == clicked_card_type)) {
            //all the cards that the player has of the given taki color
            var colored_cards = [];
            for (var i = 0; i < Player.cards.length; i++) //finding all the colored cards in player array
            {
                //add to the color cards array all the cards that are of the same color of taki
                if (Player.cards[i].color == clicked_card_color) {
                    colored_cards.push(Player.cards[i]);
                }
            }
            //remove all the cards of the given color from the player array and put them on the table
            for (var i = 0; i < colored_cards.length; i++) { //removing the colored cards from the player array
                var idx = Player.cards.indexOf(colored_cards[i]);
                Player.cards.splice(idx, 1);
                TableDeck.push(colored_cards[i]);
            }
            document.getElementById(`p${Player.num}`).innerHTML = `<p>Player ${Player.num} </p>`;
            renderImages(`p${Player.num}`, Player.cards); //rendering new cards
            TopTableCard = []; //always has one card only - empty the last one
            TopTableCard.push(TableDeck[TableDeck.length - 1]); //update
            document.getElementById("Deck").innerHTML = "<p>Table Deck</p>"; //removing the last top card
            renderImages("Deck", TopTableCard); //rendering new top card on table
        }

        // if the clicked card is stop or changeDirection and >> a valid card
        if ((clicked_card_type == "stop" || clicked_card_type == "changesDirection") && (TopTableCard[0].color == clicked_card_color || TopTableCard[0].type == clicked_card_type)) {
            document.getElementById("update_turn").innerHTML = `Turn: ${currentName}`;
            return;
        }
        // if not stop or changeDircetion >> pass the turn on
        //update turn
        turn = turn * -1;
        if (clicked_card_type == "color_changer")
        {
            if (Player.num == 1) {
                turn = 1;
            }
        }
        if (lastTurnWasColorchanger)
        {
            if (Player.num == -1)
            {
                turn = 1;
            }
        }
        else
        {
            document.getElementById("update_turn").innerHTML = `Turn: ${otherPName}`;      
        }
    }

    //function plays the game for the pc
    function pcGame(clicked_card_type)
    {        //if player one didn't choose stop or changesDirection - pc can play        if (clicked_card_type != 'stop' && clicked_card_type != 'changesDirection')        {            pc_card = pcTurn(); //choose the best card for the pc            playerTurn(playerTwo, "p2", pc_card.color, pc_card.type);            //while pc is choosing stop card or changes direction - keep playing their turn            while ((pc_card.type == "stop" || pc_card.type == "changesDirection") && playerTwo.cards.length != 0)            {                pc_card = pcTurn();                playerTurn(playerTwo, "p2", pc_card.color, pc_card.type);            }
            // if pc have no more card>> pc wins the game
            if (playerTwo.cards.length == 0) {
                alert("Computer wins the game! Restarting Game.");
                isLastGameCompleted = true;// updateing that the game ended correctly
                localStorage.setItem('isLastGameCompleted', JSON.stringify(isLastGameCompleted));// writing that game ended correctly to local storage
                start(50, false);
            }
        }
        //update local storage in the end of pc turn
        localStorageWriter(Cashier, TableDeck, playerOne, playerTwo, turn, lastTurnWasColorchanger, colorChoosed);//writing game object to local storage
        isLastGameCompleted = false;// updateing that the game has not ended
        localStorage.setItem('isLastGameCompleted', JSON.stringify(isLastGameCompleted));// writing that game hasnd ended to local storage
    }

    //function make game moves according to player's choosen card -
    //the function checks if the click is on the right turn, on the right card, and messages if a player wins
    //identity is the one who clicked the picture (p1, p2, cashier)
    function picClick(identity, clicked_card_color, clicked_card_type) { 
        //if game has began and the colors of the color changer are not displayed
        if (is_Game && document.getElementById("colorChoose").style.display != "block")
        {
            if (identity == "p1" || identity == "p2" || identity == "cashier") {
             
                if (identity == "cashier") { //1 for p1, -1 for p2
                    //the turn is player one
                    if (turn == 1)
                    {
                         //if p1 clicked the cashier and the turn is his
                        playerTurn(playerOne, identity, clicked_card_color, clicked_card_type);                        if (playerOne.cards.length == 0) {
                            alert("Player one wins the game! Well done! Restarting Game.");
                            isLastGameCompleted = true;// updateing that the game ended correctly
                            localStorage.setItem('isLastGameCompleted', JSON.stringify(isLastGameCompleted));// writing that game ended correctly to local storage
                            start(50, false);
                            return;
                        }                        if (clicked_card_type != 'color_changer')                        {                            //playing PC turn with a delay of 3 seconds                            setTimeout(function () { pcGame(clicked_card_type); }, 3000)                        }                    }
                    else { //p1 clicked a card and it wasn't their turn
                        document.getElementById("message").innerHTML = "It is not your turn!";
                    }
                    //if PC wins
                    if (playerTwo.cards.length == 0) {
                        alert("Computer wins the game! Restarting Game. ");
                        isLastGameCompleted = true;// updateing that the game ended correctly
                        localStorage.setItem('isLastGameCompleted', JSON.stringify(isLastGameCompleted));// writing that game ended correctly to local storage
                        start(50, false);
                    }
                }
                //if player one clicked the picture
                if (identity == "p1")
                { //1 for p1, -1 for p2
                    //if the turn is player one
                    if (turn == 1)
                    {
                        playerTurn(playerOne, identity, clicked_card_color, clicked_card_type);                        //if player one wins the game                        if (playerOne.cards.length == 0) {
                            alert("Player one wins the game! Well done! Restarting Game.");
                            isLastGameCompleted = true;// updateing that the game ended correctly
                            localStorage.setItem('isLastGameCompleted', JSON.stringify(isLastGameCompleted));// writing that game ended correctly to local storage
                            start(50, false);
                            return;
                        }                        if (clicked_card_type != 'color_changer')                        {                            //playing PC turn with a delay of 3 seconds                            setTimeout(function () { pcGame(clicked_card_type); }, 3000)                        }
                        //if PC won the game
                        if (playerTwo.cards.length == 0)
                        {
                            alert("Computer wins the game! Restarting Game.");
                            isLastGameCompleted = true;// updateing that the game ended correctly
                            localStorage.setItem('isLastGameCompleted', JSON.stringify(isLastGameCompleted));// writing that game ended correctly to local storage
                            start(50, false);
                        }
                    }

                    else { //p1 clicked a card and it wasn't their turn
                        document.getElementById("message").innerHTML = "It is not your turn!";
                    }
                    //if player one wins the game
                    if (playerOne.cards.length == 0)
                    {
                        alert("Player one wins the game! Well done! Restarting Game.");
                        isLastGameCompleted = true;// updateing that the game ended correctly
                        localStorage.setItem('isLastGameCompleted', JSON.stringify(isLastGameCompleted));// writing that game ended correctly to local storage
                        start(50, false);
                        return;
                    }
                    //end of a turn
                }
            }
        }
        localStorageWriter(Cashier, TableDeck, playerOne, playerTwo, turn, lastTurnWasColorchanger, colorChoosed);//writing game object to local storage
        isLastGameCompleted = false;// updateing that the game has not ended
        localStorage.setItem('isLastGameCompleted', JSON.stringify(isLastGameCompleted));// writing that game hasnd ended to local storage
    }

    //function changes is_game to true if game started
    function game() {
        is_Game = true;
        document.getElementById("message").innerHTML = "Game has started!";
        // if game started with pc turn
        if (turn == -1)
        {
            //playing PC turn with a delay of 3 seconds
            setTimeout(function () { pcGame('false'); }, 3000)
            localStorageWriter(Cashier, TableDeck, playerOne, playerTwo, turn, lastTurnWasColorchanger, colorChoosed);//writing game object to local storage
            isLastGameCompleted = false;// updateing that the game has not ended
            localStorage.setItem('isLastGameCompleted', JSON.stringify(isLastGameCompleted));// writing that game hasnd ended to local storage
        }
    }

    //showing images of cards to screen
    function renderImages(div, cards) {
        str = "";
        for (var i = 0; i < cards.length; i++) {
            picClass = 'class ="' + div + '_pic"';
            str += "<img src='" + cards[i].img + "'" + picClass + 'onclick="picClick(' + "'" + div + "'" + ", '" + cards[i].color + "'" + ", '" + cards[i].type + "'" + ')"' + "/>";
        }
        writeToDiv(div, str, false);
    }

    //function gets an answer input from button onclick function, 
    //returns true if user clicked 'yes', otherwise returns false
    function yesNo(answer) {
        if (answer == 1)// if the answer was yes>> we want to resume last game
        {
            resumeGame = true;
            //present relevant divs for resumed game
            document.getElementById("resumeGame").style.display = "none";
            document.getElementById("pressDrw").style.display = "none";
            document.getElementById("buttons").style.display = "block";
            start(50, resumeGame);   
        }
        else//if the answer was no>> we want to present new game start buttons
        {
            //present relevant divs for a new game
            document.getElementById("pressDrw").style.display = "block";
            document.getElementById("resumeGame").style.display = "none";
            document.getElementById("buttons").style.display = "block";
        }
    }

    //funtcion start is starting the game
    function start(deck_size, resume)
    {
        //rendering the colors - making sure the colors are not displayed when color changer is not choosed
        renderColors("colorChoose", colors);
        //reset the topTableCard list
        TopTableCard = [];
        //reset the game
        is_Game = false;
        if (resume)
        {
            //reading last game objects from locacl storage
            localStorageReader();
            if (turn == 1) { //if the turn is player one
                //if top table card is color changer and the player didnt pick a color yet
                if (TableDeck[TableDeck.length - 1].color == 'color_changer' && colorChoosed != 'undefined') {
                    document.getElementById("colorChoose").style.display = "block";
                }
                document.getElementById("update_turn").innerHTML = 'Turn: Player One';
            }
            else { //turn is PC
                document.getElementById("update_turn").innerHTML = 'Turn: Player Two';
            }
            TopTableCard.push(TableDeck[TableDeck.length - 1]);
        }
        else //restarting new game
        {
            isLastGameCompleted = true;
            localStorage.setItem('isLastGameCompleted', JSON.stringify(isLastGameCompleted));//update local storage that Last Game Completed
            turn = 1;
            document.getElementById("update_turn").innerHTML = 'Turn: Player One';

            //resetting all the global variables
            TableDeck = [];
            playerOne.cards = [];
            playerTwo.cards = [];
            //create cashier, shuffle it and hand out 8 cards for each player
            var Cash = new Deck();
            Cashier = Cash;
            Cashier.Cards = [];
            Cashier.createDeck();
            Cashier.Shuffle();
            //randomly choose open card
            opening_card = Cashier.Cards[Math.floor(Math.random() * (deck_size - 1)) + 1];
            // assuring color changer is not the first card on table deck at the beggining of the game
            while (opening_card.color == "color_changer") {
                opening_card = Cashier.Cards[Math.floor(Math.random() * (deck_size - 1)) + 1];
            }
            TableDeck.push(opening_card);
            idx = Cashier.Cards.indexOf(opening_card);
            Cashier.Cards.splice(idx, 1);
            cards_for_player(Cashier, playerOne);
            cards_for_player(Cashier, playerTwo);
            TopTableCard.push(TableDeck[TableDeck.length - 1]);
        }
        upside_down_img = "<img src='" + 'images/' + 'cashier' + '.jpg' + "'" + "class='cashier'" + 'onclick="picClick(' + "'" + 'cashier' + "'" + ", '" + 'cashier' + "'" + ", '" + 'cashier' + "'" + ')"' + "/>";
        upside_down_img = "<img src='" + 'images/' + 'cashier' + '.jpg' + "'" + "class='cashier'" + 'onclick="picClick(' + "'" + 'cashier' + "'" + ", '" + 'cashier' + "'" + ", '" + 'cashier' + "'" + ')"' + "/>";
        counter = 1;
        is_Game = false;
        
        //update headers
        document.getElementById("display_name_color_choosed").style.display = "none";
        document.getElementById("Deck").innerHTML = "<p>Table Deck</p>";
        document.getElementById("p1").innerHTML = "<p>Player 1</p>";
        document.getElementById("p2").innerHTML = "<p>Player 2</p>";
        renderImages("Deck", TopTableCard);
        if (!is_chashier_pic_on) { //don't show cashier pic again if already displayed
            is_chashier_pic_on = true;
            document.getElementById("Cashier").innerHTML += upside_down_img;
        }
        //display cards and headers
        renderImages("p1", playerOne.cards);
        renderImages("p2", playerTwo.cards);
        document.getElementById("message").innerHTML = "Press the 'Start Playing' button to start the game";
        document.getElementById("game").style.display = "block";
        document.getElementById("pressDrw").style.display = "none";
        isGameOver = false;
    }

    //function loads first to load in the page, according to last game state
    function loadGame()
    {
        let isLastGameCompletedTemp = localStorage.getItem("isLastGameCompleted");// geting GameObjects fron local storage
        isLastGameCompleted = JSON.parse(isLastGameCompletedTemp);
        document.getElementById("resumeGame").style.display = "none";
        document.getElementById("buttons").style.display = "none";
        // if last game ended in the middle
        if (!isLastGameCompleted)
        {
            document.getElementById("resumeGame").style.display = "block";
        }
        // if last game ended correctlly - display a new game
        else
        {
            document.getElementById("resumeGame").style.display = "none";
            document.getElementById("buttons").style.display = "block";
        }
    }
}