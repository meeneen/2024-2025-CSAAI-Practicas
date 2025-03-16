// Variables globales
let codigoSecreto = [];
let digitosAcertados = [false, false, false, false];
let intentosRealizados = 0;
const intentosMaximos = 10;

// Elementos del DOM
const display2 = document.getElementById('display2');
const contadores = [
    document.getElementById('contador1'),
    document.getElementById('contador2'),
    document.getElementById('contador3'),
    document.getElementById('contador4')
];

// Botones
const botonesDigitos = document.querySelectorAll('.digito');
const botonStart = document.getElementById('start');
const botonStop = document.getElementById('stop');
const botonClear = document.getElementById('clear');

// Inicializar el cronómetro (asumiendo que existe en cronometro.js)
let cronometro;

// Función para generar código secreto aleatorio
function generarCodigoSecreto() {
    codigoSecreto = [];
    for (let i = 0; i < 4; i++) {
        codigoSecreto.push(Math.floor(Math.random() * 10)); // Números del 0 al 9
    }
    console.log("Código secreto generado:", codigoSecreto); // Para depuración
}

// Función para iniciar el cronómetro
function iniciarCronometro() {
    if (cronometro && !cronometro.isRunning) {
        cronometro.start();
    }
}

// Función para detener el cronómetro
function detenerCronometro() {
    if (cronometro && cronometro.isRunning) {
        cronometro.stop();
    }
}

// Función para reiniciar el juego
function reiniciarJuego() {
    // Ocultar modal si está visible
    ocultarModal();
    
    // Generar nueva clave secreta
    generarCodigoSecreto();
    
    // Reiniciar variables
    digitosAcertados = [false, false, false, false];
    intentosRealizados = 0;
    
    // Reiniciar contadores visuales
    contadores.forEach(contador => {
        contador.textContent = '*';
        contador.className = 'asterisco';
    });
    
    // Mostrar mensaje inicial
    display2.textContent = 'Tú puedes...';
    display2.style.color = 'rgb(101, 243, 18)';
    
    // Reiniciar cronómetro
    if (cronometro) {
        cronometro.reset();
    }
    
    // Habilitar botones de dígitos
    botonesDigitos.forEach(boton => {
        boton.disabled = false;
    });
}

// Función para verificar el dígito ingresado
function verificarDigito(digito) {
    // Iniciar cronómetro si no está iniciado
    if (cronometro && !cronometro.isRunning) {
        cronometro.start();
    }
    
    // Incrementar contador de intentos
    intentosRealizados++;
    
    // Verificar si el dígito está en el código secreto
    let acierto = false;
    for (let i = 0; i < codigoSecreto.length; i++) {
        if (parseInt(digito) === codigoSecreto[i] && !digitosAcertados[i]) {
            // Dígito correcto y no acertado previamente
            contadores[i].textContent = digito;
            contadores[i].className = 'correct-guess';
            digitosAcertados[i] = true;
            acierto = true;
            break; // Solo acertamos un dígito a la vez
        }
    }
    
    // Verificar si se han acertado todos los dígitos
    if (digitosAcertados.every(acertado => acertado)) {
        finalizarJuego(true);
        return;
    }
    
    // Verificar si se alcanzó el máximo de intentos
    if (intentosRealizados >= intentosMaximos) {
        finalizarJuego(false);
        return;
    }
    
    // Actualizar mensaje según resultado del intento
    if (acierto) {
        display2.textContent = '¡Buen trabajo! Sigue así...';
    } else {
        display2.textContent = `Intento ${intentosRealizados}/${intentosMaximos}. ¡Sigue intentando!`;
    }
}

// Función para finalizar el juego
function finalizarJuego(victoria) {
    // Detener cronómetro
    if (cronometro) {
        cronometro.stop();
    }
    
    // Deshabilitar botones de dígitos
    botonesDigitos.forEach(boton => {
        boton.disabled = true;
    });
    
    // Mostrar mensaje según resultado
    if (victoria) {
        display2.textContent = '¡VICTORIA!';
        display2.style.color = 'rgb(101, 243, 18)';
    } else {
        display2.textContent = '¡BOOM! Has perdido';
        display2.style.color = 'red';
        
        // Mostrar código correcto
        contadores.forEach((contador, index) => {
            if (!digitosAcertados[index]) {
                contador.textContent = codigoSecreto[index];
                contador.className = 'asterisco';
            }
        });
        
        // Mostrar ventana emergente de derrota
        mostrarModal('¡BOOM!', 'Has agotado tus intentos. La bomba ha explotado. Pulsa el botón Reset para jugar de nuevo.');
    }
}

// Función para crear y mostrar el modal
function mostrarModal(titulo, mensaje) {
    // Verificar si ya existe un modal y eliminarlo
    let modalExistente = document.getElementById('gameModal');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    // Crear elementos del modal
    const modal = document.createElement('div');
    modal.id = 'gameModal';
    modal.className = 'modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content error';
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-button';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = ocultarModal;
    
    const tituloElement = document.createElement('h2');
    tituloElement.textContent = titulo;
    
    const mensajeElement = document.createElement('p');
    mensajeElement.textContent = mensaje;
    
    // Construir el modal
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(tituloElement);
    modalContent.appendChild(mensajeElement);
    modal.appendChild(modalContent);
    
    // Añadir el modal al body
    document.body.appendChild(modal);
    
    // Mostrar el modal
    setTimeout(() => {
        modal.style.display = 'block';
    }, 500);
}

// Función para ocultar el modal
function ocultarModal() {
    const modal = document.getElementById('gameModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar cronómetro
    cronometro = new Cronometro(
        document.getElementById('display'),
        () => {
            // Callback para cuando el cronómetro llegue a cero (si es necesario)
        }
    );
    
    // Generar código secreto inicial
    generarCodigoSecreto();
    
    // Botones de dígitos
    botonesDigitos.forEach(boton => {
        boton.addEventListener('click', () => {
            verificarDigito(boton.value);
        });
    });
    
    // Botón Start - Solo inicia el cronómetro
    botonStart.addEventListener('click', iniciarCronometro);
    
    // Botón Stop - Solo detiene el cronómetro
    botonStop.addEventListener('click', detenerCronometro);
    
    // Botón Reset - Reinicia el juego y genera nueva clave
    botonClear.addEventListener('click', reiniciarJuego);
    
    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('gameModal');
        if (event.target === modal) {
            ocultarModal();
        }
    });
});
