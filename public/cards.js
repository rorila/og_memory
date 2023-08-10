
// importiere die Klasse CardInfos aus cardInfos.js
import { CardInfos } from './cardInfos.js';

// Klasse Card
// Es handelt sich um eine abstrakte Klasse, die von den Klassen ImageCard und TextCard erweitert wird.
export class Card {
    card_ID
    card
    borderSize
    borderColor
    borderStyle
    height
    width
    x_coordinate
    y_coordinate

    constructor(card_ID, borderSize, borderColor, borderStyle, height, width, x_coordinate, y_coordinate) {
        // eine Karte besteht aus den folgenden Elementen:
        // Infos zu der Karte Meta-Informationen wie z.B. card_ID, card_name, card_description, card_type
        this.infos = new CardInfos(card_ID);

        // Posion und Größe
        this.height = height;
        this.width = width;

        // die Position der Karte ist die Mitte der Karte, darum wird die Position um die Hälfte der Breite und Höhe verschoben
        this.x_coordinate = x_coordinate ;
        this.y_coordinate = y_coordinate  ;

        // Rand der Karte
        this.borderSize = borderSize;
        this.borderColor = borderColor;
        this.borderStyle = borderStyle;              

        // erzeuge eine Karte
        // dafür wird ein div-Element mit den Attributen: borderSize, borderColor, height, width, x_coordinate und y_coordinate erzeugt
        this.card = document.createElement('div');
        this.card.style.position = 'absolute';
        this.card.style.left = this.x_coordinate + 'px'; // 50 ist die Hälfte der Breite des Bildes
        this.card.style.top = this.y_coordinate + 'px'; // 50 ist die Hälfte der Höhe des Bildes
        this.card.style.width = this.width + 'px';
        this.card.style.height = this.height + 'px';
        this.card.style.borderSize = this.borderSize;
        this.card.style.borderColor = this.borderColor;
        this.card.style.borderStyle = this.borderStyle;
        this.card.style.backgroundColor = 'yellow'; // Hintergrundfarbe des Bildes
        this.card.style.zIndex = '1000';
    }
}

// erzeuge eine Klasse ImageCard, die von der Klasse Card erbt
export class ImageCard extends Card {
    frontImage
    constructor(card_ID, borderSize, borderColor, borderStyle, height, width, x_coordinate, y_coordinate, frontImageSRC) {
        // Basisklasse erzeugen
        super(card_ID, borderSize, borderColor, borderStyle, height, width, x_coordinate, y_coordinate);

        // erzeuge ein img-Element mit den Attributen: height, width, x_coordinate und y_coordinate
        this.frontImage = document.createElement('img');
        this.frontImage.src = frontImageSRC;
        this.frontImage.style.position = 'absolute';
        this.frontImage.style.left = 0
        this.frontImage.style.top = 0
        this.frontImage.style.width = width + 'px';
        this.frontImage.style.height = height + 'px';
        this.frontImage.style.zIndex = '0';
        this.card.appendChild(this.frontImage);
    }
}


export class Memorycard extends ImageCard {
    backImage
    constructor(card_ID, borderSize, borderColor, borderStyle, height, width, x_coordinate, y_coordinate, frontImageSRC, backImageSRC) {

        // Basisklasse erzeugen
        super(card_ID, borderSize, borderColor, borderStyle, height, width, x_coordinate, y_coordinate,frontImageSRC);

        this.backImage = document.createElement('img');
        this.backImage.src = backImageSRC;
        this.backImage.style.position = 'absolute';
        this.backImage.style.left = 0
        this.backImage.style.top = 0
        this.backImage.style.width = width + 'px';
        this.backImage.style.height = height + 'px';
        this.backImage.style.zIndex = '1000';
        this.backImage.style.visibility = 'visible';
        this.frontImage.style.visibility = 'hidden';
        this.card.appendChild(this.backImage);


    }
    flipCard() {
        if (this.frontImage.style.visibility == 'hidden') {
            this.frontImage.style.visibility = 'visible';
            this.backImage.style.visibility = 'hidden';
        } else {
            this.frontImage.style.visibility = 'hidden';
            this.backImage.style.visibility = 'visible';
        }
    }
}