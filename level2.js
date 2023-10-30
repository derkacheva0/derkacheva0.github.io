//export { lvl1_cry } from "./level1.js";
document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("mazeCanvas");
    const ctx = canvas.getContext("2d");
    //console.log(lvl1_cry);
    let mazeLayout;
    const cellSize = 20;

    //let playerHealth = 100;
    const player = {
        x: 0,
        y: 0,
        xp: 20
    };
    const enemy1 = {
        x: 13,
        y: 5
    };
    const enemy2 = {
        x: 4,
        y: 14
    };
    function removeEnemy(enemy) {
        const row = enemy.y,
            col = enemy.x;
        mazeLayout[row][col] = 0;
        draw();
    }

    let isGameOver = false;
    loadMap();

    function loadMap() {
        fetch("level2.json")
            .then(response => response.json())
            .then(data => {
                mazeLayout = data.mazeLayout;
                console.log(mazeLayout);
                draw();
            });
    }

    function drawMaze() {
        for (let row = 0; row < mazeLayout.length; row++) {
            for (let col = 0; col < mazeLayout[row].length; col++) {
                const cell = mazeLayout[row][col];
                const img = new Image();
                img.src = getImageForCellValue(cell);
                ctx.drawImage(img, col * cellSize, row * cellSize, cellSize, cellSize);
            }
        }
    }
    function init() {
        loadMap();
        draw();
    }
    function getImageForCellValue(value) {
        const cellValues = {
            0: "ground.jpg",
            1: "banch.jpg",
            7: "tear.png",
        };

        return cellValues[value];
    }

    function drawPlayer() {
        const img = new Image();
        img.src = "human.png"
        ctx.drawImage(img, player.x * cellSize, player.y * cellSize, cellSize, cellSize);const audio = new Audio("puk.mp3");
        audio.play();
        if (
            ((player.x === enemy1.x && Math.abs(player.y - enemy1.y) === 1) ||
            (player.y === enemy1.y && Math.abs(player.x - enemy1.x) === 1)) &&
            (player.xp >= 0)
        ) {
            player.xp -= 10; // урон, который получает игрок
            console.log(`Игрок получил урон. Здоровье: ${player.xp}`);
            const audio = new Audio("clap.mp3");
            audio.play();
        }
        if (
            ((player.x === enemy2.x && Math.abs(player.y - enemy2.y) === 1) ||
                 (player.y === enemy2.y && Math.abs(player.x - enemy2.x) === 1)) &&
            (player.xp >= 0)
        ) {
            player.xp -= 10; // урон, который получает игрок
            console.log(`Игрок получил урон. Здоровье: ${player.xp}`);
            const audio = new Audio("clap.mp3");
            audio.play();
        }
        if(player.xp <= 0){
            isGameOver = true;
            const lvl2_cry = false;
            localStorage.setItem('lvl2_cry', lvl2_cry);
            window.location.href = "school.html";
        }
    }
    function drawEnemy1() {
        const img = new Image();
        img.src = "huligan.png"
        ctx.drawImage(img, enemy1.x * cellSize, enemy1.y * cellSize, cellSize, cellSize);
    }
    function drawEnemy2() {
        const img = new Image();
        img.src = "huligan.png"
        ctx.drawImage(img, enemy2.x * cellSize, enemy2.y * cellSize, cellSize, cellSize);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if(!mazeLayout){
            setTimeout(function () { // функция, которая будет вызвана после заданной задержки
                draw();
            }, 100);
        }
        if (mazeLayout) {
            drawMaze();
            drawPlayer();
            drawEnemy1();
            drawEnemy2();
        }
    }

    function checkFinish() {
        if (mazeLayout && mazeLayout[player.y] && mazeLayout[player.y][player.x] && ((mazeLayout[player.y][player.x] === 7) || player.xp === 0) || isGameOver === true){
            const lvl2_cry = true;
            localStorage.setItem('lvl2_cry', lvl2_cry);
            console.log(lvl2_cry)
            isGameOver = true;
            window.location.href = "school.html";
        }
    }

    document.addEventListener("keydown", function(event) {
        if (isGameOver) return;
        if (event.code === "Space") {
            if (
                (player.x === enemy1.x && Math.abs(player.y - enemy1.y) === 1) ||
                (player.y === enemy1.y && Math.abs(player.x - enemy1.x) === 1)
            ) {
                removeEnemy(enemy1);
            }
        }
        const directionMap = new Map([
            ["ArrowUp", { y: -1, x: 0 }],
            ["ArrowDown", { y: 1, x: 0 }],
            ["ArrowLeft", { y: 0, x: -1 }],
            ["ArrowRight", { y: 0, x: 1 }]
        ]);

        const direction = directionMap.get(event.key);
        if (!direction) return;

        const newRow = player.y + direction.y;
        const newCol = player.x + direction.x;

        if (
            mazeLayout &&
            newRow >= 0 &&
            newRow < mazeLayout.length &&
            newCol >= 0 &&
            newCol < mazeLayout[0].length &&
            (mazeLayout[newRow][newCol] === 0 || mazeLayout[newRow][newCol] === 7)
        ) {
            player.y = newRow;
            player.x = newCol;
        }

        draw();
        checkFinish();
    });
    if(!mazeLayout){
        setTimeout(function () { // функция, которая будет вызвана после заданной задержки
            init();
        }, 100);
    }
});
