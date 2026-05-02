import { personajes, actualizarHistorial, tirarDado } from './shared.js';
import { recalcularAtributosPorEquipo, actualizarAtributosHeroeUI, actualizarInventarioUI, ajustarSaludPorCambioDeEscudo } from './uiHeroe.js';

export function procesarDropTrasVictoria() {
    const chanceDrop = Math.random();

    if (chanceDrop > 0.40) {
        return;
    }

    const tipoObjeto = Math.random() < 0.50 ? 'espada' : 'escudo';
    const bonificador = tirarDado(1, 10);
    const jugador = personajes.jugador;

    if (tipoObjeto === 'espada') {
        const bonusActual = jugador.equipado?.arma?.fuerza ?? 0;
        actualizarHistorial(`Has encontrado una espada con bonificador de ataque: ${bonificador}.`);

        if (bonificador > bonusActual) {
            const nuevaEspada = {
                nombre: `Espada encontrada (+${bonificador})`,
                ataque: bonificador,
                fuerza: bonificador,
                tipo: 'arma',
                cantidad: 1,
                precio: 0,
            };
            jugador.inventario.push(nuevaEspada);
            jugador.equipado.arma = nuevaEspada;
            recalcularAtributosPorEquipo();
            actualizarAtributosHeroeUI();
            actualizarInventarioUI();
            actualizarHistorial(`Es mejor que tu arma actual (bonificador: ${bonusActual}). ¡La has equipado!`);
        } else {
            actualizarHistorial(`Tu arma actual es mejor (bonificador: ${bonusActual}). El objeto es de peor calidad.`);
        }
    } else {
        const bonusActual = jugador.equipado?.escudo?.defensa ?? 0;
        actualizarHistorial(`Has encontrado un escudo con bonificador de defensa: ${bonificador}.`);

        if (bonificador > bonusActual) {
            const nuevoEscudo = {
                nombre: `Escudo encontrado (+${bonificador})`,
                defensa: bonificador,
                vida: bonificador,
                tipo: 'escudo',
                cantidad: 1,
                precio: 0,
            };
            const escudoAnterior = jugador.equipado?.escudo ?? null;
            jugador.inventario.push(nuevoEscudo);
            jugador.equipado.escudo = nuevoEscudo;
            ajustarSaludPorCambioDeEscudo(escudoAnterior, nuevoEscudo);
            recalcularAtributosPorEquipo();
            actualizarAtributosHeroeUI();
            actualizarInventarioUI();
            actualizarHistorial(`Es mejor que tu escudo actual (bonificador: ${bonusActual}). ¡Lo has equipado!`);
        } else {
            actualizarHistorial(`Tu escudo actual es mejor (bonificador: ${bonusActual}). El objeto es de peor calidad.`);
        }
    }
}
