// ─────────────────────────────────────────────────────────────────────────────
// js/mapa.js  — Definición del mapa de la mazmorra
//
// Este archivo contiene dos exportaciones clave:
//   · idSalas: un objeto que asigna un número único a cada sala.
//              Ese número es el que aparece en la URL (?id=X) cuando el jugador se mueve.
//   · mapa:    un objeto donde cada clave es un id de sala y cada valor es
//              un objeto con toda la información de esa sala (nombre, descripción,
//              imagen de fondo, salidas disponibles, enemigos posibles y oro).
//
// Para añadir una sala nueva: agrégala a idSalas con un número único,
// luego añade su bloque en mapa con todas sus propiedades.
// ─────────────────────────────────────────────────────────────────────────────

// ── Tabla de ids de sala ──────────────────────────────────────────────────────
// Cada sala tiene un número que la identifica unívocamente.
// Usamos este objeto como "diccionario" para no usar números mágicos en el código:
// en lugar de escribir 1, escribimos idSalas.entrada, que es más legible.
// El pasillo está dividido en tramos (A, B, C, D) para que cada tramo tenga
// su propio id y no haya conflictos de navegación.
export const idSalas = {"entrada": 1,
    //Los tramos del pasillo central de la mazmorra
    "pasilloA": 2,  "pasilloB": 3, "pasilloC": 4, "pasilloD": 5,
    "sala1": 6, "sala2": 7,
    "sala3": 8, "sala4": 9, 
    "salaJefe": 10, "tienda": 11, 
    "anteSalaJefe": 12};

// ── Datos de cada sala del mapa ───────────────────────────────────────────────
// El objeto mapa usa los ids como clave, lo que permite acceder a cualquier sala
// con mapa[idSalas.entrada] o mapa[1] directamente.
//
// Cada sala tiene estas propiedades:
//   · id          → número de sala (igual que la clave del objeto, para tenerlo accesible).
//   · nombre      → texto que aparece como título en pantalla.
//   · descripcion → texto narrativo que se muestra debajo del nombre.
//   · imagenSala  → ruta de la imagen de fondo del área de juego.
//   · ubicacion   → objeto con cuatro direcciones (norte/sur/este/oeste).
//                   Cada dirección apunta al id de la sala destino, o -1 si hay pared.
//   · probEnemigos→ probabilidad de que aparezca un enemigo al entrar (0 = nunca, 1 = siempre).
//   · encontrarOro→ cantidad de oro que el jugador puede encontrar al buscar en la sala.
//   · posiblesEnemigos → array con los ids de los monstruos que pueden aparecer aquí.
export const mapa = {
    [idSalas.entrada]: {
        id: idSalas.entrada,
        nombre: "Entrada",
        descripcion: "El aire se ha vuelto más denso de repente, se avecina combates!",
        imagenSala: "../img/entrada.png",
        ubicacion: {norte: -1, sur: -1, este: idSalas.pasilloA, oeste: -1},
        probEnemigos: 0,
        encontrarOro: 0,
        posiblesEnemigos: [],
    },
    //Primer tramo del pasillo, solo para direccionar a las salas
    //El primer tramo solo puede llevar a la tienda si vas hacia el norte y a sala 1 si vas hacia el sur
    //Al avanzar en el passillo ya cambias a la segunda parte del pasillo.
    [idSalas.pasilloA]: {
        id: idSalas.pasilloA,
        nombre: "Pasillo",
        descripcion: "",
        imagenSala: "../img/pasillo.png",
        //Vas al norte tienda y sur sala 1
        ubicacion: {norte: idSalas.tienda, sur: idSalas.sala1, este: idSalas.entrada, oeste: idSalas.pasilloB},
        probEnemigos: 0,
        encontrarOro: 1,
        posiblesEnemigos: [],
    },
    [idSalas.tienda]: {
        id: idSalas.tienda,
        nombre: "Tienda",
        descripcion: "Pasen y vean, los diferentes artilugios y armas más letales del mundo!",
        imagenSala: "../img/tienda.png",
        //Si vas al sur vuelves al pasillo, la sala no tiene salidas.
        ubicacion: {norte: -1, sur: idSalas.pasilloA, este: -1, oeste: -1},
        probEnemigos: 1,
        encontrarOro: 0,
        posiblesEnemigos: ["vendedor"],
    },
    [idSalas.sala1]: {
        id: idSalas.sala1,
        nombre: "Hall de la mazmorra",
        descripcion: "Que son eso huesos en el suelo? parece que hay una bestia enorme aqui…",
        imagenSala: "../img/salaPerro.png",
        //Para salir de la sala, vas al sury vuelves al pasillo, no hay mas salidas
        ubicacion: {norte: idSalas.pasilloA, sur: -1, este: -1, oeste: -1},
        probEnemigos: 0.5,
        encontrarOro: 3,
        posiblesEnemigos: ["perro-guardian"],
    },
    //Aqui ya estamos en el bloque B de pasillo.
    [idSalas.sala2]: {
        id: idSalas.sala2,
        nombre: "Jardín de vidrio",
        descripcion: "Que preciosidad, nun he visto un jardín tan bonito como este!",
        imagenSala: "../img/salaDemogorgon.png",
        ubicacion: {norte: -1, sur: idSalas.pasilloB, este: -1, oeste: -1},
        probEnemigos: 0.5,
        posiblesEnemigos: ["demogorgon"],
    },
    [idSalas.sala3]: {
        id: idSalas.sala3,
        nombre: "Laboratorio de runas",
        descripcion: "¡Qué horror, esas runas son muy antiguas!",
        imagenSala: "../img/salaWarlock.png",
        ubicacion: {norte: idSalas.pasilloB, sur: -1, este: -1, oeste: -1},
        probEnemigos: 0.5,
        encontrarOro: 3,
        posiblesEnemigos: ["warlock"],
    },
    [idSalas.pasilloB]: {
        id: idSalas.pasilloB,
        nombre: "Pasillo",
        descripcion: "Veamos a donde nos lleva este pasillo",
        imagenSala: "../img/pasillo.png",
        //Al final del pasillo es la sala 4 y para volver al vuelves al pasillo A
        ubicacion: {norte: idSalas.sala2, sur: idSalas.sala3, este: idSalas.pasilloA, oeste: idSalas.sala4},
        probEnemigos: 0,
        encontrarOro: 2,
        posiblesEnemigos: [],
    },
    
    [idSalas.sala4]: {
        id: idSalas.sala4,
        nombre: "Puertas al trono",
        descripcion: "Se han congelado! Alquien lo hizo a proposito, parece que hay algo importante detras de estas puertas…",
        imagenSala: "../img/sala4.png",
        ubicacion: {norte: -1, sur: idSalas.pasilloC, este: idSalas.pasilloB, oeste: -1},
        probEnemigos: 0.5,
        encontrarOro: 6,
        posiblesEnemigos: ["elfo-magico"],
    },
    [idSalas.pasilloC]: {
        id: idSalas.pasilloC,
        nombre: "Pasillo",
        descripcion: "",
        imagenSala: "../img/pasilloC.png",
        //Al final del pasillo es la sala 4 y para volver al vuelves al pasillo A
        ubicacion: {norte: idSalas.sala4, sur: idSalas.anteSalaJefe, este: -1, oeste: -1},
        probEnemigos: 0,
        encontrarOro: 8,
        posiblesEnemigos: [],
    },
    [idSalas.anteSalaJefe]: {
        id: idSalas.anteSalaJefe,
        nombre: "Ante sala Boss Santuario Impío",
        descripcion: "¿Un altar? ¿Qué demonios es esto?!",
        imagenSala: "../img/salaSemiJefe.png",
        ubicacion: {norte: idSalas.pasilloC, sur: -1, este: -1, oeste: idSalas.pasilloD},
        probEnemigos: 0.5,
        encontrarOro: 10,
        posiblesEnemigos: ["bestia-warlock"],
    },
    [idSalas.pasilloD]: {
        id: idSalas.pasilloD,
        nombre: "Pasillo",
        descripcion: "",
        imagenSala: "../img/pasilloD.png",
        //Al final del pasillo es la sala 4 y para volver al vuelves al pasillo A
        ubicacion: {norte: -1, sur: -1, este: idSalas.anteSalaJefe, oeste: idSalas.salaJefe},
        probEnemigos: 0,
        encontrarOro: 5,
        posiblesEnemigos: [],
    },
    [idSalas.salaJefe]: {
        id: idSalas.salaJefe,
        nombre: "Sala del Trono Impío",
        descripcion: "Un demonio se acerca entre las sombras, parece que se va a sentar en su trono!",
        imagenSala: "../img/salaFinal.png",
        ubicacion: {norte: -1, sur: -1, este: idSalas.anteSalaJefe, oeste: -1 },
        //El jefe final siempre aparece en esta sala
        probEnemigos: 1,
        encontrarOro: 10,
        posiblesEnemigos: ["lilih"],
    },
    
    
}
//Fin del mapa.

