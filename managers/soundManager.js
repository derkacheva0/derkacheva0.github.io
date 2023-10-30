class SoundManager {
    constructor() {
        this.clips = {}; // звуковые эффекты
        this.context = null; // аудиоконтекст
        this.gainNode = null; // главный узел (управление громкостью)
        this.loaded = false; // все звуки загружены
    }

    init () { // инициализация менеджера звуков
        this.context = new AudioContext();
        this.gainNode = this.context.createGain ?
            this.context.createGain() : this.context.createGainNode();
        this.gainNode.connect(this.context.destination); // подключение к динамикам
    };

    load (path, callback) { // загрузка одного аудиофайла
        if (this.clips[path]) { // проверяем, что звуки уже заружены
            callback(this.clips[path]); // вызываем загруженный
            return; // выход
        }
        var clip = {path: path, buffer: null, loaded: false}; // клип, буфер, загружен
        clip.play = function (volume, loop) {
            soundManager.play(this.path, {looping: loop?loop:false,
                volume: volume?volume:1});
        };
        this.clips[path] = clip; // помещаем в "массив" (литерал)
        var request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            soundManager.context.decodeAudioData(request.response,
                function (buffer) {
                    clip.buffer = buffer;
                    clip.loaded = true;
                    callback(clip);
                });
        };
        request.send();
    };
    loadArray (array) { // загрузить массив звуков
        for (var i = 0; i < array.length; i++) {
            soundManager.load(array[i], function () {
                if (array.length === Object.keys(soundManager.clips).length) { // если подготовили
                    // для загрузки все звуки
                    for (let sd in soundManager.clips)
                        if (!soundManager.clips[sd].loaded) return;
                    soundManager.loaded = true; // все звки загружены
                }
            }); // конец soundManager.load
        } // конец for
    };
    play (path, settings) { // проигрывание файла
        if (!soundManager.loaded) { // если еще все не загрузили
            setTimeout(function () { soundManager.play(path, settings); },
                1000);
            return;
        }

        var looping = false; // значения по умолчанию
        var volume = 1;
        if (settings) { // если переопределены, то перенастраиваем значения
            if (settings.looping)
                looping = settings.looping;
            if (settings.volume)
                volume = settings.volume;
        }
        var sd = this.clips[path]; // получаем звуковой эффект
        if (sd === null)
            return false;

        // создаем новый экземпляр проигрывателя BufferSource BufferSource
        var sound = soundManager.context.createBufferSource();
        sound.buffer = sd.buffer;
        sound.connect(soundManager.gainNode);
        sound.loop = looping;
        soundManager.gainNode.gain.value = volume;
        sound.start(0);
        return true;
    };

    playWorldSound(path, x, y) { // какой звук и где хотим проиграть,
        // настройка звука в зависимости расстояния от игрока
        if (gameManager.player === null)
            return;
        // max область слышимости - 80% от размера холста
        let viewSize = Math.max(mapManager.view.w, mapManager.view.h) * 0.8;
        let dx = Math.abs(gameManager.player.pos_x - x);
        let dy = Math.abs(gameManager.player.pos_y - y);
        let distance = Math.sqrt(dx * dx + dy * dy);
        let norm = distance / viewSize; // определяем дистанцию до источника до источника звука
        if (norm > 1)
            norm = 1;
        let volume = 1.0 - norm;
        if (!volume) // если не слышно, то не играем
            return;
        soundManager.play(path, {looping: false, volume: volume});
    }

    toggleMute() { // приостановка звуков
        if (this.gainNode.gain.value > 0)
            this.gainNode.gain.value = 0;
        else
            this.gainNode.gain.value = 1;
    }

    stopAll() { // отключение всех звуков
        this.gainNode.disconnect();
        this.gainNode = this.context.gainNode(0);
        this.gainNode.connect(this.context.destination);
    }
}