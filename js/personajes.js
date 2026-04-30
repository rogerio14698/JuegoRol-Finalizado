
import { equipamientos } from './equipamentos.js';

const armaInicial = { ...equipamientos.armas[0], tipo: 'arma', cantidad: 1 };
const escudoInicial = { ...equipamientos.escudos[0], tipo: 'escudo', cantidad: 1 };
const pocionInicial = { nombre: 'Pocion', tipo: 'consumible', cantidad: 3 };

export const personajes = {
    jugador: {
        nombre: "Manolo",
        salud: 100,
        ataque: 10,
        defensa: 5,
        fuerza: 10,
        imagen: "../img/jugador.png",
        nivel: 1,
        experiencia: 0,
        oro: 10000,
        inventario: [armaInicial, escudoInicial, pocionInicial],
        equipado: {
            arma: armaInicial,
            escudo: escudoInicial,
        },
    },
    vendedor:{
        id: "vendedor",
        nombre: "Mercader Errante",
        salud: 100,
        ataque: 0,
        inventario: [
            ...equipamientos.armas.map((arma) => ({ ...arma, tipo: 'arma', cantidad: 1 })),
            ...equipamientos.escudos.map((escudo) => ({ ...escudo, tipo: 'escudo', cantidad: 1 }))
        ],
        imagen: "../img/vendedor.png",
        
        
    },
    monstruos: [
        {
            id: "demogorgon",
            nombre: "Demogorgon",
            salud: 150,
            ataque: 20,
            defensa: 10,
            dialogoIntro: "Gruuuh... He olido tu miedo desde el pasillo. Acercate, presa.",
            equipo: [
                { nombre: "Garra afilada", ataque: 10, defensa: 0, precio: 0 },
                { nombre: "Piel resistente", ataque: 0, defensa: 5, precio: 0 },
            ],
            inventario: [
                {nombre: "Bolsa de oro: 50", ataque: 0, defensa: 0, precio: 0},
                {nombre: "Poción de salud: 20", ataque: 0, defensa: 0, precio: 0},
                {nombre: "Alma de demonio: 1", ataque: 0, defensa: 0, precio: 0},
            ],
            imagen: "../img/demogorgon.png",
        },
        {
            id: "perro-guardian",
            nombre: "Perro Guardián",
            salud: 80,
            ataque: 15,
            defensa: 5,
            dialogoIntro: "¡Grrr! Soy el perro guardián de esta sala. Si quieres pasar, tendrás que enfrentarte a mí... o unirte a mí.",
            equipo: [
                { nombre: "Colmillos afilados", ataque: 8, defensa: 0, precio: 0 },
                { nombre: "Pelaje resistente", ataque: 0, defensa: 4, precio: 0 },
            ],
            inventario: [
                {nombre: "Bolsa de oro: 20", ataque: 0, defensa: 0, precio: 0},
                {nombre: "Poción de salud: 10", ataque: 0, defensa: 0, precio: 0},
            ],
            imagen: "../img/perro.png",
        },
        {
            id: "warlock",
            nombre: "Warlock",
            salud: 120,
            ataque: 25,
            defensa: 15,
            dialogoIntro: "Ah, un intrépido aventurero. ¿Buscas poder? Puedo ofrecerte conocimiento... por un precio.",
                equipo: [
                { nombre: "Varita mágica", ataque: 12, defensa: 0, precio: 0 },
                { nombre: "Ropas encantadas", ataque: 0, defensa: 10, precio: 0 },
            ],
            inventario: [
                {nombre: "Bolsa de oro: 30", ataque: 0, defensa: 0, precio: 0},
                {nombre: "Poción de salud: 15", ataque: 0, defensa: 0, precio: 0},
                {nombre: "Varita mágica: 1", ataque: 0, defensa: 0, precio: 0},
            ],
            imagen: "../img/warlock.png",
        },
        {
            id: "bestia-warlock",
            nombre: "Bestia Warlock",
            salud: 200,
            ataque: 30,
            defensa: 20,
            dialogoIntro: "¡Grrr! Soy la Bestia Warlock, el terror de estas tierras. Si quieres pasar, tendrás que enfrentarte a mí... o unirte a mí.",
                equipo: [
                { nombre: "Bastón mágico", ataque: 15, defensa: 0, precio: 0 },
                { nombre: "Piel encantada", ataque: 0, defensa: 12, precio: 0 },
            ],
            inventario: [
                {nombre: "Bolsa de oro: 100", ataque: 0, defensa: 0, precio: 0},
                {nombre: "Poción de salud: 50", ataque: 0, defensa: 0, precio: 0},
                {nombre: "Varita mágica: 1", ataque: 0, defensa: 0, precio: 0},
                {nombre: "Alma de demonio: 2", ataque: 0, defensa: 0, precio: 0},
            ],
            imagen: "../img/bestiaWarlock.png",
        },
        {
            id: "elfo-magico",
            nombre: "Elfo Mágico",
            salud: 90,
            ataque: 18,
            defensa: 8,
            dialogoIntro: "Saludos, viajero. Soy un elfo mágico, guardián de los secretos arcanos. Si buscas conocimiento o poder, puedo ayudarte... por un precio.",
            equipo: [
                { nombre: "Bastón Arcano", ataque: 10, defensa: 0, precio: 0 },
                { nombre: "Ropas Mágicas", ataque: 0, defensa: 5, precio: 0 },
            ],
            inventario: [
                {nombre: "Bolsa de oro: 40", ataque: 0, defensa: 0, precio: 0},
                {nombre: "Poción de salud: 15", ataque: 0, defensa: 0, precio: 0},
                {nombre: "Varita mágica: 1", ataque: 0, defensa: 0, precio: 0},
            ],
            imagen: "../img/elfo.png",
        },
        {
            id: "lilih",
            nombre: "Lilih",
            salud: 400,
            ataque: 40,
            defensa: 50,
            dialogoIntro: "¡Ah, un intrépido aventurero! Soy Lilith, la reina de las sombras. Si buscas poder, conocimiento o simplemente un desafío digno, has venido al lugar correcto... pero ten cuidado, no todos los que se acercan a mí salen con vida.",
            equipo: [
                { nombre: "Garras de Lilith", ataque: 20, defensa: 0, precio: 0 },
                { nombre: "Piel de demonio", ataque: 0, defensa: 30, precio: 0 },
            ],
            inventario: [
                {nombre: "Trofeo de Lilith", ataque: 0, defensa: 0, precio: 0},
                {nombre: "Bolsa de oro: 200", ataque: 0, defensa: 0, precio: 0},
                {nombre: "Poción de salud: 100", ataque: 0, defensa: 0, precio: 0},
                {nombre: "Alma de demonio: 5", ataque: 0, defensa: 0, precio: 0},
            ],
            imagen: "../img/lilith.png",

        }
    ],
    
}