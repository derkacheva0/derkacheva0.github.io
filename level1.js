document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("mazeCanvas");
    const ctx = canvas.getContext("2d");

    let mazeLayout;
    const cellSize = 20;

    let lvl1_cry = false;

    const player = {
        x: 0,
        y: 0
    };

    let isGameOver = false;
    loadMap();

    function loadMap() {
        fetch("level1.json")
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
            1: "glass.jpg",
            7: "tear.png",
            9: "eye.png"
        };

        return cellValues[value];
    }

    function drawPlayer() {
        ctx.fillStyle = "blue";
        ctx.fillRect(player.x * cellSize, player.y * cellSize, cellSize, cellSize);
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
        }
    }

    function checkFinish() {
        if (mazeLayout && mazeLayout[player.y] && mazeLayout[player.y][player.x] && (mazeLayout[player.y][player.x] === 7 || mazeLayout[player.y][player.x] === 9)) {
            isGameOver = true;
            window.location.href = "middle.html";
        }
    }

    document.addEventListener("keydown", function(event) {
        if (isGameOver) return;

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
            (mazeLayout[newRow][newCol] === 0 || mazeLayout[newRow][newCol] === 7 || mazeLayout[newRow][newCol] === 9)
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