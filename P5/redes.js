// Variables de trabajo
const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');

let redAleatoria;
let nodoOrigen = 0, nodoDestino = 0;
let rutaMinimaConRetardos;
let numNodos = 0;

const nodeConnect = 2;
const nodeRadius = 40;
const nodeRandomDelay = 1000;
const pipeRandomWeight = 100; 

const btnCNet = document.getElementById("btnCNet");
const btnMinPath = document.getElementById("btnMinPath");
const numNodosDisplay = document.getElementById("numNodos");


// Clase para representar un nodo en el grafo
class Nodo {

    constructor(id, x, y, delay) {
      this.id = id; // Identificador del nodo
      this.x = x; // Coordenada X del nodo
      this.y = y; // Coordenada Y del nodo
      this.delay = delay; // Retardo del nodo en milisegundos
      this.conexiones = []; // Array de conexiones a otros nodos
    }
    
    // Método para agregar una conexión desde este nodo a otro nodo con un peso dado
    conectar(nodo, peso) {
      this.conexiones.push({ nodo, peso });
    }

      
    // Método para saber si un nodo está en la lista de conexiones de otro
    isconnected(idn) {

        let isconnected = false;

        this.conexiones.forEach(({ nodo: conexion, peso }) => {      
        if (idn == conexion.id) {
            //console.log("id nodo conectado:" + conexion.id);
            isconnected = true;
        }      
    });
    
    return isconnected;
  }

    // Método para saber la distancia entre dos nodos
    node_distance(nx, ny) {

        var a = nx - this.x;
        var b = ny - this.y;
            
        return Math.floor(Math.sqrt( a*a + b*b ));
    
    }

      
    // Método para encontrar el nodo más alejado
    far_node( nodos ) {

        let distn = 0;
        let cnode = this.id;
        let distaux = 0;
        let pos = 0;
        let npos = 0;

        for (let nodo of nodos) {
        distaux = this.node_distance(nodo.x, nodo.y);
    
        if (distaux != 0 && distaux > distn) {
            distn = distaux;
            cnode = nodo.id;
            npos = pos;
        }

        pos += 1;
        }
    
        return {pos: npos, id: cnode, distance: distn,};

    }

     
    // Método para encontrar el nodo más cercano
    close_node( nodos ) {

        let far_node = this.far_node( nodos );
        let cnode = far_node.id;
        let distn = far_node.distance;
        let distaux = 0;
        let pos = 0;
        let npos = 0;    
    
        for (let nodo of nodos) {
        distaux = this.node_distance(nodo.x, nodo.y);
    
        if (distaux != 0 && distaux <= distn) {
            distn = distaux;
            cnode = nodo.id;
            npos = pos;
        }

        pos += 1;
        }
    
        return {pos:npos, id: cnode, distance: distn,}
  
    }

  
}

// Función para generar una red aleatoria con nodos en diferentes estados de congestión
function crearRedAleatoriaConCongestion(numNodos, numConexiones) {
  
    const nodos = [];
    let x = 0, y = 0, delay = 0;
    let nodoActual = 0, nodoAleatorio = 0, pickNode = 0, peso = 0;
    let bSpace = false;
  
    const xs = Math.floor(canvas.width / numNodos);
    const ys = Math.floor(canvas.height / 2 );
    const xr = canvas.width - nodeRadius;
    const yr = canvas.height - nodeRadius;
    let xp = nodeRadius;
    let yp = nodeRadius;
    let xsa = xs;
    let ysa = ys;
  
    for (let i = 0; i < numNodos; i++) {
  
      if (Math.random() < 0.5) {
        yp = nodeRadius;
        ysa = ys;
      } 
      else {
        yp = ys;
        ysa = yr;
      }
  
      x = randomNumber(xp, xsa); 
      y = randomNumber(yp, ysa); 
  
      xp = xsa;
      xsa = xsa + xs;
  
      if ( xsa > xr && xsa <= canvas.width ) {
        xsa = xr;
      }
  
      if ( xsa > xr && xsa < canvas.width ) {
        xp = nodeRadius;
        xsa = xs;
      }    
  
      delay = generarRetardo(); 
      nodos.push(new Nodo(i, x, y, delay)); 
    }
  
  for (let nodo of nodos) {
 
     const clonedArray = [...nodos];
 
     for (let j = 0; j < numConexiones; j++) {
       let close_node = nodo.close_node(clonedArray);
       //console.log(close_node);
 
       if (!nodo.isconnected(close_node.id) && !clonedArray[close_node.pos].isconnected(nodo.id)) {
         // Añadimos una nueva conexión
         // Con el nodo más cercano y la distancia a ese nodo como el peso de la conexión
         nodo.conectar(clonedArray[close_node.pos], close_node.distance);
       }
 
       // Eliminamos el nodo seleccionado del array clonado para evitar que 
       // vuelva a salir elegido con splice.
       // 0 - Inserta en la posición que le indicamos.
       // 1 - Remplaza el elemento, y como no le damos un nuevo elemento se queda vacío.      
       clonedArray.splice(close_node.pos, 1);
     }
 
   }
  
    return nodos;
    
}

//Generar un número aleatorio dentro de un rango
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// Función para generar un retardo aleatorio entre 0 y 1000 ms
function generarRetardo() {
    return Math.random() * nodeRandomDelay;
}

// Dibujar la red en el canvas
function drawNet(nnodes) {
  nnodes.forEach(nodo => {
    nodo.conexiones.forEach(({ nodo: conexion, peso }) => {
      ctx.beginPath();
      ctx.moveTo(nodo.x, nodo.y);
      ctx.lineTo(conexion.x, conexion.y);
      ctx.stroke();

      ctx.font = '12px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      pw = "N" + nodo.id + " pw " + peso;
      const midX = Math.floor((nodo.x + conexion.x)/2);
      const midY = Math.floor((nodo.y + conexion.y)/2);
      ctx.fillText(pw, midX, midY);  

    });
  });

  let nodoDesc; // Descripción del nodo

  nnodes.forEach(nodo => {
    ctx.beginPath();
    ctx.arc(nodo.x, nodo.y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = nodo.color || 'blue'; 
    ctx.fill();
    ctx.stroke();
    ctx.font = '12px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    nodoDesc = "N" + nodo.id + " delay " + Math.floor(nodo.delay);
    ctx.fillText(nodoDesc, nodo.x, nodo.y + 5);
  });
}

function actualizarNumNodosDisplay() {
  numNodosDisplay.textContent = "Número de nodos: " + numNodos;
}

// Función de callback para generar la red de manera aleatoria
btnCNet.onclick = () => {
  document.getElementById("mensaje").textContent = "Generando red...";
  document.getElementById("tiempoEnvio").textContent = "Tiempo de envío: 0 ms";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const audio = document.getElementById('audioRed');
  audio.play();

  // Mostrar animación de carga
  let dots = 0;
  const loadingInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    const loadingText = "Generando red" + ".".repeat(dots);
    document.getElementById("mensaje").textContent = loadingText;
    
    // Dibujar indicador de carga en el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '24px Arial';
    ctx.fillStyle = 'blue';
    ctx.textAlign = 'center';
    ctx.fillText(loadingText, canvas.width / 2, canvas.height / 2);
  }, 500);

  // Generar red después del retraso
  setTimeout(() => {
    clearInterval(loadingInterval);
    numNodos = 5;
    redAleatoria = crearRedAleatoriaConCongestion(numNodos, nodeConnect);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNet(redAleatoria);
    document.getElementById("mensaje").textContent = "Red generada correctamente";
    actualizarNumNodosDisplay();
  }, 5000);
};

btnMinPath.onclick = () => {
  if (!redAleatoria) {
      document.getElementById("mensaje").textContent = "Debes generar la red primero";
      mostrarErrorRedNoGenerada();
      return;
  }
  const audio = document.getElementById('audioBoton');
  audio.play();
  const nodoOrigen = redAleatoria[0];
  const resultado = dijkstraConRetardos(redAleatoria, nodoOrigen);
  
  // Usar el tiempo calculado por el algoritmo
  const tiempoTotal = resultado.tiempoTotal;
  
  // Colorear los nodos en la ruta mínima
  for (const nodo of resultado.rutaMinima) {
      nodo.color = 'green';
  }

  console.log("Ruta mínima:", resultado.rutaMinima);
  console.log("Tiempo total de retardo:", tiempoTotal, "ms");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNet(redAleatoria);
  
  // Mostrar la ruta en el mensaje
  const rutaTexto = resultado.rutaMinima.map(nodo => "N" + nodo.id).join(" → ");
  document.getElementById("mensaje").textContent = "Ruta mínima: " + rutaTexto;
  document.getElementById("tiempoEnvio").textContent = "Tiempo de envío: " + tiempoTotal.toFixed(3) + " ms";
};

function mostrarErrorRedNoGenerada() {
  const audio = document.getElementById('audioError');
  audio.play();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = '24px Arial';
  ctx.fillStyle = 'red';
  ctx.textAlign = 'center'; 
  ctx.textBaseline = 'bottom'; 
  ctx.fillText('¡Debes generar la red primero!', canvas.width / 2, canvas.height); 

  const img = new Image();
  img.onload = function() {
    const nuevoAncho = img.width * 0.5; 
    const nuevoAlto = img.height * 0.5; 
    const x = (canvas.width - nuevoAncho) / 2;
    const y = (canvas.height - nuevoAlto) / 2;
    ctx.drawImage(img, x, y, nuevoAncho, nuevoAlto);
  };

  img.src = 'ARCHIVOS/error.png'; 
}
