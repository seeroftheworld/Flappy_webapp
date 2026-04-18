const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const bgMusic = document.getElementById("bgMusic");
let musicStarted = false;

let width, height;


function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    bird.size = height * 0.05;
    gap = height * 0.25;
    pipeWidth = width * 0.08;
}
window.addEventListener("resize", resize);


const bg = new Image();
let bgIndex = Math.floor(Math.random() * 8) + 1;
bg.src = `assets/bg/Background${bgIndex}.png`;


let birdType = localStorage.getItem("bird") || "bird1";
let birdFrames = [];
let frameIndex = 0;

for (let i = 1; i <= 4; i++) {
    let img = new Image();
    img.src = `assets/birds/${birdType}_${i}.png`;
    birdFrames.push(img);
}


let bird = {
    x: 0,
    y: 0,
    size: 0,
    velocity: 0
};


let gravity = 0.5;
let jump = -10;


let pipes = [];
let gap = 0;
let pipeWidth = 0;

function spawnPipe() {
    let topHeight = Math.random() * (height * 0.5);

    pipes.push({
        x: width,
        top: topHeight,
        bottom: height - topHeight - gap,
        passed: false
    });
}
setInterval(spawnPipe, 1500);


function flap() {
    if (!gameOver) {
        bird.velocity = jump;


        if (!musicStarted) {
            bgMusic.play();
            bgMusic.volume = 0.4;
            musicStarted = true;
        }
    }
}

window.addEventListener("keydown", flap);
window.addEventListener("click", flap);

window.addEventListener("touchstart", (e) => {
    e.preventDefault();
    flap();
}, { passive: false });

let score = 0;
let gameOver = false;


function drawPipe(x, y, w, h, isTop) {
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = "#388E3C";
    let capHeight = Math.min(30, h);

    if (isTop) {
        ctx.fillRect(x - 5, h - capHeight, w + 10, capHeight);
    } else {
        ctx.fillRect(x - 5, y, w + 10, capHeight);
    }
}


function init() {
    resize();

    bird.x = width * 0.2;
    bird.y = height / 2;
    bird.velocity = 0;
}
init();


function loop() {
    if (gameOver) return;

    ctx.drawImage(bg, 0, 0, width, height);

  
    bird.velocity += gravity;
    bird.y += bird.velocity;

    frameIndex += 0.2;
    if (frameIndex >= 4) frameIndex = 0;

    let currentFrame = birdFrames[Math.floor(frameIndex)];


    let angle = Math.min(Math.max(bird.velocity * 3, -30), 90);

    ctx.save();
    ctx.translate(bird.x + bird.size / 2, bird.y + bird.size / 2);
    ctx.rotate(angle * Math.PI / 180);
    ctx.drawImage(
        currentFrame,
        -bird.size / 2,
        -bird.size / 2,
        bird.size,
        bird.size
    );
    ctx.restore();


    pipes.forEach((pipe) => {
        pipe.x -= width * 0.005;

        drawPipe(pipe.x, 0, pipeWidth, pipe.top, true);
        drawPipe(pipe.x, height - pipe.bottom, pipeWidth, pipe.bottom, false);

        
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.size > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.size > height - pipe.bottom)
        ) {
            endGame();
        }

        
        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            score++;
            pipe.passed = true;
        }
    });


    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

    // Ceiling / ground
    if (bird.y < 0 || bird.y + bird.size > height) {
        endGame();
    }

    ctx.fillStyle = "white";
    ctx.font = `${Math.floor(height * 0.05)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(score, width / 2, height * 0.1);

    requestAnimationFrame(loop);
}

loop();


function endGame() {
    gameOver = true;

    bgMusic.pause();

    document.getElementById("gameOverScreen").classList.remove("hidden");
    document.getElementById("scoreText").innerText = "Score: " + score;

    let best = localStorage.getItem("best") || 0;
    if (score > best) {
        localStorage.setItem("best", score);
    }
}

function restart() {
    window.location.href = "choices.html";
}

function home() {
    window.location.href = "index.html";
}

function leaderboard() {
    alert("Best Score: " + (localStorage.getItem("best") || 0));
}