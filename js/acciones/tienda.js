import { idSalas, personajes, obtenerSalaActualId, actualizarHistorial, normalizarTextoConEspacios } from './shared.js';
import { actualizarInventarioUI, actualizarOroUI } from './uiHeroe.js';

const PRECIO_POCION = 5;

export function parsearItemVendedor(item) {
    if (typeof item === 'string') {
        const [nombreRaw, precioRaw] = item.split(':');
        const nombre = (nombreRaw || '').trim();
        const precio = Number.parseInt((precioRaw || '').trim(), 10);

        if (!nombre || Number.isNaN(precio) || precio <= 0) {
            return null;
        }

        return { nombre, precio, cantidad: 1, tipo: 'consumible' };
    }

    if (!item || typeof item !== 'object') {
        return null;
    }

    const nombre = String(item.nombre || '').trim();
    const precio = Number.parseInt(item.precio, 10);
    const cantidad = item.cantidad === undefined ? 1 : Number.parseInt(item.cantidad, 10);

    if (!nombre || Number.isNaN(precio) || precio <= 0 || Number.isNaN(cantidad) || cantidad < 0) {
        return null;
    }

    return {
        ...item,
        nombre,
        precio,
        cantidad,
    };
}

export function cerrarPanelTienda() {
    const panel = document.getElementById('panelTienda');
    if (panel) {
        panel.hidden = true;
    }
}

export function renderizarPanelTienda() {
    const fondoSala = document.querySelector('.fondoSala');
    if (!fondoSala) {
        return;
    }

    let panel = document.getElementById('panelTienda');
    if (!panel) {
        panel = document.createElement('section');
        panel.id = 'panelTienda';
        panel.className = 'panelTienda';
        panel.hidden = true;
        fondoSala.appendChild(panel);
    }

    const items = personajes.vendedor.inventario
        .map((item, indice) => {
            const itemParseado = parsearItemVendedor(item);
            return itemParseado ? { ...itemParseado, indice } : null;
        })
        .filter(Boolean);

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

    const btnCerrar = panel.querySelector('#btn-cerrar-tienda');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarPanelTienda);
    }

    panel.querySelectorAll('button[data-indice]').forEach((botonCompra) => {
        botonCompra.addEventListener('click', () => {
            const indiceItem = Number.parseInt(botonCompra.dataset.indice || '-1', 10);
            const itemOriginal = personajes.vendedor.inventario[indiceItem];
            const itemActual = parsearItemVendedor(itemOriginal);

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

            personajes.jugador.oro -= precioItem;
            personajes.jugador.inventario.push({ ...itemActual, cantidad: 1 });

            if (itemOriginal && typeof itemOriginal === 'object' && Number.isInteger(itemOriginal.cantidad)) {
                itemOriginal.cantidad = Math.max(0, itemOriginal.cantidad - 1);
            }

            actualizarOroUI();
            actualizarInventarioUI();
            actualizarHistorial(`Has comprado ${nombreItem} por ${precioItem} de oro. Stock restante: ${Math.max(0, itemActual.cantidad - 1)}.`);
            renderizarPanelTienda();
        });
    });
}

export function configurarBotonComprar() {
    const btnComprar = document.getElementById('btn-comprar');

    if (!btnComprar) {
        return;
    }

    btnComprar.addEventListener('click', () => {
        const salaId = obtenerSalaActualId();

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

export function procesarComandoComprarPocion(comandoCrudo) {
    const comando = normalizarTextoConEspacios(comandoCrudo);
    const comandosCompra = ['comprar pocion', 'comprar'];

    if (!comandosCompra.includes(comando)) {
        return false;
    }

    const salaId = obtenerSalaActualId();
    if (salaId !== idSalas.tienda) {
        return false;
    }

    const jugador = personajes.jugador;

    if (jugador.oro < PRECIO_POCION) {
        actualizarHistorial(`No tienes oro suficiente para comprar una pocion. Necesitas ${PRECIO_POCION} de oro.`);
        return true;
    }

    jugador.oro -= PRECIO_POCION;

    const indicePocion = jugador.inventario.findIndex(
        (item) => item && typeof item === 'object' && item.tipo === 'consumible' && normalizarTextoConEspacios(String(item.nombre || '')) === 'pocion'
    );

    if (indicePocion !== -1) {
        jugador.inventario[indicePocion].cantidad = (Number.parseInt(jugador.inventario[indicePocion].cantidad, 10) || 0) + 1;
    } else {
        jugador.inventario.push({ nombre: 'Pocion', tipo: 'consumible', cantidad: 1 });
    }

    actualizarOroUI();
    actualizarInventarioUI();
    actualizarHistorial(`Has comprado una pocion por ${PRECIO_POCION} de oro. Oro restante: ${jugador.oro}.`);
    return true;
}
