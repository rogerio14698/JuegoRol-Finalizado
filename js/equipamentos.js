// ─────────────────────────────────────────────────────────────
// js/equipamentos.js  —  Catálogo de armas y escudos
//
// Define todos los objetos de equipamiento disponibles en el juego.
// Se usa como fuente de datos para:
//   · El jugador inicial (equipado con las primeras piezas de cada lista).
//   · El inventario del vendedor (todas las piezas a la venta).
// Estructura de cada arma:   { nombre, ataque, fuerza, precio }
// Estructura de cada escudo: { nombre, defensa, vida, precio }
// ─────────────────────────────────────────────────────────────

export const equipamientos = {
    // armas: lista de espadas ordenadas de menor a mayor potencia.
    // El primer elemento es el arma inicial del jugador.
    armas: [
        { nombre: "Espada de madera", ataque: 10,fuerza: 5, precio: 1 },
        { nombre: "Espada de hierro", ataque: 20, fuerza: 10, precio: 10 },
        { nombre: "Espada de acero", ataque: 30, fuerza: 15, precio: 20 },
        { nombre: "Espada mágica", ataque: 100, fuerza: 50, precio: 50 },
    ],
    // escudos: lista de escudos ordenados de menor a mayor protección.
    // El primer elemento es el escudo inicial del jugador.
    escudos: [
        { nombre: "Escudo de madera", defensa: 5, vida:10, precio: 1 },
        { nombre: "Escudo de cuero", defensa: 10, vida:50, precio: 10 },
        { nombre: "Escudo de hierro", defensa: 15, vida:100, precio: 20 },
        { nombre: "Escudo mágico", defensa: 25, vida:150, precio: 50 },
    ],
}