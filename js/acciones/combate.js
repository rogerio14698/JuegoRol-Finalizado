// ─────────────────────────────────────────────────────────────────────────────
// js/acciones/combate.js  — Sistema de combate por turnos
//
// Gestiona todo el flujo de un encuentro contra un monstruo:
//   1. crearStatsCombateEnemigo: crea el objeto de stats del enemigo para ese combate.
//   2. iniciarEncuentroConMonstruo: inicia el combate con intro de 5s y primer ataque del monstruo.
//   3. ejecutarTurnoMonstruo: calcula el daño del monstruo al héroe.
//   4. procesarComandoAtaque: el héroe escribe "ataque" y golpea al monstruo.
//   5. finalizarCombateVictoria: el monstruo muere → bonificadores, curación y loot.
//   6. procesarComandoVictoria: el héroe escribe "victoria" tras matar a Lilith → fin.
//
// Fórmulas de daño:
//   · Héroe ataca:    fuerza_base + bonus_arma + tirarDado(1,10) - defensa_enemigo
//   · Monstruo ataca: fuerza_monstruo + tirarDado(1,10) - defensa_base_héroe - bonus_escudo
// ─────────────────────────────────────────────────────────────────────────────

import { personajes, idSalas, estadoCombate, RETARDO_TURNO_MONSTRUO_TRAS_ATAQUE_HEROE_MS, normalizarTextoConEspacios, actualizarHistorial, tirarDado, reiniciarEstadoJugador, marcarVictoriaFinalDisponible, tieneVictoriaFinalDisponible, limpiarVictoriaFinalDisponible } from './shared.js';
import { inicializarSistemaEquipamiento, recalcularAtributosPorEquipo, actualizarAtributosHeroeUI, actualizarInventarioUI } from './uiHeroe.js';
import { procesarDropTrasVictoria } from './drop.js';
import { animarEntradaMonstruoDark, animarSlashBestia, animarGolpeEspadaMagica, animeEstaDisponible } from '../animacionesCombate.js';

// actualizarEquipoEnemigoUI: muestra el equipo del enemigo en la sección del DOM.
// Si el enemigo no tiene equipo, muestra "Sin equipo.".
export function actualizarEquipoEnemigoUI(equipo) {
    const equipoEnemigoEl = document.getElementById('equipoEnemigo');
    if (!equipoEnemigoEl) {
        return;
    }

    equipoEnemigoEl.innerHTML = '';
    if (!Array.isArray(equipo) || equipo.length === 0) {
        const vacio = document.createElement('li');
        vacio.className = 'equipoEnemigoVacio';
        vacio.textContent = 'Sin equipo.';
        equipoEnemigoEl.appendChild(vacio);
        return;
    }

    equipo.forEach((item) => {
        const fila = document.createElement('li');
        const nombre = item?.nombre ?? 'Objeto';
        const ataque = item?.ataque ?? 0;
        const defensa = item?.defensa ?? 0;
        fila.textContent = `${nombre} ATK: ${ataque} | DEF: ${defensa}`;
        equipoEnemigoEl.appendChild(fila);
    });
}

// calcularBonusEquipoEnemigo (privada): suma los bonificadores de todo el equipo
// del enemigo y devuelve el total de ataque, defensa y vida extra.
function calcularBonusEquipoEnemigo(equipo) {
    if (!Array.isArray(equipo) || equipo.length === 0) {
        return { ataque: 0, defensa: 0, vida: 0 };
    }

    return equipo.reduce((total, item) => {
        total.ataque += item?.ataque ?? 0;
        total.defensa += item?.defensa ?? 0;
        total.vida += item?.vida ?? 0;
        return total;
    }, { ataque: 0, defensa: 0, vida: 0 });
}

// crearStatsCombateEnemigo: construye el objeto statsCombate del enemigo
// sumando sus stats base con los bonificadores de su equipo.
// El objeto resultante es el que se almacena en estadoCombate.statsCombate
// y se actualiza a medida que el combate avanza (vidaActual cambia con cada golpe).
export function crearStatsCombateEnemigo(datosEnemigo) {
    const bonusEquipo = calcularBonusEquipoEnemigo(datosEnemigo.equipo);
    const vidaBase = datosEnemigo.salud ?? 0;
    const ataqueBase = datosEnemigo.ataque ?? 0;
    const defensaBase = datosEnemigo.defensa ?? 0;
    const fuerzaBase = datosEnemigo.fuerza ?? ataqueBase;
    const vidaConEquipo = vidaBase + bonusEquipo.vida;
    const ataqueConEquipo = ataqueBase + bonusEquipo.ataque;
    const defensaConEquipo = defensaBase + bonusEquipo.defensa;

    return {
        id: datosEnemigo.id,
        nombre: datosEnemigo.nombre,
        vidaBase,
        vidaBonus: bonusEquipo.vida,
        vidaConEquipo,
        vidaTotal: vidaBase,
        vidaActual: vidaBase,
        ataqueBase,
        ataqueBonus: bonusEquipo.ataque,
        ataqueConEquipo,
        ataqueTotal: ataqueBase,
        defensaBase,
        defensaBonus: bonusEquipo.defensa,
        defensaConEquipo,
        defensaTotal: defensaBase,
        fuerzaBase,
        fuerzaBonus: 0,
        fuerzaTotal: fuerzaBase,
    };
}

// actualizarUIEnemigoDesdeStats: refresca los elementos del DOM del enemigo
// (nombre, vida, ataque, defensa) con los valores actuales de statsCombate.
export function actualizarUIEnemigoDesdeStats(statsCombate) {
    const nombreEnemigoEl = document.getElementById('nombreEnemigo');
    const vidaEnemigoEl = document.getElementById('vidaEnemigo');
    const ataqueEnemigoEl = document.getElementById('ataqueEnemigo');
    const defensaEnemigoEl = document.getElementById('defensaEnemigo');

    if (nombreEnemigoEl) nombreEnemigoEl.textContent = `Nombre: ${statsCombate.nombre}`;
    if (vidaEnemigoEl) vidaEnemigoEl.textContent = `Vida: ${Math.max(0, statsCombate.vidaActual)} + Bonus ${statsCombate.vidaBonus}`;
    if (ataqueEnemigoEl) ataqueEnemigoEl.textContent = `Ataque: ${statsCombate.ataqueBase} + Bonus ${statsCombate.ataqueBonus}`;
    if (defensaEnemigoEl) defensaEnemigoEl.textContent = `Defensa: ${statsCombate.defensaBase} + Bonus ${statsCombate.defensaBonus}`;
}

// ocultarDialogoIntroEnSala: oculta con animación el diálogo de introducción
// del monstruo (el texto que aparece flotando en pantalla al inicio del combate).
// Añade la clase 'ocultar' y elimina el elemento del DOM 350ms después.
export function ocultarDialogoIntroEnSala() {
    const dialogoEl = document.getElementById('dialogoIntroCombate');
    if (!dialogoEl) {
        return;
    }

    dialogoEl.classList.add('ocultar');
    setTimeout(() => {
        dialogoEl.remove();
    }, 350);
}

// mostrarDialogoIntroEnSala (privada): crea o reemplaza el diálogo de intro
// del monstruo dentro de .fondoSala y lo oculta automáticamente después de
// duracionMs milisegundos (por defecto 5000 = 5 segundos).
function mostrarDialogoIntroEnSala(texto, duracionMs = 5000) {
    const fondoSala = document.querySelector('.fondoSala');
    if (!fondoSala) {
        return;
    }

    if (estadoCombate.dialogoOverlayTimeoutId) {
        clearTimeout(estadoCombate.dialogoOverlayTimeoutId);
        estadoCombate.dialogoOverlayTimeoutId = null;
    }

    const existente = document.getElementById('dialogoIntroCombate');
    if (existente) {
        existente.remove();
    }

    const dialogo = document.createElement('div');
    dialogo.id = 'dialogoIntroCombate';
    dialogo.className = 'dialogoIntroCombate';
    dialogo.innerHTML = `<p>${texto}</p>`;
    fondoSala.appendChild(dialogo);

    estadoCombate.dialogoOverlayTimeoutId = setTimeout(() => {
        ocultarDialogoIntroEnSala();
        estadoCombate.dialogoOverlayTimeoutId = null;
    }, duracionMs);
}

// limpiarEstadoCombate (privada): cancela todos los timeouts activos y resetea
// el objeto estadoCombate a su estado inicial (activo=false, turno='ninguno', etc.).
// Se llama al terminar el combate, ya sea por victoria o derrota.
function limpiarEstadoCombate() {
    if (estadoCombate.introTimeoutId) {
        clearTimeout(estadoCombate.introTimeoutId);
    }

    if (estadoCombate.dialogoOverlayTimeoutId) {
        clearTimeout(estadoCombate.dialogoOverlayTimeoutId);
    }

    if (estadoCombate.turnoMonstruoTimeoutId) {
        clearTimeout(estadoCombate.turnoMonstruoTimeoutId);
    }

    ocultarDialogoIntroEnSala();

    estadoCombate.activo = false;
    estadoCombate.statsCombate = null;
    estadoCombate.turno = 'ninguno';
    estadoCombate.introTimeoutId = null;
    estadoCombate.dialogoOverlayTimeoutId = null;
    estadoCombate.turnoMonstruoTimeoutId = null;
    estadoCombate.seccionEnemigo = null;
}

// finalizarCombateVictoria (privada): ejecuta todos los efectos de ganar un combate:
//   · Muestra el mensaje de derrota del enemigo.
//   · Incrementa fuerza base +5 y defensa base +3.
//   · Cura el 50% de la vida base del jugador.
//   · Si era Lilith (jefe final), marca la victoria final como disponible.
//   · Llama a procesarDropTrasVictoria() para generar loot.
//   · Limpia el estado de combate.
function finalizarCombateVictoria() {
    const jugador = personajes.jugador;
    const eraJefeFinal = estadoCombate.statsCombate?.id === 'lilih';

    if (estadoCombate.statsCombate) {
        actualizarHistorial(`${estadoCombate.statsCombate.nombre} ha sido derrotado.`);
    }

    inicializarSistemaEquipamiento();
    jugador.atributosBase.fuerza += 5;
    jugador.atributosBase.defensa += 3;
    const curacionVictoria = Math.floor((jugador.atributosBase.salud ?? jugador.salud) * 0.5);
    recalcularAtributosPorEquipo();
    const vidaMaximaActual = (jugador.atributosBase?.salud ?? jugador.salud) + (jugador.equipado?.escudo?.vida ?? 0);
    jugador.salud = Math.min(vidaMaximaActual, jugador.salud + curacionVictoria);
    actualizarAtributosHeroeUI();
    actualizarHistorial('Te fortaleces tras la victoria. Ganas +5 de fuerza y +3 de defensa.');
    actualizarHistorial(`Recuperas ${curacionVictoria} puntos de vida tras la batalla.`);

    if (eraJefeFinal) {
        marcarVictoriaFinalDisponible();
        actualizarHistorial('Lilith ha caido. Escribe "victoria" para cerrar la partida y ver el Historial de Partida.');
    }

    if (estadoCombate.seccionEnemigo) {
        estadoCombate.seccionEnemigo.style.display = 'none';
    }

    procesarDropTrasVictoria();
    limpiarEstadoCombate();
}

// ejecutarTurnoMonstruo (privada): el monstruo ataca al héroe.
// Fórmula de daño: fuerza_monstruo + dado(1-10) - defensa_base_héroe - bonus_escudo.
// Si el héroe muere (salud <= 0), se reinicia el estado y se vuelve a la entrada.
// Si sobrevive, el turno pasa al héroe.
function ejecutarTurnoMonstruo() {
    if (!estadoCombate.activo || !estadoCombate.statsCombate) {
        return;
    }

    const jugador = personajes.jugador;
    const statsCombate = estadoCombate.statsCombate;
    const bonusDefensaHeroe = jugador.equipado?.escudo?.defensa ?? 0;
    const defensaBaseHeroe = jugador.atributosBase?.defensa ?? jugador.defensa;

    const dadoMonstruo = tirarDado(1, 10);
    const danoMonstruo = Math.max(0, statsCombate.fuerzaTotal + dadoMonstruo - defensaBaseHeroe - bonusDefensaHeroe);
    jugador.salud = Math.max(0, jugador.salud - danoMonstruo);

    if (animeEstaDisponible()) {
        animarSlashBestia();
    }

    actualizarHistorial(`${statsCombate.nombre} ataca: ${statsCombate.fuerzaTotal} + ${dadoMonstruo} - ${defensaBaseHeroe} - ${bonusDefensaHeroe} = ${danoMonstruo}`);
    actualizarAtributosHeroeUI();

    if (jugador.salud <= 0) {
        actualizarHistorial('Has caido en combate. Pierdes oro, inventario y bonificadores.');
        reiniciarEstadoJugador();
        limpiarEstadoCombate();
        window.location.href = `${window.location.pathname}?id=${idSalas.entrada}`;
        return;
    }

    estadoCombate.turno = 'heroe';
    actualizarHistorial('Tu turno. Escribe "ataque" para golpear al monstruo.');
}

// iniciarEncuentroConMonstruo: punto de entrada del combate.
// Limpia cualquier combate previo, configura el estado para el nuevo enemigo
// y muestra la introducción (diálogo del monstruo) durante 5 segundos.
// Pasados los 5 segundos, el monstruo ataca primero.
export function iniciarEncuentroConMonstruo(datosEnemigo, seccionEnemigo) {
    if (!datosEnemigo || datosEnemigo.id === personajes.vendedor.id) {
        return;
    }

    limpiarEstadoCombate();

    const statsCombate = crearStatsCombateEnemigo(datosEnemigo);
    estadoCombate.activo = true;
    estadoCombate.statsCombate = statsCombate;
    estadoCombate.turno = 'intro';
    estadoCombate.seccionEnemigo = seccionEnemigo;

    actualizarUIEnemigoDesdeStats(statsCombate);

    const dialogoIntro = datosEnemigo.dialogoIntro || `${datosEnemigo.nombre} ruge y se prepara para el combate.`;
    actualizarHistorial(dialogoIntro);
    mostrarDialogoIntroEnSala(dialogoIntro, 5000);

    if (animeEstaDisponible()) {
        animarEntradaMonstruoDark();
    }

    estadoCombate.introTimeoutId = setTimeout(() => {
        if (!estadoCombate.activo || !estadoCombate.statsCombate || estadoCombate.statsCombate.id !== datosEnemigo.id) {
            return;
        }

        estadoCombate.turno = 'monstruo';
        actualizarHistorial(`La introduccion termina. ${datosEnemigo.nombre} ataca primero.`);
        ejecutarTurnoMonstruo();
    }, 5000);
}

// procesarComandoAtaque: el jugador escribe "ataque" para golpear al monstruo.
// Solo funciona si es el turno del héroe y hay un combate activo.
// Fórmula de daño: fuerza_base + bonus_arma + dado(1-10) - defensa_enemigo.
// Si el monstruo muere, llama a finalizarCombateVictoria.
// Si sobrevive, programa el contraataque del monstruo con RETARDO_TURNO_MONSTRUO.
export function procesarComandoAtaque(comandoCrudo) {
    const comando = normalizarTextoConEspacios(comandoCrudo);

    if (comando !== 'ataque') {
        return false;
    }

    if (!estadoCombate.activo || !estadoCombate.statsCombate) {
        actualizarHistorial('No hay un combate activo en este momento.');
        return true;
    }

    if (estadoCombate.turno === 'intro') {
        actualizarHistorial('Espera a que termine la introduccion del monstruo.');
        return true;
    }

    if (estadoCombate.turno !== 'heroe') {
        actualizarHistorial('Ahora no es tu turno.');
        return true;
    }

    const jugador = personajes.jugador;
    const statsCombate = estadoCombate.statsCombate;
    const bonusFuerzaHeroe = jugador.equipado?.arma?.fuerza ?? 0;
    const fuerzaBaseHeroe = jugador.atributosBase?.fuerza ?? jugador.fuerza;

    const dadoHeroe = tirarDado(1, 10);
    const danoHeroe = Math.max(0, fuerzaBaseHeroe + bonusFuerzaHeroe + dadoHeroe - statsCombate.defensaTotal);
    statsCombate.vidaActual = Math.max(0, statsCombate.vidaActual - danoHeroe);

    if (animeEstaDisponible()) {
        animarGolpeEspadaMagica();
    }

    actualizarHistorial(`Heroe ataca: ${fuerzaBaseHeroe} + ${bonusFuerzaHeroe} + ${dadoHeroe} - ${statsCombate.defensaTotal} = ${danoHeroe}`);
    actualizarUIEnemigoDesdeStats(statsCombate);

    if (statsCombate.vidaActual <= 0) {
        finalizarCombateVictoria();
        return true;
    }

    estadoCombate.turno = 'monstruo';

    if (estadoCombate.turnoMonstruoTimeoutId) {
        clearTimeout(estadoCombate.turnoMonstruoTimeoutId);
    }

    const retardoContraataque = animeEstaDisponible() ? RETARDO_TURNO_MONSTRUO_TRAS_ATAQUE_HEROE_MS : 0;

    estadoCombate.turnoMonstruoTimeoutId = setTimeout(() => {
        estadoCombate.turnoMonstruoTimeoutId = null;

        if (!estadoCombate.activo || !estadoCombate.statsCombate) {
            return;
        }

        ejecutarTurnoMonstruo();
    }, retardoContraataque);

    return true;
}

// procesarComandoVictoria: el jugador escribe "victoria" después de matar a Lilith.
// Solo está disponible si marcarVictoriaFinalDisponible() fue llamada previamente.
// Al ejecutarse: reinicia el estado del jugador y redirige a la portada/historial.
export function procesarComandoVictoria(comandoCrudo) {
    const comando = normalizarTextoConEspacios(comandoCrudo);

    if (comando !== 'victoria') {
        return false;
    }

    if (!tieneVictoriaFinalDisponible()) {
        actualizarHistorial('Aun no has derrotado a Lilith. No puedes declarar la victoria todavia.');
        return true;
    }

    actualizarHistorial('La mazmorra ha sido conquistada. La partida termina con victoria.');
    limpiarVictoriaFinalDisponible();
    reiniciarEstadoJugador();
    window.location.href = '../index.html#historial';
    return true;
}
