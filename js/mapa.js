//Deffinimos los id para identificar las diferentes salas del juego
export const idSalas = {"entrada": 1,
    //Los bloques del paisllo
    "pasilloA": 2,  "pasilloB": 3, "pasilloC": 4, "pasilloD": 5,
    "sala1": 6, "sala2": 7,
    "sala3": 8, "sala4": 9, 
    "salaJefe": 10, "tienda": 11, 
    "anteSalaJefe": 12};
/*El pasillo se divide en tandos bloques como sea necesario para que las ids no entren en conflito*/

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
        //Probabilidad del 2% del jefe Final aparezca en esta sala
        probEnemigos: 0.02,
        encontrarOro: 10,
        posiblesEnemigos: ["lilih"],
    },
    
    
}
//Fin del mapa.

