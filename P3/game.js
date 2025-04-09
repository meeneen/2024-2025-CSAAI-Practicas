document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    
    // Elementos para controles móviles
    const leftButton = document.getElementById('leftButton');
    const rightButton = document.getElementById('rightButton');
    const shootButton = document.getElementById('shootButton');
    
    // Hacer el canvas responsive
    function resizeCanvas() {
        const container = document.querySelector('.game-container');
        const containerWidth = container.clientWidth - 20; // Restar padding
        
        if (containerWidth < 600) {
            const aspectRatio = canvas.height / canvas.width;
            const newWidth = containerWidth;
            const newHeight = newWidth * aspectRatio;
            
            canvas.style.width = newWidth + 'px';
            canvas.style.height = newHeight + 'px';
        } else {
            canvas.style.width = '';
            canvas.style.height = '';
        }
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
    const alienRowCount = 3;  // 3 filas según las instrucciones
    const alienColCount = 8;  // Al menos 8 por fila según las instrucciones
    const alienPadding = 15;
    const alienSpeed = 1;
    const alienDropDistance = 20;
    
    // Cargar imágenes
    const playerImage = new Image();
    playerImage.src = 'ARCHIVOS/jugador.png'; // Asegúrate de tener esta imagen en la carpeta

    const alienImage = new Image();
    alienImage.src = 'ARCHIVOS/rival.png'; // Asegúrate de tener esta imagen en la carpeta
    
    const explosionImage = new Image();
    explosionImage.src = 'ARCHIVOS/explosion.png'; // Asegúrate de tener esta imagen en la carpeta
    
    // Cargar sonidos
    const laserSound = new Audio('ARCHIVOS/tiro_laser.mp3'); // Sonido de disparo
    const explosionSound = new Audio('ARCHIVOS/explosion.mp3'); // Sonido de explosión
    const victorySound = new Audio('ARCHIVOS/musica_victoria.mp3'); // Sonido de victoria
    const gameOverSound = new Audio('ARCHIVOS/musica_derrota.mp3'); // Sonido de game over
    
    let player = {
        x: canvas.width / 2 - playerWidth / 2,
        y: canvas.height - playerHeight - 10,
        width: playerWidth,
        height: playerHeight,
        speed: playerSpeed,
        isMovingLeft: false,
        isMovingRight: false
    };
    
    let bullets = [];
    let aliens = [];
    let explosions = [];
    let alienDirection = 1; // 1 derecha, -1 izquierda
    let score = 0;
    let gameOver = false;
    let victory = false;
    let gameStarted = true; // Iniciar automáticamente al cargar
    
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
                    type: r % 3 // Para tener diferentes tipos de aliens
                });
            }
        }
    }
    
    // Dibujar jugador
    function drawPlayer() {
        if (playerImage.complete) {
            ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
        } else {
            // Fallback si la imagen no está cargada
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
                    // Fallback si la imagen no está cargada
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
                // Fallback si la imagen no está cargada
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
            
            // Eliminar balas fuera de pantalla
            if (bullets[i].y < 0) {
                bullets.splice(i, 1);
                continue;
            }
            
            // Comprobar colisiones con aliens
            for (let j = 0; j < aliens.length; j++) {
                if (aliens[j].alive && 
                    bullets[i] && 
                    bullets[i].x < aliens[j].x + aliens[j].width &&
                    bullets[i].x + bullets[i].width > aliens[j].x &&
                    bullets[i].y < aliens[j].y + aliens[j].height &&
                    bullets[i].y + bullets[i].height > aliens[j].y) {
                    
                    aliens[j].alive = false;
                    
                    // Crear explosión
                    explosions.push({
                        x: aliens[j].x,
                        y: aliens[j].y,
                        width: aliens[j].width,
                        height: aliens[j].height,
                        frames: 15 // Duración de la explosión en frames
                    });
                    
                    // Reproducir sonido de explosión
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
                
                // Comprobar si algún alien toca los bordes
                if (alien.x <= 0 || alien.x + alien.width >= canvas.width) {
                    shouldChangeDirection = true;
                }
                
                // Comprobar si algún alien llega abajo (game over)
                if (alien.y + alien.height >= player.y) {
                    gameOver = true;
                    // Reproducir sonido de game over
                    gameOverSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                }
            }
        });
        
        if (allDead) {
            // Victoria - todos los aliens han sido eliminados
            victory = true;
            // Reproducir sonido de victoria
            victorySound.play().catch(e => console.log("Error al reproducir sonido:", e));
        }
        
        if (shouldChangeDirection) {
            alienDirection *= -1;
            // Mover aliens hacia abajo
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
        if (player.isMovingRight && player.x + player.width < canvas.width) {
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
        
        // Reproducir sonido de disparo
        laserSound.currentTime = 0;
        laserSound.play().catch(e => console.log("Error al reproducir sonido:", e));
    }
    
    // Dibujar estrellas de fondo
    function drawStars() {
        ctx.fillStyle = 'white';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 2;
            ctx.fillRect(x, y, size, size);
        }
    }
    
    // Bucle principal del juego
    function gameLoop() {
        if (!gameStarted || gameOver || victory) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar fondo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
            ctx.font = '20px Arial';
            ctx.fillText('Puntuación final: ' + score, canvas.width / 2, canvas.height / 2 + 40);
            return;
        }
        
        if (victory) {
            ctx.fillStyle = '#0f0';
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('¡VICTORIA!', canvas.width / 2, canvas.height / 2);
            ctx.font = '20px Arial';
            ctx.fillText('Has salvado el sector Canva Centauri', canvas.width / 2, canvas.height / 2 + 40);
            ctx.fillText('Puntuación final: ' + score, canvas.width / 2, canvas.height / 2 + 70);
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