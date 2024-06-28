const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let isMusicPlaying = false; // Variable para verificar si la música está reproduciéndose

let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `Puntuacion maxima: ${highScore}`;

// Función para cargar un archivo de audio mediante promesa
const loadSound = (url) => {
    return new Promise((resolve, reject) => {
        const audio = new Audio(url);
        audio.onloadeddata = () => resolve(audio);
        audio.onerror = reject;
    });
};

// Variables para los sonidos
let backgroundMusic, comerSonido, gameOverSound;

// Cargar los sonidos
Promise.all([
    loadSound('sfx/musicbackground.mp3'),
    loadSound('eatf.mp3'),
    loadSound('sfx/gameoversound.mp3') // Agregar el sonido de game over aquí
]).then(([background, comer, gameover]) => {
    backgroundMusic = background;
    backgroundMusic.loop = true;
    comerSonido = comer;
    gameOverSound = gameover; // Asignar el sonido de game over
}).catch(error => {
    console.error('Error al cargar los sonidos:', error);
});

const updateFoodPosition = () => {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
};

const handleGameOver = () => {
    clearInterval(setIntervalId);
    backgroundMusic.pause(); // Pausar la música de fondo
    gameOverSound.play(); // Reproducir el sonido de game over
    alert("Game Over! Pulsa ok para volver a jugar...");
    location.reload();
};

const changeDirection = e => {
    if(e.key === "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    } else if(e.key === "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    } else if(e.key === "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    } else if(e.key === "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }

    // Iniciar la música cuando la serpiente empiece a moverse
    if (!isMusicPlaying && (velocityX !== 0 || velocityY !== 0)) {
        backgroundMusic.play();
        isMusicPlaying = true;
    }
};

let startX, startY, endX, endY;

const handleTouchStart = e => {
    e.preventDefault();  // Prevenir la acción predeterminada para detener el desplazamiento
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
};

const handleTouchMove = e => {
    e.preventDefault();  // Prevenir la acción predeterminada para detener el desplazamiento
    const touch = e.touches[0];
    endX = touch.clientX;
    endY = touch.clientY;
};

const handleTouchEnd = e => {
    e.preventDefault();  // Prevenir la acción predeterminada para detener el desplazamiento
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Movimiento horizontal
        if (deltaX > 0 && velocityX != -1) {
            velocityX = 1;
            velocityY = 0;
        } else if (deltaX < 0 && velocityX != 1) {
            velocityX = -1;
            velocityY = 0;
        }
    } else {
        // Movimiento vertical
        if (deltaY > 0 && velocityY != -1) {
            velocityX = 0;
            velocityY = 1;
        } else if (deltaY < 0 && velocityY != 1) {
            velocityX = 0;
            velocityY = -1;
        }
    }

    // Iniciar la música cuando la serpiente empiece a moverse
    if (!isMusicPlaying && (velocityX !== 0 || velocityY !== 0)) {
        backgroundMusic.play();
        isMusicPlaying = true;
    }
};

const initGame = () => {
    if(gameOver) return handleGameOver();
    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;
    if(snakeX === foodX && snakeY === foodY) {
        // Reproducir el sonido cuando la serpiente come la fruta
        comerSonido.play();
        
        updateFoodPosition();
        snakeBody.push([foodY, foodX]); 
        score++;
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Puntos: ${score}`;
        highScoreElement.innerText = `Puntuacion maxima: ${highScore}`;
    }

    snakeX += velocityX;
    snakeY += velocityY;
    
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    snakeBody[0] = [snakeX, snakeY]; 

    // Verificar colisión con la pared
    if(snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        gameOver = true;
    }

    // Verificar colisión consigo mismo
    for (let i = 1; i < snakeBody.length; i++) {
        if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]) {
            gameOver = true;
            break;
        }
    }

    if(gameOver) {
        handleGameOver();
        return;
    }

    for (let i = 0; i < snakeBody.length; i++) {
        html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
    }
    playBoard.innerHTML = html;
};

updateFoodPosition();
setIntervalId = setInterval(initGame, 100);
document.addEventListener("keyup", changeDirection);
document.addEventListener("touchstart", handleTouchStart, { passive: false });
document.addEventListener("touchmove", handleTouchMove, { passive: false });
document.addEventListener("touchend", handleTouchEnd, { passive: false });