const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const gameButton = document.querySelector('div.gameButton');
const gameOver = document.querySelector('div.gameOver');
const gameOverP = document.querySelector('div.gameOver p');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const scaleCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    try {
        bird.setSize(Bird.getParams());
    }
    catch{

    }

}

window.addEventListener('resize', scaleCanvas);

class Bird {
    constructor(obj) {
        this.x = obj.x; //x position
        this.y = obj.y; //y position
        this.w = obj.w; //width
        this.h = obj.h; //height
        this.v = obj.v; //velocity

        this.falling = true;
        this.timeoutIndex;

        this.points = 0;

        this.flying = true; //If bird hit the ground or pillar this value will be changed to false, and it will end the game

        this.changeDirection = (e) => {
            if (e !== undefined) {
                clearTimeout(this.timeoutIndex);
                this.falling = false;
            } else {
                this.falling = true;
            }


            if (this.falling === false) {
                this.timeoutIndex = setTimeout(this.changeDirection, 220)
            }
        }

        //Adding 0.5 point per pillar. 2 pillars in one column, so after all it's adding 1 point
        this.addPoint = () => {
            this.points += 0.5;
        }

        //If pillar detects hit with bird this function is executed
        this.hit = () => {
            this.flying = false;
        }
    }

    draw() { //drawing bird (rectangle)
        c.fillStyle = '#FF5E35';
        c.fillRect(this.x, this.y, this.w, this.h);
    }

    update() { //updating birds position

        //changingYPosition
        if (this.falling) {
            this.y += this.v;
        } else if (!this.falling) {
            this.y -= this.v;
        }

        if (canvas.height - (this.y + this.h + this.v) <= 5) {
            this.flying = false;
        }

        this.draw();
    }

    setSize(obj) { //setting the parameters of bird
        this.x = obj.x;
        this.y = obj.y;
        this.w = obj.w;
        this.h = obj.h;
    }

    static getParams() {
        const canvasW = canvas.width;
        const canvasH = canvas.height;
        const size = 5;
        const birdW = (canvasH / 100) * size;
        const birdH = (canvasH / 100) * size;
        const x = (canvasW / 100) * 25;
        const y = ((canvasH / 100) * 50) - (birdH / 2);
        const v = 5;

        const params = {
            x: x,
            y: y,
            w: birdW,
            h: birdH,
            v: v,
        }

        return params;
    }
}

class Pillar {
    constructor(x, y, w, h, bird, place) {
        this.x = x; //x position
        this.y = y; //y position
        this.w = w; //width
        this.h = h; //height
        this.place = place; //Determinating if it's top or bottom pillar

        this.color = '#5E1742'

        this.bird = bird; //Bird obj reference
        this.pointAdded = false; //Thanks to this flag bird.addPoint function will be executed only once
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.w, this.h);
    }

    update() {
        this.x -= Bird.getParams().v;

        //Checking if bird passed the pillar
        if (this.bird.x > this.x + this.w && !this.pointAdded) {
            this.bird.addPoint();
            this.pointAdded = true;
        }

        //Checking if bird has hitted the pillar
        if (this.place === 'top') {
            if (this.bird.x + this.bird.w >= this.x && this.bird.x <= this.x + this.w && this.bird.y <= this.h) {
                this.bird.hit();
                this.color = '#330136';
            }
        } else if (this.place === 'bottom') {
            if (this.bird.x + this.bird.w >= this.x && this.bird.x <= this.x + this.w && this.bird.y + this.bird.h >= this.y) {
                this.bird.hit();
                this.color = '#330136';
            }
        }

        this.draw();
    }
}


// let bird = new Bird(Bird.getParams());

let pillarArray = []; //Array of all pillars 
let nextPillarOffset = 0; //Distance between following gaps chosen randomly in createPillars function

const createPillars = () => {

    const gapHeight = 20;

    const nextPillarOffset = Math.floor(Math.random() * (gapHeight * 3) - gapHeight); //Drawing a number between 0 and gapHeight to determinate next gaps position



    const topPillarHeight = (canvas.height / 100) * ((100 - gapHeight - nextPillarOffset) / 2);

    //Checking if top pillar isn't too small or too big
    if (topPillarHeight < 10)
        topPillarHeight = 10;
    else if (topPillarHeight > (canvas.height - (canvas.height / 100) * gapHeight) - 10)
        topPillarHeight = (canvas.height - (canvas.height / 100) * gapHeight) - 10;

    const bottomPillarHeight = canvas.height - ((canvas.height / 100) * gapHeight) - topPillarHeight;
    const topPillarY = 0;
    const bottomPillarY = topPillarHeight + (canvas.height / 100) * gapHeight;


    pillarArray.push(new Pillar(canvas.width, topPillarY, (canvas.width / 100) * 10, topPillarHeight, bird, 'top')); //Creating top pillar
    pillarArray.push(new Pillar(canvas.width, bottomPillarY, (canvas.width / 100) * 10, bottomPillarHeight, bird, 'bottom')); //Creating bottom pillar
}


/*
    TODO:
    1. Przycisk reset
*/
const writeOnTheCenter = (text) => {
    const fontSize = (canvas.width / 100) * 30;
    c.font = `${fontSize}px Arial`;
    c.textAlign = 'center';
    c.fillStyle = 'rgba(0, 0, 0, 0.3)';
    c.fillText(text, canvas.width / 2, canvas.height / 2 + fontSize / 4);
}
let createPillarsInterval;
let countdownInterval;
let countdownText = 3;

const animate = () => {
    if (createPillarsInterval === undefined) {
        createPillarsInterval = setInterval(createPillars, 1500);
        clearInterval(countdownInterval);
    }

    if (bird.flying)
        requestAnimationFrame(animate);
    else {
        gameOver.classList.remove('hidden');
        clearInterval(createPillarsInterval);
        c.clearRect(0, 0, innerWidth, innerHeight);
        writeOnTheCenter(`${Math.floor(bird.points)}`);
        gameButton.textContent = 'Play again';
        gameOverP.textContent = 'Game Over';
        gameButton.classList.remove('hidden');
        return;
    }

    c.clearRect(0, 0, innerWidth, innerHeight);

    writeOnTheCenter(`${Math.floor(bird.points)}`);
    bird.update();
    pillarArray.forEach((pillar, index) => {
        pillar.update();
        if (pillar.x < -canvas.width * 2) {
            pillarArray.splice(index, 1);
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.keyCode === 32) {
        return bird.changeDirection(e, false);
    }
});
document.addEventListener('touchstart', (e) => {
    try {
        return bird.changeDirection(e, false);
    }
    catch {

    }

});

const startGame = () => {
    gameButton.classList.add('hidden');
    gameOver.classList.add('hidden');

    countdownInterval = setInterval(() => {
        c.clearRect(0, 0, innerWidth, innerHeight);
        bird.draw();
        writeOnTheCenter(countdownText);
        countdownText -= 1;
        if (countdownText === 0) {
            setTimeout(() => {
                countdownText = 3;
            }, 1000);
        }
    }, 1000);
    setTimeout(animate, 4900);

    bird = new Bird(Bird.getParams());

    pillarArray = [];
    nextPillarOffset = 0;
    createPillarsInterval = undefined;
}

gameButton.addEventListener('click', () => {
    startGame();
});
