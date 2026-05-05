// ─────────────────────────────────────────────────────────────
// js/acciones/movimiento.js  —  Escucha de comandos de texto
//
// configurarMovimientoPorComando() registra un listener en el <input> de
// la consola para que, al pulsar Enter, se intente procesar el texto como
// un comando de juego. Los comandos se procesan en orden de prioridad:
//   1. equipar  → equipar un objeto del inventario.
//   2. vender   → vender un objeto al mercader.
//   3. comprar  → comprar poción en la tienda.
//   4. pocion   → usar una poción de salud.
//   5. ataque   → atacar al enemigo en combate.
//   6. victoria → activar la secuencia de victoria final.
//   7. movimiento → desplazarse a otra sala.
// Si hay combate activo y el texto no es un comando reconocido, se bloquea
// el movimiento hasta que el combate termine.
// ─────────────────────────────────────────────────────────────

import { mapa, idSalas, estadoCombate, normalizarComando, obtenerDestinoPorComando, actualizarHistorial, obtenerSalaActualId } from './shared.js';
import { procesarComandoEquipar, procesarComandoVender } from './equipamiento.js';
import { procesarComandoAtaque, procesarComandoVictoria } from './combate.js';
import { procesarComandoPocion } from './pociones.js';
import { procesarComandoComprarPocion } from './tienda.js';

// configurarMovimientoPorComando: registra el listener de tecla Enter en el
// input de la consola. Esta función se llama una sola vez al iniciar la pantalla.
export function configurarMovimientoPorComando() {
    const inputComando = document.getElementById('comando');

    // Obtenemos la sala actual para poder calcular movimientos.
    const salaId = obtenerSalaActualId();
    const sala = mapa[salaId];

    if (!inputComando || !sala) return;

    inputComando.addEventListener('keydown', (event) => {
        // Solo actuamos cuando se pulsa la tecla Enter.
        if (event.key !== 'Enter') return;

        // Evitamos que Enter envíe un formulario o haga scroll.
        event.preventDefault();

        // ── 1. Comando equipar ──────────────────────────────────────
        if (procesarComandoEquipar(inputComando.value)) {
            inputComando.value = '';
            return;
        }

        // ── 2. Comando vender ──────────────────────────────────────
        if (procesarComandoVender(inputComando.value)) {
            inputComando.value = '';
            return;
        }

        // ── 3. Comando comprar (poción en la tienda) ─────────────────
        if (procesarComandoComprarPocion(inputComando.value)) {
            inputComando.value = '';
            return;
        }

        // ── 4. Comando poción (usar poción de salud) ────────────────
        if (procesarComandoPocion(inputComando.value)) {
            inputComando.value = '';
            return;
        }

        // ── 5. Comando ataque (durante el combate) ─────────────────
        if (procesarComandoAtaque(inputComando.value)) {
            inputComando.value = '';
            return;
        }

        // ── 6. Comando victoria (final del juego) ─────────────────
        if (procesarComandoVictoria(inputComando.value)) {
            inputComando.value = '';
            return;
        }

        // ── 7. Bloqueo durante combate ───────────────────────────
        // Si hay un combate activo y el texto no era ninguno de los comandos
        // anteriores, informamos al jugador y no movemos.
        if (estadoCombate.activo) {
            actualizarHistorial('Estas en combate. Usa "ataque" u otros comandos de combate.');
            inputComando.value = '';
            return;
        }

        // ── 8. Movimiento de sala ──────────────────────────────
        // El texto no era un comando especial: intentámoslo interpretar como
        // una dirección (norte, sur…) o el nombre de una sala.
        const comandoNormalizado = normalizarComando(inputComando.value);
        const destinoId = obtenerDestinoPorComando(sala, comandoNormalizado);

        // Manejamos los posibles resultados de obtenerDestinoPorComando.
        if (destinoId === null) {
            actualizarHistorial(`No entiendo el comando "${inputComando.value}".`);
            return;
        }
        if (destinoId === -1) {
            actualizarHistorial('Te has topado con una pared amigo, no estas en Hogwarts rey.');
            return;
        }

        if (destinoId === 'ambigua') {
            actualizarHistorial('Hay varias salidas con ese nombre. Usa norte, sur, este u oeste.');
            return;
        }

        if (!comandoNormalizado) {
            actualizarHistorial('Escribe una direccion o una sala antes de moverte.');
            return;
        }

        // Tenemos un destino válido: navegamos a la nueva sala cambiando la URL.
        if (destinoId && destinoId !== 'ambigua' && destinoId !== -1) {
            actualizarHistorial(`Te mueves hacia ${inputComando.value}.`);
            inputComando.value = '';
            // La navegación recarga la página con el nuevo id de sala en la URL.
            window.location.href = `${window.location.pathname}?id=${destinoId}`;
        }
    });
}
