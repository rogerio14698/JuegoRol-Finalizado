// ─────────────────────────────────────────────────────────────────────────────
// js/acciones/shared.js  — Estado global compartido y utilidades transversales
//
// Este es el módulo más importante del juego. Todos los demás módulos importan
// desde aquí porque contiene:
//   · La referencia al mapa y los personajes.
//   · El estado del combate en curso.
//   · Las funciones de normalización de texto (para que "Norte", "norte" y "NORTE"
//     sean el mismo comando).
//   · La lógica de guardar/cargar el jugador en localStorage.
//   · Funciones de utilidad como tirarDado o actualizarHistorial.
// ─────────────────────────────────────────────────────────────────────────────

// Importamos el mapa de salas y los ids desde mapa.js.
import { idSalas, mapa } from '../mapa.js';

// Importamos el objeto personajes (jugador, vendedor, monstruos) y la función
// que crea un jugador nuevo con sus valores por defecto.
import { personajes } from '../personajes.js';
import { crearJugadorInicial } from '../personajes.js';

// Re-exportamos idSalas, mapa y personajes para que otros módulos solo necesiten
// importar desde shared.js en lugar de ir a cada archivo de origen.
export { idSalas, mapa, personajes };

// ── Claves de localStorage ─────────────────────────────────────────────────
// Guardamos el estado del jugador en localStorage bajo estas claves.
// Usarlas como constantes evita errores tipográficos al escribir la clave a mano.
const CLAVE_ESTADO_JUGADOR = 'estadoJugador';
const CLAVE_VICTORIA_FINAL = 'victoriaFinalDisponible';

// Bandera interna que usamos para evitar guardar el estado cuando el jugador
// ha perdido o ha ganado (en esos casos reiniciamos antes de salir).
let omitirGuardadoEstadoJugador = false;

// ── Aliases de dirección ───────────────────────────────────────────────────
// El jugador puede escribir "norte", "arriba" o cualquier sinónimo y el juego
// lo reconocerá como la misma dirección. Esto hace la experiencia más natural.
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

// ── Aliases de sala ────────────────────────────────────────────────────────
// El jugador puede escribir el nombre de una sala de varias formas y el juego
// lo resolverá al id correcto. Por ejemplo "jefe", "trono" y "salajefe"
// llevan todos a la misma sala.
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

// ── Estado del combate ─────────────────────────────────────────────────────
// Este objeto guarda TODO lo relacionado con el combate en curso.
// Es un objeto compartido (mutable) que todos los módulos de combate leen y modifican.
//   · activo          → true si hay un combate en curso, false si no.
//   · statsCombate    → las estadísticas del enemigo actual (vida, ataque, etc.).
//   · turno           → quién debe actuar: 'intro', 'heroe', 'monstruo' o 'ninguno'.
//   · introTimeoutId  → referencia al timeout de la introducción del monstruo.
//   · dialogoOverlayTimeoutId → referencia al timeout del diálogo de intro en pantalla.
//   · turnoMonstruoTimeoutId  → referencia al timeout del contraataque del monstruo.
//   · seccionEnemigo  → referencia al elemento DOM del enemigo (para ocultarlo al morir).
export const estadoCombate = {
    activo: false,
    statsCombate: null,
    turno: 'ninguno',
    introTimeoutId: null,
    dialogoOverlayTimeoutId: null,
    turnoMonstruoTimeoutId: null,
    seccionEnemigo: null,
};

// ── Constante de retardo ───────────────────────────────────────────────────
// Tiempo en milisegundos que el monstruo espera antes de contraatacar
// después de que el héroe haya golpeado. Permite que la animación termine primero.
export const RETARDO_TURNO_MONSTRUO_TRAS_ATAQUE_HEROE_MS = 900;

// ── normalizarComando ──────────────────────────────────────────────────────
// Recibe el texto que el jugador escribió en el input y lo "limpia" para
// poder compararlo sin importar mayúsculas, tildes o prefijos como "ir ".
// Ejemplo: "  Ir Norte  " → "norte"
// También elimina espacios entre palabras para comparar "pasilloa" y "pasillo a".
export function normalizarComando(valor) {
    return valor
        .trim()                                    // Quita espacios al inicio y al final.
        .toLowerCase()                             // Todo a minúsculas.
        .normalize('NFD')                          // Descompone tildes en carácter + acento.
        .replace(/[\u0300-\u036f]/g, '')           // Elimina los acentos.
        .replace(/^ir\s+/, '')                     // Quita el prefijo "ir " si existe.
        .replace(/\s+/g, '');                      // Elimina todos los espacios internos.
}

// ── normalizarTextoConEspacios ─────────────────────────────────
// Igual que normalizarComando pero CONSERVA los espacios entre palabras.
// Se usa para comandos compuestos como "equipar espada de hierro" o "tomar pocion",
// donde necesitamos mantener la separación entre palabras para identificar el objeto.
// Ejemplo: "  Tomar Poción  " → "tomar pocion"
export function normalizarTextoConEspacios(valor) {
    return valor
        .trim()                                    // Quita espacios al inicio y al final.
        .toLowerCase()                             // Todo a minúsculas.
        .normalize('NFD')                          // Descompone tildes en carácter + acento.
        .replace(/[\u0300-\u036f]/g, '')           // Elimina los acentos.
        .replace(/\s+/g, ' ');                     // Colapsa espacios múltiples en uno solo.
}

// ── obtenerDestinoPorComando ────────────────────────────────
// Recibe la sala actual y el comando ya normalizado, y devuelve el id
// de la sala a la que irá el jugador. Resultados posibles:
//   · Un número        → id de la sala destino (navegación correcta).
//   · -1               → hay una pared en esa dirección (el jugador no puede pasar).
//   · 'ambigua'        → el texto coincide con varias salidas (el jugador debe concretar).
//   · null             → el comando no se reconoce como ninguna dirección ni sala.
//
// El algoritmo tiene dos pasos:
//   1. Busca primero en aliasDirecciones (norte/sur/este/oeste/arriba...) porque
//      es la forma más rápida y directa de moverse.
//   2. Si no es una dirección, recorre las salidas de la sala actual e intenta
//      hacer coincidir el texto con el nombre o alias de cada sala destino.
export function obtenerDestinoPorComando(sala, comandoNormalizado) {
    // Paso 1: ¿El comando es una dirección cardinal o sinonímo?
    const direccion = aliasDirecciones[comandoNormalizado];

    if (direccion) {
        // Sí: devolvemos directamente el id de la sala en esa dirección.
        return sala.ubicacion[direccion];
    }

    // Paso 2: El comando no es una dirección, vemos si coincide con el nombre
    // o alias de alguna de las salas vecinas.
    const coincidencias = [];

    for (let direccionDisponible in sala.ubicacion) {
        const destinoId = sala.ubicacion[direccionDisponible];

        // Ignoramos las paredes (id = -1), no tienen nombre con el que comparar.
        if (destinoId === -1) {
            continue;
        }

        // Obtenemos la clave textual de la sala destino (p.ej. 'pasilloA').
        const claveDestino = Object.keys(idSalas).find((clave) => idSalas[clave] === destinoId);
        // Obtenemos el nombre légible de la sala destino (p.ej. 'Tienda').
        const nombreDestino = mapa[destinoId]?.nombre;
        // Buscamos si el comando es un alias conocido (p.ej. 'tienda' → 'tienda').
        const aliasDestino = aliasSalas[comandoNormalizado];

        // Comprobamos si el comando coincide con la clave, el nombre o el alias.
        const coincideConClave = claveDestino && normalizarComando(claveDestino) === comandoNormalizado;
        const coincideConNombre = nombreDestino && normalizarComando(nombreDestino) === comandoNormalizado;
        const coincideConAlias = aliasDestino && claveDestino === aliasDestino;

        if (coincideConClave || coincideConNombre || coincideConAlias) {
            coincidencias.push(destinoId);
        }
    }

    // Si hay más de una sala que coincide, el comando es ambiguo.
    if (coincidencias.length > 1) {
        return 'ambigua';
    }

    // Si hay exactamente una coincidencia, esa es la sala destino.
    if (coincidencias.length === 1) {
        return coincidencias[0];
    }

    // Si el texto es un alias de sala pero ningún vecino tiene ese destino,
    // la sala existe en el mapa pero no es accesible desde aquí (pared).
    if (aliasSalas[comandoNormalizado]) {
        return -1;
    }

    // El texto no corresponde a nada reconocido.
    return null;
}

// ── actualizarHistorial ────────────────────────────────────
// Añade una línea de texto al panel de historial de la consola y
// también la persiste en localStorage para mostrarla en la portada.
// prepend() la inserta AL INICIO del historial (la más reciente arriba).
export function actualizarHistorial(mensaje) {
    const historial = document.getElementById('historial');

    // Si el elemento del historial no existe (p.ej. estamos en la portada), no hacemos nada.
    if (!historial) {
        return;
    }

    // Creamos un nuevo elemento <p> con el mensaje y lo añadimos arriba del historial.
    const linea = document.createElement('p');
    linea.textContent = mensaje;
    historial.prepend(linea);

    // Guardamos también la entrada en localStorage para poder verla en la portada («Historial»).
    try {
        const entradas = JSON.parse(localStorage.getItem('historialPartida') || '[]');
        entradas.unshift(mensaje);  // Insertamos al inicio del array (más reciente primero).
        localStorage.setItem('historialPartida', JSON.stringify(entradas));
    } catch (e) {
        // localStorage no disponible; continuamos sin persistir
    }
}

// ── clonarItem (privada) ───────────────────────────────────────
// Crea una copia superficial de un objeto item para evitar que compartir
// la misma referencia cause modificaciones inesperadas en otro lado.
// Si el item no es un objeto (null, string, etc.) lo devuelve tal cual.
function clonarItem(item) {
    if (!item || typeof item !== 'object') {
        return item;
    }

    // El spread {...item} crea un nuevo objeto con las mismas propiedades.
    return { ...item };
}

// ── itemCoincideConReferencia (privada) ───────────────────────────
// Compara dos items por sus propiedades (no por referencia de objeto).
// Necesaria porque al cargar desde JSON los objetos son nuevos instancias,
// entonces item === referencia siempre sería false aunque sean idénticos.
function itemCoincideConReferencia(item, referencia) {
    if (!item || !referencia || typeof item !== 'object' || typeof referencia !== 'object') {
        return false;
    }

    // Comparamos todas las propiedades clave del equipo.
    return item.nombre === referencia.nombre
        && item.tipo === referencia.tipo
        && (item.ataque ?? 0) === (referencia.ataque ?? 0)
        && (item.fuerza ?? 0) === (referencia.fuerza ?? 0)
        && (item.defensa ?? 0) === (referencia.defensa ?? 0)
        && (item.vida ?? 0) === (referencia.vida ?? 0);
}

// resolverEquipoDesdeInventario (privada): dado un inventario y una referencia
// de objeto equipado (guardada en JSON), busca en el inventario el item que
// coincide con esa referencia usando itemCoincideConReferencia. Si no lo encuentra
// clona la referencia directamente para no perder el equipo.
function resolverEquipoDesdeInventario(inventario, referencia) {
    if (!referencia) {
        return null;
    }

    return inventario.find((item) => itemCoincideConReferencia(item, referencia)) ?? clonarItem(referencia);
}

// ── guardarEstadoJugador ───────────────────────────────────
// Serializa el objeto jugador a JSON y lo guarda en localStorage.
// Se llama automáticamente cuando el usuario cierra la pestaña o navega fuera,
// para que al volver el jugador retome desde donde lo dejó.
// Si omitirGuardadoEstadoJugador es true (p.ej. tras una muerte), no guardamos.
export function guardarEstadoJugador() {
    if (omitirGuardadoEstadoJugador) {
        return;
    }

    try {
        // JSON.stringify convierte el objeto a texto para poder guardarlo en localStorage.
        localStorage.setItem(CLAVE_ESTADO_JUGADOR, JSON.stringify(personajes.jugador));
    } catch (e) {
        // localStorage no disponible; continuamos sin persistir
    }
}

// ── cargarEstadoJugador ───────────────────────────────────
// Lee el estado guardado en localStorage y lo aplica sobre el objeto jugador.
// Devuelve true si había datos guardados, false si no.
// IMPORTANTE: resuelve las referencias del equipo equipado desde el propio inventario,
// porque al deserializar JSON los objetos son copias nuevas y la comparación === fallaría.
export function cargarEstadoJugador() {
    try {
        omitirGuardadoEstadoJugador = false; // Aseguramos que el guardado automático está activo.
        const estadoGuardado = localStorage.getItem(CLAVE_ESTADO_JUGADOR);

        // Si no hay nada guardado, mantenemos el jugador inicial.
        if (!estadoGuardado) {
            return false;
        }

        // Parseamos el JSON a objeto JavaScript.
        const jugadorGuardado = JSON.parse(estadoGuardado);

        // Clonamos cada item del inventario para evitar referencias compartidas.
        const inventario = Array.isArray(jugadorGuardado.inventario)
            ? jugadorGuardado.inventario.map((item) => clonarItem(item))
            : [];

        // Mezclamos el jugador guardado con el jugador actual (por si hay propiedades nuevas
        // en el código que no estaban cuando se guardó).
        personajes.jugador = {
            ...personajes.jugador,   // valores por defecto actuales
            ...jugadorGuardado,      // sobreescribimos con lo guardado
            inventario,              // usamos el inventario ya clonado
            equipado: {
                // Resolvemos el arma y escudo equipados buscando sus equivalentes en el inventario.
                arma: resolverEquipoDesdeInventario(inventario, jugadorGuardado.equipado?.arma),
                escudo: resolverEquipoDesdeInventario(inventario, jugadorGuardado.equipado?.escudo),
            },
        };

        return true;
    } catch (e) {
        return false;
    }
}

// reiniciarEstadoJugador: restablece el jugador a su estado inicial de fábrica
// y borra el guardado de localStorage. Se llama cuando el jugador muere o inicia
// una partida nueva. También activa el flag omitirGuardadoEstadoJugador para que
// el evento beforeunload no sobreescriba el borrado con el estado de muerte.
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

// marcarVictoriaFinalDisponible: guarda un flag en localStorage que indica que
// el jugador ha llegado a la sala con la victoria final. Se usa para desbloquear
// el comando especial de victoria en esa sala.
export function marcarVictoriaFinalDisponible() {
    try {
        localStorage.setItem(CLAVE_VICTORIA_FINAL, '1');
    } catch (e) {
        // localStorage no disponible; continuamos sin persistir
    }
}

// tieneVictoriaFinalDisponible: comprueba si el flag de victoria final está activo
// en localStorage. Devuelve true solo si el valor guardado es exactamente '1'.
export function tieneVictoriaFinalDisponible() {
    try {
        return localStorage.getItem(CLAVE_VICTORIA_FINAL) === '1';
    } catch (e) {
        return false;
    }
}

// limpiarVictoriaFinalDisponible: elimina el flag de victoria del localStorage.
// Se llama después de que el jugador ejecuta el comando de victoria para que
// no pueda repetirlo si vuelve a la misma sala.
export function limpiarVictoriaFinalDisponible() {
    try {
        localStorage.removeItem(CLAVE_VICTORIA_FINAL);
    } catch (e) {
        // localStorage no disponible; continuamos sin persistir
    }
}

// obtenerSalidasDisponibles: dada una sala, devuelve un array con las direcciones
// (norte, sur, este, oeste) que no tienen valor -1 (las que sí tienen una sala conectada).
export function obtenerSalidasDisponibles(sala) {
    return Object.keys(sala.ubicacion).filter((direccion) => sala.ubicacion[direccion] !== -1);
}

// tirarDado: genera un número entero aleatorio entre min y max (ambos inclusive).
// Simula la tirada de un dado de rol; se usa en el sistema de combate para
// calcular el daño final de cada ataque.
export function tirarDado(min = 1, max = 10) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// obtenerSalaActualId: lee el parámetro ?id= de la URL actual y lo convierte a número.
// Si no hay parámetro o no es un número válido, devuelve el id de la sala de entrada.
// Esto permite que toda la navegación del juego sea reproducible por URL.
export function obtenerSalaActualId() {
    const parametrosURL = new URLSearchParams(window.location.search);
    return parseInt(parametrosURL.get('id')) || idSalas.entrada;
}
