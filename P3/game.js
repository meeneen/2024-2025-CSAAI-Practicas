document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const pauseButton = document.getElementById('pauseButton');
    const soundButton = document.getElementById('soundButton');
    const restartButton = document.getElementById('restartButton');
    
    // Inicializar cronómetro
    const cronometro = new Cronometro();
    cronometro.inicializar('tiempo');
    
    // Elementos para controles móviles
    const leftButton = document.getElementById('leftButton');
    const rightButton = document.getElementById('rightButton');
    const shootButton = document.getElementById('shootButton');
    
    // Dimensiones del canvas
    let CANVAS_WIDTH = 600;
    let CANVAS_HEIGHT = 500;
    
    // Configuración del juego
    let playerWidth = 50;
    let playerHeight = 40;
    const playerSpeed = 5;
    let bulletWidth = 3;
    let bulletHeight = 15;
    const bulletSpeed = 7;
    let alienWidth = 40;
    let alienHeight = 30;
    const alienRowCount = 3;
    const alienColCount = 8;
    let alienPadding = 15;
    const alienSpeed = 1;
    let alienDropDistance = 20;
    
    // Cargar imágenes
    const playerImage = new Image();
    playerImage.src = 'ARCHIVOS/jugador.png';

    const alienImage = new Image();
    alienImage.src = 'ARCHIVOS/rival.png';
    
    const explosionImage = new Image();
    explosionImage.src = 'ARCHIVOS/explosion.png';
    
    // Cargar sonidos
    const laserSound = new Audio('ARCHIVOS/tiro_laser.mp3');
    const explosionSound = new Audio('ARCHIVOS/explosion.mp3');
    const victorySound = new Audio('ARCHIVOS/musica_victoria.mp3');
    const gameOverSound = new Audio('ARCHIVOS/musica_derrota.mp3');
    
    let player = {
        x: CANVAS_WIDTH / 2 - playerWidth / 2,
        y: CANVAS_HEIGHT - playerHeight - 10,
        width: playerWidth,
        height: playerHeight,
        speed: playerSpeed,
        isMovingLeft: false,
        isMovingRight: false
    };
    
    let bullets = [];
    let aliens = [];
    let explosions = [];
    let alienDirection = 1;
    let score = 0;
    let gameOver = false;
    let victory = false;
    let gameStarted = true;
    let gamePaused = false;
    let soundEnabled = true;
    
    // Función para redimensionar el canvas
    function resizeCanvas() {
        const container = document.querySelector('.game-container');
        const containerWidth = container.clientWidth;
        
        if (containerWidth < 600) {
            const aspectRatio = CANVAS_HEIGHT / CANVAS_WIDTH;
            const newWidth = containerWidth - 20; // Margen
            const newHeight = newWidth * aspectRatio;
            
            // Actualizar dimensiones del canvas
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            // Actualizar constantes de juego proporcionalmente
            const scale = newWidth / CANVAS_WIDTH;
            CANVAS_WIDTH = newWidth;
            CANVAS_HEIGHT = newHeight;
            
            playerWidth = 50 * scale;
            playerHeight = 40 * scale;
            bulletWidth = 3 * scale;
            bulletHeight = 15 * scale;
            alienWidth = 40 * scale;
            alienHeight = 30 * scale;
            alienPadding = 15 * scale;
            alienDropDistance = 20 * scale;
            
            // Actualizar posición del jugador
            player.width = playerWidth;
            player.height = playerHeight;
            player.y = CANVAS_HEIGHT - playerHeight - 10;
            
            // Reinicializar aliens con nuevas dimensiones
            initAliens();
        } else {
            canvas.width = 600;
            canvas.height = 500;
            CANVAS_WIDTH = 600;
            CANVAS_HEIGHT = 500;
            
            playerWidth = 50;
            playerHeight = 40;
            bulletWidth = 3;
            bulletHeight = 15;
            alienWidth = 40;
            alienHeight = 30;
            alienPadding = 15;
            alienDropDistance = 20;
            
            player.width = playerWidth;
            player.height = playerHeight;
            player.y = CANVAS_HEIGHT - playerHeight - 10;
            
            initAliens();
        }
    }
    
    // Inicializar aliens
    function initAliens() {
        aliens = [];
        for (let r = 0; r < alienRowCount; r++) {
            for (let c = 0; c < alienColCount; c++) {
                const x = c * (alienWidth + alienPadding) + alienPadding;
                const y = r * (alienHeight + alienPadding) + alienPadding + 30;
                aliens.push({ 
                    x, 
                    y, 
                    width: alienWidth, 
                    height: alienHeight, 
                    alive: true,
                    type: r % 3
                });
            }
        }
    }
    
    // Dibujar jugador
    function drawPlayer() {
        if (playerImage.complete) {
            ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
        } else {
            ctx.fillStyle = '#0f0';
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }
    }
    
    // Dibujar balas
    function drawBullets() {
        ctx.fillStyle = '#fff';
        bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }
    
    // Dibujar aliens
    function drawAliens() {
        aliens.forEach(alien => {
            if (alien.alive) {
                if (alienImage.complete) {
                    ctx.drawImage(alienImage, alien.x, alien.y, alien.width, alien.height);
                } else {
                    ctx.fillStyle = '#f00';
                    ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
                }
            }
        });
    }
    
    // Dibujar explosiones
    function drawExplosions() {
        explosions.forEach(explosion => {
            if (explosionImage.complete) {
                ctx.drawImage(explosionImage, explosion.x, explosion.y, explosion.width, explosion.height);
            } else {
                ctx.fillStyle = '#ff0';
                ctx.beginPath();
                ctx.arc(explosion.x + explosion.width / 2, explosion.y + explosion.height / 2, explosion.width / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    // Actualizar explosiones
    function updateExplosions() {
        for (let i = explosions.length - 1; i >= 0; i--) {
            explosions[i].frames--;
            if (explosions[i].frames <= 0) {
                explosions.splice(i, 1);
            }
        }
    }
    
    // Actualizar posición de las balas
    function updateBullets() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y -= bulletSpeed;
            
            if (bullets[i].y < 0) {
                bullets.splice(i, 1);
                continue;
            }
            
            for (let j = 0; j < aliens.length; j++) {
                if (aliens[j].alive && 
                    bullets[i] && 
                    bullets[i].x < aliens[j].x + aliens[j].width &&
                    bullets[i].x + bullets[i].width > aliens[j].x &&
                    bullets[i].y < aliens[j].y + aliens[j].height &&
                    bullets[i].y + bullets[i].height > aliens[j].y) {
                    
                    aliens[j].alive = false;
                    
                    explosions.push({
                        x: aliens[j].x,
                        y: aliens[j].y,
                        width: aliens[j].width,
                        height: aliens[j].height,
                        frames: 15
                    });
                    
                    if (soundEnabled) {
                        explosionSound.currentTime = 0;
                        explosionSound.play().catch(() => {});
                    }
                    
                    bullets.splice(i, 1);
                    score += 10;
                    scoreElement.textContent = score;
                    break;
                }
            }
        }
    }
    
    // Actualizar posición de los aliens
    function updateAliens() {
        let shouldChangeDirection = false;
        let allDead = true;
        
        aliens.forEach(alien => {
            if (alien.alive) {
                allDead = false;
                alien.x += alienSpeed * alienDirection;
                
                if (alien.x <= 0 || alien.x + alien.width >= CANVAS_WIDTH) {
                    shouldChangeDirection = true;
                }
                
                if (alien.y + alien.height >= player.y) {
                    gameOver = true;
                    cronometro.detener();
                    if (soundEnabled) {
                        gameOverSound.play().catch(() => {});
                    }
                    restartButton.style.display = 'block';
                }
            }
        });
        
        if (allDead) {
            victory = true;
            cronometro.detener();
            if (soundEnabled) {
                victorySound.play().catch(e => console.log("Error al reproducir sonido:", e));
            }
            restartButton.style.display = 'block';
        }
        
        if (shouldChangeDirection) {
            alienDirection *= -1;
            aliens.forEach(alien => {
                if (alien.alive) {
                    alien.y += alienDropDistance;
                }
            });
        }
    }
    
    // Actualizar posición del jugador
    function updatePlayer() {
        if (player.isMovingLeft && player.x > 0) {
            player.x -= player.speed;
        }
        if (player.isMovingRight && player.x + player.width < CANVAS_WIDTH) {
            player.x += player.speed;
        }
    }
    
    // Disparar
    function shoot() {
        bullets.push({
            x: player.x + player.width / 2 - bulletWidth / 2,
            y: player.y,
            width: bulletWidth,
            height: bulletHeight
        });
        
        if (soundEnabled) {
            laserSound.currentTime = 0;
            laserSound.play().catch(e => console.log("Error al reproducir sonido:", e));
        }
    }
    
    // Dibujar estrellas de fondo
    function drawStars() {
        const starCount = window.innerWidth < 600 ? 50 : 100;
        ctx.fillStyle = 'white';
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * CANVAS_WIDTH;
            const y = Math.random() * CANVAS_HEIGHT;
            const size = Math.random() * 2;
            ctx.fillRect(x, y, size, size);
        }
    }
    
    // Dibujar mensaje de pausa
    function drawPauseMessage() {
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('JUEGO PAUSADO', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.font = '18px Arial';
        ctx.fillText('Presiona el botón de pausa para continuar', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    }
    
    // Pausar/reanudar el juego
    function togglePause() {
        gamePaused = !gamePaused;
        pauseButton.textContent = gamePaused ? 'Reanudar' : 'Pausar';
        pauseButton.classList.toggle('paused', gamePaused);
        
        if (gamePaused) {
            cronometro.detener();
            drawPauseMessage();
        } else {
            cronometro.iniciar();
            requestAnimationFrame(gameLoop);
        }
    }
    
    // Activar/desactivar sonido
    function toggleSound() {
        soundEnabled = !soundEnabled;
        soundButton.textContent = soundEnabled ? 'Silenciar' : 'Activar Sonido';
        soundButton.classList.toggle('muted', !soundEnabled);
        
        [laserSound, explosionSound, victorySound, gameOverSound].forEach(sound => {
            sound.muted = !soundEnabled;
        });
    }
    
    // Reiniciar el juego
    function resetGame() {
        player = {
            x: CANVAS_WIDTH / 2 - playerWidth / 2,
            y: CANVAS_HEIGHT - playerHeight - 10,
            width: playerWidth,
            height: playerHeight,
            speed: playerSpeed,
            isMovingLeft: false,
            isMovingRight: false
        };
        
        bullets = [];
        explosions = [];
        alienDirection = 1;
        score = 0;
        scoreElement.textContent = score;
        gameOver = false;
        victory = false;
        gamePaused = false;
        
        pauseButton.textContent = 'Pausar';
        pauseButton.classList.remove('paused');
        restartButton.style.display = 'none';
        
        initAliens();
        cronometro.reiniciar();
        cronometro.iniciar();
        
        requestAnimationFrame(gameLoop);
    }
    
    // Bucle principal del juego
    function gameLoop() {
        if (!gameStarted || gameOver || victory || gamePaused) {
            if (gameOver) {
                ctx.fillStyle = '#f00';
                ctx.font = '40px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
                ctx.font = '20px Arial';
                ctx.fillText('Puntuación final: ' + score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
            } else if (victory) {
                ctx.fillStyle = '#0f0';
                ctx.font = '40px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('¡VICTORIA!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
                ctx.font = '20px Arial';
                ctx.fillText('Has salvado el sector Canva Centauri', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
                ctx.fillText('Puntuación final: ' + score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
            } else if (gamePaused) {
                drawPauseMessage();
            }
            return;
        }
        
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawStars();
        
        updatePlayer();
        updateBullets();
        updateAliens();
        updateExplosions();
        
        drawPlayer();
        drawBullets();
        drawAliens();
        drawExplosions();
        
        requestAnimationFrame(gameLoop);
    }
    
    // Eventos de teclado
    document.addEventListener('keydown', (e) => {
        if (gameOver || victory) return;
        
        if (e.key === 'ArrowLeft') {
            player.isMovingLeft = true;
        } else if (e.key === 'ArrowRight') {
            player.isMovingRight = true;
        } else if (e.key === ' ') {
            if (!gamePaused) shoot();
        } else if (e.key === 'p' || e.key === 'P') {
            togglePause();
        } else if (e.key === 'm' || e.key === 'M') {
            toggleSound();
        } else if (e.key === 'r' || e.key === 'R') {
            if (gameOver || victory) resetGame();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') {
            player.isMovingLeft = false;
        } else if (e.key === 'ArrowRight') {
            player.isMovingRight = false;
        }
    });
    
    // Eventos para controles móviles
    leftButton.addEventListener('touchstart', () => {
        player.isMovingLeft = true;
    });
    leftButton.addEventListener('touchend', () => {
        player.isMovingLeft = false;
    });
    rightButton.addEventListener('touchstart', () => {
        player.isMovingRight = true;
    });
    rightButton.addEventListener('touchend', () => {
        player.isMovingRight = false;
    });
    shootButton.addEventListener('touchstart', () => {
        if (!gamePaused) shoot();
    });
    
    // Botones de pausa y sonido
    pauseButton.addEventListener('click', togglePause);
    soundButton.addEventListener('click', toggleSound);
    restartButton.addEventListener('click', resetGame);
    
    // Inicializar el juego
    resizeCanvas();
    initAliens();
    cronometro.iniciar();
    requestAnimationFrame(gameLoop);
});