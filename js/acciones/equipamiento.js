import { idSalas, personajes, normalizarTextoConEspacios, actualizarHistorial, obtenerSalaActualId } from './shared.js';
import { inicializarSistemaEquipamiento, esItemEquipable, recalcularAtributosPorEquipo, actualizarAtributosHeroeUI, actualizarInventarioUI } from './uiHeroe.js';
import { parsearItemVendedor, renderizarPanelTienda } from './tienda.js';

function obtenerPrecioVenta(item) {
    return Math.max(1, Math.floor((item?.precio ?? 1) / 2));
}

function devolverItemAlMercader(item) {
    const inventarioVendedor = personajes.vendedor.inventario;
    const indiceExistente = inventarioVendedor.findIndex(
        (itemVendedor) => itemVendedor.nombre === item.nombre && itemVendedor.tipo === item.tipo
    );

    if (indiceExistente >= 0) {
        const actual = parsearItemVendedor(inventarioVendedor[indiceExistente]);
        inventarioVendedor[indiceExistente].cantidad = (actual?.cantidad ?? 0) + 1;
        return;
    }

    inventarioVendedor.push({
        ...item,
        cantidad: 1,
    });
}

function equiparItemInventario(indiceItem) {
    const inventario = personajes.jugador.inventario;
    const item = inventario[indiceItem];

    if (!esItemEquipable(item)) {
        actualizarHistorial('Ese objeto no se puede equipar.');
        return;
    }

    inicializarSistemaEquipamiento();
    personajes.jugador.equipado[item.tipo] = item;
    recalcularAtributosPorEquipo();
    actualizarAtributosHeroeUI();
    actualizarInventarioUI();
    actualizarHistorial(`Has equipado ${item.nombre}.`);
}

function venderItemInventario(indiceItem) {
    const salaId = obtenerSalaActualId();

    if (salaId !== idSalas.tienda) {
        actualizarHistorial('Solo puedes vender objetos cuando estes en la tienda.');
        return;
    }

    const inventario = personajes.jugador.inventario;
    const item = inventario[indiceItem];

    if (!item || !esItemEquipable(item)) {
        actualizarHistorial('Solo puedes vender equipamiento desde el inventario.');
        return;
    }

    const precioVenta = obtenerPrecioVenta(item);

    inicializarSistemaEquipamiento();
    if (personajes.jugador.equipado[item.tipo] === item) {
        personajes.jugador.equipado[item.tipo] = null;
    }

    inventario.splice(indiceItem, 1);
    personajes.jugador.oro += precioVenta;
    devolverItemAlMercader(item);
    recalcularAtributosPorEquipo();
    actualizarAtributosHeroeUI();
    actualizarInventarioUI();
    actualizarHistorial(`Has vendido ${item.nombre} por ${precioVenta} de oro.`);

    const panelTienda = document.getElementById('panelTienda');
    if (panelTienda && !panelTienda.hidden) {
        renderizarPanelTienda();
    }
}

export function procesarComandoEquipar(comandoCrudo) {
    const comando = normalizarTextoConEspacios(comandoCrudo);

    if (!comando.startsWith('equipar ')) {
        return false;
    }

    const nombreObjetivo = comando.replace(/^equipar\s+/, '').trim();
    if (!nombreObjetivo) {
        actualizarHistorial('Indica el nombre del equipo. Ejemplo: equipar espada de hierro');
        return true;
    }

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

export function procesarComandoVender(comandoCrudo) {
    const comando = normalizarTextoConEspacios(comandoCrudo);

    if (!comando.startsWith('vender ')) {
        return false;
    }

    const nombreObjetivo = comando.replace(/^vender\s+/, '').trim();
    if (!nombreObjetivo) {
        actualizarHistorial('Indica el nombre del equipo. Ejemplo: vender espada de hierro');
        return true;
    }

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
