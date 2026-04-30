import { personajes } from './shared.js';

export function inicializarSistemaEquipamiento() {
    if (!personajes.jugador.atributosBase) {
        personajes.jugador.atributosBase = {
            salud: personajes.jugador.salud,
            ataque: personajes.jugador.ataque,
            defensa: personajes.jugador.defensa,
            fuerza: personajes.jugador.fuerza ?? 0,
        };
    }

    if (!personajes.jugador.equipado) {
        personajes.jugador.equipado = {
            arma: null,
            escudo: null,
        };
    }
}

export function esItemEquipable(item) {
    return !!item && typeof item === 'object' && (item.tipo === 'arma' || item.tipo === 'escudo');
}

export function recalcularAtributosPorEquipo() {
    inicializarSistemaEquipamiento();

    const base = personajes.jugador.atributosBase;
    const arma = personajes.jugador.equipado.arma;
    const escudo = personajes.jugador.equipado.escudo;

    personajes.jugador.ataque = base.ataque + (arma?.ataque ?? 0);
    personajes.jugador.fuerza = base.fuerza + (arma?.fuerza ?? 0);
    personajes.jugador.defensa = base.defensa + (escudo?.defensa ?? 0);

    const saludConEquipo = base.salud + (escudo?.vida ?? 0);
    personajes.jugador.salud = Math.max(1, saludConEquipo);
}

export function actualizarOroUI() {
    const oroHeroeEl = document.getElementById('oroHeroe');
    if (oroHeroeEl) {
        oroHeroeEl.textContent = `Oro: ${personajes.jugador.oro}`;
    }
}

export function actualizarAtributosHeroeUI() {
    inicializarSistemaEquipamiento();

    const jugador = personajes.jugador;
    const arma = jugador.equipado?.arma;
    const escudo = jugador.equipado?.escudo;

    const bonusAtaque = arma?.ataque ?? 0;
    const bonusFuerza = arma?.fuerza ?? 0;
    const bonusDefensa = escudo?.defensa ?? 0;
    const bonusVida = escudo?.vida ?? 0;

    const nivelHeroeEl = document.getElementById('nivelHeroe');
    const vidaHeroeEl = document.getElementById('vidaHeroe');
    const ataqueHeroeEl = document.getElementById('ataqueHeroe');
    const fuerzaHeroeEl = document.getElementById('fuerzaHeroe');
    const defensaHeroeEl = document.getElementById('defensaHeroe');

    if (nivelHeroeEl) nivelHeroeEl.textContent = `${jugador.nombre} | ${jugador.nivel}`;
    if (vidaHeroeEl) vidaHeroeEl.textContent = `Vida: ${jugador.salud} + escudo Bonus ${bonusVida}`;
    if (ataqueHeroeEl) ataqueHeroeEl.textContent = `Ataque: ${jugador.ataque} + arma Bonus ${bonusAtaque}`;
    if (fuerzaHeroeEl) fuerzaHeroeEl.textContent = `Fuerza: ${jugador.fuerza} + arma Bonus ${bonusFuerza}`;
    if (defensaHeroeEl) defensaHeroeEl.textContent = `Defensa: ${jugador.defensa} + escudo Bonus ${bonusDefensa}`;

    actualizarOroUI();
}

export function actualizarInventarioUI() {
    const inventarioHeroeEl = document.getElementById('inventarioHeroe');
    if (!inventarioHeroeEl) {
        return;
    }

    inicializarSistemaEquipamiento();

    const inventario = personajes.jugador.inventario || [];
    inventarioHeroeEl.innerHTML = '';

    if (inventario.length === 0) {
        const vacio = document.createElement('li');
        vacio.className = 'inventarioVacio';
        vacio.textContent = 'Sin objetos.';
        inventarioHeroeEl.appendChild(vacio);
        return;
    }

    inventario.forEach((item) => {
        const fila = document.createElement('li');
        const nombre = typeof item === 'string' ? item : String(item?.nombre || 'Objeto sin nombre');
        const cantidad = typeof item === 'object' ? Number.parseInt(item?.cantidad, 10) : NaN;

        if (!esItemEquipable(item)) {
            fila.textContent = Number.isInteger(cantidad) && cantidad > 1 ? `${nombre} x${cantidad}` : nombre;
            inventarioHeroeEl.appendChild(fila);
            return;
        }

        const slot = item.tipo;
        const estaEquipado = personajes.jugador.equipado[slot] === item;
        fila.textContent = `${nombre}${estaEquipado ? ' (equipado)' : ''}`;
        inventarioHeroeEl.appendChild(fila);
    });
}
