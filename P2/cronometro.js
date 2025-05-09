
class Cronometro {
    constructor(displayElement, onComplete) {
        this.display = displayElement;
        this.onComplete = onComplete;
        this.isRunning = false;
        this.startTime = 0;
        this.currentTime = 0;
        this.timerInterval = null;
        this.reset();
    }
    
    // Iniciar el crono
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now() - this.currentTime;
        
        this.timerInterval = setInterval(() => {
            this.currentTime = Date.now() - this.startTime;
            this.updateDisplay();
        }, 100); 
    }
    
    // Detener el crono
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.timerInterval);
    }
    
    // Reiniciar el crono
    reset() {
        this.stop();
        this.currentTime = 0;
        this.updateDisplay();
    }
    
    // Actualiza el crono en la interfaz
    updateDisplay() {
        // Convertir milisegundos a formato mm:ss:ms
        const totalSeconds = Math.floor(this.currentTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((this.currentTime % 1000) / 10);
        
        // Formatear y mostrar
        this.display.textContent = `${minutes}:${seconds}:${milliseconds}`;
    }
}
