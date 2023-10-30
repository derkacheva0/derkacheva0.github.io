class MapManager {
    constructor() {
        this.mapData = null; // переменная для хранения карты (объект JSONFiles)
        this.tLayers = []; // переменная для хранения ссылки на блоки (тайлы) карты
        this.xCount = 0; // количество блоков (тайлов) по горизонтали
        this.yCount = 0; // количество блоков (тайлов) по вертикали
        this.tSize = {x: 0, y: 0}; // размер блока (тайла)
        this.mapSize = {x: 0, y: 0}; // размер карты в пикселах (вычисляется)
        this.tilesets = []; //массив описаний блоков (тайлов) карты

        this.imgLoadCount = 0; // количество загруженных изображений
        this.imgLoaded = false; // все изображения загружены (сначала - false)
        this.jsonLoaded = false; // json описание загружено (сначала - false)

        // видимая область с координатами левого верхнего угла, а также высота и ширина этой области
        this.view = {x: 0, y: 0, w: 240, h: 240};
    }

    parseMap(tilesJSON) {
        this.mapData = JSON.parse(tilesJSON); // распарсить JSONFiles

        this.xCount = this.mapData.width; // сохранение ширины
        this.yCount = this.mapData.height // сохранение высоты
        this.tSize.x = this.mapData.tilewidth; // сохранение размера блока
        this.tSize.y = this.mapData.tileheight;
        this.mapSize.x = this.xCount * this.tSize.x; // вычисление размера карты
        this.mapSize.y = this.yCount * this.tSize.y;

        for (let i = 0; i < this.mapData.tilesets.length; i++) {
            let img = new Image(); // создаем переменную для хранения изображений

            img.onload = function () { // при загрузке изображения
                mapManager.imgLoadCount++; // увеличиваем счетчик
                if (mapManager.imgLoadCount === mapManager.mapData.tilesets.length) {
                    mapManager.imgLoaded = true; //загружены все изображения
                }
            };

            img.src = this.mapData.tilesets[i].image; // задание пути к изображению
            let t = this.mapData.tilesets[i]; // вытягиваем один tileset из карты во временную переменную

            let ts = { // создаем свой объект tileset
                firstgid: t.firstgid, // firstgid - с него начинается нумерация в data
                image: img, // объект рисунок
                name: t.name, // имя элемента рисунка
                xCount: Math.floor(t.imagewidth / mapManager.tSize.x), // горизонталь
                yCount: Math.floor(t.imageheight / mapManager.tSize.y), // вертикаль
            };
            this.tilesets.push(ts); // сохраняем tileset в массив
        }
        this.jsonLoaded = true; // true, когда разобрали весь JSONFiles
    }

    loadMap(path) { // path - путь к файлу, который необходимо загрузить (м.б. относительный и абсолютный)
        var request = new XMLHttpRequest(); // создание ajax-запроса
        request.onreadystatechange = function () { // функция, вызывается автоматически после отправки запроса
            if (request.readyState === 4 && request.status === 200) {
                // получен корректный ответ, результат можно
                // обрабатывать map.Manager.parseMap(request.responseText)
                mapManager.parseMap(request.responseText); // responseText хранит текст, получаенный с сервера
            }
        };
        request.open("GET", path, true);
        // true - отправить асинхронный запрос на path с использованием функции GET
        request.send(); // отправить запрос
    }

    draw(ctx) { // нарисовать карту в контексте
        // если карта не загружена, то повторить прорисовку через 100 мск
        if (!mapManager.imgLoaded || !mapManager.jsonLoaded) {
            setTimeout(function () { // функция, которая будет вызвана после заданной задержки
                mapManager.draw(ctx)
            }, 100);
        } else {
            // DONE: заполнение слоев карты
            if (this.tLayers.length === 0) // проверить, что tLayers настроен,
                // тк при первом обращении к draw, tLayers.length=0
                for (var id = 0; id < this.mapData.layers.length; id++) {
                    // проходим по  всем layers карты
                    var layer = this.mapData.layers[id];
                    if (layer.type === "tilelayer") { // если не tilelayer - пропускаем
                        this.tLayers.push(layer);
                    }
                }

            // DONE: проход по всем слоям массива tLayers
            for (var j = 0; j < this.tLayers.length; j++) {
                var tLayer = this.tLayers[j];
                for (var i = 0; i < tLayer.data.length; i++) { // пройти по всей карте
                    if (tLayer.data[i] !== 0) { // если нет данных - пропускаем
                        var tile = this.getTile(tLayer.data[i]); // получение блока по индексу
                        // i проходит линейно по массиву, xCount - длина по x
                        var pX = (i % this.xCount) * this.tSize.x; // вычисляем x в пикселах
                        var pY = Math.floor(i / this.xCount) * this.tSize.y; // вычисляем y в пикселах

                        // не рисуем за пределами видимой зоны
                        if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y))
                            continue;
                        // сдвигаем видимую зону
                        pX -= this.view.x;
                        pY -= this.view.y;

                        // рисуем в контекст
                        ctx.drawImage(tile.img, tile.px, tile.py, this.tSize.x, this.tSize.y,
                            pX, pY, this.tSize.x, this.tSize.y);
                    }
                }
            }

        }
    }

    isVisible(x, y, width, height) { // не рисуем за пределами видимой зоны
        if (x + width < this.view.x || y + height < this.view.y ||
            x > this.view.x + this.view.w || y > this.view.y + this.view.h)
            return false;
        return true;
    }

    getTile(tileIndex) { // индекс блока
        var tile = { // один блок
            img: null,
            px: 0, py: 0 // координаты блока в tileset
        };
        var tileset = this.getTileset(tileIndex);
        tile.img = tileset.image; // изображение искомого tileset
        var id = tileIndex - tileset.firstgid; // индекс блока в tileset
        // блок прямоугольный, остаток от деления на xCount дает x в tileset
        var x = id % tileset.xCount;
        // округление от деления на xCount дает y в tileset
        var y = Math.floor(id / tileset.xCount);
        // с учетом размера можно посчитать координаты блока в пикселах
        tile.px = x * mapManager.tSize.x;
        tile.py = y * mapManager.tSize.y;
        return tile; // возвращаем блок для отображения
    }

    getTileset(tileIndex) {
        for (var i = mapManager.tilesets.length - 1; i >= 0; i--)
            // в каждом tilesets[i].firstgid записано число, с которого начинается нумерация блоков
            if (mapManager.tilesets[i].firstgid <= tileIndex) {
                // если индекс первого блока меньше или равен искомому, значит, этот tileset и нужен
                return mapManager.tilesets[i];
            }
        return null; // возвращается найденный tileset
    }

    parseEntities() { // разбор слоя типа objectgroup
        if (!mapManager.imgLoaded || !mapManager.jsonLoaded) {
            // если карта не загружена, то повторить попытку через 100 мск
            setTimeout(function () {
                mapManager.parseEntities();
            }, 100);
        } else {
            for (var j = 0; j < this.mapData.layers.length; j++) {
                // просмотр всех слоев
                if (this.mapData.layers[j].type === 'objectgroup') {
                    var entities = this.mapData.layers[j];
                    // слой с объектами следует "разобрать"
                    for (var i = 0; i < entities.objects.length; i++) {
                        // объект сущности
                        var e = entities.objects[i];
                        // блок try-catch предназначена для выполнения действий, которые могут привести
                        // к ошибочным ситуациям. В случае ошибки управление передается в блок catch
                        try {
                            // e.class - строковое название объекта, который необходимо разместить на карте.
                            // Поле class вводится дизайнером игры
                            // функция Object.create создает новый объект на основании gameManager.factory[e.class].
                            // при этом копируются все поля и функции из исходного объекта. Ошибка может быть,
                            // если разработчик не описал объект с типом e.class
                            // gameManager.factory[e.class] возвращает объект JavaScript

                            if (e.class === 'player' && gameManager.player) {
                                gameManager.player.pos_x = e.x + e.width / 2;
                                gameManager.player.pos_y = e.y - e.height / 2;
                            } else {
                                // в соответствии с типом создаем экземпляр объекта
                                let obj = gameManager.factory[e.class].create(e.x + e.width / 2, e.y - e.height / 2, e.width, e.height, e.name);

                                // поле name вводится дизайнером игры в визуальном интерфейсе
                                if (obj.name === "player")
                                    // инициализируем параметры игрока
                                    gameManager.initPlayer(obj);
                                else
                                    // помещаем в массив объектов
                                    gameManager.entities.push(obj);
                            }
                        } catch (ex) {
                            // сообщение об ошибке
                            console.log("Error while creating: [" + e.gid + "]" + e.type + ", " + ex);
                        }
                    } // конец for для объектов слоя objectgroup
                } // конец if проверки типа слоя на равенство objectgroup
            } // конец for для просмотра всех слоев
        }

    }

    getTilesetIdx(x, y) {
        // получить блок по координатам на карте
        var wX = x;
        var wY = y;
        var idx = Math.floor(wY / this.tSize.y) * this.xCount + Math.floor(wX / this.tSize.x);
        // вернем массив из блоков на всех слоях (тех, что нам нужны),
        // причем индекс блока в массиве соотвествует индексу слоя в массиве слоев
        var ids = new Array();
        for (var i = 0; i < this.tLayers.length; i++)
            ids.push(this.tLayers[i].data[idx]);
        return ids;
    }

    centerAt(x, y) {
        if (x < this.view.w / 2) // центрирование по горизонтали
            this.view.x = 0;
        else if (x > this.mapSize.x - this.view.w / 2)
            this.view.x = this.mapSize.x - this.view.w;
        else
            this.view.x = x - (this.view.w / 2);
        if (y < this.view.h / 2) // центрирование по вертикали
            this.view.y = 0;
        else if (y > this.mapSize.y - this.view.h / 2)
            this.view.y = this.mapSize.y - this.view.h;
        else
            this.view.y = y - (this.view.h / 2);
    }
}