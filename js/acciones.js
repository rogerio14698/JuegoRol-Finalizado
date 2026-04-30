
//Importamos el mapa y los id de las salas 
import { idSalas, mapa } from './mapa.js';
import { personajes } from './personajes.js';

//Definimos los alias de las direcciones para movernos por consola
const aliasDirecciones = {
    norte: 'norte',
    arriba: 'norte',
    sur: 'sur',
    abajo: 'sur',
    este: 'este',
    derecha: 'este',
    oeste: 'oeste',
    izquierda: 'oeste'
};

//Definimos los alias de las salas para movernos por consola.
const aliasSalas = {
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

//Funcion para normalizar el comando introducido por el usuario
function normalizarComando(valor) {
    return valor
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/^ir\s+/, '')
        .replace(/\s+/g, '');
    /*Estas funciones no las comento ya que las veo que son autoexplicativas */
}

function normalizarTextoConEspacios(valor) {
    return valor
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
}


//Esta funcion recibe la sala que estamos y el comando normalizado
function obtenerDestinoPorComando(sala, comandoNormalizado) {
    const direccion = aliasDirecciones[comandoNormalizado];

    if (direccion) {
        return sala.ubicacion[direccion];
    }
    //
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

//Funcion para actualizar el historial de movimientos del jugador
function actualizarHistorial(mensaje) {
    const historial = document.getElementById('historial');

    if (!historial) {
        return;
    }

    const linea = document.createElement('p');
    linea.textContent = mensaje;
    historial.prepend(linea);

    // Persistimos cada entrada en localStorage para que la web la pueda leer
    try {
        const entradas = JSON.parse(localStorage.getItem('historialPartida') || '[]');
        entradas.unshift(mensaje);
        localStorage.setItem('historialPartida', JSON.stringify(entradas));
    } catch (e) {
        // localStorage no disponible; continuamos sin persistir
    }
}

//Esto es un for muy reducido, que muestra todas las direcciones disponibles de la sala.
function obtenerSalidasDisponibles(sala) {
    return Object.keys(sala.ubicacion).filter((direccion) => sala.ubicacion[direccion] !== -1);
}

function actualizarOroUI() {
    const oroHeroeEl = document.getElementById('oroHeroe');
    if (oroHeroeEl) {
        oroHeroeEl.textContent = `Oro: ${personajes.jugador.oro}`;
    }
}

function actualizarAtributosHeroeUI() {
    inicializarSistemaEquipamiento();

    const jugador = personajes.jugador;
    const base = jugador.atributosBase;
    const arma = jugador.equipado?.arma;
    const escudo = jugador.equipado?.escudo;

    const bonusAtaque = arma?.ataque ?? 0;
    const bonusFuerza = arma?.fuerza ?? 0;
    const bonusDefensa = escudo?.defensa ?? 0;
    const bonusVida = escudo?.vida ?? 0;

    const nivelHeroeEl = document.getElementById("nivelHeroe");
    const vidaHeroeEl = document.getElementById("vidaHeroe");
    const ataqueHeroeEl = document.getElementById("ataqueHeroe");
    const fuerzaHeroeEl = document.getElementById("fuerzaHeroe");
    const defensaHeroeEl = document.getElementById("defensaHeroe");

    if (nivelHeroeEl) nivelHeroeEl.textContent = `${jugador.nombre} | ${jugador.nivel}`;
    if (vidaHeroeEl) vidaHeroeEl.textContent = `Vida: ${jugador.salud} + escudo Bonus ${bonusVida}`;
    if (ataqueHeroeEl) ataqueHeroeEl.textContent = `Ataque: ${jugador.ataque} + arma Bonus ${bonusAtaque}`;
    if (fuerzaHeroeEl) fuerzaHeroeEl.textContent = `Fuerza: ${jugador.fuerza} + arma Bonus ${bonusFuerza}`;
    
    if (defensaHeroeEl) defensaHeroeEl.textContent = `Defensa: ${jugador.defensa} + escudo Bonus ${bonusDefensa}`;

    actualizarOroUI();
}

function obtenerSalaActualId() {
    const parametrosURL = new URLSearchParams(window.location.search);
    return parseInt(parametrosURL.get('id')) || idSalas.entrada;
}

function inicializarSistemaEquipamiento() {
    if (!personajes.jugador.atributosBase) {
        personajes.jugador.atributosBase = {
            salud: personajes.jugador.salud,
            ataque: personajes.jugador.ataque,
            defensa: personajes.jugador.defensa,
            fuerza: personajes.jugador.fuerza ?? 0,
        };
    }

    if (!personajes.jugador.equipado) {
        personajes.jugador.equipado = {
            arma: null,
            escudo: null,
        };
    }
}

function esItemEquipable(item) {
    return !!item && typeof item === 'object' && (item.tipo === 'arma' || item.tipo === 'escudo');
}

function recalcularAtributosPorEquipo() {
    inicializarSistemaEquipamiento();

    const base = personajes.jugador.atributosBase;
    const arma = personajes.jugador.equipado.arma;
    const escudo = personajes.jugador.equipado.escudo;

    personajes.jugador.ataque = base.ataque + (arma?.ataque ?? 0);
    personajes.jugador.fuerza = base.fuerza + (arma?.fuerza ?? 0);
    personajes.jugador.defensa = base.defensa + (escudo?.defensa ?? 0);

    const saludConEquipo = base.salud + (escudo?.vida ?? 0);
    personajes.jugador.salud = Math.max(1, saludConEquipo);
}

function obtenerPrecioVenta(item) {
    return Math.max(1, Math.floor((item?.precio ?? 1) / 2));
}

function devolverItemAlMercader(item) {
    const inventarioVendedor = personajes.vendedor.inventario;
    const indiceExistente = inventarioVendedor.findIndex(
        (itemVendedor) => itemVendedor.nombre === item.nombre && itemVendedor.tipo === item.tipo
    );

    if (indiceExistente >= 0) {
        const actual = parsearItemVendedor(inventarioVendedor[indiceExistente]);
        inventarioVendedor[indiceExistente].cantidad = (actual?.cantidad ?? 0) + 1;
        return;
    }

    inventarioVendedor.push({
        ...item,
        cantidad: 1,
    });
}

function equiparItemInventario(indiceItem) {
    const inventario = personajes.jugador.inventario;
    const item = inventario[indiceItem];

    if (!esItemEquipable(item)) {
        actualizarHistorial('Ese objeto no se puede equipar.');
        return;
    }

    inicializarSistemaEquipamiento();
    personajes.jugador.equipado[item.tipo] = item;
    recalcularAtributosPorEquipo();
    actualizarAtributosHeroeUI();
    actualizarInventarioUI();
    actualizarHistorial(`Has equipado ${item.nombre}.`);
}

function procesarComandoEquipar(comandoCrudo) {
    const comando = normalizarTextoConEspacios(comandoCrudo);

    if (!comando.startsWith('equipar ')) {
        return false;
    }

    const nombreObjetivo = comando.replace(/^equipar\s+/, '').trim();
    if (!nombreObjetivo) {
        actualizarHistorial('Indica el nombre del equipo. Ejemplo: equipar espada de hierro');
        return true;
    }

    const indiceItem = personajes.jugador.inventario.findIndex((item) => {
        if (!esItemEquipable(item)) {
            return false;
        }
        return normalizarTextoConEspacios(item.nombre) === nombreObjetivo;
    });

    if (indiceItem === -1) {
        actualizarHistorial(`No tienes "${nombreObjetivo}" en tu inventario o no es equipable.`);
        return true;
    }

    equiparItemInventario(indiceItem);
    return true;
}

function procesarComandoVender(comandoCrudo) {
    const comando = normalizarTextoConEspacios(comandoCrudo);

    if (!comando.startsWith('vender ')) {
        return false;
    }

    const nombreObjetivo = comando.replace(/^vender\s+/, '').trim();
    if (!nombreObjetivo) {
        actualizarHistorial('Indica el nombre del equipo. Ejemplo: vender espada de hierro');
        return true;
    }

    const indiceItem = personajes.jugador.inventario.findIndex((item) => {
        if (!esItemEquipable(item)) {
            return false;
        }
        return normalizarTextoConEspacios(item.nombre) === nombreObjetivo;
    });

    if (indiceItem === -1) {
        actualizarHistorial(`No tienes "${nombreObjetivo}" en tu inventario o no es equipable.`);
        return true;
    }

    venderItemInventario(indiceItem);
    return true;
}

function venderItemInventario(indiceItem) {
    const salaId = obtenerSalaActualId();

    if (salaId !== idSalas.tienda) {
        actualizarHistorial('Solo puedes vender objetos cuando estes en la tienda.');
        return;
    }

    const inventario = personajes.jugador.inventario;
    const item = inventario[indiceItem];

    if (!item || !esItemEquipable(item)) {
        actualizarHistorial('Solo puedes vender equipamiento desde el inventario.');
        return;
    }

    const precioVenta = obtenerPrecioVenta(item);

    inicializarSistemaEquipamiento();
    if (personajes.jugador.equipado[item.tipo] === item) {
        personajes.jugador.equipado[item.tipo] = null;
    }

    inventario.splice(indiceItem, 1);
    personajes.jugador.oro += precioVenta;
    devolverItemAlMercader(item);
    recalcularAtributosPorEquipo();
    actualizarAtributosHeroeUI();
    actualizarInventarioUI();
    actualizarHistorial(`Has vendido ${item.nombre} por ${precioVenta} de oro.`);

    const panelTienda = document.getElementById('panelTienda');
    if (panelTienda && !panelTienda.hidden) {
        renderizarPanelTienda();
    }
}

function actualizarInventarioUI() {
    const inventarioHeroeEl = document.getElementById('inventarioHeroe');
    if (!inventarioHeroeEl) {
        return;
    }

    inicializarSistemaEquipamiento();

    const inventario = personajes.jugador.inventario || [];
    inventarioHeroeEl.innerHTML = '';

    if (inventario.length === 0) {
        const vacio = document.createElement('li');
        vacio.className = 'inventarioVacio';
        vacio.textContent = 'Sin objetos.';
        inventarioHeroeEl.appendChild(vacio);
        return;
    }

    inventario.forEach((item) => {
        const fila = document.createElement('li');
        const nombre = typeof item === 'string' ? item : String(item?.nombre || 'Objeto sin nombre');

        if (!esItemEquipable(item)) {
            fila.textContent = nombre;
            inventarioHeroeEl.appendChild(fila);
            return;
        }

        const slot = item.tipo;
        const estaEquipado = personajes.jugador.equipado[slot] === item;
        fila.textContent = `${nombre}${estaEquipado ? ' (equipado)' : ''}`;

        inventarioHeroeEl.appendChild(fila);
    });
}

function parsearItemVendedor(item) {
    if (typeof item === 'string') {
        const [nombreRaw, precioRaw] = item.split(':');
        const nombre = (nombreRaw || '').trim();
        const precio = Number.parseInt((precioRaw || '').trim(), 10);

        if (!nombre || Number.isNaN(precio) || precio <= 0) {
            return null;
        }

        return { nombre, precio, cantidad: 1, tipo: 'consumible' };
    }

    if (!item || typeof item !== 'object') {
        return null;
    }

    const nombre = String(item.nombre || '').trim();
    const precio = Number.parseInt(item.precio, 10);
    const cantidad = item.cantidad === undefined ? 1 : Number.parseInt(item.cantidad, 10);

    if (!nombre || Number.isNaN(precio) || precio <= 0 || Number.isNaN(cantidad) || cantidad < 0) {
        return null;
    }

    return {
        ...item,
        nombre,
        precio,
        cantidad,
    };
}

function cerrarPanelTienda() {
    const panel = document.getElementById('panelTienda');
    if (panel) {
        panel.hidden = true;
    }
}

function renderizarPanelTienda() {
    const fondoSala = document.querySelector('.fondoSala');
    if (!fondoSala) {
        return;
    }

    let panel = document.getElementById('panelTienda');
    if (!panel) {
        panel = document.createElement('section');
        panel.id = 'panelTienda';
        panel.className = 'panelTienda';
        panel.hidden = true;
        fondoSala.appendChild(panel);
    }

    const items = personajes.vendedor.inventario
        .map((item, indice) => {
            const itemParseado = parsearItemVendedor(item);
            return itemParseado ? { ...itemParseado, indice } : null;
        })
        .filter(Boolean);

    const htmlItems = items.length === 0
        ? '<p class="fuenteParrafo">El mercader no tiene articulos disponibles.</p>'
        : items.map((item) => `
            <article class="itemTienda ${item.cantidad === 0 ? 'itemTiendaAgotado' : ''}">
                <div>
                    <p class="itemTiendaNombre">${item.nombre}</p>
                    <p class="itemTiendaPrecio">${item.precio} de oro</p>
                    <p class="fuenteParrafo">${item.tipo === 'arma' ? `Ataque: ${item.ataque ?? 0} | Fuerza: ${item.fuerza ?? 0}` : ''}${item.tipo === 'escudo' ? `Defensa: ${item.defensa ?? 0} | Vida: ${item.vida ?? 0}` : ''}</p>
                    <p class="fuenteParrafo">Stock: ${item.cantidad}</p>
                </div>
                <button class="boton-verde" data-indice="${item.indice}" ${item.cantidad === 0 ? 'disabled' : ''}>${item.cantidad === 0 ? 'Agotado' : 'Comprar'}</button>
            </article>
        `).join('');

    panel.innerHTML = `
        <div class="panelTiendaCabecera">
            <h3>Tienda del Mercader</h3>
            <button id="btn-cerrar-tienda" class="boton-azul">Cerrar</button>
        </div>
        <div class="panelTiendaItems">${htmlItems}</div>
        <div class="panelTiendaPie">
            <p class="fuenteParrafo">Tu oro actual: <strong>${personajes.jugador.oro}</strong></p>
        </div>
    `;

    const btnCerrar = panel.querySelector('#btn-cerrar-tienda');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarPanelTienda);
    }

    panel.querySelectorAll('button[data-indice]').forEach((botonCompra) => {
        botonCompra.addEventListener('click', () => {
            const indiceItem = Number.parseInt(botonCompra.dataset.indice || '-1', 10);
            const itemOriginal = personajes.vendedor.inventario[indiceItem];
            const itemActual = parsearItemVendedor(itemOriginal);

            if (!itemActual) {
                actualizarHistorial('No se pudo completar la compra del articulo seleccionado.');
                return;
            }

            const nombreItem = itemActual.nombre;
            const precioItem = itemActual.precio;

            if (itemActual.cantidad <= 0) {
                actualizarHistorial(`${nombreItem} esta agotado en la tienda.`);
                return;
            }

            if (personajes.jugador.oro < precioItem) {
                actualizarHistorial(`No tienes oro suficiente para comprar ${nombreItem}.`);
                return;
            }

            personajes.jugador.oro -= precioItem;
            personajes.jugador.inventario.push({ ...itemActual, cantidad: 1 });

            if (itemOriginal && typeof itemOriginal === 'object' && Number.isInteger(itemOriginal.cantidad)) {
                itemOriginal.cantidad = Math.max(0, itemOriginal.cantidad - 1);
            }

            actualizarOroUI();
            actualizarInventarioUI();
            actualizarHistorial(`Has comprado ${nombreItem} por ${precioItem} de oro. Stock restante: ${Math.max(0, itemActual.cantidad - 1)}.`);
            renderizarPanelTienda();
        });
    });
}

export function configurarBotonBuscar() {
    const btnBuscar = document.getElementById('btn-buscar');

    const parametrosURL = new URLSearchParams(window.location.search);
    const salaId = parseInt(parametrosURL.get('id')) || idSalas.entrada;
    const sala = mapa[salaId];

    if (!btnBuscar || !sala) return;

    let yaBusco = false;

    btnBuscar.addEventListener('click', () => {
        if (yaBusco) {
            actualizarHistorial('Ya has buscado en esta sala.');
            return;
        }

        yaBusco = true;
        const oroEncontrado = sala.encontrarOro ?? 0;

        if (oroEncontrado > 0) {
            personajes.jugador.oro += oroEncontrado;
            actualizarHistorial(`Has encontrado ${oroEncontrado} monedas de oro. Total: ${personajes.jugador.oro}`);
            actualizarOroUI();
        } else {
            actualizarHistorial('No has encontrado nada en esta sala.');
        }
    });
}

export function configurarBotonComprar() {
    const btnComprar = document.getElementById('btn-comprar');

    if (!btnComprar) {
        return;
    }

    btnComprar.addEventListener('click', () => {
        const parametrosURL = new URLSearchParams(window.location.search);
        const salaId = parseInt(parametrosURL.get('id')) || idSalas.entrada;

        if (salaId !== idSalas.tienda) {
            actualizarHistorial('Solo puedes comprar cuando estes dentro de la tienda.');
            return;
        }

        renderizarPanelTienda();
        const panel = document.getElementById('panelTienda');
        if (panel) {
            panel.hidden = false;
        }
        actualizarHistorial('Has abierto la tienda del mercader.');
    });
}

export function configurarMovimientoPorComando() {
    const inputComando = document.getElementById('comando');

    // Leemos la sala actual desde los parámetros de URL, igual que mostrarSala()
    const parametrosURL = new URLSearchParams(window.location.search);
    const salaId = parseInt(parametrosURL.get('id')) || idSalas.entrada;
    const sala = mapa[salaId];

    if (!inputComando || !sala) return;

    inputComando.addEventListener('keydown', (event) => {
        //Si presiona enter, se procesa el comando
        if (event.key !== 'Enter') return;

        //Prevenimos que el formulario se envie y la pagina se recargue
        event.preventDefault();

        if (procesarComandoEquipar(inputComando.value)) {
            inputComando.value = '';
            return;
        }

        if (procesarComandoVender(inputComando.value)) {
            inputComando.value = '';
            return;
        }

        //Normalizamos el comando introducido por el usuario
        const comandoNormalizado = normalizarComando(inputComando.value);
        //VEr esto ?¿? que falla
        const destinoId = obtenerDestinoPorComando(sala, comandoNormalizado);




        if (destinoId === null) {
            actualizarHistorial(`No entiendo el comando "${inputComando.value}".`);
            return;
        }
        if (destinoId === -1) {
            actualizarHistorial('Te has topado con una pared amigo, no estas en Hogwarts rey.');
            return;
        }

        if (destinoId === 'ambigua') {
            actualizarHistorial('Hay varias salidas con ese nombre. Usa norte, sur, este u oeste.');
            return;
        }

        if (!comandoNormalizado) {
            actualizarHistorial('Escribe una direccion o una sala antes de moverte.');
            return;
        }
        //Fin de verificacion del comando

        //Ir al destino.

        if (destinoId && destinoId !== 'ambigua' && destinoId !== -1) {
            actualizarHistorial(`Te mueves hacia ${inputComando.value}.`);
            inputComando.value = '';

            //Cambio Clave: Redirigimos a la misma página pero con el nuevo id.
            //Hacemos un epa! jeje , estoy tengo nuevo id y cargo otra vez la misma página.
            window.location.href = window.location.pathname + '?id=' + destinoId;
        }
    });
}

export function mostrarSala() {

    inicializarSistemaEquipamiento();
    recalcularAtributosPorEquipo();

    //1. Obtener Id de la URL
    const parametrosURL = new URLSearchParams(window.location.search);
    const salaId = parseInt(parametrosURL.get('id')) || idSalas.entrada; //Entrada por defecto si no hay id en la URL
    const sala = mapa[salaId];

    if (!sala) return; //Si la sala no existe, no hacemos nada.
    //CAmbiar el fondo dinamicamente segun la sala en la que estamos.
    const fondoSala = document.querySelector('.fondoSala');

    if (fondoSala && sala.imagenSala) {
        //Aplicamos el estilo directamente. 
        //Como en el mapa definimos la ruta de la imagen, la ponemos como fondo directamente.
        fondoSala.style.backgroundImage = `url(${sala.imagenSala})`;

    }

    if (sala.id !== idSalas.tienda) {
        cerrarPanelTienda();
    }

    const nombreSalaEl = document.getElementById("nombreSala");
    const descripcionSalaEl = document.getElementById("descripcionSala");

    if (!nombreSalaEl || !descripcionSalaEl) {
        return;
    }

    //2. Inyectar textos en el template.
    nombreSalaEl.textContent = sala.nombre; //Mostramos el nombre de la sala en el titulo.
    descripcionSalaEl.textContent = sala.descripcion; //Mostramos la descripcion de la sala en el parrafo.
    // Lógica de descripcion de la sala y las salidas disponibles.

    //Aqui podemos ver en que sala nos encontramos.
    let textoFinal = sala.descripcion;

    //3. Logica para salas normales 1 entrada 1 salida.
    const salidasDisponibles = obtenerSalidasDisponibles(sala);

    if (salidasDisponibles.length > 0 && sala.nombre !== "Pasillo") {
        textoFinal += ` Salidas disponibles: ${salidasDisponibles.join(', ')}.`;
    }

    //4. Lógica para los pasillos, ya que pueden tener varias salaidas
    if (sala.nombre === "Pasillo") {
        //Limpiamos la descripcion para el pasillo.
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
        //Asignamos descripcion al pasillo.
        textoFinal = descripcionPasillo;
    }

    //5. Rendizar el texto final en el template.
    descripcionSalaEl.textContent = textoFinal;

    //Añadir la lógica de aparicion de enemigos segun la probabilidad del archivo mapa.js
    const seccionEnemigo = document.querySelector('.enemigo');

    //Solo ejecutamos la lógica de enemigos si la sección existe en el DOM
    if (seccionEnemigo) {
        //Tiramos un numero aleatorio entre 0-1 para ver si aparece el monstruo.
        const dado = Math.random();

        if (sala.probEnemigos > 0 && dado <= sala.probEnemigos && sala.posiblesEnemigos?.length > 0) {
            // APARECE ENEMIGO
            seccionEnemigo.style.display = "block";

            // Elegimos un enemigo al azar de la lista de la sala
            const nombreEnemigoAzar = sala.posiblesEnemigos[Math.floor(Math.random() * sala.posiblesEnemigos.length)];

            // Buscamos en monstruos o en vendedor (que es objeto suelto)
            let datosEnemigo = personajes.monstruos.find(m => m.id === nombreEnemigoAzar);
            if (!datosEnemigo && personajes.vendedor.id === nombreEnemigoAzar) {
                datosEnemigo = personajes.vendedor;
            }

            if (datosEnemigo) {
                const nivelEnemigoEl = document.getElementById("nivelEnemigo");
                const vidaEnemigoEl = document.getElementById("vidaEnemigo");
                const ataqueEnemigoEl = document.getElementById("ataqueEnemigo");
                const defensaEnemigoEl = document.getElementById("defensaEnemigo");
                const imgEnemigoEl = document.querySelector(".imagenEnemigo");
                const tituloEnemigoEl = seccionEnemigo.querySelector(".tituloNombre");

                if (tituloEnemigoEl) tituloEnemigoEl.textContent = datosEnemigo.nombre;
                if (nivelEnemigoEl) nivelEnemigoEl.textContent = `Nombre: ${datosEnemigo.nombre}`;
                if (vidaEnemigoEl) vidaEnemigoEl.textContent = `Vida: ${datosEnemigo.salud}`;
                if (ataqueEnemigoEl) ataqueEnemigoEl.textContent = `Ataque: ${datosEnemigo.ataque}`;
                if (defensaEnemigoEl) defensaEnemigoEl.textContent = `Defensa: ${datosEnemigo.defensa ?? 0}`;
                if (imgEnemigoEl) imgEnemigoEl.src = datosEnemigo.imagen;
                
                //Actualizamos el historial con la aparicion del enemigo.
                //Poner el condicional si es vendedor o monstruo.
                if (datosEnemigo.id !== personajes.vendedor.id) {
                    actualizarHistorial(`¡Cuidado! Un ${datosEnemigo.nombre} ha aparecido.`);
                } else {
                    actualizarHistorial(`¡Bienvenido! El ${datosEnemigo.nombre} te saluda: "Pasen y vean mis artículos!"`);
                    //Aqui vamos a poner la logica de compra de articulos, peor eso más adelante, ultima cosa que hacer aun.
                }
            }
        } else {
            // NO HAY ENEMIGO
            seccionEnemigo.style.display = "none";
        }
    }

    // --- RELLENAR UI DEL JUGADOR ---
    actualizarAtributosHeroeUI();
    actualizarInventarioUI();


}
