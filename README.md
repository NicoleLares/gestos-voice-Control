# 🤖 COSMO – Sistema de Control por Voz y Gestos

COSMO es un sistema de control inteligente que permite manejar un robot (WANDA) mediante **gestos de mano** y **comandos de voz** en español.

Integra:

- 🖐 Reconocimiento de gestos con MediaPipe
- 🎙 Reconocimiento de voz con Web Speech API
- 🧠 Interpretación semántica usando OpenAI
- 🎛 Control centralizado de comandos
- 🔊 Respuesta por voz (Text-to-Speech)

---

## 🚀 Tecnologías Utilizadas

- 🎯 Reconocimiento de manos: MediaPipe  
- 🧠 Modelo de lenguaje: OpenAI (gpt-4o-mini)  
- 🎙 Speech Recognition & Speech Synthesis: Web Speech API  
- 🌐 JavaScript ES Modules  
- 📦 CDN: jsDelivr  

---

## 📂 Arquitectura del Proyecto

El sistema está dividido en tres módulos principales:

---

### 1️⃣ Reconocimiento de Gestos (MediaPipe)

- Captura video desde la cámara.
- Detecta landmarks de la mano.
- Interpreta gestos específicos.
- Envía el comando al `CommandController`.

#### ✋ Gestos soportados

| Gesto | Acción |
|-------|--------|
| 👍 Pulgar arriba | avanzar |
| 🤙 Shaka | retroceder |
| ✋ Palma abierta | detener |
| 👉 Índice derecha | vuelta derecha |
| 👈 Índice izquierda | vuelta izquierda |
| ✌ Inclinación derecha | 90° derecha |
| ✌ Inclinación izquierda | 90° izquierda |
| 👌 OK derecha | 360° derecha |
| 👌 OK izquierda | 360° izquierda |

Incluye:
- Confirmación de gesto (600 ms)
- Cooldown anti-repetición
- Modo suspendido tras inactividad

---

### 2️⃣ Control por Voz (COSMO)

- Reconocimiento continuo en español (`es-ES`)
- Palabra clave para despertar: **“COSMO”**
- Interpretación de comandos mediante modelo `gpt-4o-mini`
- Conversión de texto a voz
- Sistema de suspensión automática tras 5 segundos de inactividad

El modelo está configurado para devolver **únicamente uno de los comandos válidos** o:
