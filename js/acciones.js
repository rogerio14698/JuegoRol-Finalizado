// ─────────────────────────────────────────────────────────────
// js/acciones.js  —  Punto central de exportación de acciones
//
// Este archivo actúa como un "índice" o "barril" (barrel file).
// No tiene lógica propia: solo re-exporta funciones de los módulos
// individuales para que app.js solo necesite importar desde un lugar.
// Si mañana añades una acción nueva, la registras aquí y ya está disponible.
// ─────────────────────────────────────────────────────────────

// Movimiento por teclado: escucha el input de texto y mueve al jugador entre salas.
export { configurarMovimientoPorComando } from './acciones/movimiento.js';

// Botón Buscar: busca oro en la sala actual (solo funciona una vez por visita).
export { configurarBotonBuscar } from './acciones/busqueda.js';

// Botón Comprar y comando de compra rápida: gestiona la tienda del mercader.
export { configurarBotonComprar, procesarComandoComprarPocion } from './acciones/tienda.js';

// Botón Mapa: muestra un panel con la imagen del mapa de la mazmorra.
export { configurarBotonMapa } from './acciones/mapaPanel.js';

// Botón Pocion y comando de texto: usa una poción del inventario para curar al héroe.
export { configurarBotonPocion, procesarComandoPocion } from './acciones/pociones.js';

// Botón Abandonar: reinicia el estado del jugador y vuelve a la sala de entrada.
export { configurarBotonAbandonar } from './acciones/salida.js';

// mostrarSala: función que lee la URL (?id=X) y pinta la sala correspondiente en el DOM.
export { mostrarSala } from './acciones/sala.js';

// Botón Menú: abre el panel con el inventario y las estadísticas detalladas del héroe.
export { configurarBotonMenu } from './acciones/menu.js';

// procesarDropTrasVictoria: lanza la lógica de loot (botín) cuando el jugador gana un combate.
export { procesarDropTrasVictoria } from './acciones/drop.js';
