const statusBadge = document.getElementById("status");
const transcriptEl = document.getElementById("transcript");
const responseEl = document.getElementById("response");

let isSleeping = false;
let inactivityTimer = null;
let OPENAI_API_KEY = null; 

// ================== CONFIG ==================
const INACTIVITY_TIME = 5000; // 5 segundos
const MOCKAPI_URL = "https://68e538728e116898997ee561.mockapi.io/apikey";

// ================== SPEECH API ==================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = "es-ES";
recognition.continuous = true;
recognition.interimResults = false;

// ================== VOZ (TEXT TO SPEECH) ==================
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    utterance.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

// ================== OBTENER API KEY ==================
async function fetchApiKey() {
    try {
        const response = await fetch(MOCKAPI_URL);
        const data = await response.json();

        if (data && data.length > 0) {
            OPENAI_API_KEY = data[0].api_key;
            console.log("✅ API Key cargada correctamente desde MockAPI");
        } else {
            console.error("❌ No se encontró API Key en MockAPI");
        }
    } catch (error) {
        console.error("❌ Error obteniendo API Key:", error);
    }
}

// ================== INACTIVITY ==================
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        goToSleep();
    }, INACTIVITY_TIME);
}

function goToSleep() {
    isSleeping = true;
    statusBadge.textContent = "SUSPENDIDO";
    statusBadge.className = "badge bg-secondary";
    responseEl.textContent = "Sistema suspendido. Di 'COSMO' para despertar.";
}

function wakeUp() {
    isSleeping = false;
    statusBadge.textContent = "ACTIVO";
    statusBadge.className = "badge bg-success";
    responseEl.textContent = "Sistema activado. Escuchando órdenes...";
}

// ================== OPENAI (CORREGIDO) ==================
async function interpretCommand(text) {

    if (!OPENAI_API_KEY) {
        return "Error: API Key no disponible";
    }

    const prompt = `Eres un sistema de control por voz para un robot llamado WANDA.

Debes interpretar el texto del usuario y devolver SOLO UNO de los siguientes
comandos EXACTOS, sin explicaciones, sin comillas, sin texto adicional:

avanzar
retroceder
detener
vuelta derecha
vuelta izquierda
90° derecha
90° izquierda
360° derecha
360° izquierda

Reglas IMPORTANTES:
- Acepta sinónimos, variaciones, conjugaciones y errores comunes.
- Ignora la palabra "WANDA" si aparece.
- Frases como "avanza", "avanzar", "muévete hacia adelante" → avanzar
- Frases como "para", "alto", "stop", "detente", "frena", "quieto", "cálmate" → detener
- Frases como "gira a la derecha", "voltea derecha" → vuelta derecha
- Frases como "gira a la izquierda", "voltea izquierda" → vuelta izquierda
- Frases como "noventa grados derecha" → 90° derecha
- Frases como "noventa grados izquierda" → 90° izquierda
- Frases como "giro completo derecha", "vuelta completa derecha", "tres sesenta derecha" → 360° derecha
- Frases como "giro completo izquierda", "tres sesenta izquierda" → 360° izquierda

Si NO corresponde a ningún comando, responde EXACTAMENTE:
Orden no reconocida

Texto del usuario:
"${text}"`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim();
        } else {
             return "Error: Respuesta vacía de IA";
        }

    } catch (error) {
        console.error("Error llamando a OpenAI:", error);
        return "Error al procesar la orden";
    }
}

// ================== RECOGNITION EVENTS ==================
recognition.onresult = async (event) => {
    const text = event.results[event.results.length - 1][0].transcript.trim().toUpperCase();
    transcriptEl.textContent = text;

    resetInactivityTimer();

    // MODO SUSPENDIDO
    if (isSleeping) {
        if (text.includes("COSMO")) {
            wakeUp();
        }
        return;
    }

    // PROCESAR COMANDO
    const result = await interpretCommand(text);
    responseEl.textContent = result;

    // Decir el comando por voz (solo si es válido)
    if (result && result !== "Orden no reconocida" && !result.startsWith("Error")) {
    speak(result);

    // 🔥 Enviar al controlador central
    if (window.CommandController) {
        window.CommandController.execute(result, "voz");
    }
  }
};

recognition.onerror = (e) => {
    console.error("Error:", e);
};

recognition.onend = () => {
    recognition.start();
};

// ================== START ==================
async function initApp() {
    await fetchApiKey();
    recognition.start();
    resetInactivityTimer();

    // 🎙 Presentación solo una vez por sesión
    if (!sessionStorage.getItem("cosmoPresented")) {
        speak("Hola, soy COSMO. Soy una inteligencia artificial que reconoce la voz e interpreta comandos hablados y los traduce en instrucciones específicas.");
        sessionStorage.setItem("cosmoPresented", "true");
    }
}

initApp();