import { personajes, idSalas, estadoCombate, RETARDO_TURNO_MONSTRUO_TRAS_ATAQUE_HEROE_MS, normalizarTextoConEspacios, actualizarHistorial, tirarDado, reiniciarEstadoJugador, marcarVictoriaFinalDisponible, tieneVictoriaFinalDisponible, limpiarVictoriaFinalDisponible } from './shared.js';
import { inicializarSistemaEquipamiento, recalcularAtributosPorEquipo, actualizarAtributosHeroeUI, actualizarInventarioUI } from './uiHeroe.js';
import { procesarDropTrasVictoria } from './drop.js';
import { animarEntradaMonstruoDark, animarSlashBestia, animarGolpeEspadaMagica, animeEstaDisponible } from '../animacionesCombate.js';

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
