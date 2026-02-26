import {
  HandLandmarker,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs";

const video = document.getElementById("video");
const estado = document.getElementById("estado");

let handLandmarker;
let modoSuspendido = false;
let ultimoMovimiento = Date.now();
let cooldown = false;

const TIEMPO_SUSPENSION = 5000;
const TIEMPO_CONFIRMACION = 600;
const TIEMPO_COOLDOWN = 1000;

let gestoActual = null;
let tiempoInicioGesto = 0;

/* ============================
   INICIALIZACIÓN
============================ */

async function iniciarCamara() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
}

async function cargarModelo() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-assets/hand_landmarker.task"
    },
    runningMode: "VIDEO",
    numHands: 1
  });
}

/* ============================
   UTILIDADES
============================ */

function dedoExtendido(punta, nudillo) {
  return punta.y < nudillo.y;
}

function soloPulgar(landmarks) {
  return (
    dedoExtendido(landmarks[4], landmarks[3]) &&
    !dedoExtendido(landmarks[8], landmarks[6]) &&
    !dedoExtendido(landmarks[12], landmarks[10]) &&
    !dedoExtendido(landmarks[16], landmarks[14]) &&
    !dedoExtendido(landmarks[20], landmarks[18])
  );
}

function soloIndice(landmarks) {
  return (
    dedoExtendido(landmarks[8], landmarks[6]) &&
    !dedoExtendido(landmarks[12], landmarks[10]) &&
    !dedoExtendido(landmarks[16], landmarks[14]) &&
    !dedoExtendido(landmarks[20], landmarks[18])
  );
}

function dosDedos(landmarks) {
  return (
    dedoExtendido(landmarks[8], landmarks[6]) &&
    dedoExtendido(landmarks[12], landmarks[10]) &&
    !dedoExtendido(landmarks[16], landmarks[14])
  );
}

// 🤙 Shaka (pulgar + meñique)
function gestoShaka(landmarks) {
  return (
    dedoExtendido(landmarks[4], landmarks[3]) &&
    dedoExtendido(landmarks[20], landmarks[18]) &&
    !dedoExtendido(landmarks[8], landmarks[6]) &&
    !dedoExtendido(landmarks[12], landmarks[10]) &&
    !dedoExtendido(landmarks[16], landmarks[14])
  );
}

// ✋ Palma abierta
function palmaAbierta(landmarks) {
  return (
    dedoExtendido(landmarks[8], landmarks[6]) &&
    dedoExtendido(landmarks[12], landmarks[10]) &&
    dedoExtendido(landmarks[16], landmarks[14]) &&
    dedoExtendido(landmarks[20], landmarks[18])
  );
}

// 👌 OK
function gestoOK(landmarks) {
  const distancia =
    Math.abs(landmarks[4].x - landmarks[8].x) +
    Math.abs(landmarks[4].y - landmarks[8].y);

  return (
    distancia < 0.1 &&
    dedoExtendido(landmarks[12], landmarks[10]) &&
    dedoExtendido(landmarks[16], landmarks[14]) &&
    dedoExtendido(landmarks[20], landmarks[18])
  );
}

/* ============================
   RECONOCIMIENTO
============================ */

function reconocerGesto(landmarks) {
  const muneca = landmarks[0];
  const pulgar = landmarks[4];
  const indice = landmarks[8];

  // 👍 Avanzar
  if (soloPulgar(landmarks) && pulgar.y < muneca.y)
    return "Avanzar";

  // 🤙 Retroceder
  if (gestoShaka(landmarks))
    return "Retroceder";

  // ✋ Detener
  if (palmaAbierta(landmarks))
    return "Detener";

  // 👉 Derecha
  if (soloIndice(landmarks) && indice.x > muneca.x)
    return "Vuelta derecha";

  // 👈 Izquierda
  if (soloIndice(landmarks) && indice.x < muneca.x)
    return "Vuelta izquierda";

  // ✌ 90°
  if (dosDedos(landmarks)) {
    const inclinacion = landmarks[8].x - landmarks[12].x;
    if (inclinacion > 0.05) return "90° derecha";
    if (inclinacion < -0.05) return "90° izquierda";
  }

  // 👌 360° sin movimiento
  if (gestoOK(landmarks)) {
    if (indice.x > muneca.x)
      return "360° derecha";

    if (indice.x < muneca.x)
      return "360° izquierda";
  }

  return null;
}

/* ============================
   LOOP PRINCIPAL
============================ */

async function detectar() {
  if (modoSuspendido) {
    estado.innerText = "Modo suspendido...";
    requestAnimationFrame(detectar);
    return;
  }

  const ahora = performance.now();
  const resultados = handLandmarker.detectForVideo(video, ahora);

  if (resultados.landmarks.length > 0) {
    ultimoMovimiento = Date.now();

    const gesto = reconocerGesto(resultados.landmarks[0]);

    if (gesto && !cooldown) {
      if (gestoActual !== gesto) {
        gestoActual = gesto;
        tiempoInicioGesto = Date.now();
      }

      if (Date.now() - tiempoInicioGesto > TIEMPO_CONFIRMACION) {
    estado.innerText = gesto;

    // 🔥 Enviar al controlador central
    if (window.CommandController) {
        window.CommandController.execute(gesto, "gesto");
    }
            activarCooldown();
    }
    } else if (!gesto) {
      estado.innerText = "Orden no reconocida";
      gestoActual = null;
    }

  } else {
    if (Date.now() - ultimoMovimiento > TIEMPO_SUSPENSION) {
      modoSuspendido = true;
    }
    estado.innerText = "Orden no reconocida";
  }

  requestAnimationFrame(detectar);
}

/* ============================
   CONTROL ESTADOS
============================ */

function activarCooldown() {
  cooldown = true;
  setTimeout(() => {
    cooldown = false;
  }, TIEMPO_COOLDOWN);
}

video.addEventListener("mousemove", () => {
  modoSuspendido = false;
  ultimoMovimiento = Date.now();
});

/* ============================
   START
============================ */

(async () => {
  await iniciarCamara();
  await cargarModelo();
  detectar();
})();