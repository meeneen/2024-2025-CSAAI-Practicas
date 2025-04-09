document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    
    // Elementos para controles móviles
    const leftButton = document.getElementById('leftButton');
    const rightButton = document.getElementById('rightButton');
    const shootButton = document.getElementById('shootButton');
    
    // Dimensiones originales del canvas
    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 500;
    
    // Factor de escala para mantener las proporciones
    let scale = 1;
    
    // Hacer el canvas responsive
    function resizeCanvas() {
        const container = document.querySelector('.game-container');
        const containerWidth = container.clientWidth - 20; // Restar padding
        
        if (containerWidth < CANVAS_WIDTH) {
            scale = containerWidth / CANVAS_WIDTH;
        } else {
            scale = 1;
        }
        
        // Mantener las dimensiones lógicas del canvas
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
    }
    
    // Llamar a resizeCanvas cuando cambie el tamaño de la ventana
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Configuración del juego
    const playerWidth = 50;
    const playerHeight = 40;
    const playerSpeed = 5;
    const bulletWidth = 3;
    const bulletHeight = 15;
    const bulletSpeed = 7;
    const alienWidth = 40;
    const alienHeight = 30;
    const alienRowCount = 3;
    const alienColCount = 8;
    const alienPadding = 15;
    const alienSpeed = 1;
    const alienDropDistance = 20;
    
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
    
    // Función para convertir coordenadas de pantalla a coordenadas del canvas
    function getCanvasCoordinates(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
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
                ctx.arc(explosion.x + explosion.width/2, explosion.y + explosion.height/2, explosion.width/2, 0, Math.PI * 2);
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
                    
                    explosionSound.currentTime = 0;
                    explosionSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                    
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
                    gameOverSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                }
            }
        });
        
        if (allDead) {
            victory = true;
            victorySound.play().catch(e => console.log("Error al reproducir sonido:", e));
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
        
        laserSound.currentTime = 0;
        laserSound.play().catch(e => console.log("Error al reproducir sonido:", e));
    }
    
    // Dibujar estrellas de fondo
    function drawStars() {
        ctx.fillStyle = 'white';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * CANVAS_WIDTH;
            const y = Math.random() * CANVAS_HEIGHT;
            const size = Math.random() * 2;
            ctx.fillRect(x, y, size, size);
        }
    }
    
    // Bucle principal del juego
    function gameLoop() {
        if (!gameStarted || gameOver || victory) return;
        
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
        
        if (gameOver) {
            ctx.fillStyle = '#f00';
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.font = '20px Arial';
            ctx.fillText('Puntuación final: ' + score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
            return;
        }
        
        if (victory) {
            ctx.fillStyle = '#0f0';
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('¡VICTORIA!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.font = '20px Arial';
            ctx.fillText('Has salvado el sector Canva Centauri', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
            ctx.fillText('Puntuación final: ' + score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
            return;
        }
        
        requestAnimationFrame(gameLoop);
    }
    
    // Eventos de teclado
    document.addEventListener('keydown', (e) => {
        if (!gameStarted || gameOver || victory) return;
        
        if (e.key === 'ArrowLeft') {
            player.isMovingLeft = true;
        } else if (e.key === 'ArrowRight') {
            player.isMovingRight = true;
        } else if (e.key === ' ') {
            shoot();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') {
            player.isMovingLeft = false;
        } else if (e.key === 'ArrowRight') {
            player.isMovingRight = false;
        }
    });
    
    // Controles táctiles para dispositivos móviles
    if (leftButton && rightButton && shootButton) {
        // Control izquierdo
        leftButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            player.isMovingLeft = true;
        });
        
        leftButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            player.isMovingLeft = false;
        });
        
        // Control derecho
        rightButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            player.isMovingRight = true;
        });
        
        rightButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            player.isMovingRight = false;
        });
        
        // Botón de disparo
        shootButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            shoot();
        });
        
        // Prevenir comportamientos no deseados en móviles
        document.addEventListener('touchmove', (e) => {
            if (e.target.className.includes('mobile-button')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // También añadir soporte para clics de ratón (para pruebas)
        leftButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
            player.isMovingLeft = true;
        });
        
        leftButton.addEventListener('mouseup', (e) => {
            e.preventDefault();
            player.isMovingLeft = false;
        });
        
        rightButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
            player.isMovingRight = true;
        });
        
        rightButton.addEventListener('mouseup', (e) => {
            e.preventDefault();
            player.isMovingRight = false;
        });
        
        shootButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
            shoot();
        });
    }
    
    // Iniciar el juego automáticamente
    initAliens();
    gameLoop();
});