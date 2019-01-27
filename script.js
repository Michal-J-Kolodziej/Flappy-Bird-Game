const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const scaleCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    bird.setSize(Bird.getParams());
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

        this.flying = true;

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
    }

    draw() { //drawing bird (rectangle)
        c.fillStyle = 'grey';
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
        const x = (canvasW / 100) * 5;
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
    constructor(x, y, w, h, bird) {
        this.x = x; //x position
        this.y = y; //y position
        this.w = w; //width
        this.h = h; //height

        this.bird = bird; //bird obj reference
    }

    draw() {
        c.fillStyle = 'grey';
        c.fillRect(this.x, this.y, this.w, this.h);
    }

    update() {
        this.x -= Bird.getParams().v;

        this.draw();
    }
}


const bird = new Bird(Bird.getParams());

let pillarArray = [];
let nextPillarOffset = 0;

const createPillars = () => {

    const gapHeight = 25;

    nextPillarOffset = Math.floor(Math.random() * (gapHeight * 2.5) - gapHeight); //Drawing a number between 0 and gapHeight to determinate next gaps position


    const pillarHeight = (canvas.height / 100) * ((100 - gapHeight) / 2);
    const topPillarY = 0 - (canvas.height / 100) * nextPillarOffset;
    const bottomPillarY = canvas.height - (canvas.height / 100) * ((100 - (gapHeight - nextPillarOffset)) / 2);


    pillarArray.push(new Pillar(canvas.width, topPillarY, (canvas.width / 100) * 10, pillarHeight, bird)); //top pillar
    pillarArray.push(new Pillar(canvas.width, bottomPillarY, (canvas.width / 100) * 10, pillarHeight + ((canvas.height / 100) * gapHeight), bird)); //bottom pillar
}

let createPillarsInterval = setInterval(createPillars, 1500);

/*
    TODO:
    1. Ustalic dlaczego luki pomiędzy pilarami maja różną wysokość
    2. Zabezpieczyć się przed sytuacja gdy górna kolumna nie sięga do górnej krawędzi
    3. Zabezpieczyć się przed sytuacją gdy luka pomiędzy kolumnami wyjdzie poza planszę
*/


const animate = () => {
    if (bird.flying)
        requestAnimationFrame(animate);
    else {
        document.querySelector('div.gameOver').classList.remove('hidden');
        clearInterval(createPillarsInterval);
    }


    c.clearRect(0, 0, innerWidth, innerHeight);

    bird.update();
    pillarArray.forEach((pillar, index) => {
        pillar.update();
        if (pillar.x < -canvas.width) {
            pillarArray.splice(index, 1);
        }

    })

}


document.addEventListener('keydown', (e) => {
    if (e.keyCode === 32) {
        return bird.changeDirection(e, false);
    }
});
animate();
