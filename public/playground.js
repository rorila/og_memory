// erzeuge eine Klasse mit Namen: 'Playground'. Attribute sind: size,color und exportiere diese Klasse

export class Playground {
    constructor(height,width, color,x_coordinate, y_coordinate) {
        this.height = height;
        this.width = width;
        this.color = color;    
        
        this.playground = document.createElement('div');
        this.playground.style.position = 'absolute';
        this.playground.style.left = x_coordinate+'px';
        this.playground.style.top = y_coordinate+'px';
        this.playground.style.width = width+'px';
        this.playground.style.height = height+'px';
        this.playground.style.backgroundColor = color;
        this.playground.style.zIndex = '1000';
        document.body.appendChild(this.playground);
    }
}


