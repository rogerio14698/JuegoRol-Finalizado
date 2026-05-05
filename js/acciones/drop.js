// ─────────────────────────────────────────────────────────────
// js/acciones/drop.js  —  Botín tras vencer un combate
//
// Cuando el jugador derrota a un enemigo, existe una probabilidad (40%) de
// que aparezca un objeto de botín: una espada o un escudo con bonificaciones
// aleatorias. Si el objeto encontrado es mejor que el equipado actualmente,
// se equipa automáticamente.
// ─────────────────────────────────────────────────────────────

import { personajes, actualizarHistorial, tirarDado } from './shared.js';
import { recalcularAtributosPorEquipo, actualizarAtributosHeroeUI, actualizarInventarioUI, ajustarSaludPorCambioDeEscudo } from './uiHeroe.js';

// procesarDropTrasVictoria: decide si cae botín y de qué tipo.
// Se llama desde combate.js justo después de que el jugador gana un combate.
export function procesarDropTrasVictoria() {
    // Lanzamos un número aleatorio entre 0 y 1.
    // Si es mayor que 0.40 (60% de los casos), no cae botín y terminamos.
    const chanceDrop = Math.random();

    if (chanceDrop > 0.40) {
        return;
    }

    // 50% de probabilidad: o cae una espada o cae un escudo.
    const tipoObjeto = Math.random() < 0.50 ? 'espada' : 'escudo';

    // El bonificador es un número aleatorio entre 1 y 10 (simulando una tirada de dado).
    const bonificador = tirarDado(1, 10);
    const jugador = personajes.jugador;

    if (tipoObjeto === 'espada') {
        // Comparamos el bonificador del arma encontrada con el del arma equipada actualmente.
        const bonusActual = jugador.equipado?.arma?.fuerza ?? 0;
        actualizarHistorial(`Has encontrado una espada con bonificador de ataque: ${bonificador}.`);

        // Solo equipamos si la nueva espada es mejor.
        if (bonificador > bonusActual) {
            const nuevaEspada = {
                nombre: `Espada encontrada (+${bonificador})`,
                ataque: bonificador,
                fuerza: bonificador,
                tipo: 'arma',
                cantidad: 1,
                precio: 0,  // Los objetos de botín no tienen precio (no se pueden vender).
            };
            // Añadimos la espada al inventario y la equipamos directamente.
            jugador.inventario.push(nuevaEspada);
            jugador.equipado.arma = nuevaEspada;
            recalcularAtributosPorEquipo(); // Recalcula ataque/fuerza con el nuevo arma.
            actualizarAtributosHeroeUI();   // Refresca los números en pantalla.
            actualizarInventarioUI();        // Refresca la lista del inventario.
            actualizarHistorial(`Es mejor que tu arma actual (bonificador: ${bonusActual}). ¡La has equipado!`);
        } else {
            actualizarHistorial(`Tu arma actual es mejor (bonificador: ${bonusActual}). El objeto es de peor calidad.`);
        }
    } else {
        // Misma lógica para el escudo.
        const bonusActual = jugador.equipado?.escudo?.defensa ?? 0;
        actualizarHistorial(`Has encontrado un escudo con bonificador de defensa: ${bonificador}.`);

        if (bonificador > bonusActual) {
            const nuevoEscudo = {
                nombre: `Escudo encontrado (+${bonificador})`,
                defensa: bonificador,
                vida: bonificador,  // El bonus de vida del escudo es igual al de defensa.
                tipo: 'escudo',
                cantidad: 1,
                precio: 0,
            };
            const escudoAnterior = jugador.equipado?.escudo ?? null;
            jugador.inventario.push(nuevoEscudo);
            jugador.equipado.escudo = nuevoEscudo;
            // ajustarSaludPorCambioDeEscudo recalcula la vida máxima al cambiar el escudo.
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
