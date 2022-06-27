class Game { 
    constructor () {
    this.hero = null;
    this.world = null;
    this.enemies = [];
    //level
    }

    startGame() {
        this.hero = new Hero();
        this.world = new World(this.hero, this.enemies);
        this.world.startWorld();
        this.createEnemies();
    }


    createEnemies() { 
        setInterval( () => {
            if(this.enemies.length < 10){
                this.enemies.push(new Enemy());
            }

        }, 5000);
    }

}

class World  {
    constructor(hero, enemies) {
        this.hero = hero;
        this.enemies = enemies;
        this.battle = null;
    }

    startWorld() {
        this.addEventListeners();
        this.moveEnemy();
        this.detectContact();
    }

    addEventListeners() {
        document.addEventListener('keydown', event => {
            switch(true) {
                case event.key === "ArrowUp" &&  this.hero.positionY + this.hero.height < 100:
                    this.hero.moveUp();
                    break;
                case event.key === "ArrowDown" && this.hero.positionY > 0:
                    this.hero.moveDown();
                    break;
                case event.key === "ArrowLeft" &&  this.hero.positionX > 0:
                    this.hero.moveLeft();
                    break;
                case event.key === "ArrowRight" &&  this.hero.positionX + this.hero.width < 100:
                    this.hero.moveRight();
                    break;
            }
        })
    }

    moveEnemy() {
        setInterval( () => {
            this.enemies.forEach(enemy => {
                switch(true) {
                    case enemy.positionX < this.hero.positionX && enemy.positionY < this.hero.positionY:
                        enemy.moveRight();
                        enemy.moveUp();
                        break;
                    case enemy.positionX > this.hero.positionX && enemy.positionY < this.hero.positionY:
                        enemy.moveLeft();
                        enemy.moveUp();
                        break;
                    case enemy.positionX < this.hero.positionX && enemy.positionY > this.hero.positionY:
                        enemy.moveRight();
                        enemy.moveDown();
                        break;
                    case enemy.positionX > this.hero.positionX && enemy.positionY > this.hero.positionY:
                        enemy.moveLeft();
                        enemy.moveDown();
                        break;
                    case enemy.positionX < this.hero.positionX:
                        enemy.moveRight();
                        break;
                    case enemy.positionX > this.hero.positionX:
                        enemy.moveLeft();
                        break;
                    case enemy.positionY < this.hero.positionY:
                        enemy.moveUp();
                        break;
                    case enemy.positionY > this.hero.positionY:
                        enemy.moveDown();
                        break;

            }
            })
        }, 200);
    }

    detectContact() {
        setInterval(() => {
            this.enemies.forEach( (enemy => {
                if (this.hero.positionX < enemy.positionX + enemy.width &&
                    this.hero.positionX + this.hero.width > enemy.positionX &&
                    this.hero.positionY < enemy.positionY + enemy.height &&
                    this.hero.height + this.hero.positionY > enemy.positionY) {
                    console.log("battle!");
                    this.battle = new Battle;
                }
            }))
        }, 50) 
    }

}


class Battle {
    constructor() {

    }

    startBattle(){ 

    }

    addEventListeners() {
        // document.addEventListener('click', this.hero.attack())
    }


}

class Character {
    constructor (className, height, width, positionX, positionY, health, attack, defence) {
        this.className = className;

        this.height = height;
        this.width = width;
        this.positionX = positionX;
        this.positionY = positionY;


        this.health = health;
        this.attack = attack;
        this.defence = defence;

        this.domElement = this.createDomElement();
    }

    createDomElement(className) {
        const newElement = document.createElement('div');

        //set it and css
        newElement.className = this.className;
        newElement.style.height = this.height + "vh";
        newElement.style.width = this.width + "vw";
        newElement.style.left = this.positionX + "vw";
        newElement.style.bottom = this.positionY + "vh";


        // append to the dom
        document.getElementById("world").appendChild(newElement);

        return newElement;
    }

    moveUp() {
        this.positionY++;
        this.domElement.style.bottom = this.positionY + "vh";
    }
    moveDown() {
        this.positionY--;
        this.domElement.style.bottom = this.positionY + "vh";
    }
    moveLeft() {
        this.positionX--;
        this.domElement.style.left = this.positionX + "vw";
    }
    moveRight() {
        this.positionX++;
        this.domElement.style.left = this.positionX + "vW";
    }
}


class Hero extends Character {
    constructor() {
        const className = "hero"
        const height = 15;
        const width = 3;
        const positionX = 0;
        const positionY = 100 - height;


        const health = 100;
        const attack = 20;
        const defence = 10;

        super(className, height, width, positionX, positionY, health, attack, defence);
    }
        

}




class Enemy extends Character {
    constructor(/*level*/) {
        const className = "enemy"
        
        const height = 10;
        const width = 2;
        const positionX = Math.floor(Math.random() * (100 - width) + 1);
        const positionY = Math.floor(Math.random() * (100 - height) + 1);

        const health = 50;
        const attack = 10;
        const defence = 10;

        super(className, height, width, positionX, positionY, health, attack, defence);
    
        this.level = 1;
    }

}

// class Ally extends Character {}
// class BossEnemy extends Character {}



const game = new Game();
game.startGame();