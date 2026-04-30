import { mapa, idSalas, estadoCombate, normalizarComando, obtenerDestinoPorComando, actualizarHistorial, obtenerSalaActualId } from './shared.js';
import { procesarComandoEquipar, procesarComandoVender } from './equipamiento.js';
import { procesarComandoAtaque } from './combate.js';

export function configurarMovimientoPorComando() {
    const inputComando = document.getElementById('comando');

    const salaId = obtenerSalaActualId();
    const sala = mapa[salaId];

    if (!inputComando || !sala) return;

    inputComando.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;

        event.preventDefault();

        if (procesarComandoEquipar(inputComando.value)) {
            inputComando.value = '';
            return;
        }

        if (procesarComandoVender(inputComando.value)) {
            inputComando.value = '';
            return;
        }

        if (procesarComandoAtaque(inputComando.value)) {
            inputComando.value = '';
            return;
        }

        if (estadoCombate.activo) {
            actualizarHistorial('Estas en combate. Usa "ataque" u otros comandos de combate.');
            inputComando.value = '';
            return;
        }

        const comandoNormalizado = normalizarComando(inputComando.value);
        const destinoId = obtenerDestinoPorComando(sala, comandoNormalizado);

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

        if (destinoId && destinoId !== 'ambigua' && destinoId !== -1) {
            actualizarHistorial(`Te mueves hacia ${inputComando.value}.`);
            inputComando.value = '';
            window.location.href = `${window.location.pathname}?id=${destinoId}`;
        }
    });
}
