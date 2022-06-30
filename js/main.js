
// variables for DOM changes
const worldEl = () => document.getElementById("world");
const battleEl = () => document.getElementById("battle");
const popupEl = () => document.getElementById("popup");


class Game { 
    constructor () {
    this.hero = null;
    this.world = null;
    this.audio = null;

    this.resetScenes();
    }

    resetScenes() {
        worldEl().innerHTML = "";
        this.createPopupElement(worldEl());
    }

    resetGame() {
        delete this.hero;
        delete this.world;
        delete this.audio;
    }

    createPopupElement(parent) {
        const popupEl = document.createElement("div");
        popupEl.id = "popup";

        parent.appendChild(popupEl);
    }

    welcome() {
        //scene
        worldEl().hidden = false;
        battleEl().hidden = true;

        //popup welcome 
        popupEl().innerHTML = "<br><br>You are on an adventure to find a special flower. <br><br>Find the flower and win the game.<br><br>This requires a certain level of experience. Fill the bar before you reach the flower by winning fights against monsters along the way.<br><br><br>";

        //play button
        const play = document.createElement("button");
        play.innerText = "Play";
        play.style.height = "3rem";
        play.style.width = "4rem";
        popupEl().appendChild(play);
        popupEl().hidden = false;

        play.addEventListener("click", () => {
            popupEl().hidden = true;
            popupEl().innerHTML = "";

            this.startGame();
        });
    }


    startGame() {
        popupEl().hidden = true;

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
        clearInterval(this.world.intervalID);

        this.audio.pause();

        //scene
        worldEl().hidden = false;
        battleEl().hidden = true;

        this.resetGame();
        this.resetScenes();

        this.audio = null;

        //popup
        if(status === "gameOver") {
            popupEl().innerHTML = "<br><br><br>Game Over<br><br><br>";
        } else if(status === "winGame") {
            popupEl().innerHTML = "<br><br><br>Congratulations! <br>You reached the destination.<br><br><br>";
        }

        //play again button
        const playAgain = document.createElement("button");
        playAgain.innerText = "Play Again";
        playAgain.style.height = "3rem";
        playAgain.style.width = "4rem";
        popupEl().appendChild(playAgain);

        popupEl().hidden = false;

        playAgain.addEventListener("click", () => {
            popupEl().hidden = true;
            popupEl().innerHTML = "";
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
        this.hero.createDomElement(worldEl(), true);

        this.addEventListeners();
        this.enemyActions();
    }

    //move player
    addEventListeners() {
        document.addEventListener("keydown", event => {
            if(this.inBattle){
                return;
            }

            switch(true) {
                case event.key === "ArrowUp" && this.hero.positionY + this.hero.height < 100:
                    this.hero.moveUp();
                    break;
                case event.key === "ArrowDown" && this.hero.positionY > 0:
                    this.hero.moveDown();
                    break;
                case event.key === "ArrowLeft" && this.hero.positionX > 0:
                    this.hero.moveLeft();
                    break;
                case event.key === "ArrowRight" && this.hero.positionX + this.hero.width < 100:
                    this.hero.moveRight();
                    break;
            }
        })
    }

    //game interval
    enemyActions() {
        this.intervalID = setInterval( () => {
            if(this.inBattle){
                return;
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
            const enemy = new Enemy();
            enemy.createDomElement(worldEl(), false);
            this.enemies.push(enemy);
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
        worldEl().hidden = true;
        battleEl().hidden = false;

        this.battle.startBattle(hero, enemy);
    }

    winBattle(enemy){
        this.enemies.splice(this.enemies.indexOf(enemy), 1);
        this.resumeScene();

        popupEl().innerHTML = "<br><br><br>Enemy down! You win!"
        popupEl().hidden = false;

        //scene
        worldEl().hidden = false;
        battleEl().hidden = true;

        battleEl().innerHTML = "";

        //continue in world setting
        setTimeout(() => {
            popupEl().innerHTML = "";
            popupEl().hidden = true;

            this.inBattle = false;
        }, 2000)
    }

    resumeScene() {
        worldEl().innerHTML = "";

        this.createPopupElement(worldEl());

        this.hero.positionX = this.worldPositionX;
        this.hero.positionY = this.worldPositionY;
        this.hero.height = this.hero.worldHeight;
        this.hero.width = this.hero.worldWidth;

        this.hero.createDomElement(worldEl(), true)
        this.enemies.forEach(enemy => enemy.createDomElement(worldEl(), false));
    }

    createPopupElement(parent) {
        const popupEl = document.createElement("div");
        popupEl.hidden = true;
        popupEl.id = "popup";

        parent.appendChild(popupEl);
    }
}


class Battle {
    constructor(hero, enemy) {
        this.hero = hero;
        this.hero.scene = "battle"
        this.hero.height = hero.battleHeight;
        this.hero.width = hero.battleWidth;
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
        this.resetScene();
        this.addEventListeners();

        this.hero.createDomElement(battleEl(), true);
        this.enemy.createDomElement(battleEl(), true);
    }

    resetScene() {
        battleEl().innerHTML = "";
        this.createBattleActions(battleEl());
    }

    createBattleActions(parent) {
        const magicBtn = document.createElement("button");
        magicBtn.id = "magic";
        magicBtn.className = "fight-btn";
        magicBtn.innerHTML = "<img src=\"./img/Elemental.png\" />";

        const attackBtn = document.createElement("button");
        attackBtn.id = "attack";
        attackBtn.className = "fight-btn";
        attackBtn.innerHTML = "<img src=\"./img/sword.png\" />";

        const healBtn = document.createElement("button");
        healBtn.id = "heal";
        healBtn.className = "fight-btn";
        healBtn.innerHTML = "<img src=\"./img/potion.png\" />";

        parent.appendChild(magicBtn);
        parent.appendChild(attackBtn);
        parent.appendChild(healBtn);
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
        if (hero.health > 0) {
            switch (action) {
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
            setTimeout(() => game.endGame("gameOver"), 700);
        } else if (enemy.health <= 0){
            hero.xp++;
            document.getElementById("xp-value").value = hero.xp;
            setTimeout(() => game.world.winBattle(enemy), 700);
        }
    }

    
    attack(attacker, opponent) {
        const chance = Number(Math.random().toFixed(2));
        let hit = 0;

        if(chance > 0.85) {
            hit = attacker.attack * 2;
        } else if(chance > 0.60) {
            hit = (Math.floor(attacker.attack * chance));
        } else {
            hit = (Math.floor(attacker.attack * 0.6));
        }

        opponent.health -= hit;
        opponent.healthBar.value = opponent.health;

        opponent.createHealthBar();

        let hitValue = document.createElement("p");
        hitValue.innerHTML = hit;
        hitValue.id = "hit"
       
        opponent.domElement.appendChild(hitValue);

        setTimeout(() => hitValue.remove(), 500)
    }

//change attack! 
    magic(attacker, opponent){
        const chance = Number(Math.random().toFixed(2));
        let hit = 0;

        if(chance > 0.85) {
            hit = attacker.attack * 2;
        } else if(chance > 0.60) {
            hit = (Math.floor(attacker.attack * chance));
        } else {
            hit = (Math.floor(attacker.attack * 0.6));
        }

        opponent.health -= hit;
        opponent.healthBar.value = opponent.health;

        let hitValue = document.createElement("p");
        hitValue.innerHTML = hit;
        hitValue.id = "hit"
       
        opponent.domElement.appendChild(hitValue);

        setTimeout(() => hitValue.remove(), 500)
    }

    heal() {
        if(this.hero.health > 80){
            this.hero.health = 100;
        } else if(this.hero.health <= 80) {
            this.hero.health += 20;
        }
    }
}

class Character {
    constructor (className, scene, height, width, positionX, positionY, health, attack) {
        this.id = this.generateUniqueId();
        this.className = className;
        this.scene = scene;

        this.height = height;
        this.width = width;
        this.positionX = positionX;
        this.positionY = positionY;


        this.health = health;
        this.attack = attack;

        this.domElement = null;
        this.healthBar = null;
    }

    generateUniqueId() {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const charactersLength = characters.length;
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }

        return result;
    }

    createDomElement(parent, withHealthBar) {
        const newElement = document.createElement('div');

        newElement.id = this.id;
        newElement.className = this.className;
        newElement.style.height = this.height + "vh";
        newElement.style.width = this.width + "vw";
        newElement.style.left = this.positionX + "vw";
        newElement.style.bottom = this.positionY + "vh";

        parent.appendChild(newElement);

        this.domElement = newElement;

        if (withHealthBar === true) {
            this.healthBar = this.createHealthBar();
        }

        return newElement;
    }

    createHealthBar() {
        this.domElement.querySelectorAll('.hp').forEach(element => element.remove());

        const healthBar = document.createElement("progress");
        healthBar.className = "hp-value";
        healthBar.value = this.health;
        healthBar.max = 100; 

        const label = document.createElement("label");
        label.className = "hp";
        label.textContent = this.className;

        label.appendChild(healthBar);
        this.domElement.appendChild(label);

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

        this.worldHeight = 8;
        this.worldWidth = 6;

        this.battleHeight = 40;
        this.battleWidth = 30;

        this.xp = 0;
    }

    createDomElement(parent, withHealthBar) {
        const element = super.createDomElement(parent, withHealthBar);

        this.createXpBar();

        return element;
    }

    createXpBar() {
        this.domElement.innerHTML += `<label id="xp">xp
        <progress id="xp-value" value="${this.xp}" max="1"></progress></label>`;
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
    }
}

// class Ally extends Character {}
// class BossEnemy extends Enemy {}





//start game
const game = new Game();
game.welcome();