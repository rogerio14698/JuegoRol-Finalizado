
// Rutas de los templates que se usarán dentro de index.html.
// Cada bloque visual tiene su propio archivo para mantener el HTML principal más limpio.
const rutaTemplateNavegador = 'template/navegadorExterno.html';
const rutaTemplateHome = 'template/home.html';
const rutaTemplateGuia = 'template/guia.html';
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
// Alterna entre home, tutorial, historial y cargar partida.
function mostrarVista(vista) {
    const home = document.getElementById('home');
    const guia = document.getElementById('guia');
    const historial = document.getElementById('historial');
    const cargarPartida = document.getElementById('cargarPartida');

    // Si falta alguno de los bloques visuales, salimos para evitar errores en tiempo de ejecución.
    if (!home || !guia || !historial || !cargarPartida) {
        return;
    }

    // La vista por defecto es la portada con el botón de empezar.
    if (vista === 'home') {
        home.hidden = false;
        guia.hidden = true;
        historial.hidden = true;
        cargarPartida.hidden = true;
        return;
    }

    // Cuando el usuario abre el tutorial, escondemos la portada y mostramos ese contenido.
    if (vista === 'guia') {
        home.hidden = true;
        guia.hidden = false;
        historial.hidden = true;
        cargarPartida.hidden = true;
        return;
    }
    if (vista === 'historial') {
        home.hidden = true;
        guia.hidden = true;
        historial.hidden = false;
        cargarPartida.hidden = true;
        return;
    }
    if (vista === 'cargarPartida') {
        home.hidden = true;
        guia.hidden = true;
        historial.hidden = true;
        cargarPartida.hidden = false;
        return;
    }
}

function actualizarEnlaceActivo(vista) {
    const enlacesVista = document.querySelectorAll('#navegadorPaginas a[data-vista]');

    enlacesVista.forEach((enlace) => {
        enlace.classList.toggle('active', enlace.dataset.vista === vista);
    });
}

function configurarBotonInicioWeb() {
    document.addEventListener('click', (evento) => {
        const botonInicio = evento.target.closest('#btnInicio');

        if (!botonInicio) {
            return;
        }

        window.location.href = 'salas/entrada.html';
    });
}

// Este bloque escucha los clicks del menú y decide qué vista mostrar.
// Lee el localStorage y vuelca las entradas en #listaHistorial.
function cargarHistorialDesdeStorage() {
    const lista = document.getElementById('listaHistorial');
    if (!lista) return;

    let entradas = [];
    try {
        entradas = JSON.parse(localStorage.getItem('historialPartida') || '[]');
    } catch (e) {
        entradas = [];
    }

    lista.innerHTML = '';

    if (entradas.length === 0) {
        const vacio = document.createElement('p');
        vacio.className = 'historialVacio';
        vacio.textContent = 'Sin entradas registradas. Juega una partida para ver el historial aqui.';
        lista.appendChild(vacio);
    } else {
        entradas.forEach((texto) => {
            const linea = document.createElement('p');
            linea.textContent = texto;
            lista.appendChild(linea);
        });
    }

    // Boton limpiar: elimina el localStorage y recarga la vista vacia
    const btnLimpiar = document.getElementById('btnLimpiarHistorial');
    if (btnLimpiar) {
        btnLimpiar.onclick = () => {
            localStorage.removeItem('historialPartida');
            cargarHistorialDesdeStorage();
        };
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
        actualizarEnlaceActivo(vista);

        if (vista === 'historial') {
            cargarHistorialDesdeStorage();
        }
    });
}

// Esta función prepara la portada completa.
// Primero carga los templates, después registra la navegación y por último fija la vista inicial.
async function iniciarPantallaWeb() {
    try {
        const navegadorWeb = document.getElementById('navegadorPaginas');
        const homeTemplate = document.getElementById('home');
        const guiaTemplate = document.getElementById('guia');
        const historialTemplate = document.getElementById('historial');
        const cargarPartidaTemplate = document.getElementById('cargarPartida');

        // Si la página actual no tiene ninguno de los contenedores esperados, no continuamos.
        if (!navegadorWeb && !homeTemplate && !guiaTemplate && !historialTemplate && !cargarPartidaTemplate) {
            return;
        }

        // El navegador se carga siempre que exista su contenedor, porque es el punto de entrada de las vistas.
        if (navegadorWeb) {
            await cargarTemplatesWeb('navegadorPaginas', rutaTemplateNavegador);
        }

        if (homeTemplate) {
            await cargarTemplatesWeb('home', rutaTemplateHome);
        }

        // El tutorial también se carga al inicio, pero se mantiene oculto hasta que el usuario lo pida.
        if (guiaTemplate) {
            await cargarTemplatesWeb('guia', rutaTemplateGuia);
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
        configurarBotonInicioWeb();

        // Dejamos visible sólo la portada al entrar en index.html.
        mostrarVista('home');
        actualizarEnlaceActivo('home');

        console.log('Sistema cargado: Navegador y Tutorial listos.');
    } catch (error) {
        console.error('Error cargando la interfaz:', error);
    }
}

// Arrancamos la lógica de la portada.
iniciarPantallaWeb();
