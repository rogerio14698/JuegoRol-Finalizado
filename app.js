import { configurarMovimientoPorComando, configurarBotonBuscar, mostrarSala } from './js/acciones.js';
import { renderizarTemplate } from './js/cargarTemplates.js';

// 1. Lógica del botón de inicio ,no depende de los templates
const btnInicio = document.getElementById("btnInicio");
if (btnInicio) {
    btnInicio.addEventListener("click", () => {
        window.location.href = "salas/entrada.html";
    });
}

// 2. Función principal que construye la página
async function iniciarPantalla() {
    try {
        const contenedorPrincipal = document.getElementById('contenedorPrincipal');
        const contenedorConsola = document.getElementById('contenedorConsola');

        if (!contenedorPrincipal || !contenedorConsola) {
            return;
        }

        // A. Renderizamos el esqueleto de la sala
        // IMPORTANTE: Asegúrate de que en tu sala (ej. entrada.html) haya un id="contenedorPrincipal"
        await renderizarTemplate('contenedorPrincipal', '../template/templateMain.html');
        
        // B. Renderizamos la consola dentro del hueco que dejó el primer template
        await renderizarTemplate('contenedorConsola', '../template/templateConsola.html');

        // C. AHORA que los elementos existen en el DOM, llenamos los datos
        // Ya no necesitas el "if (document.getElementById...)", lo llamamos directamente
        mostrarSala();

        // D. Registramos los eventos del teclado y botones
        configurarMovimientoPorComando();
        configurarBotonBuscar();

        console.log("Sistema cargado: Sala y Consola listas.");
    } catch (error) {
        console.error("Error cargando la interfaz:", error);
    }
}

// Ejecutamos la carga
iniciarPantalla();