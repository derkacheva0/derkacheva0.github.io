document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("mazeCanvas");
    const ctx = canvas.getContext("2d");

    let mazeLayout;
    const cellSize = 20;


    const player = {
        x: 4,
        y: 4
    };
    const police = {
        x: 0,
        y: 0
    };

    let isGameOver = false;
    loadMap();

    function loadMap() {
        fetch("level3.json")
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
            1: "mebel.jpg",
            9: "door.png",
            0: "floor.jpg"
        };

        return cellValues[value];
    }

    function drawPlayer() {
        const img = new Image();
        img.src = "human.png"
        ctx.drawImage(img, player.x * cellSize, player.y * cellSize, cellSize, cellSize);
    }
    function drawPolice() {
        const img = new Image();
        img.src = "police.png"
        ctx.drawImage(img, police.x * cellSize, police.y * cellSize, cellSize, cellSize);
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
            drawPolice();
            movePolice();
        }
    }
    function movePolice() {
        if (player.x < police.x) {
            police.x--;
        } else if (player.x > police.x) {
            police.x++;
        } else if (player.y < police.y) {
            police.y--;
        } else if (player.y > police.y) {
            police.y++;
        }

        if (player.x === police.x && player.y === police.y) {
            isGameOver = true;
            const lvl3_cry = true;
            localStorage.setItem('lvl3_cry', lvl3_cry);
            window.location.href = "results.html";
        }
    }

    function checkFinish() {
        if (mazeLayout && mazeLayout[player.y] && mazeLayout[player.y][player.x] && (mazeLayout[player.y][player.x] === 7 || mazeLayout[player.y][player.x] === 9)) {
            isGameOver = true;
            const lvl3_cry = false;
            localStorage.setItem('lvl3_cry', lvl3_cry);
            window.location.href = "results.html";
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
