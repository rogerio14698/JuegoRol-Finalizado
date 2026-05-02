import { idSalas, mapa } from '../mapa.js';
import { personajes } from '../personajes.js';
import { crearJugadorInicial } from '../personajes.js';

export { idSalas, mapa, personajes };

const CLAVE_ESTADO_JUGADOR = 'estadoJugador';
const CLAVE_VICTORIA_FINAL = 'victoriaFinalDisponible';
let omitirGuardadoEstadoJugador = false;

export const aliasDirecciones = {
    norte: 'norte',
    arriba: 'norte',
    sur: 'sur',
    abajo: 'sur',
    este: 'este',
    derecha: 'este',
    oeste: 'oeste',
    izquierda: 'oeste'
};

export const aliasSalas = {
    entrada: 'entrada',
    tienda: 'tienda',
    pasilloa: 'pasilloA',
    pasillob: 'pasilloB',
    pasilloc: 'pasilloC',
    pasillod: 'pasilloD',
    pasillo: 'pasilloA',
    sala1: 'sala1',
    sala2: 'sala2',
    sala3: 'sala3',
    sala4: 'sala4',
    jefe: 'salaJefe',
    salajefe: 'salaJefe',
    trono: 'salaJefe',
    antesalajefe: 'anteSalaJefe',
    santuario: 'anteSalaJefe'
};

export const estadoCombate = {
    activo: false,
    statsCombate: null,
    turno: 'ninguno',
    introTimeoutId: null,
    dialogoOverlayTimeoutId: null,
    turnoMonstruoTimeoutId: null,
    seccionEnemigo: null,
};

export const RETARDO_TURNO_MONSTRUO_TRAS_ATAQUE_HEROE_MS = 900;

export function normalizarComando(valor) {
    return valor
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/^ir\s+/, '')
        .replace(/\s+/g, '');
}

export function normalizarTextoConEspacios(valor) {
    return valor
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
}

export function obtenerDestinoPorComando(sala, comandoNormalizado) {
    const direccion = aliasDirecciones[comandoNormalizado];

    if (direccion) {
        return sala.ubicacion[direccion];
    }

    const coincidencias = [];

    for (let direccionDisponible in sala.ubicacion) {
        const destinoId = sala.ubicacion[direccionDisponible];

        if (destinoId === -1) {
            continue;
        }

        const claveDestino = Object.keys(idSalas).find((clave) => idSalas[clave] === destinoId);
        const nombreDestino = mapa[destinoId]?.nombre;
        const aliasDestino = aliasSalas[comandoNormalizado];

        const coincideConClave = claveDestino && normalizarComando(claveDestino) === comandoNormalizado;
        const coincideConNombre = nombreDestino && normalizarComando(nombreDestino) === comandoNormalizado;
        const coincideConAlias = aliasDestino && claveDestino === aliasDestino;

        if (coincideConClave || coincideConNombre || coincideConAlias) {
            coincidencias.push(destinoId);
        }
    }

    if (coincidencias.length > 1) {
        return 'ambigua';
    }

    if (coincidencias.length === 1) {
        return coincidencias[0];
    }

    if (aliasSalas[comandoNormalizado]) {
        return -1;
    }

    return null;
}

export function actualizarHistorial(mensaje) {
    const historial = document.getElementById('historial');

    if (!historial) {
        return;
    }

    const linea = document.createElement('p');
    linea.textContent = mensaje;
    historial.prepend(linea);

    try {
        const entradas = JSON.parse(localStorage.getItem('historialPartida') || '[]');
        entradas.unshift(mensaje);
        localStorage.setItem('historialPartida', JSON.stringify(entradas));
    } catch (e) {
        // localStorage no disponible; continuamos sin persistir
    }
}

function clonarItem(item) {
    if (!item || typeof item !== 'object') {
        return item;
    }

    return { ...item };
}

function itemCoincideConReferencia(item, referencia) {
    if (!item || !referencia || typeof item !== 'object' || typeof referencia !== 'object') {
        return false;
    }

    return item.nombre === referencia.nombre
        && item.tipo === referencia.tipo
        && (item.ataque ?? 0) === (referencia.ataque ?? 0)
        && (item.fuerza ?? 0) === (referencia.fuerza ?? 0)
        && (item.defensa ?? 0) === (referencia.defensa ?? 0)
        && (item.vida ?? 0) === (referencia.vida ?? 0);
}

function resolverEquipoDesdeInventario(inventario, referencia) {
    if (!referencia) {
        return null;
    }

    return inventario.find((item) => itemCoincideConReferencia(item, referencia)) ?? clonarItem(referencia);
}

export function guardarEstadoJugador() {
    if (omitirGuardadoEstadoJugador) {
        return;
    }

    try {
        localStorage.setItem(CLAVE_ESTADO_JUGADOR, JSON.stringify(personajes.jugador));
    } catch (e) {
        // localStorage no disponible; continuamos sin persistir
    }
}

export function cargarEstadoJugador() {
    try {
        omitirGuardadoEstadoJugador = false;
        const estadoGuardado = localStorage.getItem(CLAVE_ESTADO_JUGADOR);

        if (!estadoGuardado) {
            return false;
        }

        const jugadorGuardado = JSON.parse(estadoGuardado);
        const inventario = Array.isArray(jugadorGuardado.inventario)
            ? jugadorGuardado.inventario.map((item) => clonarItem(item))
            : [];

        personajes.jugador = {
            ...personajes.jugador,
            ...jugadorGuardado,
            inventario,
            equipado: {
                arma: resolverEquipoDesdeInventario(inventario, jugadorGuardado.equipado?.arma),
                escudo: resolverEquipoDesdeInventario(inventario, jugadorGuardado.equipado?.escudo),
            },
        };

        return true;
    } catch (e) {
        return false;
    }
}

export function reiniciarEstadoJugador() {
    omitirGuardadoEstadoJugador = true;
    personajes.jugador = crearJugadorInicial();

    try {
        localStorage.removeItem(CLAVE_ESTADO_JUGADOR);
        localStorage.removeItem(CLAVE_VICTORIA_FINAL);
    } catch (e) {
        // localStorage no disponible; continuamos sin persistir
    }
}

export function marcarVictoriaFinalDisponible() {
    try {
        localStorage.setItem(CLAVE_VICTORIA_FINAL, '1');
    } catch (e) {
        // localStorage no disponible; continuamos sin persistir
    }
}

export function tieneVictoriaFinalDisponible() {
    try {
        return localStorage.getItem(CLAVE_VICTORIA_FINAL) === '1';
    } catch (e) {
        return false;
    }
}

export function limpiarVictoriaFinalDisponible() {
    try {
        localStorage.removeItem(CLAVE_VICTORIA_FINAL);
    } catch (e) {
        // localStorage no disponible; continuamos sin persistir
    }
}

export function obtenerSalidasDisponibles(sala) {
    return Object.keys(sala.ubicacion).filter((direccion) => sala.ubicacion[direccion] !== -1);
}

export function tirarDado(min = 1, max = 10) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function obtenerSalaActualId() {
    const parametrosURL = new URLSearchParams(window.location.search);
    return parseInt(parametrosURL.get('id')) || idSalas.entrada;
}
