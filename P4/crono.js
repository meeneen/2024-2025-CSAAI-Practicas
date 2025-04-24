class Cronometro {
    /**
     * Constructor del cronómetro
     * @param {HTMLElement} elementoTiempo - Elemento DOM donde se mostrará el tiempo
     */
    constructor(elementoTiempo) {
        this.elementoTiempo = elementoTiempo;
        this.tiempoInicio = 0;
        this.tiempoFinal = 0;
        this.corriendo = false;
        this.intervalo = null;
    }
    
    /**
     * Inicia el cronómetro
     */
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
    
    /**
     * Detiene el cronómetro y devuelve el tiempo transcurrido
     * @returns {number} Tiempo transcurrido en milisegundos
     */
    detener() {
        if (!this.corriendo) return this.tiempoFinal;
        
        clearInterval(this.intervalo);
        this.tiempoFinal = this.obtenerTiempoTranscurrido();
        this.corriendo = false;
        return this.tiempoFinal;
    }
    
    /**
     * Pausa el cronómetro sin reiniciarlo
     */
    pausar() {
        if (!this.corriendo) return;
        
        clearInterval(this.intervalo);
        this.tiempoFinal = this.obtenerTiempoTranscurrido();
        this.corriendo = false;
    }
    
    /**
     * Reanuda el cronómetro desde donde se pausó
     */
    reanudar() {
        if (this.corriendo) return;
        
        // Ajustar el tiempo de inicio para mantener el tiempo acumulado
        this.tiempoInicio = Date.now() - this.tiempoFinal;
        this.corriendo = true;
        
        // Actualizar el tiempo cada 100ms
        this.intervalo = setInterval(() => {
            const tiempoActual = this.obtenerTiempoTranscurrido();
            this.mostrarTiempo(tiempoActual);
        }, 100);
    }
    
    /**
     * Reinicia el cronómetro a cero
     */
    reiniciar() {
        this.detener();
        this.tiempoFinal = 0;
        this.mostrarTiempo(0);
    }
    
    /**
     * Obtiene el tiempo transcurrido en milisegundos
     * @returns {number} Tiempo transcurrido en milisegundos
     */
    obtenerTiempoTranscurrido() {
        if (!this.corriendo) return this.tiempoFinal;
        return Date.now() - this.tiempoInicio;
    }
    
    /**
     * Muestra el tiempo en el elemento DOM
     * @param {number} tiempoMs - Tiempo en milisegundos
     */
    mostrarTiempo(tiempoMs) {
        if (!this.elementoTiempo) return;
        
        const segundosTotales = tiempoMs / 1000;
        const minutos = Math.floor(segundosTotales / 60);
        const segundos = Math.floor(segundosTotales % 60);
        const decimas = Math.floor((tiempoMs % 1000) / 100);
        
        const tiempoFormateado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}.${decimas}`;
        this.elementoTiempo.textContent = tiempoFormateado;
    }
    
    /**
     * Obtiene el tiempo final formateado como string
     * @returns {string} Tiempo formateado (mm:ss.d)
     */
    obtenerTiempoFormateado() {
        const tiempoMs = this.tiempoFinal || this.obtenerTiempoTranscurrido();
        const segundosTotales = tiempoMs / 1000;
        const minutos = Math.floor(segundosTotales / 60);
        const segundos = Math.floor(segundosTotales % 60);
        const decimas = Math.floor((tiempoMs % 1000) / 100);
        
        return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}.${decimas}`;
    }
    
    /**
     * Obtiene el tiempo en formato legible para mensajes
     * @returns {string} Tiempo en formato "X min Y seg"
     */
    obtenerTiempoLegible() {
        const tiempoMs = this.tiempoFinal || this.obtenerTiempoTranscurrido();
        const segundosTotales = tiempoMs / 1000;
        const minutos = Math.floor(segundosTotales / 60);
        const segundos = Math.floor(segundosTotales % 60);
        
        if (minutos === 0) {
            return `${segundos} segundos`;
        } else if (minutos === 1) {
            return `1 minuto y ${segundos} segundos`;
        } else {
            return `${minutos} minutos y ${segundos} segundos`;
        }
    }
}
