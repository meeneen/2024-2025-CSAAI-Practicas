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

// Inicializar el crono
let cronometro;

//  código secreto aleatorio
function generarCodigoSecreto() {
    codigoSecreto = [];
    for (let i = 0; i < 4; i++) {
        codigoSecreto.push(Math.floor(Math.random() * 10)); // Números del 0 al 9
    }
    console.log("Código secreto generado:", codigoSecreto); // poder verlo en la consola
}

// iniciar el crono
function iniciarCronometro() {
    if (cronometro && !cronometro.isRunning) {
        cronometro.start();
    }
}

//  detener el crono
function detenerCronometro() {
    if (cronometro && cronometro.isRunning) {
        cronometro.stop();
    }
}

// reset
function reiniciarJuego() {
    // ocultar ventana emergente si está visible
    ocultarModal();
    
    // Generar nueva clave secreta
    generarCodigoSecreto();
    
    // Reiniciar variables
    digitosAcertados = [false, false, false, false];
    intentosRealizados = 0;
    
    // Reiniciar contadores
    contadores.forEach(contador => {
        contador.textContent = '*';
        contador.className = 'asterisco';
    });
    
    // Mostrar mensaje inicial
    display2.textContent = 'A por ello!';
    display2.style.color = 'rgb(101, 243, 18)';
    
    // Reiniciar crono
    if (cronometro) {
        cronometro.reset();
    }
    
    // Habilitar botones de numeros
    botonesDigitos.forEach(boton => {
        boton.disabled = false;
    });
}


function verificarDigito(digito) {
    // Iniciar crono si esta parado
    if (cronometro && !cronometro.isRunning) {
        cronometro.start();
    }
    
    // Incrementar contador de intentos
    intentosRealizados++;
    
    // Verificar si el numero esta en la clave
    let acierto = false;
    for (let i = 0; i < codigoSecreto.length; i++) {
        if (parseInt(digito) === codigoSecreto[i] && !digitosAcertados[i]) {
            contadores[i].textContent = digito;
            contadores[i].className = 'correct-guess';
            digitosAcertados[i] = true;
            acierto = true;
            break; // Solo acertamos un numero por intento
        }
    }
    
    // Verificar si se han acertado todos los numeros
    if (digitosAcertados.every(acertado => acertado)) {
        finalizarJuego(true);
        return;
    }
    
    // Verificar si se alcanza el máximo de intentos
    if (intentosRealizados >= intentosMaximos) {
        finalizarJuego(false);
        return;
    }
    
    // Actualizar mensajito segun el resultado
    if (acierto) {
        display2.textContent = '¡Buen trabajo! Sigue así...';
    } else {
        display2.textContent = `Intento ${intentosRealizados}/${intentosMaximos}. ¡Sigue intentando!`;
    }
}

// terminar juego
function finalizarJuego(victoria) {
    // Detener crono
    if (cronometro) {
        cronometro.stop();
    }
    
    //  botones de numeros off
    botonesDigitos.forEach(boton => {
        boton.disabled = true;
    });
    
    // Mostrar mensajito segun el resultado
    if (victoria) {
        display2.textContent = '¡VICTORIA!';
        display2.style.color = 'rgb(101, 243, 18)';
    } else {
        display2.textContent = '¡BOOM! Has perdido';
        display2.style.color = 'red';
        
        // Mostrar clave correcta
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

// Función para crear y mostrar la ventana emergente
function mostrarModal(titulo, mensaje) {
   
    
    // Crear elementos de la ventana emergente
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
    
    // Construir la estructura de la ventana emergente
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(tituloElement);
    modalContent.appendChild(mensajeElement);
    modal.appendChild(modalContent);
    
    // Añadir la ventana emergente al body
    document.body.appendChild(modal);
    
    // Mostrar la ventana emergente con un retraso de 500ms
    setTimeout(() => {
        modal.style.display = 'block';
    }, 500);
}

// Función para ocultar la ventana emergente
function ocultarModal() {
    const modal = document.getElementById('gameModal');
    if (modal) {
        modal.style.display = 'none';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Inicializar crono
    cronometro = new Cronometro(
        document.getElementById('display'),     
    );
    
    // Generar código secreto inicial
    generarCodigoSecreto();
    
    // Botones de numeros
    botonesDigitos.forEach(boton => {
        boton.addEventListener('click', () => {
            verificarDigito(boton.value);
        });
    });
    
    // Botón Start - inicia el crono
    botonStart.addEventListener('click', iniciarCronometro);
    
    // Botón Stop - detiene el crono
    botonStop.addEventListener('click', detenerCronometro);
    
    // Botón Reset - Reinicia el crono y genera nueva clave
    botonClear.addEventListener('click', reiniciarJuego);
    
    // Cerrar la ventana de derrota al hacer clic fuera de élla
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('gameModal');
        if (event.target === modal) {
            ocultarModal();
        }
    });
});
