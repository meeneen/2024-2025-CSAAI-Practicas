// Arrays de emojis para cada dimensión
const emojis2x2 = ['🐶', '🚀'];
const emojis4x4 = ['🐶', '🐺', '🍎', '🍏', '🚗', '🚕', '🏀', '⚽'];
const emojis6x6 = [
    '🐶', '🐺', '🦊', '🍎', '🍏', '🍊', '🍋', '😎','🤩' , 
    '😄', '🚗', '🚕', '🚙', '🌹', '🌷', '🌺', '🌻', '🌼'
];

class JuegoMemory {
    constructor() {
        // Elementos del DOM
        this.tableroJuego = document.getElementById('tablero-juego');
        this.botonesDimensiones = document.querySelectorAll('.boton-dimension');
        this.botonComenzar = document.getElementById('boton-comenzar');
        this.botonReiniciar = document.getElementById('boton-reiniciar');
        this.elementoMovimientos = document.getElementById('movimientos');
        this.elementoTiempo = document.getElementById('tiempo');
        this.modal = document.getElementById('modal');
        this.modalMensaje = document.getElementById('modal-mensaje');
        this.modalBoton = document.getElementById('modal-boton');
        
        this.dimensiones = 4; 
        this.numParejas = 8; 
        this.cartasVolteadas = [];
        this.parejasEncontradas = 0;
        this.bloqueado = false;
        this.juegoIniciado = false;
        this.movimientos = 0;
        this.animacionEnCurso = false; // Nueva variable para controlar animaciones
        
        // Inicializar cronómetro
        this.cronometro = new Cronometro(this.elementoTiempo);
        
        // Inicializar eventos
        this.inicializarEventos();
        
        // Preparar el tablero inicial
        this.prepararTablero();
    }
    
   
    inicializarEventos() {
        // Evento para el botón de comenzar
        this.botonComenzar.addEventListener('click', () => {
            this.comenzarJuego();
        });
        
        // Evento para el botón de reiniciar
        this.botonReiniciar.addEventListener('click', () => {
            this.finalizarJuego();
        });
        
        // Eventos para los botones de dimensiones
        this.botonesDimensiones.forEach(boton => {
            boton.addEventListener('click', () => {
                // No permitir cambiar dimensiones si el juego está iniciado
                if (this.juegoIniciado) return;
                
                // Quitar la clase seleccionado de todos los botones
                this.botonesDimensiones.forEach(b => b.classList.remove('seleccionado'));
                
                // Añadir la clase seleccionado al botón clickeado
                boton.classList.add('seleccionado');
                
                // Actualizar la dimensión del juego
                this.dimensiones = parseInt(boton.dataset.dimension);
                
                // Actualizar el número de parejas
                this.numParejas = Math.pow(this.dimensiones, 2) / 2;
                
                // Preparar el tablero con la nueva dimensión
                this.prepararTablero();
            });
        });
        
        // Evento para el botón del modal
        this.modalBoton.addEventListener('click', () => {
            this.cerrarModal();
            this.prepararTablero();
        });
    }
    
    // Preparar el tablero sin iniciar el juego
    prepararTablero() {
        // Reiniciar variables del juego
        this.parejasEncontradas = 0;
        this.movimientos = 0;
        this.elementoMovimientos.textContent = '0';
        this.cronometro.reiniciar();
        this.juegoIniciado = false;
        this.bloqueado = false;
        this.animacionEnCurso = false;
        this.cartasVolteadas = [];
        
        // Habilitar/deshabilitar botones según estado
        this.botonComenzar.disabled = false;
        this.botonReiniciar.disabled = false;
        
        // Habilitar los botones de dimensiones
        this.habilitarBotonesDimensiones(true);
        
        // Crear el tablero
        this.crearTablero();
    }
    
    // Habilitar o deshabilitar los botones de dimensiones
    habilitarBotonesDimensiones(habilitar) {
        this.botonesDimensiones.forEach(boton => {
            boton.disabled = !habilitar;
            if (!habilitar) {
                boton.classList.add('deshabilitado');
            } else {
                boton.classList.remove('deshabilitado');
            }
        });
    }
    
    // Crear el tablero de juego
    crearTablero() {
        this.tableroJuego.innerHTML = '';
        this.tableroJuego.className = `dim-${this.dimensiones}`;
        
        // Seleccionar el conjunto de emojis según la dimensión
        let emojiSet;
        switch(this.dimensiones) {
            case 2:
                emojiSet = emojis2x2;
                break;
            case 4:
                emojiSet = emojis4x4;
                break;
            case 6:
                emojiSet = emojis6x6;
                break;
        }
        
        // Crear array con pares de emojis
        let cartasEmojis = [];
        for (let i = 0; i < this.numParejas; i++) {
            // Añadir dos veces el mismo emoji para crear la pareja
            cartasEmojis.push(emojiSet[i]);
            cartasEmojis.push(emojiSet[i]);
        }
        
        // Mezclar las cartas
        cartasEmojis = this.mezclarArray(cartasEmojis);
        
        // Usar un fragmento de documento para mejorar el rendimiento
        const fragmento = document.createDocumentFragment();
        
        // Crear las cartas en el DOM
        for (let i = 0; i < cartasEmojis.length; i++) {
            const carta = document.createElement('div');
            carta.className = 'carta';
            carta.dataset.valor = cartasEmojis[i]; // Guardar el emoji como valor
            carta.dataset.index = i; // Añadir un índice único para identificar la carta
            
            const cartaFrente = document.createElement('div');
            cartaFrente.className = 'carta-frente';
            
            const cartaReverso = document.createElement('div');
            cartaReverso.className = 'carta-reverso';
            cartaReverso.textContent = cartasEmojis[i]; // Mostrar el emoji
            
            carta.appendChild(cartaFrente);
            carta.appendChild(cartaReverso);
            
            // Añadir evento de clic
            carta.addEventListener('click', () => {
                this.voltearCarta(carta);
            });
            
            fragmento.appendChild(carta);
        }
        
        // Añadir todas las cartas al tablero de una vez
        this.tableroJuego.appendChild(fragmento);
    }
    
    // Método para mezclar un array (creado por ia )
    mezclarArray(array) {
        const nuevoArray = [...array];
        for (let i = nuevoArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nuevoArray[i], nuevoArray[j]] = [nuevoArray[j], nuevoArray[i]];
        }
        return nuevoArray;
    }
    
    // Comenzar el juego
    comenzarJuego() {
        if (this.juegoIniciado) return;
        
        this.juegoIniciado = true;
        this.botonComenzar.disabled = true;
        this.botonReiniciar.disabled = false;
        
        // Deshabilitar los botones de dimensiones
        this.habilitarBotonesDimensiones(false);
        
        // Iniciar el cronómetro
        this.cronometro.iniciar();
    }
    
    // Finalizar el juego
    finalizarJuego(victoria = false) {
        if (!this.juegoIniciado && !victoria) return;
        
        // Detener el cronómetro
        const tiempoFinal = this.cronometro.detener();
        
        this.juegoIniciado = false;
        
        if (victoria) {
            // Mostrar modal con mensaje de victoria
            const minutos = Math.floor(tiempoFinal / 60000);
            const segundos = Math.floor((tiempoFinal % 60000) / 1000);
            
            this.modalMensaje.textContent = `¡Has completado el juego en ${minutos}:${segundos.toString().padStart(2, '0')} con ${this.movimientos} movimientos!`;
            this.mostrarModal();
        }
        
        // Reiniciar el tablero
        this.prepararTablero();
    }
    
    // Bloquear todas las cartas
    bloquearTodasLasCartas() {
        const cartas = this.tableroJuego.querySelectorAll('.carta:not(.emparejada)');
        cartas.forEach(carta => {
            carta.classList.add('bloqueada');
        });
    }
    
    // Desbloquear todas las cartas
    desbloquearTodasLasCartas() {
        const cartas = this.tableroJuego.querySelectorAll('.carta.bloqueada');
        cartas.forEach(carta => {
            carta.classList.remove('bloqueada');
        });
    }
    
    // Voltear una carta
    voltearCarta(carta) {
        // No hacer nada si:
        // - La carta ya está volteada
        // - Es parte de una pareja encontrada
        // - El tablero está bloqueado
        // - Hay una animación en curso
        if (carta.classList.contains('volteada') || 
            carta.classList.contains('emparejada') || 
            this.bloqueado ||
            this.animacionEnCurso) {
            return;
        }
        
        // Si es la primera carta que se voltea, iniciar el juego
        if (!this.juegoIniciado) {
            this.comenzarJuego();
        }
        
        // Marcar que hay una animación en curso
        this.animacionEnCurso = true;
        
        // Voltear la carta
        carta.classList.add('volteada');
        
        // Añadir la carta a las volteadas
        this.cartasVolteadas.push(carta);
        
        // Esperar a que termine la animación de volteo antes de continuar
        setTimeout(() => {
            // Si hay dos cartas volteadas, comprobar si son pareja
            if (this.cartasVolteadas.length === 2) {
                this.movimientos++;
                this.elementoMovimientos.textContent = this.movimientos;
                
                this.bloqueado = true;
                
                // Bloquear todas las cartas mientras se comprueba la coincidencia
                this.bloquearTodasLasCartas();
                
                setTimeout(() => {
                    this.comprobarCoincidencia();
                    this.bloqueado = false;
                    this.animacionEnCurso = false;
                    
                    // Desbloquear las cartas que no son parte de parejas encontradas
                    this.desbloquearTodasLasCartas();
                }, 500);
            } else {
                // Si solo hay una carta volteada, permitir voltear otra
                this.animacionEnCurso = false;
            }
        }, 400); // Este tiempo debe coincidir con la duración de la animación CSS
    }
    
    // Comprobar si las dos cartas volteadas son pareja
    comprobarCoincidencia() {
        const [carta1, carta2] = this.cartasVolteadas;
        
        if (carta1.dataset.valor === carta2.dataset.valor) {
            // Son pareja
            carta1.classList.add('emparejada');
            carta2.classList.add('emparejada');
            this.parejasEncontradas++;
            this.cartasVolteadas = [];
            
            // Comprobar si se ha completado el juego
            if (this.parejasEncontradas === this.numParejas) {
                this.finalizarJuego(true);
            }
        } else {
            // No son pareja, voltear de nuevo
            setTimeout(() => {
                carta1.classList.remove('volteada');
                carta2.classList.remove('volteada');
                this.cartasVolteadas = [];
            }, 250);
        }
    }
    
    // Mostrar el modal
    mostrarModal() {
        this.modal.style.display = 'flex';
    }
    
    // Cerrar el modal
    cerrarModal() {
        this.modal.style.display = 'none';
    }
}

// Iniciar el juego cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    new JuegoMemory();
});
