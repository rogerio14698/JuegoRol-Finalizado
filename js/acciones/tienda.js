// ─────────────────────────────────────────────────────────────
// js/acciones/tienda.js  —  Tienda del Mercader
//
// Gestiona el panel de compra que aparece cuando el jugador está en la sala
// "tienda" y hace clic en "Comprar" o escribe "comprar" en la consola.
// También permite comprar pociones directamente por texto.
// ─────────────────────────────────────────────────────────────

import { idSalas, personajes, obtenerSalaActualId, actualizarHistorial, normalizarTextoConEspacios } from './shared.js';
import { actualizarInventarioUI, actualizarOroUI } from './uiHeroe.js';

// Precio fijo de una poción cuando se compra por comando de texto.
const PRECIO_POCION = 5;

// parsearItemVendedor: convierte un item del inventario del vendedor al formato
// interno del juego. El vendedor puede tener items en dos formatos:
//   - String: "Poción:5" (nombre:precio).
//   - Objeto: {nombre, precio, cantidad, tipo, ...} (formato completo).
// Devuelve un objeto normalizado o null si el item es inválido.
export function parsearItemVendedor(item) {
    if (typeof item === 'string') {
        // Formato string: dividimos por ':' para separar nombre y precio.
        const [nombreRaw, precioRaw] = item.split(':');
        const nombre = (nombreRaw || '').trim();
        const precio = Number.parseInt((precioRaw || '').trim(), 10);

        // Validamos que nombre y precio sean válidos.
        if (!nombre || Number.isNaN(precio) || precio <= 0) {
            return null;
        }

        return { nombre, precio, cantidad: 1, tipo: 'consumible' };
    }

    if (!item || typeof item !== 'object') {
        return null;
    }

    // Formato objeto: extraemos y validamos cada campo.
    const nombre = String(item.nombre || '').trim();
    const precio = Number.parseInt(item.precio, 10);
    const cantidad = item.cantidad === undefined ? 1 : Number.parseInt(item.cantidad, 10);

    if (!nombre || Number.isNaN(precio) || precio <= 0 || Number.isNaN(cantidad) || cantidad < 0) {
        return null;
    }

    // Spread para mantener propiedades extra del item (ataque, defensa, etc.).
    return {
        ...item,
        nombre,
        precio,
        cantidad,
    };
}

// cerrarPanelTienda: oculta el panel de la tienda con el atributo hidden.
export function cerrarPanelTienda() {
    const panel = document.getElementById('panelTienda');
    if (panel) {
        panel.hidden = true;
    }
}

// renderizarPanelTienda: crea o actualiza el panel de la tienda en el DOM.
// Lista todos los items del vendedor con su precio y stock.
// Registra botones de compra individuales para cada item.
export function renderizarPanelTienda() {
    const fondoSala = document.querySelector('.fondoSala');
    if (!fondoSala) {
        return;
    }

    // Creamos el panel si no existía previamente.
    let panel = document.getElementById('panelTienda');
    if (!panel) {
        panel = document.createElement('section');
        panel.id = 'panelTienda';
        panel.className = 'panelTienda';
        panel.hidden = true;
        fondoSala.appendChild(panel);
    }

    // Parseamos el inventario del vendedor y filtramos los items inválidos.
    const items = personajes.vendedor.inventario
        .map((item, indice) => {
            const itemParseado = parsearItemVendedor(item);
            // Guardamos el índice original para poder referenciar el item al comprar.
            return itemParseado ? { ...itemParseado, indice } : null;
        })
        .filter(Boolean);  // Eliminamos los null.

    // Si no hay items disponibles, mostramos un mensaje alternativo.
    const htmlItems = items.length === 0
        ? '<p class="fuenteParrafo">El mercader no tiene articulos disponibles.</p>'
        : items.map((item) => `
            <article class="itemTienda ${item.cantidad === 0 ? 'itemTiendaAgotado' : ''}">
                <div>
                    <p class="itemTiendaNombre">${item.nombre}</p>
                    <p class="itemTiendaPrecio">${item.precio} de oro</p>
                    <p class="fuenteParrafo">${item.tipo === 'arma' ? `Ataque: ${item.ataque ?? 0} | Fuerza: ${item.fuerza ?? 0}` : ''}${item.tipo === 'escudo' ? `Defensa: ${item.defensa ?? 0} | Vida: ${item.vida ?? 0}` : ''}</p>
                    <p class="fuenteParrafo">Stock: ${item.cantidad}</p>
                </div>
                <button class="boton-verde" data-indice="${item.indice}" ${item.cantidad === 0 ? 'disabled' : ''}>${item.cantidad === 0 ? 'Agotado' : 'Comprar'}</button>
            </article>
        `).join('');

    // Generamos el HTML completo del panel.
    panel.innerHTML = `
        <div class="panelTiendaCabecera">
            <h3>Tienda del Mercader</h3>
            <button id="btn-cerrar-tienda" class="boton-azul">Cerrar</button>
        </div>
        <div class="panelTiendaItems">${htmlItems}</div>
        <div class="panelTiendaPie">
            <p class="fuenteParrafo">Tu oro actual: <strong>${personajes.jugador.oro}</strong></p>
        </div>
    `;

    // Registramos el botón de cerrar.
    const btnCerrar = panel.querySelector('#btn-cerrar-tienda');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarPanelTienda);
    }

    // Registramos un listener por cada botón "Comprar" de cada item.
    panel.querySelectorAll('button[data-indice]').forEach((botonCompra) => {
        botonCompra.addEventListener('click', () => {
            // Obtenemos el índice del item en el inventario del vendedor desde el atributo data-indice.
            const indiceItem = Number.parseInt(botonCompra.dataset.indice || '-1', 10);
            const itemOriginal = personajes.vendedor.inventario[indiceItem];
            const itemActual = parsearItemVendedor(itemOriginal);

            // Validaciones antes de proceder con la compra.
            if (!itemActual) {
                actualizarHistorial('No se pudo completar la compra del articulo seleccionado.');
                return;
            }

            const nombreItem = itemActual.nombre;
            const precioItem = itemActual.precio;

            if (itemActual.cantidad <= 0) {
                actualizarHistorial(`${nombreItem} esta agotado en la tienda.`);
                return;
            }

            if (personajes.jugador.oro < precioItem) {
                actualizarHistorial(`No tienes oro suficiente para comprar ${nombreItem}.`);
                return;
            }

            // Ejecutamos la compra: descontamos oro y añadimos al inventario del jugador.
            personajes.jugador.oro -= precioItem;
            personajes.jugador.inventario.push({ ...itemActual, cantidad: 1 });

            // Reducimos el stock del item en el inventario del vendedor.
            if (itemOriginal && typeof itemOriginal === 'object' && Number.isInteger(itemOriginal.cantidad)) {
                itemOriginal.cantidad = Math.max(0, itemOriginal.cantidad - 1);
            }

            // Actualizamos la interfaz.
            actualizarOroUI();
            actualizarInventarioUI();
            actualizarHistorial(`Has comprado ${nombreItem} por ${precioItem} de oro. Stock restante: ${Math.max(0, itemActual.cantidad - 1)}.`);

            // Volvemos a renderizar la tienda para reflejar el nuevo stock.
            renderizarPanelTienda();
        });
    });
}

// configurarBotonComprar: registra el listener del botón "Comprar" en la consola.
// Solo funciona si el jugador está actualmente en la sala tienda.
export function configurarBotonComprar() {
    const btnComprar = document.getElementById('btn-comprar');

    if (!btnComprar) {
        return;
    }

    btnComprar.addEventListener('click', () => {
        const salaId = obtenerSalaActualId();

        // Si el jugador no está en la tienda, le avisamos y no abrimos el panel.
        if (salaId !== idSalas.tienda) {
            actualizarHistorial('Solo puedes comprar cuando estes dentro de la tienda.');
            return;
        }

        renderizarPanelTienda();
        const panel = document.getElementById('panelTienda');
        if (panel) {
            panel.hidden = false;
        }
        actualizarHistorial('Has abierto la tienda del mercader.');
    });
}

// procesarComandoComprarPocion: alternativa de texto para comprar una poción.
// Si el jugador escribe "comprar" o "comprar pocion" en la consola, se intenta
// comprar una poción directamente sin abrir el panel gráfico.
// Devuelve true si el comando fue reconocido (aunque la compra falle por falta de oro).
export function procesarComandoComprarPocion(comandoCrudo) {
    const comando = normalizarTextoConEspacios(comandoCrudo);
    const comandosCompra = ['comprar pocion', 'comprar'];

    if (!comandosCompra.includes(comando)) {
        return false;  // El texto no es un comando de compra.
    }

    // Solo se puede comprar si el jugador está en la sala tienda.
    const salaId = obtenerSalaActualId();
    if (salaId !== idSalas.tienda) {
        return false;
    }

    const jugador = personajes.jugador;

    // Verificamos que el jugador tenga oro suficiente.
    if (jugador.oro < PRECIO_POCION) {
        actualizarHistorial(`No tienes oro suficiente para comprar una pocion. Necesitas ${PRECIO_POCION} de oro.`);
        return true;  // El comando fue reconocido aunque no se pudo ejecutar.
    }

    // Descontamos el oro del jugador.
    jugador.oro -= PRECIO_POCION;

    // Buscamos si ya tiene pociones en el inventario para acumular cantidad.
    const indicePocion = jugador.inventario.findIndex(
        (item) => item && typeof item === 'object' && item.tipo === 'consumible' && normalizarTextoConEspacios(String(item.nombre || '')) === 'pocion'
    );

    if (indicePocion !== -1) {
        // Ya existía un slot de poción: incrementamos la cantidad.
        jugador.inventario[indicePocion].cantidad = (Number.parseInt(jugador.inventario[indicePocion].cantidad, 10) || 0) + 1;
    } else {
        // No había pociones: creamos un nuevo slot en el inventario.
        jugador.inventario.push({ nombre: 'Pocion', tipo: 'consumible', cantidad: 1 });
    }

    actualizarOroUI();
    actualizarInventarioUI();
    actualizarHistorial(`Has comprado una pocion por ${PRECIO_POCION} de oro. Oro restante: ${jugador.oro}.`);
    return true;
}
