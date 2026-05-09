// ─────────────────────────────────────────────────────────────
// js/acciones/uiHeroe.js  —  Actualización del HUD del héroe
//
// Este módulo centraliza TODAS las operaciones que modifican la interfaz
// del panel del héroe (stats, barra de vida, inventario, oro).
// También gestiona el sistema de atributosBase para separar valores
// sin equipo de valores con bonificadores del equipo equipado.
// ─────────────────────────────────────────────────────────────

import { personajes } from './shared.js';

// inicializarSistemaEquipamiento: asegura que los objetos atributosBase y equipado
// existen en el jugador antes de operar con ellos.
// atributosBase guarda los valores "sin equipo" para que recalcularAtributosPorEquipo
// siempre parta de los valores originales y no acumule bonificadores.
export function inicializarSistemaEquipamiento() {
    if (!personajes.jugador.atributosBase) {
        // Primera vez: guardamos los valores actuales como base.
        personajes.jugador.atributosBase = {
            salud: personajes.jugador.salud,
            ataque: personajes.jugador.ataque,
            defensa: personajes.jugador.defensa,
            fuerza: personajes.jugador.fuerza ?? 0,
        };
    }

    if (!personajes.jugador.equipado) {
        // Si no existe el objeto equipado, lo creamos vacío.
        personajes.jugador.equipado = {
            arma: null,
            escudo: null,
        };
    }
}

// esItemEquipable: devuelve true si el item es un arma o un escudo.
// Se usa para distinguir equipamiento de consumibles y otros objetos.
export function esItemEquipable(item) {
    return !!item && typeof item === 'object' && (item.tipo === 'arma' || item.tipo === 'escudo');
}

// recalcularAtributosPorEquipo: actualiza ataque, fuerza, defensa y salud del jugador
// sumando los bonificadores del arma y escudo equipados a los valores base.
// IMPORTANTE: usa siempre atributosBase como punto de partida para no acumular
// bonificadores con cada llamada.
export function recalcularAtributosPorEquipo() {
    inicializarSistemaEquipamiento();

    const base = personajes.jugador.atributosBase;
    const arma = personajes.jugador.equipado.arma;     // Puede ser null.
    const escudo = personajes.jugador.equipado.escudo; // Puede ser null.
    const saludActual = personajes.jugador.salud;

    // base + bonus del arma/escudo (si no hay equipo, el operador ?? 0 devuelve 0).
    personajes.jugador.ataque = base.ataque + (arma?.ataque ?? 0);
    personajes.jugador.fuerza = base.fuerza + (arma?.fuerza ?? 0);
    personajes.jugador.defensa = base.defensa + (escudo?.defensa ?? 0);

    // La salud máxima incluye el bonus de vida del escudo.
    const saludConEquipo = base.salud + (escudo?.vida ?? 0);
    // Clampamos la salud actual entre 1 y la nueva máxima.
    personajes.jugador.salud = Math.max(1, Math.min(saludActual ?? saludConEquipo, saludConEquipo));
}

// ajustarSaludPorCambioDeEscudo: cuando el jugador cambia de escudo,
// la vida máxima varía. Esta función ajusta la salud actual en consecuencia.
// deltaVida = bonus nuevo - bonus anterior (puede ser negativo si el nuevo escudo es peor).
export function ajustarSaludPorCambioDeEscudo(escudoAnterior, escudoNuevo) {
    inicializarSistemaEquipamiento();

    const bonusVidaAnterior = escudoAnterior?.vida ?? 0;
    const bonusVidaNuevo = escudoNuevo?.vida ?? 0;
    const deltaVida = bonusVidaNuevo - bonusVidaAnterior;
    const saludMaximaNueva = personajes.jugador.atributosBase.salud + bonusVidaNuevo;

    // Sumamos el delta a la salud actual y la clampamos entre 1 y la nueva máxima.
    personajes.jugador.salud = Math.max(
        1,
        Math.min((personajes.jugador.salud ?? saludMaximaNueva) + deltaVida, saludMaximaNueva)
    );
}

// actualizarOroUI: actualiza el texto del oro del héroe en el HUD.
export function actualizarOroUI() {
    const oroHeroeEl = document.getElementById('oroHeroe');
    if (oroHeroeEl) {
        oroHeroeEl.textContent = `Oro: ${personajes.jugador.oro}`;
    }
}

// renderizarBarraVida (privada): genera el HTML de la barra de vida del héroe.
// El porcentaje se calcula como (vidaActual / vidaMaxima) * 100, clampado a [0, 100].
function renderizarBarraVida(vidaActual, vidaMaxima, bonusVida) {
    const porcentajeVida = vidaMaxima > 0
        ? Math.max(0, Math.min(100, (vidaActual / vidaMaxima) * 100))
        : 0;

    return `
        <span class="vidaHeroeTexto">Vida: ${vidaActual}/${vidaMaxima} + escudo Bonus ${bonusVida}</span>
        <span class="barraVidaHeroe" aria-hidden="true">
            <span class="barraVidaHeroeRelleno" style="width: ${porcentajeVida}%;"></span>
        </span>
    `;
}

// actualizarAtributosHeroeUI: refresca todos los elementos del HUD del héroe
// (nombre/nivel, vida, ataque, fuerza, defensa, oro) con los valores actuales.
export function actualizarAtributosHeroeUI() {
    inicializarSistemaEquipamiento();

    const jugador = personajes.jugador;
    const arma = jugador.equipado?.arma;
    const escudo = jugador.equipado?.escudo;

    // Calculamos los bonus del equipo equipado.
    const bonusAtaque = arma?.ataque ?? 0;
    const bonusFuerza = arma?.fuerza ?? 0;
    const bonusDefensa = escudo?.defensa ?? 0;
    const bonusVida = escudo?.vida ?? 0;
    const vidaMaxima = (jugador.atributosBase?.salud ?? jugador.salud) + bonusVida;

    // Obtenemos los elementos del DOM.
    const nivelHeroeEl = document.getElementById('nivelHeroe');
    const xpHeroeEl = document.getElementById('xpHeroe');
    const vidaHeroeEl = document.getElementById('vidaHeroe');
    const ataqueHeroeEl = document.getElementById('ataqueHeroe');
    const fuerzaHeroeEl = document.getElementById('fuerzaHeroe');
    const defensaHeroeEl = document.getElementById('defensaHeroe');

    // Actualizamos el contenido de cada elemento si existe.
    if (nivelHeroeEl) nivelHeroeEl.textContent = `${jugador.nombre} | Nivel ${jugador.nivel}`;
    const xpNecesaria = jugador.nivel * 100;
    if (xpHeroeEl) xpHeroeEl.textContent = `XP: ${jugador.experiencia} / ${xpNecesaria}`;
    if (vidaHeroeEl) {
        // La barra de vida se genera con HTML para poder mostrar la barra visual.
        vidaHeroeEl.innerHTML = renderizarBarraVida(jugador.salud, vidaMaxima, bonusVida);
    }
    if (ataqueHeroeEl) ataqueHeroeEl.textContent = `Ataque: ${jugador.ataque} + arma Bonus ${bonusAtaque}`;
    if (fuerzaHeroeEl) fuerzaHeroeEl.textContent = `Fuerza: ${jugador.fuerza} + arma Bonus ${bonusFuerza}`;
    if (defensaHeroeEl) defensaHeroeEl.textContent = `Defensa: ${jugador.defensa} + escudo Bonus ${bonusDefensa}`;

    actualizarOroUI();
}

// actualizarInventarioUI: vuelca el inventario del jugador en el elemento <ul>
// del HUD. Muestra "(equipado)" junto al nombre si el objeto está en uso.
// Los consumibles muestran la cantidad (x2, x3, etc.) si es mayor de 1.
export function actualizarInventarioUI() {
    const inventarioHeroeEl = document.getElementById('inventarioHeroe');
    if (!inventarioHeroeEl) {
        return;
    }

    inicializarSistemaEquipamiento();

    const inventario = personajes.jugador.inventario || [];
    inventarioHeroeEl.innerHTML = '';  // Limpiamos la lista antes de repintarla.

    if (inventario.length === 0) {
        const vacio = document.createElement('li');
        vacio.className = 'inventarioVacio';
        vacio.textContent = 'Sin objetos.';
        inventarioHeroeEl.appendChild(vacio);
        return;
    }

    // Creamos un <li> por cada item del inventario.
    inventario.forEach((item) => {
        const fila = document.createElement('li');
        const nombre = typeof item === 'string' ? item : String(item?.nombre || 'Objeto sin nombre');
        const cantidad = typeof item === 'object' ? Number.parseInt(item?.cantidad, 10) : NaN;

        if (!esItemEquipable(item)) {
            // Consumible o string: mostramos nombre y cantidad si hay más de una unidad.
            fila.textContent = Number.isInteger(cantidad) && cantidad > 1 ? `${nombre} x${cantidad}` : nombre;
            inventarioHeroeEl.appendChild(fila);
            return;
        }

        // Equipamiento: indicamos si está equipado actualmente.
        const slot = item.tipo;  // 'arma' o 'escudo'
        const estaEquipado = personajes.jugador.equipado[slot] === item;
        fila.textContent = `${nombre}${estaEquipado ? ' (equipado)' : ''}`;
        inventarioHeroeEl.appendChild(fila);
    });
}
