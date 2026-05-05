// ─────────────────────────────────────────────────────────────
// js/acciones/equipamiento.js  —  Comandos equipar y vender
//
// Procesa los comandos de texto "equipar <nombre>" y "vender <nombre>".
// Al equipar un objeto se recalculan los atributos del jugador con los
// bonificadores del nuevo equipo. Al vender se devuelve el objeto al
// mercader y el jugador recibe la mitad del precio original.
// ─────────────────────────────────────────────────────────────

import { idSalas, personajes, normalizarTextoConEspacios, actualizarHistorial, obtenerSalaActualId } from './shared.js';
import { inicializarSistemaEquipamiento, esItemEquipable, recalcularAtributosPorEquipo, actualizarAtributosHeroeUI, actualizarInventarioUI, ajustarSaludPorCambioDeEscudo } from './uiHeroe.js';
import { parsearItemVendedor, renderizarPanelTienda } from './tienda.js';

// obtenerPrecioVenta (privada): devuelve el precio al que se puede vender un objeto.
// La venta es siempre la mitad del precio de compra (mínimo 1 de oro).
function obtenerPrecioVenta(item) {
    return Math.max(1, Math.floor((item?.precio ?? 1) / 2));
}

// devolverItemAlMercader (privada): cuando el jugador vende un objeto,
// este vuelve al inventario del vendedor.
// Si el vendedor ya tiene ese objeto, aumenta su stock en 1.
// Si no, crea un nuevo slot en el inventario del vendedor.
function devolverItemAlMercader(item) {
    const inventarioVendedor = personajes.vendedor.inventario;

    // Buscamos si el vendedor ya tiene este tipo de objeto (mismo nombre y tipo).
    const indiceExistente = inventarioVendedor.findIndex(
        (itemVendedor) => itemVendedor.nombre === item.nombre && itemVendedor.tipo === item.tipo
    );

    if (indiceExistente >= 0) {
        // El vendedor ya tiene este objeto: aumentamos el stock en 1.
        const actual = parsearItemVendedor(inventarioVendedor[indiceExistente]);
        inventarioVendedor[indiceExistente].cantidad = (actual?.cantidad ?? 0) + 1;
        return;
    }

    // El vendedor no tiene este objeto: lo añadimos con cantidad 1.
    inventarioVendedor.push({
        ...item,
        cantidad: 1,
    });
}

// equiparItemInventario (privada): equipa el item que está en el índice dado
// del inventario del jugador. Si es un escudo, ajusta la vida máxima.
// Actualiza atributos e interfaz tras el cambio.
function equiparItemInventario(indiceItem) {
    const inventario = personajes.jugador.inventario;
    const item = inventario[indiceItem];

    // Solo se pueden equipar armas y escudos (no consumibles ni objetos especiales).
    if (!esItemEquipable(item)) {
        actualizarHistorial('Ese objeto no se puede equipar.');
        return;
    }

    inicializarSistemaEquipamiento();
    // Guardamos el escudo anterior para calcular el ajuste de vida si cambiamos de escudo.
    const escudoAnterior = personajes.jugador.equipado.escudo;
    personajes.jugador.equipado[item.tipo] = item;  // item.tipo es 'arma' o 'escudo'.

    if (item.tipo === 'escudo') {
        // Al cambiar de escudo la vida máxima puede cambiar; ajustamos la vida actual.
        ajustarSaludPorCambioDeEscudo(escudoAnterior, item);
    }

    // Recalculamos todos los atributos con el nuevo equipo y refrescamos la UI.
    recalcularAtributosPorEquipo();
    actualizarAtributosHeroeUI();
    actualizarInventarioUI();
    actualizarHistorial(`Has equipado ${item.nombre}.`);
}

// venderItemInventario (privada): vende el item en el índice dado del inventario.
// Solo puede venderse si el jugador está en la tienda.
function venderItemInventario(indiceItem) {
    const salaId = obtenerSalaActualId();

    // Solo se puede vender estando en la sala tienda.
    if (salaId !== idSalas.tienda) {
        actualizarHistorial('Solo puedes vender objetos cuando estes en la tienda.');
        return;
    }

    const inventario = personajes.jugador.inventario;
    const item = inventario[indiceItem];

    // Solo se puede vender equipamiento (armas y escudos), no consumibles.
    if (!item || !esItemEquipable(item)) {
        actualizarHistorial('Solo puedes vender equipamiento desde el inventario.');
        return;
    }

    const precioVenta = obtenerPrecioVenta(item);

    inicializarSistemaEquipamiento();
    const escudoAnterior = personajes.jugador.equipado.escudo;

    // Si el item que se vende está actualmente equipado, lo desequipamos primero.
    if (personajes.jugador.equipado[item.tipo] === item) {
        personajes.jugador.equipado[item.tipo] = null;
    }

    // Eliminamos el item del inventario del jugador.
    inventario.splice(indiceItem, 1);
    // Sumamos el oro de la venta al jugador.
    personajes.jugador.oro += precioVenta;
    // Devolvemos el item al inventario del mercader.
    devolverItemAlMercader(item);

    // Si era un escudo, ajustamos la vida máxima del jugador.
    if (item.tipo === 'escudo') {
        ajustarSaludPorCambioDeEscudo(escudoAnterior, personajes.jugador.equipado.escudo);
    }

    recalcularAtributosPorEquipo();
    actualizarAtributosHeroeUI();
    actualizarInventarioUI();
    actualizarHistorial(`Has vendido ${item.nombre} por ${precioVenta} de oro.`);

    // Si el panel de la tienda está abierto, lo actualizamos para reflejar el nuevo stock.
    const panelTienda = document.getElementById('panelTienda');
    if (panelTienda && !panelTienda.hidden) {
        renderizarPanelTienda();
    }
}

// procesarComandoEquipar: recibe el texto crudo del jugador y comprueba
// si es un comando "equipar <nombre>". Devuelve true si fue procesado.
export function procesarComandoEquipar(comandoCrudo) {
    const comando = normalizarTextoConEspacios(comandoCrudo);

    // Si el texto no empieza por "equipar ", no es este tipo de comando.
    if (!comando.startsWith('equipar ')) {
        return false;
    }

    // Extraemos el nombre del objeto quitando el prefijo "equipar ".
    const nombreObjetivo = comando.replace(/^equipar\s+/, '').trim();
    if (!nombreObjetivo) {
        actualizarHistorial('Indica el nombre del equipo. Ejemplo: equipar espada de hierro');
        return true;
    }

    // Buscamos el objeto en el inventario por nombre (normalizado).
    const indiceItem = personajes.jugador.inventario.findIndex((item) => {
        if (!esItemEquipable(item)) {
            return false;
        }
        return normalizarTextoConEspacios(item.nombre) === nombreObjetivo;
    });

    if (indiceItem === -1) {
        actualizarHistorial(`No tienes "${nombreObjetivo}" en tu inventario o no es equipable.`);
        return true;
    }

    equiparItemInventario(indiceItem);
    return true;
}

// procesarComandoVender: recibe el texto crudo del jugador y comprueba
// si es un comando "vender <nombre>". Devuelve true si fue procesado.
export function procesarComandoVender(comandoCrudo) {
    const comando = normalizarTextoConEspacios(comandoCrudo);

    if (!comando.startsWith('vender ')) {
        return false;
    }

    // Extraemos el nombre del objeto quitando el prefijo "vender ".
    const nombreObjetivo = comando.replace(/^vender\s+/, '').trim();
    if (!nombreObjetivo) {
        actualizarHistorial('Indica el nombre del equipo. Ejemplo: vender espada de hierro');
        return true;
    }

    // Buscamos el objeto en el inventario por nombre (normalizado).
    const indiceItem = personajes.jugador.inventario.findIndex((item) => {
        if (!esItemEquipable(item)) {
            return false;
        }
        return normalizarTextoConEspacios(item.nombre) === nombreObjetivo;
    });

    if (indiceItem === -1) {
        actualizarHistorial(`No tienes "${nombreObjetivo}" en tu inventario o no es equipable.`);
        return true;
    }

    venderItemInventario(indiceItem);
    return true;
}
