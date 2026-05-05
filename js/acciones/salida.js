// ─────────────────────────────────────────────────────────────
// js/acciones/salida.js  —  Botón "Abandonar cueva"
//
// Cuando el jugador pulsa este botón, se reinicia su estado completo
// (pierde todo el progreso) y se le redirige a la sala de entrada.
// Es el equivalente a un "Game Over" voluntario o una rendición.
// ─────────────────────────────────────────────────────────────

import { idSalas, reiniciarEstadoJugador } from './shared.js';

// configurarBotonAbandonar: registra el listener del botón "Abandonar cueva".
export function configurarBotonAbandonar() {
    const btnAbandonar = document.getElementById('btn-abandonar');

    // Si el botón no existe en el DOM actual, salimos sin error.
    if (!btnAbandonar) {
        return;
    }

    btnAbandonar.addEventListener('click', () => {
        // Borramos todo el progreso del jugador y lo reiniciamos al estado inicial.
        reiniciarEstadoJugador();

        // Redirigimos a la sala de entrada usando el sistema de ids en la URL.
        // window.location.pathname es la ruta actual (p.ej. /DWEC-JuegoROL-Tarea6/salas/entrada.html).
        window.location.href = `${window.location.pathname}?id=${idSalas.entrada}`;
    });
}
