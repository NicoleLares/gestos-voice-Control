// ===============================
// CONTROLADOR CENTRAL GLOBAL
// ===============================

window.CommandController = {

    lastExecution: 0,
    lastCommand: null,
    COOLDOWN: 800, // evita spam de gestos

    execute(command, source) {

        const now = Date.now();

        // Evita ejecución muy seguida
        if (now - this.lastExecution < this.COOLDOWN) return;

        // Evita repetir mismo comando consecutivo
        if (command === this.lastCommand) return;

        this.lastExecution = now;
        this.lastCommand = command;

        console.log(`Comando recibido desde ${source}: ${command}`);

        // Mostrar en pantalla (control global)
        const globalDisplay = document.getElementById("globalCommand");
        if (globalDisplay) {
            globalDisplay.innerText = `${command} (${source})`;
        }

        // 🔥 AQUÍ iría conexión con robot real o backend
        // ejemplo:
        // enviarAlRobot(command);
    }
};