class EventsManager {
    constructor() {
        this.bind = []; // сопоставление клавиш действиям
        this.action = []; // действия
    }

    setup (canvas) { // настройка сопоставления
        this.bind[87] = 'up'; // w - двигаться вверх
        this.bind[65] = 'left'; // a - двигаться влево
        this.bind[83] = 'down'; // s - вдигаться вниз
        this.bind[68] = 'right'; // d - двигаться вправо
        this.bind[32] = 'attack'; // пробел - удар

        // контроль событий мыши
        // canvas.addEventListener("mousedown", this.onMouseDown);
        // canvas.addEventListener("mouseup", this.onMouseUp);

        // контроль событий клавиатуры
        document.body.addEventListener("keydown", this.onKeyDown);
        document.body.addEventListener("keyup", this.onKeyUp);
    }

    onKeyDown (event) { // нажали на кнопку на клавиатуре, проверили, есть ли
        // сопоставление действию для события с кодом keyDown
        let action = eventsManager.bind[event.keyCode];
        if (action) // проверка на action === true
            eventsManager.action[action] = true; // согласились выполнять действие
    }

    onKeyUp (event) { // нажали на кнопку на клавиатуре, проверили, есть ли
        // сопоставление действию для события с кодом keyDown
        let action = eventsManager.bind[event.keyCode];
        if (action) // проверка на action === true
            eventsManager.action[action] = false; // отменили действие
    }
}