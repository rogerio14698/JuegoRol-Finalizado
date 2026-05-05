// ─────────────────────────────────────────────────────────────
// js/acciones/busqueda.js  —  Botón "Buscar"
//
// Permite al jugador buscar oro en la sala actual.
// Solo puede buscar UNA VEZ por visita (la variable yaBusco lo controla).
// La cantidad de oro encontrada viene del campo encontrarOro de la sala en mapa.js.
// ─────────────────────────────────────────────────────────────

import { mapa, personajes, obtenerSalaActualId, actualizarHistorial } from './shared.js';
import { actualizarOroUI } from './uiHeroe.js';

// configurarBotonBuscar: registra el listener del botón "Buscar" en la consola.
// Se llama una vez al iniciar la pantalla, después de renderizar los templates.
export function configurarBotonBuscar() {
    // Buscamos el botón en el DOM (existe dentro del template de la consola).
    const btnBuscar = document.getElementById('btn-buscar');

    // Obtenemos el id de la sala en la que está el jugador ahora mismo (?id= de la URL).
    const salaId = obtenerSalaActualId();
    const sala = mapa[salaId];

    // Si no existe el botón o la sala no está en el mapa, salimos sin hacer nada.
    if (!btnBuscar || !sala) return;

    // yaBusco es una variable local que recuerda si el jugador ya buscó en ESTA carga de sala.
    // Se resetea cada vez que el jugador entra a una sala nueva (porque se recarga la página).
    let yaBusco = false;

    btnBuscar.addEventListener('click', () => {
        // Si ya buscó antes en esta sala, no hacemos nada más.
        if (yaBusco) {
            actualizarHistorial('Ya has buscado en esta sala.');
            return;
        }

        // Marcamos que ya buscó para impedir una segunda búsqueda.
        yaBusco = true;

        // Leemos cuánto oro puede encontrarse en esta sala.
        // El operador ?? 0 significa: "si encontrarOro es undefined, usa 0".
        const oroEncontrado = sala.encontrarOro ?? 0;

        if (oroEncontrado > 0) {
            // Sumamos el oro encontrado al total del jugador.
            personajes.jugador.oro += oroEncontrado;
            actualizarHistorial(`Has encontrado ${oroEncontrado} monedas de oro. Total: ${personajes.jugador.oro}`);
            // Actualizamos el texto del oro en el HUD del héroe.
            actualizarOroUI();
        } else {
            actualizarHistorial('No has encontrado nada en esta sala.');
        }
    });
}
