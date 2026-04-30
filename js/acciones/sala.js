import { idSalas, mapa, personajes, estadoCombate, obtenerSalaActualId, obtenerSalidasDisponibles, actualizarHistorial } from './shared.js';
import { inicializarSistemaEquipamiento, recalcularAtributosPorEquipo, actualizarAtributosHeroeUI, actualizarInventarioUI } from './uiHeroe.js';
import { cerrarPanelTienda } from './tienda.js';
import { ocultarDialogoIntroEnSala, crearStatsCombateEnemigo, actualizarUIEnemigoDesdeStats, actualizarEquipoEnemigoUI, iniciarEncuentroConMonstruo } from './combate.js';

export function mostrarSala() {
    inicializarSistemaEquipamiento();
    recalcularAtributosPorEquipo();

    const salaId = obtenerSalaActualId();
    const sala = mapa[salaId];

    if (!sala) return;

    const fondoSala = document.querySelector('.fondoSala');

    if (fondoSala && sala.imagenSala) {
        fondoSala.style.backgroundImage = `url(${sala.imagenSala})`;
    }

    if (sala.id !== idSalas.tienda) {
        cerrarPanelTienda();
    }

    if (!estadoCombate.activo) {
        ocultarDialogoIntroEnSala();
    }

    const nombreSalaEl = document.getElementById('nombreSala');
    const descripcionSalaEl = document.getElementById('descripcionSala');

    if (!nombreSalaEl || !descripcionSalaEl) {
        return;
    }

    nombreSalaEl.textContent = sala.nombre;
    descripcionSalaEl.textContent = sala.descripcion;

    let textoFinal = sala.descripcion;

    const salidasDisponibles = obtenerSalidasDisponibles(sala);

    if (salidasDisponibles.length > 0 && sala.nombre !== 'Pasillo') {
        textoFinal += ` Salidas disponibles: ${salidasDisponibles.join(', ')}.`;
    }

    if (sala.nombre === 'Pasillo') {
        let descripcionPasillo = '';

        for (let direccion in sala.ubicacion) {
            const destino = sala.ubicacion[direccion];

            if (destino === idSalas.tienda) {
                descripcionPasillo += `Hay una puerta al ${direccion} que lleva a la tienda. `;
            } else if (destino === idSalas.entrada) {
                descripcionPasillo += `Hay una puerta al ${direccion} que vuelve a la entrada. `;
            } else if ([idSalas.pasilloA, idSalas.pasilloB, idSalas.pasilloC, idSalas.pasilloD].includes(destino)) {
                descripcionPasillo += `Puedes continuar por el ${direccion} hacia otro tramo del pasillo. `;
            } else if (destino !== -1) {
                descripcionPasillo += `Hay una puerta al ${direccion} que lleva a una sala. `;
            } else {
                descripcionPasillo += `Al ${direccion} hay una pared sólida. `;
            }
        }

        textoFinal = descripcionPasillo;
    }

    descripcionSalaEl.textContent = textoFinal;

    const seccionEnemigo = document.querySelector('.enemigo');

    if (seccionEnemigo) {
        const dado = Math.random();

        if (sala.probEnemigos > 0 && dado <= sala.probEnemigos && sala.posiblesEnemigos?.length > 0) {
            seccionEnemigo.style.display = 'block';

            const nombreEnemigoAzar = sala.posiblesEnemigos[Math.floor(Math.random() * sala.posiblesEnemigos.length)];

            let datosEnemigo = personajes.monstruos.find((m) => m.id === nombreEnemigoAzar);
            if (!datosEnemigo && personajes.vendedor.id === nombreEnemigoAzar) {
                datosEnemigo = personajes.vendedor;
            }

            if (datosEnemigo) {
                const imgEnemigoEl = document.querySelector('.imagenEnemigo');
                const tituloEnemigoEl = document.getElementById('tituloEnemigo');
                const statsCombate = crearStatsCombateEnemigo(datosEnemigo);

                if (tituloEnemigoEl) tituloEnemigoEl.textContent = datosEnemigo.nombre;
                if (imgEnemigoEl) imgEnemigoEl.src = datosEnemigo.imagen;
                actualizarUIEnemigoDesdeStats(statsCombate);
                actualizarEquipoEnemigoUI(datosEnemigo.equipo);

                if (datosEnemigo.id !== personajes.vendedor.id) {
                    actualizarHistorial(`¡Cuidado! Un ${datosEnemigo.nombre} ha aparecido.`);
                    iniciarEncuentroConMonstruo(datosEnemigo, seccionEnemigo);
                } else {
                    actualizarHistorial(`¡Bienvenido! El ${datosEnemigo.nombre} te saluda: "Pasen y vean mis artículos!"`);
                }
            }
        } else {
            seccionEnemigo.style.display = 'none';
        }
    }

    actualizarAtributosHeroeUI();
    actualizarInventarioUI();
}
