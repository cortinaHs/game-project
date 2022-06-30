
// variables for DOM changes
const worldEl = document.getElementById("world");
const battleEl = document.getElementById("battle");
const popupEl = document.getElementById("popup");


class Game { 
    constructor () {
    this.hero = null;
    this.world = null;
    this.audio = null;
    }


    welcome() {
        //scene
        worldEl.hidden = false;
        battleEl.hidden = true;

        //popup welcome 
        popupEl.innerHTML = "<br><br>You are on an adventure to find a special flower. <br><br>Find the flower and win the game.<br><br>This requires a certain level of experience. Fill the bar before you reach the flower by winning fights against monsters along the way.<br><br><br>";

        //play button
        const play = document.createElement("button");
        play.innerText = "Play";
        play.style.height = "3rem";
        play.style.width = "4rem";
        popupEl.appendChild(play);
        popupEl.hidden = false;

        play.addEventListener("click", () => {
            popupEl.hidden = true;
            popupEl.innerHTML = "";
            play.remove();
            this.startGame();
        });
    }


    startGame() {
        popupEl.hidden = true;

        this.hero = new Hero();

        //initiate world
        this.world = new World(this.hero);
        this.world.startWorld();
        this.audio = new Audio("../sounds/battleaudio.mp3");
        this.audio.play();
        this.audio.volume = 0.2;
        this.audio.loop = true;

    }


    endGame(status) {
        //scene
        worldEl.hidden = false;
        battleEl.hidden = true;

        //reset
        clearInterval(this.world.intervalID)
        this.hero.domElement.remove();
        this.world.enemies.forEach(enemy => enemy.domElement.remove());
        this.hero = null;
        this.world = null;
        this.audio.pause();
        this.audio = null;

        //popup
        if(status === "gameOver") {
            popupEl.innerHTML = "<br><br><br>Game Over<br><br><br>";
        } else if(status === "winGame") {
            popupEl.innerHTML = "<br><br><br>Congratulations! <br>You reached the destination.<br><br><br>";
        }

        //play again button
        const playAgain = document.createElement("button");
        playAgain.innerText = "Play Again";
        play.style.height = "3rem";
        play.style.width = "4rem";
        popupEl.appendChild(playAgain);

        popupEl.hidden = false;

        playAgain.addEventListener("click", () => {
            popupEl.hidden = true;
            popupEl.innerHTML = "";
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

    //move player
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

    //game interval
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

    //enemies
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

    //win game
    reachDestination() {
        if(this.hero.positionX === 100 - this.hero.width && this.hero.positionY === 0 && this.hero.xp >= 1){
            game.endGame("winGame");
        }
    }


    //battle
    initiateBattle(hero, enemy) {
        //save world position
        this.worldPositionX = this.hero.positionX;
        this.worldPositionY = this.hero.positionY;

        //initiate battle
        this.battle = new Battle(hero, enemy);
        this.inBattle = true;

        //scene
        worldEl.hidden = true;
        battleEl.hidden = false;
        const heroDom = hero.createDomElement();
        hero.createHealthBar(heroDom);
        const enemyDom = enemy.createDomElement();
        enemy.createHealthBar(enemyDom);
        this.battle.startBattle(hero, enemy);
    }

    winBattle(enemy){
        popupEl.innerHTML = "<br><br><br>Enemy down! You win!"
        popupEl.hidden = false;

        //scene
        worldEl.hidden = false;
        battleEl.hidden = true;

        //remove enemy
        enemy.domElement.remove();
        this.enemies.splice(this.enemies.indexOf(enemy), 1);
        
        //??????
        this.hero.healthBar = this.hero.createHealthBar(this.hero.domElement);

        //continue in world setting
        setTimeout(() => {
            popupEl.innerHTML = "";
            popupEl.hidden = true;
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
        this.hero.height = 40;
        this.hero.width = 30;
        this.hero.positionX = 8;
        this.hero.positionY = 10;

        this.enemy = enemy;
        this.enemy.scene = "battle"
        this.enemy.height = 40;
        this.enemy.width = 37;
        this.enemy.positionX = 95 - this.enemy.width;
        this.enemy.positionY = 15;
    }

    startBattle() {
        this.addEventListeners();
    }

    //hero actions
    addEventListeners() {
        document.getElementById("attack").addEventListener('click', () => {
            this.fight(attack, this.hero, this.enemy);
        });

        document.getElementById("heal").addEventListener('click', () => {
            this.fight(heal, this.hero, this.enemy);
        });

        document.getElementById("magic").addEventListener('click', () => {
            this.fight(magic, this.hero, this.enemy);
        });
    }

    fight(action, hero, enemy) {
        //hero attack
        if (hero.health > 0){
            switch(action){
                case attack: 
                    this.attack(hero, enemy);
                    break;
                case heal: 
                    this.heal();
                    break;
                case magic: 
                    this.magic(hero, enemy);
                    break;
            }
        }

        //enemy attack
        if (enemy.health > 0){
        this.attack(enemy, hero);
        }

        // win-loose battle
        if (hero.health <= 0) {
            setTimeout(() => {
                game.endGame("gameOver");
            }, 1000)
        } else if (enemy.health <= 0){
            hero.xp++;
            document.getElementById("xp-value").value = hero.xp;
            setTimeout(() => {
                game.world.winBattle(enemy);
            }, 1000)
        }

    }

    
    attack(attacker, opponent) {
        const chance = Number(Math.random().toFixed(2));

        if(chance > 0.85) {
            opponent.health -= attacker.attack * 2;
        } else if(chance > 0.60) {
            opponent.health -= (Math.floor(attacker.attack * chance));
        } else {
            opponent.health -= (Math.floor(attacker.attack * 0.6));
        }

        opponent.healthBar.value = opponent.health;
    }

//change attack! 
    magic(attacker, opponent){
        const chance = Number(Math.random().toFixed(2));

        if(chance > 0.85) {
            opponent.health -= attacker.attack * 2;
        } else if(chance > 0.60) {
            opponent.health -= (Math.floor(attacker.attack * chance));
        } else {
            opponent.health -= (Math.floor(attacker.attack * 0.6));
        }

        opponent.healthBar.value = opponent.health;
    }

    heal() {
        this.hero.health += 20;
    }
}

class Character {
    constructor (className, scene, height, width, positionX, positionY, health, attack) {
        this.className = className;
        this.scene = scene;

        this.height = height;
        this.width = width;
        this.positionX = positionX;
        this.positionY = positionY;


        this.health = health;
        this.attack = attack;

        this.domElement = this.createDomElement();
        this.healthBar = this.createHealthBar(this.domElement);
    }

    createDomElement() {
        const newElement = document.createElement('div');

        newElement.className = this.className;
        newElement.style.height = this.height + "vh";
        newElement.style.width = this.width + "vw";
        newElement.style.left = this.positionX + "vw";
        newElement.style.bottom = this.positionY + "vh";

        document.getElementById(this.scene).appendChild(newElement);

        return newElement;
    }

    createHealthBar(domElement) {

        const healthBar = document.createElement("progress");
        healthBar.className = "hp-value";
        healthBar.value = this.health;
        healthBar.max = 100; 

        const label = document.createElement("label");
        label.className = "hp";
        label.textContent = this.className;

        label.appendChild(healthBar);
        domElement.appendChild(label);

        this.healthBar = healthBar;

        return healthBar;
    }

    //character movement
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

        const height = 8;
        const width = 6;
        const positionX = 2;
        const positionY = 100 - 3 - height;


        const health = 100;
        const attack = 30;

        super(className, scene, height, width, positionX, positionY, health, attack);

        this.xp = 0;
        this.domElement.innerHTML += `<label id="xp">xp
        <progress id="xp-value" value="${this.xp}" max="1"></progress></label>`
    }
        

}




class Enemy extends Character {
    constructor() {
        const className = "enemy";
        const scene = "world";
        
        const height = 10;
        const width = 9;
        const positionX = Math.floor(Math.random() * (100 - width) + 1);
        const positionY = Math.floor(Math.random() * (100 - height) + 1);


        const health = 100;
        const attack = 10;

        super(className, scene, height, width, positionX, positionY, health, attack);
    
        this.healthBar.hidden = true;
    }

}

// class Ally extends Character {}
// class BossEnemy extends Enemy {}





//start game
const game = new Game();
game.welcome();