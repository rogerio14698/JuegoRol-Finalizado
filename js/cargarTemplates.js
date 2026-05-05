
// ─────────────────────────────────────────────────────────────
// js/cargarTemplates.js  —  Cargador de plantillas HTML externas
//
// El juego separa la estructura HTML en archivos ".html" dentro de /template/.
// Este módulo descarga esos archivos y los inyecta dentro de contenedores
// del DOM en tiempo de ejecución, evitando duplicar código HTML en cada página.
// ─────────────────────────────────────────────────────────────

// Recibe el id del contenedor destino y la ruta del archivo HTML del template.
// Es async porque usa fetch, que es una operación de red y tarda un tiempo indeterminado.
export async function renderizarTemplate(idArea, rutaTemplate) {
    // Buscamos el elemento HTML donde vamos a meter el contenido del template.
    const area = document.getElementById(idArea);

    // El archivo HTML externo no es accesible directamente como variable,
    // así que tenemos que descargarlo con fetch y procesarlo manualmente.
    try {
        // 1. Hacemos una petición HTTP para descargar el archivo del template.
        //    fetch() devuelve una Promesa, por eso usamos await para esperar el resultado.
        const respuestaFetch = await fetch(rutaTemplate);

        // 2. Convertimos la respuesta a texto plano (el HTML como string).
        const textoTemplate = await respuestaFetch.text();

        // 3. Usamos DOMParser para convertir ese string HTML en un documento real
        //    que podemos recorrer como si fuera el DOM de la página.
        const parser = new DOMParser();
        const doc = parser.parseFromString(textoTemplate, 'text/html');

        // 4. Buscamos la etiqueta <template> dentro del documento descargado.
        //    La etiqueta <template> es especial: su contenido no se renderiza
        //    automáticamente, hay que clonarlo y añadirlo manualmente.
        const contenidoTemplate = doc.querySelector('template');

        if (area && contenidoTemplate) {
            // 5. Clonamos el contenido del template.
            //    cloneNode(true) significa "copia todo, incluyendo hijos".
            const clone = contenidoTemplate.content.cloneNode(true);

            // 6. Limpiamos el contenedor para evitar duplicados si se llama varias veces.
            area.innerHTML = '';

            // 7. Insertamos el clon en el DOM. A partir de aquí ya es visible en pantalla.
            area.appendChild(clone);
        }

    } catch (error) {
        // Si el archivo no existe o hay un problema de red, lo anotamos en consola.
        console.error('Error al cargar el template:', error);
    }
}