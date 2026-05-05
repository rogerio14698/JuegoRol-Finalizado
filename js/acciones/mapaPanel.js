// ─────────────────────────────────────────────────────────────
// js/acciones/mapaPanel.js  —  Panel "Mapa de la Mazmorra"
//
// Crea y gestiona el panel superpuesto con la imagen del mapa cuando
// el jugador hace clic en el botón "Mapa".
// El panel se inserta dentro de .fondoSala la primera vez y después
// solo se muestra/oculta con el atributo hidden.
// ─────────────────────────────────────────────────────────────

import { actualizarHistorial } from './shared.js';

// cerrarPanelMapa (privada): oculta el panel del mapa usando el atributo hidden.
function cerrarPanelMapa() {
    const panel = document.getElementById('panelMapa');
    if (panel) {
        panel.hidden = true;
    }
}

// renderizarPanelMapa (privada): crea el panel del mapa si todavía no existe en el DOM.
// Si ya existe, solo actualiza su contenido HTML (idempotente).
// Lo inserta dentro de .fondoSala para que el z-index lo superponga a la sala.
function renderizarPanelMapa() {
    // Necesitamos .fondoSala como contenedor padre del panel.
    const fondoSala = document.querySelector('.fondoSala');
    if (!fondoSala) {
        return;
    }

    // Buscamos si el panel ya fue creado antes en esta sesión.
    let panel = document.getElementById('panelMapa');
    if (!panel) {
        // Primera vez: creamos el elemento <section> y lo añadimos al DOM.
        panel = document.createElement('section');
        panel.id = 'panelMapa';
        panel.className = 'panelMapa';
        panel.hidden = true;  // Empieza oculto; se mostrará después.
        fondoSala.appendChild(panel);
    }

    // Rellenamos el HTML interior con la cabecera y la imagen del mapa.
    panel.innerHTML = `
        <div class="panelMapaCabecera">
            <h3>Mapa de la Mazmorra</h3>
            <button id="btn-cerrar-mapa" class="boton-azul">Cerrar</button>
        </div>
        <div class="panelMapaContenido">
            <img src="../img/mapa.jpg" alt="Mapa de la mazmorra" class="imagenMapaMazmorra">
        </div>
    `;

    // Registramos el botón de cerrar que acabamos de crear dentro del HTML.
    const btnCerrar = panel.querySelector('#btn-cerrar-mapa');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarPanelMapa);
    }
}

// configurarBotonMapa: registra el listener del botón "Mapa" en la consola.
export function configurarBotonMapa() {
    const btnMapa = document.getElementById('btn-mapa');

    if (!btnMapa) {
        return;
    }

    btnMapa.addEventListener('click', () => {
        // Primero creamos/actualizamos el panel (si ya existe, actualiza el HTML).
        renderizarPanelMapa();

        // Luego lo mostramos quitando el atributo hidden.
        const panel = document.getElementById('panelMapa');
        if (panel) {
            panel.hidden = false;
        }

        actualizarHistorial('Has abierto el mapa de la mazmorra.');
    });
}
