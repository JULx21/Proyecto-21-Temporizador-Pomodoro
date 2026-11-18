// ---------- VARIABLES (el "estado" de mi app) ----------

// minutos de cada modo (los valores por defecto del enunciado)
let minutos = {
  trabajo: 25,
  corto: 5,
  largo: 15
};

let modo = "trabajo";        // modo actual: trabajo, corto o largo
let segundos = minutos.trabajo * 60;  // segundos que le quedan al temporizador
let intervalo = null;        // aquí guardo el setInterval (si es null, el timer está parado)
let sesiones = 0;            // cuántas sesiones de trabajo he terminado

// ---------- TRAER ELEMENTOS DEL HTML ----------
const body = document.body;
const textoTiempo = document.getElementById("tiempo");
const textoTipo = document.getElementById("tipo-sesion");
const textoContador = document.getElementById("contador");
const btnIniciar = document.getElementById("btn-iniciar");
const btnReiniciar = document.getElementById("btn-reiniciar");
const btnGuardar = document.getElementById("btn-guardar");

const botonesModo = {
  trabajo: document.getElementById("btn-trabajo"),
  corto: document.getElementById("btn-corto"),
  largo: document.getElementById("btn-largo")
};

// nombres bonitos para mostrar en pantalla
const nombres = {
  trabajo: "Trabajo",
  corto: "Descanso corto",
  largo: "Descanso largo"
};

// ---------- FUNCIONES ----------

// muestra el tiempo en formato 25:00
function mostrarTiempo() {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  // padStart agrega un 0 adelante si el número tiene un solo dígito (5 -> 05)
  textoTiempo.textContent = String(min).padStart(2, "0") + ":" + String(seg).padStart(2, "0");
}

// cambia el modo (trabajo, corto o largo) y deja todo listo
function cambiarModo(nuevoModo) {
  pausar();
  modo = nuevoModo;
  segundos = minutos[modo] * 60;

  // cambio el color del fondo con la clase del body
  body.className = modo;

  // actualizo el texto del tipo de sesión
  textoTipo.textContent = nombres[modo];

  // marco cuál botón de modo está activo
  for (const clave in botonesModo) {
    const activo = clave === modo;
    botonesModo[clave].classList.toggle("activo", activo);
    botonesModo[clave].setAttribute("aria-pressed", activo);
  }

  btnIniciar.textContent = "Iniciar";
  mostrarTiempo();
}

// inicia o reanuda el temporizador
function iniciar() {
  // si ya está corriendo no hago nada
  if (intervalo !== null) return;

  btnIniciar.textContent = "Pausar";

  // cada 1000 ms (1 segundo) resto un segundo
  intervalo = setInterval(function () {
    segundos--;
    mostrarTiempo();

    // cuando llega a 0 se acaba la sesión
    if (segundos <= 0) {
      terminarSesion();
    }
  }, 1000);
}

// pausa el temporizador (sin borrar el tiempo que queda)
function pausar() {
  clearInterval(intervalo);
  intervalo = null;
}

// el botón principal: inicia, pausa o reanuda
function botonPrincipal() {
  if (intervalo === null) {
    iniciar();
  } else {
    pausar();
    btnIniciar.textContent = "Reanudar";
  }
}

// reinicia el tiempo del modo actual
function reiniciar() {
  cambiarModo(modo);
}

// cuando se acaba el tiempo
function sonar() {
  // creo un "pitido" con la Web Audio API (así no necesito un archivo de sonido)
  const audio = new (window.AudioContext || window.webkitAudioContext)();
  const oscilador = audio.createOscillator();
  oscilador.frequency.value = 880; // tono del pitido
  oscilador.connect(audio.destination);
  oscilador.start();
  oscilador.stop(audio.currentTime + 1); // suena 1 segundo
}

function terminarSesion() {
  pausar();
  sonar();

  if (modo === "trabajo") {
    sesiones++; // sumo una sesión de trabajo
    textoContador.textContent = sesiones;

    // cada 4 sesiones de trabajo toca descanso largo
    if (sesiones % 4 === 0) {
      cambiarModo("largo");
    } else {
      cambiarModo("corto");
    }
  } else {
    // después de cualquier descanso vuelve el trabajo
    cambiarModo("trabajo");
  }
}

// guarda los minutos que escribió el usuario
function guardarConfig() {
  const nuevoTrabajo = parseInt(document.getElementById("min-trabajo").value);
  const nuevoCorto = parseInt(document.getElementById("min-corto").value);
  const nuevoLargo = parseInt(document.getElementById("min-largo").value);

  // solo guardo si son números mayores a 0
  if (nuevoTrabajo > 0 && nuevoCorto > 0 && nuevoLargo > 0) {
    minutos.trabajo = nuevoTrabajo;
    minutos.corto = nuevoCorto;
    minutos.largo = nuevoLargo;
    cambiarModo(modo); // reinicio el modo actual con los nuevos minutos
  } else {
    alert("Escribe minutos válidos (mayores a 0)");
  }
}

// ---------- EVENTOS (lo que pasa cuando hago clic) ----------
btnIniciar.addEventListener("click", botonPrincipal);
btnReiniciar.addEventListener("click", reiniciar);
btnGuardar.addEventListener("click", guardarConfig);

botonesModo.trabajo.addEventListener("click", function () { cambiarModo("trabajo"); });
botonesModo.corto.addEventListener("click", function () { cambiarModo("corto"); });
botonesModo.largo.addEventListener("click", function () { cambiarModo("largo"); });

// muestro el tiempo apenas carga la página
mostrarTiempo();