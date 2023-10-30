class PhysicManager {
    constructor() {
        this.walls = [451, 452, 453, 441, 442, 553,443, 444, 557,
            466, 467, 468, 457, 459, 458, 468, 561,445, 446,447, 448, 449, 450];
    }

    // функция изменяет состояние объекта и возвращает информацию о внесенных или
    // не внесенных изменениях (коды: stop, break, move)
    update (obj) { // обновление состояния объекта
        if(obj.move_x === 0 && obj.move_y === 0)
            return "stop"; // скорости движения нулевые

        let newX = obj.pos_x + Math.floor(obj.move_x * (obj.speed * 8));
        let newY = obj.pos_y + Math.floor(obj.move_y * (obj.speed * 8));

        // анализ пространства на карте по направлению движения,
        // функция getTilesetIdx возвращает массив индексов блоков карты по слоям карты,
        // который находится на пути объекта


        let ts = mapManager.getTilesetIdx(newX + obj.size_x/2, newY + obj.size_y/2);
        let e = this.entityAtXY(obj, newX, newY); // объект на пути, с кем столкнется объект,

        //alert(e);
        if (e === null) {
            if(!(this.walls.includes(ts[1]))) { // перемещаем объект на свободное место
                obj.pos_y = newY;
                obj.pos_x = newX;
            }
        } else if (e && e.name === 'player'){

            if (obj.in_attack && e && obj.onTouchPlayer) {
                obj.onTouchPlayer(e);
            }
        }
    }

    updatePlayer(obj) {
        if(obj.move_x === 0 && obj.move_y === 0)
            return "stop"; // скорости движения нулевые

        let newX = obj.pos_x + Math.floor(obj.move_x * (obj.speed * 8));
        let newY = obj.pos_y + Math.floor(obj.move_y * (obj.speed * 8));

        // анализ пространства на карте по направлению движения,
        // функция getTilesetIdx возвращает массив индексов блоков карты по слоям карты,
        // который находится на пути объекта
        let e;
        e = this.entityAtXY(obj, newX, newY);
        let ts = mapManager.getTilesetIdx(newX + obj.size_x/2, newY + obj.size_y/2);


        if ( (e) && obj.in_attack && obj.weapon.animation_numb === 2  && obj.onTouchEnemy) {
            obj.onTouchEnemy(e);
        }
        else if ( (e) && !obj.in_attack && e.onTouchPlayer) {
            e.onTouchPlayer(obj);
        }
        else if ( (e) && ( e.name.match(/coin[\d*]/)
            || e.name.match(/[\w*]_heal[\d*]/) || e.name.match(/treasure[\d*]/) ||
            e.name.match(/next_level/) || e.name.match(/door/)) ) {
            obj.onTouchEntity(e);
        }
//
        else if(!(this.walls.includes(ts[1]))
            && (e === null || e.name.match(/[\w*]_heal[\d*]/))) { // перемещаем объект на свободное место
            obj.pos_y = newY;
            obj.pos_x = newX;
        } else
            return "break"; // дальше двигаться нельзя
        return "move"; // двигаемся
    }

    entityAtXY (obj, x, y) { // поиск объекта по координатам
        for (let i = 0; i < gameManager.entities.length; i++) {
            let e = gameManager.entities[i]; // проходим по всем объектам карты
            if (e.name !== obj.name) { // имя не совпадает (имена уникальны)
                if(e.pos_x - e.size_x / 2 <= x + obj.size_x / 2 && x - obj.size_x/2 <= e.pos_x + e.size_x / 2 &&
                    e.pos_y - e.size_y / 2 <= y + obj.size_y / 2 && y - obj.size_y / 2 <= e.pos_y + e.size_y / 2){
                    return e;
                }
            }
        } // конец цикла for
        return null; // объект не найден
    }

    playerAtXY (obj, x, y) {
        if(gameManager.player.pos_x - gameManager.player.size_x / 2 <= x + obj.size_x / 2 &&
            x - obj.size_x/2 <= gameManager.player.pos_x + gameManager.player.size_x / 2 &&
            gameManager.player.pos_y - gameManager.player.size_y / 2 <= y + obj.size_y / 2 &&
            y - obj.size_y / 2 <= gameManager.player.pos_y + gameManager.player.size_y / 2){
            return gameManager.player;
        }
        return null;
    }
}