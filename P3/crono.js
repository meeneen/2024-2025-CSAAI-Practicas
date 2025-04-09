// Cronómetro para el juego Space Invaders
class Cronometro {
    constructor() {
        this.tiempoInicio = 0;
        this.tiempoFinal = 0;
        this.corriendo = false;
        this.elementoTiempo = null;
        this.intervalo = null;
    }

    // Inicializar el cronómetro con el elemento HTML donde mostrar el tiempo
    inicializar(elementoId) {
        this.elementoTiempo = document.getElementById(elementoId);
        if (!this.elementoTiempo) {
            console.error('No se encontró el elemento para mostrar el tiempo');
            return false;
        }
        this.mostrarTiempo(0);
        return true;
    }

    // Iniciar el cronómetro
    iniciar() {
        if (this.corriendo) return;
        
        this.tiempoInicio = Date.now();
        this.corriendo = true;
        
        // Actualizar el tiempo cada 100ms
        this.intervalo = setInterval(() => {
            const tiempoActual = this.obtenerTiempoTranscurrido();
            this.mostrarTiempo(tiempoActual);
        }, 100);
    }

    // Detener el cronómetro
    detener() {
        if (!this.corriendo) return;
        
        clearInterval(this.intervalo);
        this.tiempoFinal = this.obtenerTiempoTranscurrido();
        this.corriendo = false;
        return this.tiempoFinal;
    }

    // Reiniciar el cronómetro
    reiniciar() {
        this.detener();
        this.mostrarTiempo(0);
    }

    // Obtener el tiempo transcurrido en milisegundos
    obtenerTiempoTranscurrido() {
        if (!this.corriendo) return this.tiempoFinal;
        return Date.now() - this.tiempoInicio;
    }

    // Mostrar el tiempo en formato mm:ss.d
    mostrarTiempo(tiempoMs) {
        if (!this.elementoTiempo) return;
        
        const segundosTotales = tiempoMs / 1000;
        const minutos = Math.floor(segundosTotales / 60);
        const segundos = Math.floor(segundosTotales % 60);
        const decimas = Math.floor((tiempoMs % 1000) / 100);
        
        const tiempoFormateado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}.${decimas}`;
        this.elementoTiempo.textContent = tiempoFormateado;
    }

    // Obtener el tiempo final formateado
    obtenerTiempoFinal() {
        const tiempoMs = this.tiempoFinal || this.obtenerTiempoTranscurrido();
        const segundosTotales = tiempoMs / 1000;
        const minutos = Math.floor(segundosTotales / 60);
        const segundos = Math.floor(segundosTotales % 60);
        const decimas = Math.floor((tiempoMs % 1000) / 100);
        
        return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}.${decimas}`;
    }
}

// Exportar la clase para usarla en game.js
window.Cronometro = Cronometro;