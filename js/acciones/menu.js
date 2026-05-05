// ─────────────────────────────────────────────────────────────
// js/acciones/menu.js  —  Panel de inventario y estadísticas (Menu)
//
// Muestra un panel superpuesto con tres columnas:
//   1. Estadísticas del héroe (salud, ataque, fuerza, defensa, oro, nivel).
//   2. Equipo equipado (arma y escudo con desglose de bonificadores).
//   3. Consumibles en el inventario (pociones, etc.) con cantidades.
// Todos los datos se leen en tiempo real de personajes.jugador.
// ─────────────────────────────────────────────────────────────

import { personajes, actualizarHistorial } from './shared.js';

// cerrarPanelMenu (privada): oculta el panel usando el atributo hidden.
function cerrarPanelMenu() {
    const panel = document.getElementById('panelMenu');
    if (panel) {
        panel.hidden = true;
    }
}

// etiquetaSlot (privada): genera el HTML para mostrar un slot de equipo.
// Si item es null (sin equipar), devuelve un texto de marcador de posición.
// Si hay item, muestra el nombre y los bonificadores relevantes.
function etiquetaSlot(item) {
    if (!item) return '<span class="menuSlotVacio">— Sin equipar —</span>';

    // Construimos el array de stats que tiene el item (solo los que son distintos de 0).
    const stats = [];
    if (item.ataque) stats.push(`ATQ +${item.ataque}`);
    if (item.fuerza) stats.push(`FUE +${item.fuerza}`);
    if (item.defensa) stats.push(`DEF +${item.defensa}`);
    if (item.vida) stats.push(`VID +${item.vida}`);

    return `<span class="menuSlotNombre">${item.nombre}</span><span class="menuSlotStats">${stats.join(' \u00b7 ')}</span>`;
}

// renderizarPanelMenu (privada): crea el panel si no existe y rellena su HTML
// con los datos actuales del jugador. Se llama cada vez que se abre el menú
// para garantizar que los datos estén actualizados.
function renderizarPanelMenu() {
    const fondoSala = document.querySelector('.fondoSala');
    if (!fondoSala) return;

    // Si el panel ya existe lo reutilizamos; si no, lo creamos y lo añadimos al DOM.
    let panel = document.getElementById('panelMenu');
    if (!panel) {
        panel = document.createElement('section');
        panel.id = 'panelMenu';
        panel.className = 'panelMenu';
        panel.hidden = true;  // Empieza oculto.
        fondoSala.appendChild(panel);
    }

    const jugador = personajes.jugador;
    // atributosBase guarda los valores sin bonificadores de equipo.
    const base = jugador.atributosBase ?? {};
    const arma = jugador.equipado?.arma;       // Puede ser null si no hay arma equipada.
    const escudo = jugador.equipado?.escudo;   // Puede ser null si no hay escudo equipado.

    // Calculamos la salud máxima: salud base + bonus de vida del escudo.
    const saludMax = (base.salud ?? jugador.salud) + (escudo?.vida ?? 0);

    // Filtramos solo los consumibles del inventario (pociones, etc.).
    const consumibles = (jugador.inventario ?? []).filter(i => i.tipo === 'consumible');

    // Generamos el HTML de la lista de consumibles o el mensaje "Sin consumibles".
    const filasConsumo = consumibles.length
        ? consumibles.map(i => `<li>${i.nombre} <span class="menuSlotStats">x${i.cantidad}</span></li>`).join('')
        : '<li class="menuSlotVacio">Sin consumibles</li>';

    // Inyectamos el HTML completo del panel con las tres secciones.
    panel.innerHTML = `
        <div class="panelMenuCabecera">
            <h3>Inventario y Estadísticas</h3>
            <button id="btn-cerrar-menu" class="boton-azul">Cerrar</button>
        </div>
        <div class="panelMenuCuerpo">

            <section class="panelMenuBloque">
                <h4 class="panelMenuSubtitulo">Estadísticas del héroe</h4>
                <ul class="panelMenuStats">
                    <li><span class="menuStatEtiqueta">Nombre</span><span>${jugador.nombre}</span></li>
                    <li><span class="menuStatEtiqueta">Salud</span><span>${jugador.salud} / ${saludMax}</span></li>
                    <li><span class="menuStatEtiqueta">Ataque</span><span>${jugador.ataque} <small>(base ${base.ataque ?? '—'})</small></span></li>
                    <li><span class="menuStatEtiqueta">Fuerza</span><span>${jugador.fuerza} <small>(base ${base.fuerza ?? '—'})</small></span></li>
                    <li><span class="menuStatEtiqueta">Defensa</span><span>${jugador.defensa} <small>(base ${base.defensa ?? '—'})</small></span></li>
                    <li><span class="menuStatEtiqueta">Oro</span><span>${jugador.oro}</span></li>
                    <li><span class="menuStatEtiqueta">Nivel</span><span>${jugador.nivel}</span></li>
                </ul>
            </section>

            <section class="panelMenuBloque">
                <h4 class="panelMenuSubtitulo">Equipo</h4>
                <ul class="panelMenuEquipo">
                    <li class="menuSlot">
                        <span class="menuSlotTipo">⚔ Arma</span>
                        <div class="menuSlotDetalle">${etiquetaSlot(arma)}</div>
                    </li>
                    <li class="menuSlot">
                        <span class="menuSlotTipo">🛡 Escudo</span>
                        <div class="menuSlotDetalle">${etiquetaSlot(escudo)}</div>
                    </li>
                </ul>
            </section>

            <section class="panelMenuBloque">
                <h4 class="panelMenuSubtitulo">Consumibles</h4>
                <ul class="panelMenuConsumo">${filasConsumo}</ul>
            </section>

        </div>
    `;

    // Registramos el botón de cerrar que acaba de ser creado dentro del innerHTML.
    panel.querySelector('#btn-cerrar-menu').addEventListener('click', cerrarPanelMenu);
}

// configurarBotonMenu: registra el listener del botón "Menu" en la consola.
export function configurarBotonMenu() {
    const btnMenu = document.getElementById('btn-menu');
    if (!btnMenu) return;

    btnMenu.addEventListener('click', () => {
        // Cada vez que se abre, regeneramos el panel con los datos más recientes.
        renderizarPanelMenu();

        const panel = document.getElementById('panelMenu');
        if (panel) {
            panel.hidden = false;  // Mostramos el panel quitando el atributo hidden.
        }

        actualizarHistorial('Has abierto el inventario.');
    });
}
