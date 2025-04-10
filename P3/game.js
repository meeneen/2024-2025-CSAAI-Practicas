document.addEventListener('DOMContentLoaded', () => {
    const lienzo = document.getElementById('gameCanvas');
    const ctx = lienzo.getContext('2d');
    const elementoPuntuacion = document.getElementById('score');
    const botonPausa = document.getElementById('pauseButton');
    const botonSonido = document.getElementById('soundButton');
    const botonReiniciar = document.getElementById('restartButton');
    
    // Inicializar cronómetro
    const cronometro = new Cronometro();
    cronometro.inicializar('tiempo');
    
    // Elementos para controles móviles
    const botonIzquierda = document.getElementById('leftButton');
    const botonDerecha = document.getElementById('rightButton');
    const botonDisparo = document.getElementById('shootButton');
    
    // Dimensiones del lienzo
    let ANCHO_LIENZO = 800;
    let ALTO_LIENZO = 600;
    
    // Configuración del juego
    let anchoJugador = 50;
    let altoJugador = 40;
    const velocidadJugador = 5;
    let anchoBala = 3;
    let altoBala = 15;
    const velocidadBala = 7;
    let anchoAlien = 40;
    let altoAlien = 30;
    const filasAliens = 3;
    const columnasAliens = 8;
    let espaciadoAliens = 15;
    const velocidadAliens = 1.5;
    let distanciaCaidaAliens = 20;
    
    // Variables para las estrellas
    let estrellas = [];
    
    // Cargar imágenes
    const imagenJugador = new Image();
    imagenJugador.src = 'ARCHIVOS/jugador.png';

    const imagenAlien = new Image();
    imagenAlien.src = 'ARCHIVOS/rival.png';
    
    const imagenExplosion = new Image();
    imagenExplosion.src = 'ARCHIVOS/explosion.png';
    
    // Cargar sonidos 
    const sonidoLaser = new Audio('ARCHIVOS/tiro_laser.mp3');
    const sonidoExplosion = new Audio('ARCHIVOS/explosion.mp3');
    const sonidoVictoria = new Audio('ARCHIVOS/musica_victoria.mp3');
    const sonidoDerrota = new Audio('ARCHIVOS/musica_derrota.mp3');
    
    let jugador = {
        x: ANCHO_LIENZO / 2 - anchoJugador / 2,
        y: ALTO_LIENZO - altoJugador - 10,
        ancho: anchoJugador,
        alto: altoJugador,
        velocidad: velocidadJugador,
        moviendoIzquierda: false,
        moviendoDerecha: false
    };
    
    let balas = [];
    let aliens = [];
    let explosiones = [];
    let direccionAliens = 1;
    let puntuacion = 0;
    let juegoTerminado = false;
    let victoria = false;
    let juegoIniciado = true;
    let juegoPausado = false;
    let sonidoActivado = true;
    
    // Función para redimensionar el lienzo
    function redimensionarLienzo() {
        const contenedor = document.querySelector('.game-container');
        const anchoContenedor = contenedor.clientWidth;
        
        if (anchoContenedor < 800) {
            const relacionAspecto = ALTO_LIENZO / ANCHO_LIENZO;
            const nuevoAncho = anchoContenedor - 20; // Margen
            const nuevoAlto = nuevoAncho * relacionAspecto;
            
            // Actualizar dimensiones del lienzo
            lienzo.width = nuevoAncho;
            lienzo.height = nuevoAlto;
            
            // Actualizar constantes de juego proporcionalmente
            const escala = nuevoAncho / ANCHO_LIENZO;
            ANCHO_LIENZO = nuevoAncho;
            ALTO_LIENZO = nuevoAlto;
            
            anchoJugador = 50 * escala;
            altoJugador = 40 * escala;
            anchoBala = 3 * escala;
            altoBala = 15 * escala;
            anchoAlien = 40 * escala;
            altoAlien = 30 * escala;
            espaciadoAliens = 15 * escala;
            distanciaCaidaAliens = 20 * escala;
            
            // Actualizar posición del jugador
            jugador.ancho = anchoJugador;
            jugador.alto = altoJugador;
            jugador.y = ALTO_LIENZO - altoJugador - 10;
            
            // Reinicializar aliens con nuevas dimensiones
            inicializarAliens();
            inicializarEstrellas();
        } else {
            lienzo.width = 800;
            lienzo.height = 600;
            ANCHO_LIENZO = 800;
            ALTO_LIENZO = 600;
            
            anchoJugador = 50;
            altoJugador = 40;
            anchoBala = 3;
            altoBala = 15;
            anchoAlien = 40;
            altoAlien = 30;
            espaciadoAliens = 15;
            distanciaCaidaAliens = 20;
            
            jugador.ancho = anchoJugador;
            jugador.alto = altoJugador;
            jugador.y = ALTO_LIENZO - altoJugador - 10;
            
            inicializarAliens();
            inicializarEstrellas();
        }
    }
    
    // Inicializar estrellas
    function inicializarEstrellas() {
        estrellas = [];
        const cantidadEstrellas = window.innerWidth < 800 ? 50 : 100;
        
        for (let i = 0; i < cantidadEstrellas; i++) {
            estrellas.push({
                x: Math.random() * ANCHO_LIENZO,
                y: Math.random() * ALTO_LIENZO,
                tamaño: Math.random() * 2 + 0.5,
                velocidad: Math.random() * 0.3 + 0.1  // Velocidad lenta entre 0.1 y 0.4 píxeles por fotograma
            });
        }
    }
    
    // Inicializar aliens
    function inicializarAliens() {
        aliens = [];
        for (let f = 0; f < filasAliens; f++) {
            for (let c = 0; c < columnasAliens; c++) {
                const x = c * (anchoAlien + espaciadoAliens) + espaciadoAliens;
                const y = f * (altoAlien + espaciadoAliens) + espaciadoAliens + 30;
                aliens.push({ 
                    x, 
                    y, 
                    ancho: anchoAlien, 
                    alto: altoAlien, 
                    vivo: true,
                    tipo: f % 3
                });
            }
        }
    }
    // Dibujar jugador
    function dibujarJugador() {
        if (imagenJugador.complete) {
            ctx.drawImage(imagenJugador, jugador.x, jugador.y, jugador.ancho, jugador.alto);
        } else {
            ctx.fillStyle = '#0f0';
            ctx.fillRect(jugador.x, jugador.y, jugador.ancho, jugador.alto);
        }
    }
    
    // Dibujar balas
    function dibujarBalas() {
        ctx.fillStyle = '#fff';
        balas.forEach(bala => {
            ctx.fillRect(bala.x, bala.y, bala.ancho, bala.alto);
        });
    }
    
    // Dibujar aliens
    function dibujarAliens() {
        aliens.forEach(alien => {
            if (alien.vivo) {
                if (imagenAlien.complete) {
                    ctx.drawImage(imagenAlien, alien.x, alien.y, alien.ancho, alien.alto);
                } else {
                    ctx.fillStyle = '#f00';
                    ctx.fillRect(alien.x, alien.y, alien.ancho, alien.alto);
                }
            }
        });
    }
    
    // Dibujar explosiones
    function dibujarExplosiones() {
        explosiones.forEach(explosion => {
            if (imagenExplosion.complete) {
                ctx.drawImage(imagenExplosion, explosion.x, explosion.y, explosion.ancho, explosion.alto);
            } else {
                ctx.fillStyle = '#ff0';
                ctx.beginPath();
                ctx.arc(explosion.x + explosion.ancho / 2, explosion.y + explosion.alto / 2, explosion.ancho / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    // Actualizar explosiones
    function actualizarExplosiones() {
        for (let i = explosiones.length - 1; i >= 0; i--) {
            explosiones[i].fotogramas--;
            if (explosiones[i].fotogramas <= 0) {
                explosiones.splice(i, 1);
            }
        }
    }
    
    // Actualizar posición de las balas
    function actualizarBalas() {
        for (let i = balas.length - 1; i >= 0; i--) {
            balas[i].y -= velocidadBala;
            
            if (balas[i].y < 0) {
                balas.splice(i, 1);
                continue;
            }
            
            for (let j = 0; j < aliens.length; j++) {
                if (aliens[j].vivo && 
                    balas[i] && 
                    balas[i].x < aliens[j].x + aliens[j].ancho &&
                    balas[i].x + balas[i].ancho > aliens[j].x &&
                    balas[i].y < aliens[j].y + aliens[j].alto &&
                    balas[i].y + balas[i].alto > aliens[j].y) {
                    
                    aliens[j].vivo = false;
                    
                    explosiones.push({
                        x: aliens[j].x,
                        y: aliens[j].y,
                        ancho: aliens[j].ancho,
                        alto: aliens[j].alto,
                        fotogramas: 15
                    });
                    
                    if (sonidoActivado) {
                        sonidoExplosion.currentTime = 0;
                        sonidoExplosion.play().catch(() => {});
                    }
                    
                    balas.splice(i, 1);
                    puntuacion += 10;
                    elementoPuntuacion.textContent = puntuacion;
                    break;
                }
            }
        }
    }
    
    // Actualizar posición de los aliens
    function actualizarAliens() {
        let cambiarDireccion = false;
        let todosMuertos = true;
        
        aliens.forEach(alien => {
            if (alien.vivo) {
                todosMuertos = false;
                alien.x += velocidadAliens * direccionAliens;
                
                if (alien.x <= 0 || alien.x + alien.ancho >= ANCHO_LIENZO) {
                    cambiarDireccion = true;
                }
                
                if (alien.y + alien.alto >= jugador.y) {
                    juegoTerminado = true;
                    cronometro.detener();
                    if (sonidoActivado) {
                        sonidoDerrota.play().catch(() => {});
                    }
                    botonReiniciar.style.display = 'block';
                }
            }
        });
        
        if (todosMuertos) {
            victoria = true;
            cronometro.detener();
            if (sonidoActivado) {
                sonidoVictoria.play().catch(e => console.log("Error al reproducir sonido:", e));
            }
            botonReiniciar.style.display = 'block';
        }
        
        if (cambiarDireccion) {
            direccionAliens *= -1;
            aliens.forEach(alien => {
                if (alien.vivo) {
                    alien.y += distanciaCaidaAliens;
                }
            });
        }
    }
    
    // Actualizar posición del jugador
    function actualizarJugador() {
        if (jugador.moviendoIzquierda && jugador.x > 0) {
            jugador.x -= jugador.velocidad;
        }
        if (jugador.moviendoDerecha && jugador.x + jugador.ancho < ANCHO_LIENZO) {
            jugador.x += jugador.velocidad;
        }
    }
    
    // Disparar
    function disparar() {
        balas.push({
            x: jugador.x + jugador.ancho / 2 - anchoBala / 2,
            y: jugador.y,
            ancho: anchoBala,
            alto: altoBala
        });
        
        if (sonidoActivado) {
            sonidoLaser.currentTime = 0;
            sonidoLaser.play().catch(e => console.log("Error al reproducir sonido:", e));
        }
    }
    
    // Dibujar estrellas de fondo
    function dibujarEstrellas() {
        ctx.fillStyle = 'white';
        
        // Dibujar y actualizar cada estrella
        estrellas.forEach(estrella => {
            // Dibujar la estrella
            ctx.fillRect(estrella.x, estrella.y, estrella.tamaño, estrella.tamaño);
            
            // Mover la estrella hacia abajo (efecto de caída lenta)
            estrella.y += estrella.velocidad;
            
            // Si la estrella sale de la pantalla, reposicionarla arriba
            if (estrella.y > ALTO_LIENZO) {
                estrella.y = 0;
                estrella.x = Math.random() * ANCHO_LIENZO;
            }
        });
    }
        // Dibujar mensaje de pausa
        function dibujarMensajePausa() {
            ctx.fillStyle = '#fff';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('JUEGO PAUSADO', ANCHO_LIENZO / 2, ALTO_LIENZO / 2);
            ctx.font = '18px Arial';
            ctx.fillText('Presiona el botón de pausa para continuar', ANCHO_LIENZO / 2, ALTO_LIENZO / 2 + 40);
        }
        
        // Pausar/reanudar el juego
        function alternarPausa() {
            juegoPausado = !juegoPausado;
            botonPausa.textContent = juegoPausado ? 'Reanudar' : 'Pausar';
            botonPausa.classList.toggle('paused', juegoPausado);
            
            if (juegoPausado) {
                cronometro.pausar(); // Usar pausar en lugar de detener
                dibujarMensajePausa();
            } else {
                cronometro.reanudar(); // Usar reanudar en lugar de iniciar
                requestAnimationFrame(bucleJuego);
            }
        }
        
        // Activar/desactivar sonido
        function alternarSonido() {
            sonidoActivado = !sonidoActivado;
            botonSonido.textContent = sonidoActivado ? 'Silenciar' : 'Activar Sonido';
            botonSonido.classList.toggle('muted', !sonidoActivado);
            
            [sonidoLaser, sonidoExplosion, sonidoVictoria, sonidoDerrota].forEach(sonido => {
                sonido.muted = !sonidoActivado;
            });
        }
        
        // Reiniciar el juego
        function reiniciarJuego() {
            jugador = {
                x: ANCHO_LIENZO / 2 - anchoJugador / 2,
                y: ALTO_LIENZO - altoJugador - 10,
                ancho: anchoJugador,
                alto: altoJugador,
                velocidad: velocidadJugador,
                moviendoIzquierda: false,
                moviendoDerecha: false
            };
            
            balas = [];
            explosiones = [];
            direccionAliens = 1;
            puntuacion = 0;
            elementoPuntuacion.textContent = puntuacion;
            juegoTerminado = false;
            victoria = false;
            juegoPausado = false;
            
            botonPausa.textContent = 'Pausar';
            botonPausa.classList.remove('paused');
            botonReiniciar.style.display = 'none';
            
            inicializarAliens();
            inicializarEstrellas();
            cronometro.reiniciar();
            cronometro.iniciar();
            
            requestAnimationFrame(bucleJuego);
        }
        
        // Bucle principal del juego
        function bucleJuego() {
            if (!juegoIniciado || juegoTerminado || victoria || juegoPausado) {
                if (juegoTerminado) {
                    ctx.fillStyle = '#f00';
                    ctx.font = '40px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('GAME OVER', ANCHO_LIENZO / 2, ALTO_LIENZO / 2);
                    ctx.font = '20px Arial';
                    ctx.fillText('Puntuación final: ' + puntuacion, ANCHO_LIENZO / 2, ALTO_LIENZO / 2 + 40);
                } else if (victoria) {
                    ctx.fillStyle = '#0f0';
                    ctx.font = '40px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('¡VICTORIA!', ANCHO_LIENZO / 2, ALTO_LIENZO / 2);
                    ctx.font = '20px Arial';
                    ctx.fillText('Has salvado el sector Canva Centauri', ANCHO_LIENZO / 2, ALTO_LIENZO / 2 + 40);
                    ctx.fillText('Puntuación final: ' + puntuacion, ANCHO_LIENZO / 2, ALTO_LIENZO / 2 + 70);
                } else if (juegoPausado) {
                    dibujarMensajePausa();
                }
                return;
            }
            
            ctx.clearRect(0, 0, ANCHO_LIENZO, ALTO_LIENZO);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, ANCHO_LIENZO, ALTO_LIENZO);
            dibujarEstrellas();
            
            actualizarJugador();
            actualizarBalas();
            actualizarAliens();
            actualizarExplosiones();
            
            dibujarJugador();
            dibujarBalas();
            dibujarAliens();
            dibujarExplosiones();
            
            requestAnimationFrame(bucleJuego);
        }
        
        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            if (juegoTerminado || victoria) return;
            
            if (e.key === 'ArrowLeft') {
                jugador.moviendoIzquierda = true;
            } else if (e.key === 'ArrowRight') {
                jugador.moviendoDerecha = true;
            } else if (e.key === ' ') {
                if (!juegoPausado) disparar();
            } else if (e.key === 'p' || e.key === 'P') {
                alternarPausa();
            } else if (e.key === 'm' || e.key === 'M') {
                alternarSonido();
            } else if (e.key === 'r' || e.key === 'R') {
                if (juegoTerminado || victoria) reiniciarJuego();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') {
                jugador.moviendoIzquierda = false;
            } else if (e.key === 'ArrowRight') {
                jugador.moviendoDerecha = false;
            }
        });
        
        // Eventos para controles móviles
        botonIzquierda.addEventListener('touchstart', () => {
            jugador.moviendoIzquierda = true;
        });
        botonIzquierda.addEventListener('touchend', () => {
            jugador.moviendoIzquierda = false;
        });
        botonDerecha.addEventListener('touchstart', () => {
            jugador.moviendoDerecha = true;
        });
        botonDerecha.addEventListener('touchend', () => {
            jugador.moviendoDerecha = false;
        });
        botonDisparo.addEventListener('touchstart', () => {
            if (!juegoPausado) disparar();
        });
        
        // Botones de pausa y sonido
        botonPausa.addEventListener('click', alternarPausa);
        botonSonido.addEventListener('click', alternarSonido);
        botonReiniciar.addEventListener('click', reiniciarJuego);
        
        // Inicializar el juego
        redimensionarLienzo();
        inicializarAliens();
        inicializarEstrellas();
        cronometro.iniciar();
        requestAnimationFrame(bucleJuego);
    });