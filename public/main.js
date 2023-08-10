// importiere die Klasse 'Player' aus der Datei: 'player.js'
import { Player } from './player.js';

// importiere die Klasse 'Card' aus der Datei: 'cards.js'
import { Card, ImageCard, Memorycard } from './cards.js';

// importiere die Klasse 'Playground' aus der Datei: 'playground.js'
import { Playground } from './playground.js';

var usernameInput = document.querySelector('.usernameInput'); // Eingabefeld für Benutzername
var messages = document.querySelector('.messages');           // Liste mit Chat-Nachrichten
var inputMessage = document.querySelector('.inputMessage');   // Eingabefeld für Chat-Nachricht
var loginPage = document.querySelector('.login.page');        // Login-Seite
var chatPage = document.querySelector('.chat.page');          // Chat-Seite
var startButton = document.querySelector('.startButton');     // Start-Button
var spreadButton = document.querySelector('.spreadButton');     // Spread-Button


var cardStack = [];                         // Liste mit Memorycards

var username;                             // Aktueller Benutzername
var connected = false;                    // Kennzeichen ob angemeldet
var gameStarted = false;                  // Kennzeichen ob Spiel gestartet


var debugModus = 'info';         // Kennzeichen für Debug-Modus

// Eingabefeld für Benutzername erhält den Fokus
var currentInput = usernameInput.focus();

// Socket.io Objekt anlegen
var socket = io();

let cardCount = 30;

let playgroundOffset_X = 20;
let playgroundOffset_Y = 150;

let cardDimentsion = { height: 75, width: 75 };
let playgroundDimension = { height: 1000, width: 1500 };

// ==== Code für Benutzerschnittstelle

// wenn der User die Return-Taste drückt, wird die Funktion "sendMessage" oder die Funktion "setUsername" aufgerufen
window.addEventListener('keydown', function (event) {
    //   console.log("main.js: window.addEventListener");
    if (event.key === "Enter") { // Return-Taste
        if (username) {
            sendMessage();
        } else {
            setUsername();
        }
    }
});


window.addEventListener('mousemove', function (event) {
    // console.log("main.js: window.addEventListener");
    if (username) {
        //   sendCoordinates(event);
    }
});

// wenn der User die linke Maustaste drücket, wird die Funktion "isLeftMouseButtonClicked" aufgerufen
window.addEventListener('mousedown', function (event) {
    //  console.log("main.js: window.addEventListener");
    if (username) {
        leftMousebuttonClicked(event);
    }
});

function sendCoordinates(event) {
    console.log("main.js: sendCoordinates");

    const x = event.clientX;
    const y = event.clientY;
    if (username) {
        //sendMouseInteraction(username, x, y);
    }
}

// der User hat die linke Maustaste gedrückt
function leftMousebuttonClicked(event) {
    console.log("main.js: leftMousebuttonClicked");

    const x = event.clientX;
    const y = event.clientY;
    if (connected) {
        socket.emit('user clicked left mouse button', username, x, y);
    }
}

// Benutzername wird gesetzt
function setUsername() {
    console.log("main.js: setUsername");
    // Benutzername aus Eingabefeld holen (ohne Leerzeichen am Anfang oder Ende).
    username = usernameInput.value.trim();

    // Prüfen, ob der Benutzername nicht leer ist
    if (username) {

        // erzeuge ein Objekt der Klasse 'Player'
        const player = new Player(username, 'alias', 99);
        console.log(player);

        // Loginmaske ausblenden und Chat-Seite einblenden
        loginPage.style.display = "none";
        chatPage.style.display = "block";


        // Chat-Nachricht wird neues, aktuelles Eingabefeld
        currentInput = inputMessage.focus();

        // Server mit Socket.io über den neuen Benutzer informieren. Wenn die
        // Anmeldung klappt wird der Server die "login"-Nachricht zurückschicken.
        socket.emit('add user', player.name);
    }
}

// Mauskoordinaten und Username versenden
function sendMouseInteraction(username, x, y) {

    console.log("main.js: sendMourseInteraction");
    // Nachricht aus Eingabefeld holen (ohne Leerzeichen am Anfang oder Ende).
    var message = `username: ${username} x: ${x} y: ${y}`;

    // Prüfen, ob die Nachricht nicht leer ist und wir verbunden sind.
    if (message && connected) {
        // Eingabefeld auf leer setzen
        inputMessage.value = '';

        // Server über neue Nachricht informieren. Der Server wird die Nachricht
        // an alle anderen Clients spread.
        socket.emit('new message', message);
    }
}

// Chat-Nachricht versenden
function sendMessage() {

    console.log("main.js: sendMessage");
    // Nachricht aus Eingabefeld holen (ohne Leerzeichen am Anfang oder Ende).
    var message = inputMessage.value.trim();

    // Prüfen, ob die Nachricht nicht leer ist und wir verbunden sind.
    if (message && connected) {
        // Eingabefeld auf leer setzen
        inputMessage.value = '';

        // Chat-Nachricht zum Chatprotokoll hinzufügen
        addChatMessage({ username: username, message: message });

        // Server über neue Nachricht informieren. Der Server wird die Nachricht
        // an alle anderen Clients spread.
        socket.emit('new message', message);
    }
}

// Protokollnachricht zum Chat-Protokoll in eine neue Zeile hinzufügen
function log(message) {
    console.log("main.js: log");

    var li = document.createElement('li');
    //q: was macht die folgende Zeile?
    //  li.classList.add('log');
    li.textContent = message;
    messages.appendChild(li);

    // Chat-Protokoll nach unten scrollen
    messages.scrollTop = messages.scrollHeight;
}

startButton.addEventListener('click', function (event) {
    gameStarted = true;
    createPlayground();
});

spreadButton.addEventListener('click', function (event) {
    gameStarted = true;
    spreadCards();
    spreadCards();
});

// Funktion Karten spread
// erzeuge eine zufällen x,y Koordinate
// und zeige eine Karte an dieser Position an
function spreadCards() {
    console.log("main.js: spreadCards");
    for (let index = 0; index < cardCount; index++) {
        let newPlace = getFreePosition();
        let x = newPlace.x
        let y = newPlace.y
        let currCard = new Memorycard(1, 2, 'red', 'solid', cardDimentsion.height, cardDimentsion.width, x, y, `./memory_cards/image_${index+1}.jpg`, `bird_fly.svg`,);
        document.body.appendChild(currCard.card);
        cardStack.push(currCard);
        socket.emit('showMemoryCard', index, username, x, y);
    }
}

// Funktion getFreePosition 
// erzeuge eine zufällen x,y Koordinate und prüfe, ob sich an dieser Position bereits eine Karte befindet
// erzeuge so lange eine neue x,y Koordinate, bis eine freie Position gefunden wurde
function getFreePosition() {
    console.log("main.js: getFreePosition");
    let x = 0;
    let y = 0;
    let maxTries = 100;
    let tries = 0;

    while (tries < maxTries) {
        x = Math.floor(Math.random() * playgroundDimension.width) + playgroundOffset_X;
        y = Math.floor(Math.random() * playgroundDimension.height) + playgroundOffset_Y;
        if (!isOverlapping(x, y) && isInPlayground(x, y)) {

            return { x: x, y: y };
        }
        tries++;
    }

    console.error("Could not find a free position after " + maxTries + " tries.");
    return null;
}

// Funktion isInPlayground es wird geprüft, ob sich die Karte innerhalb des Spielfeldes befindet
function isInPlayground(x, y) {
    console.log("main.js: isInPlayground");
    console.log(`x: ${x}, y: ${y}`);

    // zuerst werden die Eckpunkte 0ben links und unten rechts des Spielfeldes definiert
    let top_left_x = playgroundOffset_X;
    let top_left_y = playgroundOffset_Y;

    let bottom_right_x = playgroundOffset_X + playgroundDimension.width;
    let bottom_right_y = playgroundOffset_Y + playgroundDimension.height;

    // dann die Eckpunkte der Karte
    let newCard_top_left_x = x;
    let newCard_top_left_y = y;

    let newCard_top_right_x = x + cardDimentsion.width;
    let newCard_top_right_y = y + cardDimentsion.height;

    let newCard_bottom_left_x = x;
    let newCard_bottom_left_y = y + cardDimentsion.height;

    let newCard_bottom_right_x = x + cardDimentsion.width;
    let newCard_bottom_right_y = y + cardDimentsion.height;

    // prüfe, ob sich die linke obere Ecke der Karte in einem Bereich der anderen Karten befindet
    let isTopLeftInRectangle = isPointInRectangle(newCard_top_left_x, newCard_top_left_y, top_left_x, top_left_y, bottom_right_x, bottom_right_y);

    let isTopRightInRectangle = isPointInRectangle(newCard_top_right_x, newCard_top_right_y, top_left_x, top_left_y, bottom_right_x, bottom_right_y);

    let isbottoumLeftInRectangle = isPointInRectangle(newCard_bottom_left_x, newCard_bottom_left_y, top_left_x, top_left_y, bottom_right_x, bottom_right_y);

    let isBottomRightInRectangle = isPointInRectangle(newCard_bottom_right_x, newCard_bottom_right_y, top_left_x, top_left_y, bottom_right_x, bottom_right_y);


    if (isTopLeftInRectangle && isTopRightInRectangle && isbottoumLeftInRectangle && isBottomRightInRectangle) {
        return true;
    }
    console.log("###############################################"+ 'Karte ist außerhalb des Spielfeldes')
    return false;
}

// funktion isOverlapping Eingangsparameter x,y x darf nicht zwischen card.x und card.x + card.width liegen und y darf nicht zwischen card.y und card.y + card.height liegen
function isOverlapping(x, y) {
    console.log("main.js: isOverlapping");
    console.log(`x: ${x}, y: ${y}`);

    // prüfe, ob sich die Maus über einer Memorycard befindet wenn ja, dann wird die Memorycard umgedreht wenn nein, dann wird nichts gemacht
    for (let i = 0; i < cardStack.length; i++) {

        console.log(`Karte Nummer: ${i}`)

        // befindet sich die linke obere Ecke der Karte in einem Bereich der anderen Karten?

        let top_left_x = cardStack[i].x_coordinate;
        let top_left_y = cardStack[i].y_coordinate;

        let bottom_right_x = cardStack[i].x_coordinate + cardStack[i].width;
        let bottom_right_y = cardStack[i].y_coordinate + cardStack[i].height;

        let newCard_top_left_x = x;
        let newCard_top_left_y = y;

        let newCard_top_right_x = x + cardStack[i].width;
        let newCard_top_right_y = y;

        let newCard_bottom_left_x = x;
        let newCard_bottom_left_y = y + cardStack[i].height;

        let newCard_bottom_right_x = x + cardStack[i].width;
        let newCard_bottom_right_y = y + cardStack[i].height;

        // prüfe, ob sich die linke obere Ecke der Karte in einem Bereich der anderen Karten befindet
        let isTopLeftInRectangle = isPointInRectangle(newCard_top_left_x, newCard_top_left_y, top_left_x, top_left_y, bottom_right_x, bottom_right_y);

        let isTopRightInRectangle = isPointInRectangle(newCard_top_right_x, newCard_top_right_y, top_left_x, top_left_y, bottom_right_x, bottom_right_y);

        let isbottoumLeftInRectangle = isPointInRectangle(newCard_bottom_left_x, newCard_bottom_left_y, top_left_x, top_left_y, bottom_right_x, bottom_right_y);

        let isBottomRightInRectangle = isPointInRectangle(newCard_bottom_right_x, newCard_bottom_right_y, top_left_x, top_left_y, bottom_right_x, bottom_right_y);


        if (isTopLeftInRectangle || isTopRightInRectangle || isbottoumLeftInRectangle || isBottomRightInRectangle) {
            return true;
        }
    }
}

// funktion die prüft, ob sich Punkt a (x/y) inerhalb eines Rechtecks (a/b für oben links und c/d für unten rechts) befindet
function isPointInRectangle(newX, newY, targetTopLeftX, targetTopLeftY, targetBottomRightX, targetBottomRightY) {
    console.log("main.js: isPointInRectangle");
    console.log(`newX: ${newX}, newY: ${newY}`);
    console.log(`targetTopLeftX: ${targetTopLeftX}, targetTopLeftY: ${targetTopLeftY}`);
    console.log(`targetBottomRightX: ${targetBottomRightX}, targetBottomRightY: ${targetBottomRightY}`);

    if (newX >= targetTopLeftX && newX <= targetBottomRightX && newY >= targetTopLeftY && newY <= targetBottomRightY) {
        return true;
    } else {
        return false;
    }

}

// funktion isOnCardClicked es wird geprüft, ob sich die Maus über einer Memorycard befindet
function isOnCardClicked(x, y) {
    console.log("main.js: isOnCardClicked");
    console.log(`x: ${x}, y: ${y}`);
    // prüfe, ob sich die Maus über einer Memorycard befindet wenn ja, dann wird die Memorycard umgedreht wenn nein, dann wird nichts gemacht
    for (let i = 0; i < cardStack.length; i++) {

        // console.log(`Karten Nummer: ${cardStack[i].infos.card_ID}`)
        // console.log(`X-Min: ${cardStack[i].x_coordinate}`)
        // console.log(`X-Max: ${cardStack[i].x_coordinate + cardStack[i].width}`)
        // console.log(`Y-Min: ${cardStack[i].y_coordinate}`)
        // console.log(`Y-Max: ${cardStack[i].y_coordinate + cardStack[i].height}`)
        if (x > cardStack[i].x_coordinate && x < cardStack[i].x_coordinate + cardStack[i].width && y > cardStack[i].y_coordinate && y < cardStack[i].y_coordinate + cardStack[i].height) {
            console.log(`Die Karte mit der ID: ${cardStack[i].infos.card_ID} wurde angeklickt`)
            //  console.log("main.js: isOnCardClicked: card clicked");
            return i
        }
    } console.log(`es wurde keine Karte angeklickt`)
}

// funktion inONPlaygroundClicked es wird geprüft, ob sich die Maus innerhalb der Spielfläche befindet
function isOnPlaygroundClicked(x, y) {
    console.log("main.js: isInPlaygroundClicked");
    console.log(`x: ${x}, y: ${y}`);
    console.log(`x+xOffset: ${x + xOffset}, y+yOffset: ${y + yOffset}`)
    // prüfe, ob sich die Maus innerhalb der Spielfläche befindet wenn ja, dann wird eine Memorycard an der Stelle angezeigt wenn nein, dann wird nichts gemacht
    if (x > playgroundOffset_X && x < playgroundOffset_X + playgroundDimension.width && y > playgroundOffset_Y && y < playgroundOffset_Y + playgroundDimension.height) {
        console.log("main.js: isInPlaygroundClicked: card clicked");
        return true
    }
    return false;
}

// erzeuge eine spielfläche mit 1000x1000px
function createPlayground() {
    console.log("main.js: createPlayground");
    // erzeuge eine neue Playground
    socket.emit('showPlayground', {height:playgroundDimension.height, width:playgroundDimension.width,color:'green', offset_X:playgroundOffset_X,offst_Y: playgroundOffset_Y} )
   // const playground = new Playground(playgroundDimension.height, playgroundDimension.width, 'green', playgroundOffset_X, playgroundOffset_Y);
}

// um das Bild soll ein roter Rahmen gezeichnet werden der Rahmen soll 2px breit sein
// Das Bild soll mittig zum Mausklick angezeigt werden

// Chat-Nachricht zum Chat-Protokoll anfügen
function addChatMessage(data) {
    console.log("main.js: addChatMessage");
    console.log(`data.username: ${data.username} data.message: ${data.message}`);

    var usernameDiv = document.createElement('span');
    usernameDiv.classList.add('username');
    usernameDiv.textContent = data.username;

    var messageBodyDiv = document.createElement('span');
    // messageBodyDiv.classList.add('messageBody');
    messageBodyDiv.textContent = data.message;

    var messageDiv = document.createElement('li');
    // messageDiv.classList.add('message');
    messageDiv.appendChild(usernameDiv);
    messageDiv.appendChild(messageBodyDiv);

    // Chat-Nachricht zum Chat-Protokoll hinzufügen
    messages.appendChild(messageDiv);

    // Chat-Protokoll nach unten scrollen
    messages.scrollTop = messages.scrollHeight;
}

socket.on('showPlayground', function (data) {
    console.log("main.js: showPlayground");
    console.log(`data.height: ${data.height} data.width: ${data.width} data.color: ${data.color} data.playgroundOffset_X: ${data.offset_X} data.offset_Y: ${data.playgroundOffset_Y}`);

    // erzeuge eine neue Playground
    const playground = new Playground(data.height, data.width, data.color, data.offset_X, data.offset_Y);
    console.log(playground);
});

// ==== Code für Socket.io Events


// Server schickt "login": Anmeldung war erfolgreich
socket.on('login', function (data) {
    console.log("main.js: login");
    connected = true;
    log("Willkommen beim Chat!");
});

// Server schickt "new message": Neue Nachricht zum Chat-Protokoll hinzufügen
socket.on('new message', function (data) {
    if (connected) {
        console.log("main.js: new message");
        console.log(`data.username: ${data.username} data.message: ${data.message}`);

        addChatMessage(data);
    }
});

// Server schickt "user joined": Neuen Benutzer im Chat-Protokoll anzeigen
socket.on('user joined', function (data) {
    console.log("main.js: user joined");

    if (connected) {
        log(data + ' joined');
    }
});

// Server schickt "user clicked left mouse button": 
socket.on('user clicked left mouse button', function (username, x, y) {
    // nur dann, wenn das Spiel gestartet ist und sich der Mauszeiger innerhalb der Spielfläche befindet und das bild vollständig in die Spielfläche pass soll die Funktion "showMemoryCard" aufgerufen werden

    console.log("main.js: user clicked left mouse button");
    handleMouseClick(x, y);
});

// das Bild: 'bird.svg' soll an der Stelle des Mausklicks angezeigt werden
// um das Bild soll ein roter Rahmen gezeichnet werden der Rahmen soll 2px breit sein
// Das Bild soll mittig zum Mausklick angezeigt werden
function handleMouseClick(x, y) {
    console.log("main.js: handleMouseClick");

    let clickedCard = isOnCardClicked(x, y);
    if (clickedCard != undefined) {
        cardStack[clickedCard].flipCard();
    }
}

// Server schickt "user left": Benutzer, der gegangen ist, im Chat-Protokoll anzeigen
socket.on('user left', function (data) {
    console.log("main.js: user left");
    log(data + ' left');
});

socket.on('showMemoryCard', function (index,usernname, x, y) {
    console.log("main.js: showMemoryCard");

    let currCard = new Memorycard(index, 2, 'red', 'solid', cardDimentsion.height, cardDimentsion.width, x, y, `./memory_cards/image_${index+1}.jpg`, `bird_fly.svg`,);
    document.body.appendChild(currCard.card);
    cardStack.push(currCard);
});




