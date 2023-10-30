class GameManager {
    constructor() {

        this.factory = {}; // фабрика объектов на карте
        this.entities = []; // объекты на карте
        this.player = null; // указатель на объект игрока
        this.laterKill = []; // отложенное уничтожение объектов

        this.next_level = false;

        this.sounds = {levelSound: "../../sounds/level_sound.wav",
            sounds: ["../../sounds/level_sound.wav", "../../sounds/player_step.wav",
                "../../sounds/enemies_step.wav", "../../sounds/kus.mp3",
                "../../sounds/base_weapon.mp3", "../../sounds/katana.mp3",
                "../../sounds/get_coin.wav", "../../sounds/get_treasure.wav",
                "../../sounds/heal.wav", "../../sounds/lose.wav",
                "../../sounds/win.wav"]};
    }

    initPlayer (obj) { // инициализация игрока
        this.player = obj;
    }

    update () { // обновление информации обо всех объектах
        if(this.player === null) {
            return;
        }
        if (!this.player.alive) {
            this.endGame();
            return;
        }
        if (this.player.win) {
            this.winGame();
            return;
        }
        // по умолчанию игрок никуда не двигается
        this.player.move_x = 0;
        this.player.move_y = 0;
        // поймали событие - обрабатываем
        if (eventsManager.action["up"]) this.player.move_y = -1;
        if (eventsManager.action["down"]) this.player.move_y = 1;
        if (eventsManager.action["left"]) this.player.move_x = -1;
        if (eventsManager.action["right"]) this.player.move_x = 1;
        // стреляем
        if (eventsManager.action["attack"]) this.player.attack();

        // обновление информации по всем объектам на карте
        this.entities.forEach(function(e) {
            try { // защита от ошибок при выполнении update
                e.update();
            } catch(ex) {}
        });
        this.player.update();

        // удаление объектов, попавших в laterKill
        for(let i = 0; i < this.laterKill.length; i++) {
            let idx = this.entities.indexOf(this.laterKill[i]);
            if(idx > -1)
                this.entities.splice(idx, 1); // удаление из массива 1 объекта
        }

        if(this.laterKill.length > 0) // очистка массива laterKill
            this.laterKill.length = 0;


        ctx.fillStyle = "#758520";
        ctx.fillRect(0,0, 240, 240);
        mapManager.centerAt(this.player.pos_x, this.player.pos_y);
        mapManager.draw(ctx);
        this.draw(ctx);
    }
    draw (ctx) {
        for (let e = 0; e < this.entities.length; e++) {
            this.entities[e].draw(ctx);
        }
        this.player.draw(ctx);

    }
    loadAll () {
        mapManager.loadMap("../../views/map3.json"); // загрузка карты
        spriteManager.loadAtlas("../../views/sprites.json", "../../views/spritesheet.png"); // загрузка атласа

        gameManager.factory['player'] = new PlayerFabric(); // инициализация фабрики

        gameManager.factory['middle_undead'] = new MiddleUndeadFabric();
        gameManager.factory['middle_orc'] = new MiddleOrcFabric();
        gameManager.factory['middle_demon'] = new MiddleDemonFabric();

        gameManager.factory['coin'] = new CoinFabric();
        gameManager.factory['treasure'] = new TreasureFabric();
        gameManager.factory['big_heal'] = new BigHealFabric();
        gameManager.factory['door'] = new DoorFabric();


        gameManager.factory['next_level'] = new NextLevelFabric();

        mapManager.parseEntities(); // разбор сущностей карты
        mapManager.draw(ctx); // отобразить карту
        eventsManager.setup(canvas); // настройка событий
        soundManager.init();

        soundManager.loadArray(this.sounds.sounds);
        soundManager.play(this.sounds.levelSound, {looping: true, volume: 1});

    }

    loadForSecondLevel() {
        this.entities.length = 0;
        this.laterKill.length = 0;
        //mapManager = new MapManager();
        mapManager.loadMap("../../views/map2.json"); // загрузка карты
        physicManager.walls = [716,658, 668, 262, 356, 647,
            208,666,667, 654, 661, 644,  259,  660, 308,  2692,
            662, 664, 665,656,  682, 683, 674, 257, 640, 641, 649, 650, 655,
            639, 642, 643,  648, 651, 652, 657];
        mapManager.parseEntities(); // разбор сущностей карты
        mapManager.draw(ctx); // отобразить карту
        eventsManager.setup(canvas); // настройка событий
    }

    play () {
        gameManager.loadAll();
        setInterval(updateWorld, 100);
    }

    endGame() {
        soundManager.play("../../sounds/lose.wav", {looping: false, volume: 0.9});
        this.entities.length = 0;
        this.updateLeaderboard();
        this.player = null;
        spriteManager.endGame(ctx);
    }
    winGame() {
        soundManager.play("../../sounds/win.wav", {looping: false, volume: 0.9});
        spriteManager.win(ctx);
        this.entities.length = 0;
        this.updateLeaderboard();
        this.player = null;

    }

    updateLeaderboard(){
        //проверка рекордов
        localStorage.setItem('game.score', this.player.coins)
        let tmp = localStorage['game.leaderBoard'];
        if(!tmp){
            let leaderBoard = new Array(1);
            leaderBoard[0] = new Array(2);
            leaderBoard[0][0] = localStorage['username.game'];
            leaderBoard[0][1] = this.player.coins;
            localStorage.setItem('game.leaderBoard', JSON.stringify(leaderBoard));
        } else{
            let arr = JSON.parse(localStorage.getItem('game.leaderBoard'));
            let userWas = false;
            for(let i=0; i<arr.length; i++){
                if(arr[i][0] === localStorage['username.game']){
                    if(this.player.coins > arr[i][1])
                        arr[i][1] = this.player.coins;
                    userWas = true;
                }
            }
            if(!userWas)
                arr.push([localStorage['username.game'], this.player.coins]);
            arr.sort((function(index){
                return function(a, b){
                    return (a[index] === b[index] ? 0 : (a[index] < b[index] ? 1 : -1));
                };
            })(1));
            localStorage.setItem('game.leaderBoard', JSON.stringify(arr));
        }
    }
}

// при нажатии ENTER переводит на начальную страницу
document.addEventListener('keydown', event => {
    if (event.keyCode === 13){
        if (!gameManager.player) {
            window.location.href = 'Start.html';
        }
    }
});
