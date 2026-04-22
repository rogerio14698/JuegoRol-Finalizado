
// Rutas de los templates que se usarán dentro de index.html.
// Cada bloque visual tiene su propio archivo para mantener el HTML principal más limpio.
const rutaTemplateNavegador = 'template/navegadorExterno.html';
const rutaTemplateTutorial = 'template/tutorial.html';
const rutaTemplateHistorial = 'template/historial.html';
const rutaTemplateCargarPartida = 'template/cargarPartida.html';

// Esta función recibe el id del contenedor donde se inyectará el template
// y la ruta del archivo HTML externo que contiene la etiqueta <template>.
async function cargarTemplatesWeb(idTemplateWeb, rutaTemplateWeb) {
    const templateArea = document.getElementById(idTemplateWeb);

    // Si el contenedor no existe en la página actual, no hacemos nada.
    if (!templateArea) {
        return false;
    }

    try {
        // 1. Cargamos el archivo HTML del template.
        const respuestaFetch = await fetch(rutaTemplateWeb);

        // Si el servidor devuelve un error, detenemos la carga para no insertar HTML incompleto.
        if (!respuestaFetch.ok) {
            throw new Error(`No se pudo cargar el template: ${rutaTemplateWeb}`);
        }

        // 2. Convertimos la respuesta a texto para poder parsearla como documento HTML.
        const textoTemplate = await respuestaFetch.text();

        // 3. Creamos un documento temporal y buscamos la etiqueta <template> dentro del archivo.
        const parser = new DOMParser();
        const doc = parser.parseFromString(textoTemplate, 'text/html');
        const contenidoTemplate = doc.querySelector('template');

        // Si el archivo no contiene una etiqueta <template>, lo consideramos un error de estructura.
        if (!contenidoTemplate) {
            throw new Error(`El archivo ${rutaTemplateWeb} no contiene una etiqueta <template>.`);
        }

        // 4. Clonamos el contenido del template y lo insertamos en el contenedor destino.
        const clone = contenidoTemplate.content.cloneNode(true);
        templateArea.innerHTML = '';
        templateArea.appendChild(clone);

        return true;
    } catch (error) {
        console.error('Error al cargar los templates:', error);
        return false;
    }
}

// Esta función controla qué bloque de la portada se ve en cada momento.
// Por ahora sólo alterna entre la vista de inicio y la vista del tutorial.
function mostrarVista(vista) {
    const inicio = document.querySelector('.inicio');
    const tutorial = document.getElementById('tutorial');
    const historial = document.getElementById('historial');
    const cargarPartida = document.getElementById('cargarPartida');

    // Si falta alguno de los bloques visuales, salimos para evitar errores en tiempo de ejecución.
    if (!inicio || !tutorial || !historial || !cargarPartida) {
        return;
    }

    // La vista por defecto es la portada con el botón de empezar.
    if (vista === 'inicio') {
        inicio.hidden = false;
        tutorial.hidden = true;
        historial.hidden = true;
        cargarPartida.hidden = true;
        return;
    }

    // Cuando el usuario abre el tutorial, escondemos la portada y mostramos ese contenido.
    if (vista === 'tutorial') {
        inicio.hidden = true;
        tutorial.hidden = false;
        historial.hidden = true;
        cargarPartida.hidden = true;
        return;
    }
    if (vista === 'historial') {
        inicio.hidden = true;
        tutorial.hidden = true;
        historial.hidden = false;
        cargarPartida.hidden = true;
        return;
    }
    if (vista === 'cargarPartida') {
        inicio.hidden = true;
        tutorial.hidden = true;
        historial.hidden = true;
        cargarPartida.hidden = false;
        return;
    }
}

// Este bloque escucha los clicks del menú y decide qué vista mostrar.
// Se usa delegación de eventos porque los enlaces del navegador se insertan dinámicamente.
function configurarNavegacionWeb() {
    const navegadorWeb = document.getElementById('navegadorPaginas');

    if (!navegadorWeb) {
        return;
    }

    navegadorWeb.addEventListener('click', (evento) => {
        const enlace = evento.target.closest('a[data-vista]');

        // Si el click no ocurrió sobre un enlace de vista, no hacemos nada.
        if (!enlace) {
            return;
        }

        // Cancelamos la navegación normal para manejar el cambio desde JavaScript.
        evento.preventDefault();

        const vista = enlace.dataset.vista;
        mostrarVista(vista);
    });
}

// Esta función prepara la portada completa.
// Primero carga los templates, después registra la navegación y por último fija la vista inicial.
async function iniciarPantallaWeb() {
    try {
        const navegadorWeb = document.getElementById('navegadorPaginas');
        const tutorialTemplate = document.getElementById('tutorial');
        const historialTemplate = document.getElementById('historial');
        const cargarPartidaTemplate = document.getElementById('cargarPartida');

        // Si la página actual no tiene ninguno de los contenedores esperados, no continuamos.
        if (!navegadorWeb && !tutorialTemplate && !historialTemplate && !cargarPartidaTemplate) {
            return;
        }

        // El navegador se carga siempre que exista su contenedor, porque es el punto de entrada de las vistas.
        if (navegadorWeb) {
            await cargarTemplatesWeb('navegadorPaginas', rutaTemplateNavegador);
        }

        // El tutorial también se carga al inicio, pero se mantiene oculto hasta que el usuario lo pida.
        if (tutorialTemplate) {
            await cargarTemplatesWeb('tutorial', rutaTemplateTutorial);
        }
        if (historialTemplate) {
            await cargarTemplatesWeb('historial', rutaTemplateHistorial);
        }
        if (cargarPartidaTemplate) {
            await cargarTemplatesWeb('cargarPartida', rutaTemplateCargarPartida);
        }

        // La navegación debe configurarse después de renderizar el template del menú,
        // porque antes de eso los enlaces aún no existen dentro del DOM.
        configurarNavegacionWeb();

        // Dejamos visible sólo la portada al entrar en index.html.
        mostrarVista('inicio');

        console.log('Sistema cargado: Navegador y Tutorial listos.');
    } catch (error) {
        console.error('Error cargando la interfaz:', error);
    }
}

// Arrancamos la lógica de la portada.
iniciarPantallaWeb();
