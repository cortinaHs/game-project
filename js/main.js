class Game { 
    constructor () {
    this.hero = null;
    this.world = null;

    //level
    }

    startGame() {
        document.getElementById("world").hidden = false;
        document.getElementById("battle").hidden = true;
        this.hero = new Hero();
        this.world = new World(this.hero);
        this.world.startWorld();

    }
}

class World  {
    constructor(hero) {
        this.hero = hero;
        this.enemies = [];
        this.battle = null;
        this.inBattle = false;
    }

    startWorld() {
        this.addEventListeners();
        this.createEnemies();
        this.moveEnemy();
        this.detectContact();
    }

    addEventListeners() {
        document.addEventListener('keydown', event => {
            if(this.inBattle){
                return
            }
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

    createEnemies() { 
        setInterval( () => {
            if(this.inBattle){
                return
            }
            if(this.enemies.length < 10){
                this.enemies.push(new Enemy());
            }

        }, 5000);
    }


    moveEnemy() {
        setInterval( () => {
            if(this.inBattle){
                return
            }
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
            if(this.inBattle){
                return
            }
            this.enemies.forEach( (enemy => {
                if (this.hero.positionX < enemy.positionX + enemy.width &&
                    this.hero.positionX + this.hero.width > enemy.positionX &&
                    this.hero.positionY < enemy.positionY + enemy.height &&
                    this.hero.height + this.hero.positionY > enemy.positionY) {
                    this.startBattle(this.hero, enemy);
                    this.enemies.splice(enemy);
                    enemy.domElement.remove();
                }
            }))
        }, 50) 
    }

    startBattle(hero, enemy) {
        this.battle = new Battle(hero, enemy);
        this.inBattle = true;
        document.getElementById("world").hidden = true;
        document.getElementById("battle").hidden = false;
        hero.createDomElement();
        enemy.createDomElement();

    }

}


class Battle {
    constructor(hero, enemy) {
        this.hero = hero;
        this.hero.scene = "battle"
        this.hero.height = 25;
        this.hero.width = 8;
        this.hero.positionX = 90 - this.hero.width;
        this.hero.positionY = 0;

        this.enemy = enemy;
        this.enemy.scene = "battle"
        this.enemy.height = 30;
        this.enemy.width = 10;
        this.enemy.positionX = 10;
        this.enemy.positionY = 0;

    }

    addEventListeners() {
        // document.addEventListener('click', this.hero.attack())
    }


}

class Character {
    constructor (className, scene, height, width, positionX, positionY, health, attack, defence) {
        this.className = className;
        this.scene = scene;

        this.height = height;
        this.width = width;
        this.positionX = positionX;
        this.positionY = positionY;


        this.health = health;
        this.attack = attack;
        this.defence = defence;

        this.domElement = this.createDomElement();
    }

    createDomElement() {
        const newElement = document.createElement('div');

        //set it and css
        newElement.className = this.className;
        newElement.style.height = this.height + "vh";
        newElement.style.width = this.width + "vw";
        newElement.style.left = this.positionX + "vw";
        newElement.style.bottom = this.positionY + "vh";

        // append to the dom
        document.getElementById(this.scene).appendChild(newElement);

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
        const className = "hero";
        const scene = "world";


        const height = 15;
        const width = 3;
        const positionX = 0;
        const positionY = 100 - height;


        const health = 100;
        const attack = 20;
        const defence = 10;

        super(className, scene, height, width, positionX, positionY, health, attack, defence);
    }
        

}




class Enemy extends Character {
    constructor(/*level*/) {
        const className = "enemy";
        const scene = "world";
        
        const height = 10;
        const width = 2;
        const positionX = Math.floor(Math.random() * (100 - width) + 1);
        const positionY = Math.floor(Math.random() * (100 - height) + 1);

        const health = 50;
        const attack = 10;
        const defence = 10;

        super(className, scene, height, width, positionX, positionY, health, attack, defence);
    
        this.level = 1;
    }

}

// class Ally extends Character {}
// class BossEnemy extends Character {}



const game = new Game();
game.startGame();