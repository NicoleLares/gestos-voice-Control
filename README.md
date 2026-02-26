# 🤖 COSMO – Sistema de Control por Voz y Gestos

COSMO es un sistema de control multimodal que permite manejar un robot (WANDA) mediante **gestos de mano** y **comandos de voz** en español.

---

## 🚀 Características

- 🖐 Reconocimiento de gestos con MediaPipe
- 🎙 Reconocimiento de voz (Web Speech API)
- 🧠 Interpretación inteligente con OpenAI
- 🔊 Respuesta por voz (Text-to-Speech)
- 🎛 Control centralizado de comandos
- 💤 Sistema de suspensión automática
- 🔁 Cooldown anti-repetición

---

## 🏗 Arquitectura

El sistema se divide en tres módulos principales:

### 1️⃣ Gestos (MediaPipe)

- Captura de cámara
- Detección de landmarks de la mano
- Reconocimiento de gestos
- Envío de comandos al controlador central

Gestos soportados:

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

---

### 2️⃣ Voz (COSMO)

- Reconocimiento continuo en español (`es-ES`)
- Palabra clave de activación: **COSMO**
- Interpretación con modelo `gpt-4o-mini`
- Corrección semántica de sinónimos
- Conversión de texto a voz

Si no reconoce el comando devuelve:

```
Orden no reconocida
```

---

### 3️⃣ CommandController

Objeto global que:

- Unifica comandos de voz y gestos
- Evita spam con cooldown
- Evita repetición consecutiva
- Permite integrar backend o robot real

Ejemplo futuro:

```js
function enviarAlRobot(command) {
  // WebSocket / HTTP / Serial
}
```

---

## 🔑 API Key

La API Key se obtiene dinámicamente desde un servicio externo (MockAPI).

⚠️ En producción se recomienda:
- No exponer claves en frontend
- Usar backend seguro
- Implementar autenticación

---

## 🧠 Flujo del Sistema

```
Gestos  ─┐
         ├──> CommandController ───> Robot / Backend
Voz     ─┘
```

---

## 🛠 Cómo Ejecutarlo

1. Servir el proyecto en un servidor local (ej: Live Server).
2. Permitir acceso a cámara y micrófono.
3. Esperar presentación inicial de COSMO.
4. Controlar mediante voz o gestos.

---

## 🔮 Mejoras Futuras

- Conexión real con robot
- Dashboard de monitoreo
- Historial de comandos
- Soporte multiusuario
- Integración con hardware (Arduino / ESP32)

---

## 👨‍💻 Autor

Proyecto de control multimodal con Inteligencia Artificial.