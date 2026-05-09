// ─────────────────────────────────────────────────────────────
// js/acciones/comandosPanel.js  —  Panel de ayuda de comandos
//
// Muestra un modal superpuesto dentro de .fondoSala con la lista de
// comandos de texto y acciones rápidas disponibles durante la partida.
// ─────────────────────────────────────────────────────────────

import { actualizarHistorial } from './shared.js';

function cerrarPanelComandos() {
    const panel = document.getElementById('panelComandos');
    if (panel) {
        panel.hidden = true;
    }
}

function renderizarPanelComandos() {
    const fondoSala = document.querySelector('.fondoSala');
    if (!fondoSala) {
        return;
    }

    let panel = document.getElementById('panelComandos');
    if (!panel) {
        panel = document.createElement('section');
        panel.id = 'panelComandos';
        panel.className = 'panelComandos';
        panel.hidden = true;
        fondoSala.appendChild(panel);
    }

    panel.innerHTML = `
        <div class="panelComandosCabecera">
            <h3>Comandos de Juego</h3>
            <button id="btn-cerrar-comandos" class="boton-azul">Cerrar</button>
        </div>

        <div class="panelComandosContenido">
            <article class="panelComandosBloque">
                <h4>Movimiento</h4>
                <ul>
                    <li><code>norte</code>, <code>sur</code>, <code>este</code>, <code>oeste</code></li>
                    <li><code>arriba</code>, <code>abajo</code>, <code>derecha</code>, <code>izquierda</code></li>
                    <li><code>ir norte</code> (acepta prefijo <code>ir</code>)</li>
                    <li><code>entrada</code>, <code>tienda</code>, <code>sala1</code> ...</li>
                </ul>
            </article>

            <article class="panelComandosBloque">
                <h4>Combate</h4>
                <ul>
                    <li><code>ataque</code>: golpea al enemigo en tu turno</li>
                    <li><code>victoria</code>: comando final tras derrotar a Lilith</li>
                </ul>
            </article>

            <article class="panelComandosBloque">
                <h4>Inventario y equipo</h4>
                <ul>
                    <li><code>pocion</code>, <code>usar pocion</code>, <code>tomar pocion</code>, <code>beber pocion</code></li>
                    <li><code>equipar nombre-del-objeto</code></li>
                    <li><code>vender nombre-del-objeto</code> (solo en tienda)</li>
                </ul>
            </article>

            <article class="panelComandosBloque">
                <h4>Tienda</h4>
                <ul>
                    <li><code>comprar</code> o <code>comprar pocion</code> (solo en tienda)</li>
                    <li>Boton <strong>Comprar</strong> para abrir la tienda completa</li>
                </ul>
            </article>
        </div>
    `;

    const btnCerrar = panel.querySelector('#btn-cerrar-comandos');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarPanelComandos);
    }
}

export function configurarBotonComandos() {
    const btnComandos = document.getElementById('btn-comandos');

    if (!btnComandos) {
        return;
    }

    btnComandos.addEventListener('click', () => {
        renderizarPanelComandos();

        const panel = document.getElementById('panelComandos');
        if (panel) {
            panel.hidden = false;
        }

        actualizarHistorial('Has abierto el panel de comandos.');
    });
}
