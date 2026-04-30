import { actualizarHistorial } from './shared.js';

function cerrarPanelMapa() {
    const panel = document.getElementById('panelMapa');
    if (panel) {
        panel.hidden = true;
    }
}

function renderizarPanelMapa() {
    const fondoSala = document.querySelector('.fondoSala');
    if (!fondoSala) {
        return;
    }

    let panel = document.getElementById('panelMapa');
    if (!panel) {
        panel = document.createElement('section');
        panel.id = 'panelMapa';
        panel.className = 'panelMapa';
        panel.hidden = true;
        fondoSala.appendChild(panel);
    }

    panel.innerHTML = `
        <div class="panelMapaCabecera">
            <h3>Mapa de la Mazmorra</h3>
            <button id="btn-cerrar-mapa" class="boton-azul">Cerrar</button>
        </div>
        <div class="panelMapaContenido">
            <img src="../img/mapa.jpg" alt="Mapa de la mazmorra" class="imagenMapaMazmorra">
        </div>
    `;

    const btnCerrar = panel.querySelector('#btn-cerrar-mapa');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarPanelMapa);
    }
}

export function configurarBotonMapa() {
    const btnMapa = document.getElementById('btn-mapa');

    if (!btnMapa) {
        return;
    }

    btnMapa.addEventListener('click', () => {
        renderizarPanelMapa();

        const panel = document.getElementById('panelMapa');
        if (panel) {
            panel.hidden = false;
        }

        actualizarHistorial('Has abierto el mapa de la mazmorra.');
    });
}
