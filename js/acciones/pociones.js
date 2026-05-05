// ─────────────────────────────────────────────────────────────
// js/acciones/pociones.js  —  Sistema de pociones de salud
//
// El jugador puede usar pociones desde el botón "Poción" del HUD o
// escribiendo comandos como "pocion", "tomar pocion", "beber pocion".
// Cada uso restaura CURACION_POCION (10) puntos de vida, respetando
// el límite máximo (vida base + bonus del escudo equipado).
// ─────────────────────────────────────────────────────────────

import { personajes, normalizarTextoConEspacios, actualizarHistorial } from './shared.js';
import { inicializarSistemaEquipamiento, actualizarAtributosHeroeUI, actualizarInventarioUI } from './uiHeroe.js';

// Cuantos puntos de vida recupera el jugador por cada poción usada.
const CURACION_POCION = 10;

// usarPocionHeroe: consume una poción del inventario y restaura vida al jugador.
// Solo funciona si hay pociones disponibles con cantidad > 0.
export function usarPocionHeroe() {
    // Sincronizamos el sistema de equipamiento antes de cualquier cálculo.
    inicializarSistemaEquipamiento();

    const jugador = personajes.jugador;

    // Buscamos el primer item del inventario que sea una poción de salud.
    // Usamos normalizarTextoConEspacios para que funcione con variantes de escritura.
    const indicePocion = jugador.inventario.findIndex((item) => {
        if (!item || typeof item !== 'object') {
            return false;
        }

        const nombreNormalizado = normalizarTextoConEspacios(String(item.nombre || ''));
        const esConsumible = item.tipo === 'consumible';
        return esConsumible && (nombreNormalizado === 'pocion' || nombreNormalizado === 'pocion de salud');
    });

    // Si no encontramos ninguna poción en el inventario, informamos y salimos.
    if (indicePocion === -1) {
        actualizarHistorial('No te quedan pociones en el inventario.');
        return;
    }

    const pocion = jugador.inventario[indicePocion];
    const cantidadActual = Number.parseInt(pocion.cantidad, 10) || 0;

    // Verificamos que la cantidad sea mayor que 0 (puede haber un slot con cantidad 0).
    if (cantidadActual <= 0) {
        // Si la cantidad es 0, eliminamos el slot del inventario para limpiarlo.
        jugador.inventario.splice(indicePocion, 1);
        actualizarInventarioUI();
        actualizarHistorial('No te quedan pociones en el inventario.');
        return;
    }

    // Calculamos la vida máxima del jugador: salud base + bonus del escudo equipado.
    const vidaBase = jugador.atributosBase?.salud ?? jugador.salud;
    const bonusVidaEscudo = jugador.equipado?.escudo?.vida ?? 0;
    const vidaMaxima = vidaBase + bonusVidaEscudo;
    const saludAnterior = jugador.salud;

    // Restauramos la vida sin superar la vida máxima.
    jugador.salud = Math.min(vidaMaxima, jugador.salud + CURACION_POCION);

    // Reducimos la cantidad de pociones en el inventario.
    pocion.cantidad = cantidadActual - 1;
    if (pocion.cantidad <= 0) {
        // Si ya no quedan, eliminamos el slot del inventario.
        jugador.inventario.splice(indicePocion, 1);
    }

    // Actualizamos la interfaz para reflejar los cambios.
    actualizarAtributosHeroeUI();
    actualizarInventarioUI();

    // Calculamos cuánta vida se curió realmente (puede ser menos de 10 si ya estaba casi lleno).
    const curadoReal = jugador.salud - saludAnterior;
    actualizarHistorial(`Usas una pocion y recuperas ${curadoReal} de vida. Pociones restantes: ${Math.max(0, cantidadActual - 1)}.`);
}

// procesarComandoPocion: recibe el texto que escribe el jugador y comprueba
// si es un comando para usar una poción. Devuelve true si lo era, false si no.
export function procesarComandoPocion(comandoCrudo) {
    const comando = normalizarTextoConEspacios(comandoCrudo);

    // Lista de todas las formas en que el jugador puede escribir el comando de poción.
    const comandosPocion = ['pocion', 'tomar pocion', 'beber pocion', 'usar pocion'];

    if (!comandosPocion.includes(comando)) {
        return false;  // El texto no es un comando de poción.
    }

    usarPocionHeroe();
    return true;  // Sí era un comando de poción, ya procesado.
}

// configurarBotonPocion: registra el listener del botón "Poción" en la consola.
export function configurarBotonPocion() {
    const btnPocion = document.getElementById('btn-pocion');

    if (!btnPocion) {
        return;
    }

    // Cuando el jugador hace clic, simplemente llamamos a usarPocionHeroe.
    btnPocion.addEventListener('click', () => {
        usarPocionHeroe();
    });
}
