// ─────────────────────────────────────────────────────────────
// app.js  —  Punto de entrada principal del juego
// Este archivo se ejecuta cuando el navegador carga salas/entrada.html.
// Su misión es: cargar templates HTML, pintar la sala actual y
// registrar todos los botones/comandos de la consola.
// ─────────────────────────────────────────────────────────────

// Importamos todas las funciones que configuran los botones y acciones del juego.
// Cada función viene de su propio módulo dentro de js/acciones/.
import { configurarMovimientoPorComando, configurarBotonBuscar, configurarBotonComprar, configurarBotonMapa, configurarBotonPocion, configurarBotonAbandonar, mostrarSala, configurarBotonMenu } from './js/acciones.js';

// Esta función inyecta plantillas HTML externas dentro de contenedores del DOM.
import { renderizarTemplate } from './js/cargarTemplates.js';

// Inicializa la librería de animaciones Anime.js cargándola desde CDN.
import { inicializarAnimeJS } from './js/animacionesCombate.js';

// Funciones para guardar y restaurar el estado del jugador desde localStorage.
import { cargarEstadoJugador, guardarEstadoJugador } from './js/acciones/shared.js';

// Objeto central de personajes; necesario para aplicar el nombre elegido en la portada.
import { personajes } from './js/personajes.js';

// ── Botón de inicio (portada index.html) ──────────────────────
// Este botón existe en la portada (index.html), no dentro del juego.
// Si existe en el DOM, al hacer clic nos lleva a la sala de entrada.
const btnInicio = document.getElementById("btnInicio");
if (btnInicio) {
    btnInicio.addEventListener("click", () => {
        // Redirigimos al jugador a la primera sala del juego.
        window.location.href = "salas/entrada.html";
    });
}

// ── Función principal del juego ───────────────────────────────
// Esta función es asíncrona porque necesita esperar a que se
// descarguen los archivos HTML de los templates antes de continuar.
async function iniciarPantalla() {
    try {
        // 1. Intentamos restaurar el estado guardado del jugador desde localStorage.
        //    Si no hay nada guardado, se usa el estado inicial por defecto.
        cargarEstadoJugador();

            // Aplicamos el nombre elegido en la portada si el jugador lo introdujo antes de entrar.
            // Una vez aplicado, borramos la clave para que no persista en recargas posteriores.
            try {
                const nombrePendiente = localStorage.getItem('nombreJugadorPendiente');
                if (nombrePendiente) {
                    personajes.jugador.nombre = nombrePendiente;
                    localStorage.removeItem('nombreJugadorPendiente');
                }
            } catch (e) {
                // localStorage no disponible; continuamos con el nombre por defecto
            }

        // 2. Buscamos los contenedores donde se van a inyectar los templates.
        //    Si no existen en el HTML actual, significa que no estamos en la página
        //    correcta y no tiene sentido continuar.
        const contenedorPrincipal = document.getElementById('contenedorPrincipal');
        const contenedorConsola = document.getElementById('contenedorConsola');

        if (!contenedorPrincipal || !contenedorConsola) {
            return;
        }

        // 3. Cargamos el template de la sala (fondo, héroe, enemigo, stats).
        //    Hasta que esto no termine, el template no existe en el DOM.
        await renderizarTemplate('contenedorPrincipal', '../template/templateMain.html');

        // 4. Cargamos el template de la consola de comandos (input, historial, botones).
        //    Debe hacerse después del template principal porque comparte el mismo HTML.
        await renderizarTemplate('contenedorConsola', '../template/templateConsola.html');

        // 5. Ahora que los elementos YA existen en el DOM, podemos pintarlos con datos reales.
        //    mostrarSala() lee el parámetro ?id= de la URL y carga la sala correspondiente.
        mostrarSala();

        // 6. Registramos los listeners de todos los botones y el input de comandos.
        //    Estos también deben hacerse después de renderizar los templates, porque
        //    los botones no existen antes de inyectar el HTML.
        configurarMovimientoPorComando(); // Escucha el input de texto (comandos de movimiento/combate).
        configurarBotonBuscar();          // Botón "Buscar" → busca oro en la sala actual.
        configurarBotonComprar();         // Botón "Comprar" → abre el panel de la tienda.
        configurarBotonMapa();            // Botón "Mapa" → muestra el panel del mapa.
        configurarBotonPocion();          // Botón "Pocion" → usa una poción del inventario.
        configurarBotonAbandonar();       // Botón "Abandonar cueva" → reinicia y vuelve al inicio.
        configurarBotonMenu();            // Botón "Menu" → abre el panel de inventario y estadísticas.

        // 7. Intentamos cargar Anime.js desde CDN para tener animaciones de combate.
        //    Si falla (sin internet), el juego funciona igual pero sin animaciones.
        await inicializarAnimeJS();

        console.log("Sistema cargado: Sala y Consola listas.");
    } catch (error) {
        // Si cualquier paso falla, mostramos el error en consola para poder depurarlo.
        console.error("Error cargando la interfaz:", error);
    }
}

// ── Guardado automático del estado ───────────────────────────
// Guardamos el progreso del jugador en localStorage cuando el usuario
// cierra la pestaña o navega fuera, para poder restaurarlo al volver.
window.addEventListener('pagehide', guardarEstadoJugador);
window.addEventListener('beforeunload', guardarEstadoJugador);

// ── Arranque ──────────────────────────────────────────────────
// Ejecutamos la función principal para que todo se ponga en marcha.
iniciarPantalla();