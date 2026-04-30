import { mapa, personajes, obtenerSalaActualId, actualizarHistorial } from './shared.js';
import { actualizarOroUI } from './uiHeroe.js';

export function configurarBotonBuscar() {
    const btnBuscar = document.getElementById('btn-buscar');

    const salaId = obtenerSalaActualId();
    const sala = mapa[salaId];

    if (!btnBuscar || !sala) return;

    let yaBusco = false;

    btnBuscar.addEventListener('click', () => {
        if (yaBusco) {
            actualizarHistorial('Ya has buscado en esta sala.');
            return;
        }

        yaBusco = true;
        const oroEncontrado = sala.encontrarOro ?? 0;

        if (oroEncontrado > 0) {
            personajes.jugador.oro += oroEncontrado;
            actualizarHistorial(`Has encontrado ${oroEncontrado} monedas de oro. Total: ${personajes.jugador.oro}`);
            actualizarOroUI();
        } else {
            actualizarHistorial('No has encontrado nada en esta sala.');
        }
    });
}
