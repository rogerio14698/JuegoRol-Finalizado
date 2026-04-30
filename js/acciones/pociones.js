import { personajes, normalizarTextoConEspacios, actualizarHistorial } from './shared.js';
import { inicializarSistemaEquipamiento, actualizarAtributosHeroeUI, actualizarInventarioUI } from './uiHeroe.js';

export function usarPocionHeroe() {
    inicializarSistemaEquipamiento();

    const jugador = personajes.jugador;
    const indicePocion = jugador.inventario.findIndex((item) => {
        if (!item || typeof item !== 'object') {
            return false;
        }

        const nombreNormalizado = normalizarTextoConEspacios(String(item.nombre || ''));
        const esConsumible = item.tipo === 'consumible';
        return esConsumible && (nombreNormalizado === 'pocion' || nombreNormalizado === 'pocion de salud');
    });

    if (indicePocion === -1) {
        actualizarHistorial('No te quedan pociones en el inventario.');
        return;
    }

    const pocion = jugador.inventario[indicePocion];
    const cantidadActual = Number.parseInt(pocion.cantidad, 10) || 0;
    if (cantidadActual <= 0) {
        jugador.inventario.splice(indicePocion, 1);
        actualizarInventarioUI();
        actualizarHistorial('No te quedan pociones en el inventario.');
        return;
    }

    const vidaBase = jugador.atributosBase?.salud ?? jugador.salud;
    const bonusVidaEscudo = jugador.equipado?.escudo?.vida ?? 0;
    const vidaMaxima = vidaBase + bonusVidaEscudo;
    const curacion = Math.max(1, Math.floor(vidaBase * 0.25));
    const saludAnterior = jugador.salud;

    jugador.salud = Math.min(vidaMaxima, jugador.salud + curacion);

    pocion.cantidad = cantidadActual - 1;
    if (pocion.cantidad <= 0) {
        jugador.inventario.splice(indicePocion, 1);
    }

    actualizarAtributosHeroeUI();
    actualizarInventarioUI();

    const curadoReal = jugador.salud - saludAnterior;
    actualizarHistorial(`Usas una pocion y recuperas ${curadoReal} de vida. Pociones restantes: ${Math.max(0, cantidadActual - 1)}.`);
}

export function configurarBotonPocion() {
    const btnPocion = document.getElementById('btn-pocion');

    if (!btnPocion) {
        return;
    }

    btnPocion.addEventListener('click', () => {
        usarPocionHeroe();
    });
}
