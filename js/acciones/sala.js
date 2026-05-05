// ─────────────────────────────────────────────────────────────
// js/acciones/sala.js  —  Renderizado de la sala actual
//
// mostrarSala() es la función principal que se llama al entrar a cualquier sala.
// Lee el id de la sala desde la URL (?id=...), busca sus datos en mapa.js,
// muestra el fondo, la descripción y, con cierta probabilidad, hace aparecer
// un enemigo que inicia el combate automáticamente.
// ─────────────────────────────────────────────────────────────

import { idSalas, mapa, personajes, estadoCombate, obtenerSalaActualId, obtenerSalidasDisponibles, actualizarHistorial } from './shared.js';
import { inicializarSistemaEquipamiento, recalcularAtributosPorEquipo, actualizarAtributosHeroeUI, actualizarInventarioUI } from './uiHeroe.js';
import { cerrarPanelTienda } from './tienda.js';
import { ocultarDialogoIntroEnSala, crearStatsCombateEnemigo, actualizarUIEnemigoDesdeStats, actualizarEquipoEnemigoUI, iniciarEncuentroConMonstruo } from './combate.js';

// mostrarSala: orquesta todo lo que ocurre al entrar en una sala:
//   1. Inicializa el sistema de equipamiento y recalcula atributos.
//   2. Pone la imagen de fondo de la sala.
//   3. Cierra paneles que no corresponden (tienda, diálogo de intro).
//   4. Escribe el nombre y descripción de la sala en el DOM.
//   5. Genera la descripción de salidas disponibles.
//   6. Lanza o suprime la sección del enemigo según la probabilidad de la sala.
//   7. Actualiza el HUD del héroe.
export function mostrarSala() {
    inicializarSistemaEquipamiento();
    recalcularAtributosPorEquipo();

    // Leemos el id de la sala de la URL (?id=...) y buscamos sus datos en el mapa.
    const salaId = obtenerSalaActualId();
    const sala = mapa[salaId];

    // Si el id no corresponde a ninguna sala conocida, no hacemos nada.
    if (!sala) return;

    const fondoSala = document.querySelector('.fondoSala');

    // Ponemos la imagen de fondo de la sala si existe.
    if (fondoSala && sala.imagenSala) {
        fondoSala.style.backgroundImage = `url(${sala.imagenSala})`;
    }

    // Si no estamos en la tienda, cerramos el panel de la tienda (por si estaba abierto).
    if (sala.id !== idSalas.tienda) {
        cerrarPanelTienda();
    }

    // Si no hay combate activo, ocultamos el diálogo de intro del monstruo.
    if (!estadoCombate.activo) {
        ocultarDialogoIntroEnSala();
    }

    const nombreSalaEl = document.getElementById('nombreSala');
    const descripcionSalaEl = document.getElementById('descripcionSala');

    if (!nombreSalaEl || !descripcionSalaEl) {
        return;
    }

    // Mostramos el nombre y la descripción base de la sala.
    nombreSalaEl.textContent = sala.nombre;
    descripcionSalaEl.textContent = sala.descripcion;

    let textoFinal = sala.descripcion;

    // Obtenemos las salidas con nombres legibles (Norte, Sur, etc.).
    const salidasDisponibles = obtenerSalidasDisponibles(sala);

    // Para la mayoría de salas, añadimos las salidas al texto descriptivo.
    if (salidasDisponibles.length > 0 && sala.nombre !== 'Pasillo') {
        textoFinal += ` Salidas disponibles: ${salidasDisponibles.join(', ')}.`;
    }

    // Los pasillos tienen una descripción dinámica que detalla cada dirección.
    if (sala.nombre === 'Pasillo') {
        let descripcionPasillo = '';

        for (let direccion in sala.ubicacion) {
            const destino = sala.ubicacion[direccion];

            // Describimos cada dirección del pasillo con texto informátivo.
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
        // Tiramos un número aleatorio entre 0 y 1.
        // Si es menor o igual que probEnemigos, aparece un enemigo.
        const dado = Math.random();

        if (sala.probEnemigos > 0 && dado <= sala.probEnemigos && sala.posiblesEnemigos?.length > 0) {
            // Mostramos la sección del enemigo.
            seccionEnemigo.style.display = 'block';

            // Elegimos un enemigo aleatorio de la lista de posibles enemigos de la sala.
            const nombreEnemigoAzar = sala.posiblesEnemigos[Math.floor(Math.random() * sala.posiblesEnemigos.length)];

            // Buscamos los datos del enemigo en la lista de monstruos.
            let datosEnemigo = personajes.monstruos.find((m) => m.id === nombreEnemigoAzar);
            // Si no es un monstruo, comprobamos si es el vendedor (en la sala tienda puede aparecer).
            if (!datosEnemigo && personajes.vendedor.id === nombreEnemigoAzar) {
                datosEnemigo = personajes.vendedor;
            }

            if (datosEnemigo) {
                const imgEnemigoEl = document.querySelector('.imagenEnemigo');
                const tituloEnemigoEl = document.getElementById('tituloEnemigo');

                // Creamos las estadísticas de combate del enemigo y actualizamos su UI.
                const statsCombate = crearStatsCombateEnemigo(datosEnemigo);

                if (tituloEnemigoEl) tituloEnemigoEl.textContent = datosEnemigo.nombre;
                if (imgEnemigoEl) imgEnemigoEl.src = datosEnemigo.imagen;
                actualizarUIEnemigoDesdeStats(statsCombate);
                actualizarEquipoEnemigoUI(datosEnemigo.equipo);

                if (datosEnemigo.id !== personajes.vendedor.id) {
                    // Es un monstruo: iniciamos el combate.
                    actualizarHistorial(`¡Cuidado! Un ${datosEnemigo.nombre} ha aparecido.`);
                    iniciarEncuentroConMonstruo(datosEnemigo, seccionEnemigo);
                } else {
                    // Es el vendedor: lo mostramos con un saludo amistoso.
                    actualizarHistorial(`¡Bienvenido! El ${datosEnemigo.nombre} te saluda: "Pasen y vean mis artículos!"`);
                }
            }
        } else {
            // La sala no tiene enemigo esta vez: ocultamos la sección del enemigo.
            seccionEnemigo.style.display = 'none';
        }
    }

    // Actualizamos el HUD del héroe al final para mostrar los stats al día.
    actualizarAtributosHeroeUI();
    actualizarInventarioUI();
}
