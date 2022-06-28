class Game { 
    constructor () {
    this.hero = null;
    this.world = null;

    //level
    }


    welcomeScreen() {
        document.getElementById("world").hidden = false;
        document.getElementById("battle").hidden = true;
        

        const message = document.createElement("p");
        message.innerHTML = ".......";

        document.getElementById("popup").appendChild(message);


        const play = document.createElement("button");
        play.innerText = "Play";
        document.getElementById("popup").appendChild(play);

        document.getElementById("popup").hidden = false;

        play.addEventListener("click", () => {
            document.getElementById("popup").hidden = true;
            message.remove();
            play.remove();
            this.startGame();
        });



    }

    startGame() {
        document.getElementById("popup").hidden = true;

        this.hero = new Hero();
        this.world = new World(this.hero);
        this.world.startWorld();

    }

    gameEnd(status) {
        document.getElementById("world").style.filter = "blur (8px)"
        document.getElementById("world").hidden = false;
        document.getElementById("battle").hidden = true;

        //reset
        clearInterval(this.world.intervalID)
        this.hero.domElement.remove();
        this.world.enemies.forEach(enemy => enemy.domElement.remove());
        this.hero = null;
        this.world = null;

        //popup
        const message = document.createElement("p");

        if(status === "gameOver") {
            message.innerHTML = "Game Over";
        } else if(status === "winGame") {
            message.innerHTML = "Congratulations! You reached the destination.";
        }

        document.getElementById("popup").appendChild(message);


        const playAgain = document.createElement("button");
        playAgain.innerText = "Play Again";
        document.getElementById("popup").appendChild(playAgain);

        document.getElementById("popup").hidden = false;

        playAgain.addEventListener("click", () => {
            document.getElementById("popup").hidden = true;
            message.remove();
            playAgain.remove();
            this.startGame();
        });
        
    }
}

class World  {
    constructor(hero) {
        this.hero = hero;
        this.enemies = [];
        this.battle = null;
        this.inBattle = false;
        this.worldPositionX = null;
        this.worldPositionY = null;
        this.intervalID = null;
        this.time = 0;
    }

    startWorld() {
        this.addEventListeners();
        this.enemyActions();
    }

    addEventListeners() {
        document.addEventListener("keydown", event => {
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

    enemyActions() {
        this.intervalID = setInterval( () => {
            if(this.inBattle){
                return
            }

            if(this.time % 420 === 0) {
                this.createEnemies();
            }

            if(this.time % 120 === 0) {
                this.moveEnemy();
            }

            this.detectContact();

            this.reachDestination();

            this.time++;

        }, 10);
    }

        

    

    createEnemies() {  
            if(this.enemies.length < 5){
                this.enemies.push(new Enemy());
            }
    }


    moveEnemy() {
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
            });
    }

    detectContact() {
            this.enemies.forEach( (enemy => {
                if (this.hero.positionX < enemy.positionX + enemy.width &&
                    this.hero.positionX + this.hero.width > enemy.positionX &&
                    this.hero.positionY < enemy.positionY + enemy.height &&
                    this.hero.height + this.hero.positionY > enemy.positionY) {

                    this.initiateBattle(this.hero, enemy);
                }
            }));
    }

        reachDestination() {
            if(this.hero.positionX === 100 - this.hero.width && this.hero.positionY === 0){
                //trigger "Bossfight"?
                //min XP = 100
                game.gameEnd("winGame");
        }
    }

    initiateBattle(hero, enemy) {
        this.worldPositionX = this.hero.positionX;
        this.worldPositionY = this.hero.positionY;
        this.battle = new Battle(hero, enemy);
        this.inBattle = true;
        document.getElementById("world").hidden = true;
        document.getElementById("battle").hidden = false;
        hero.createDomElement();
        enemy.createDomElement();
        this.battle.startBattle(hero, enemy);
    }

    winBattle(enemy){
        const message = document.createElement("p");
        message.innerHTML = "Enemy down! You win!"

        document.getElementById("popup").appendChild(message)
        document.getElementById("popup").hidden = false;
        // document.getElementById("world").style.filter = "blur (8px)"
        document.getElementById("world").hidden = false;
        document.getElementById("battle").hidden = true;

        this.enemies.splice(this.enemies.indexOf(enemy), 1);
        enemy.domElement.remove();


        setTimeout(() => {
            message.remove();
            document.getElementById("popup").hidden = true;
            this.hero.positionX = this.worldPositionX;
            this.hero.positionY = this.worldPositionY;
            this.inBattle = false;
        }, 3000)
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

        // this.turn = "hero";

    }

    startBattle(hero, enemy) {
        this.addEventListeners();
    }

    addEventListeners() {
        document.getElementById("attack").addEventListener('click', () => {
                this.fight(this.hero, this.enemy);
        });
        // document.getElementById("block").addEventListener('click', () => {
        //     if(this.turn === "hero") {
        //         this.defend(this.hero, this.enemy);
        //         this.turn = "enemy";
        //     }
        // });
    }

    fight(hero, enemy) {
 
        this.attack(hero, enemy);
        this.attack(enemy, hero);

        console.log(hero.health)


        // if(this.turn === "hero") {
        // this.attack(hero, enemy);
        // this.turn = "enemy";
        // } else if (this.turn === "enemy") {
        //     this.attack(enemy, hero);
        //     this.turn = "hero";
        // }

        if (hero.health <= 0) {
            return game.gameEnd("gameOver");
        } else if (enemy.health <= 0){
            return game.world.winBattle(enemy);
        }

    }

    
    attack(attacker, opponent) {

        //move animation

        const chance = Number(Math.random().toFixed(2))

        if(chance > 0.85) {
            opponent.health -= attacker.attack * 2;
        } else if(chance > 0.60) {
            opponent.health -= (Math.floor(attacker.attack * chance)) - opponent.defence;
        } else {
            opponent.health -= (Math.floor(attacker.attack * 0.6)) - opponent.defence;
        }
    }

    // defend() {

    // }


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


        const health = 200;
        const attack = 40;
        const defence = 10;

        super(className, scene, height, width, positionX, positionY, health, attack, defence);
    }
        

}




class Enemy extends Character {
    constructor(/*positionX, positionY, level*/) {
        const className = "enemy";
        const scene = "world";
        
        const height = 10;
        const width = 2;
        const positionX = Math.floor(Math.random() * (100 - width) + 1);
        const positionY = Math.floor(Math.random() * (100 - height) + 1);


        const health = 150;
        const attack = 20;
        const defence = 10;

        super(className, scene, height, width, positionX, positionY, health, attack, defence);
    
        this.level = 1;
    }

}

// class Ally extends Character {}
// class BossEnemy extends Character {}



const game = new Game();
game.welcomeScreen();