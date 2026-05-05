// ─────────────────────────────────────────────────────────────────────────────
// renderizarTemplatesExternos.js  — SPA de la portada (index.html)
//
// Gestiona toda la interfaz de la portada del juego, que es una Single Page
// Application (SPA) basada en hash (#home, #guia, #historial, #cargarPartida).
//
// Flujo de inicio:
//   1. iniciarPantallaWeb() se llama al cargar la página.
//   2. cargarTemplatesWeb() descarga e inyecta los 5 templates HTML externos.
//   3. configurarNavegacionWeb() registra la delegación de eventos sobre document.
//   4. configurarBotonInicioWeb() registra el botón "Empezar a jugar".
//   5. mostrarVista() muestra la sección que corresponde al hash actual de la URL.
//
// Navegación: los enlaces usan data-vista="nombre" y se interceptan en el listener
// de clicks. Nunca hay navegación por rutas físicas entre las secciones de la portada.
// ─────────────────────────────────────────────────────────────────────────────

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

// actualizarEnlaceActivo: recorre todos los enlaces de navegación con data-vista
// y marca como 'active' solo el que coincide con la vista actual.
// Esto da feedback visual al usuario de dónde está dentro de la portada.
function actualizarEnlaceActivo(vista) {
    const enlacesVista = document.querySelectorAll('#navegadorPaginas a[data-vista]');

    enlacesVista.forEach((enlace) => {
        enlace.classList.toggle('active', enlace.dataset.vista === vista);
    });
}

// configurarBotonInicioWeb: escucha clicks sobre #btnInicio y redirige al
// archivo de entrada del juego (salas/entrada.html).
// Usa event delegation para que funcione aunque el botón sea insertado dinámicamente.
function configurarBotonInicioWeb() {
    document.addEventListener('click', (evento) => {
        const botonInicio = evento.target.closest('#btnInicio');

        if (!botonInicio) {
            return;
        }

        window.location.href = 'salas/entrada.html';
    });
}

// configurarBotonIrAlJuego: intercepta el click sobre #btnIrAlJuego (botón "Ir al juego"
// de la tarjeta de gestión de partidas). Lee el nombre escrito en #nombreJugador,
// lo guarda en localStorage para que app.js lo aplique al jugador al iniciar,
// y luego navega a salas/entrada.html. Si el campo está vacío se usa el nombre por defecto.
function configurarBotonIrAlJuego() {
    document.addEventListener('click', (evento) => {
        const boton = evento.target.closest('#btnIrAlJuego');
        if (!boton) {
            return;
        }

        evento.preventDefault();

        const input = document.getElementById('nombreJugador');
        const nombre = input ? input.value.trim() : '';

        if (nombre) {
            try {
                localStorage.setItem('nombreJugadorPendiente', nombre);
            } catch (e) {
                // localStorage no disponible; continuamos sin persistir el nombre
            }
        }

        window.location.href = 'salas/entrada.html';
    });
}

// configurarCarruselMonstruosGuia: prepara el carrusel de imágenes de monstruos
// dentro de la tarjeta "Salas y Amenazas". Soporta flechas anterior/siguiente
// y navegación directa por puntos.
function configurarCarruselMonstruosGuia() {
    const carruseles = document.querySelectorAll('[data-carrusel-monstruos]');

    carruseles.forEach((carrusel) => {
        if (carrusel.dataset.inicializado === '1') {
            return;
        }

        const track = carrusel.querySelector('.carruselTrack');
        const slides = carrusel.querySelectorAll('.carruselSlide');
        const prevBtn = carrusel.querySelector('.carruselControlPrev');
        const nextBtn = carrusel.querySelector('.carruselControlNext');
        const puntos = carrusel.querySelectorAll('.carruselPunto');

        if (!track || slides.length === 0 || !prevBtn || !nextBtn) {
            return;
        }

        let indiceActual = 0;

        const pintar = () => {
            track.style.transform = `translateX(-${indiceActual * 100}%)`;

            slides.forEach((slide, idx) => {
                slide.classList.toggle('is-active', idx === indiceActual);
            });

            puntos.forEach((punto, idx) => {
                punto.classList.toggle('is-active', idx === indiceActual);
            });
        };

        prevBtn.addEventListener('click', () => {
            indiceActual = (indiceActual - 1 + slides.length) % slides.length;
            pintar();
        });

        nextBtn.addEventListener('click', () => {
            indiceActual = (indiceActual + 1) % slides.length;
            pintar();
        });

        puntos.forEach((punto) => {
            punto.addEventListener('click', () => {
                const indice = Number.parseInt(punto.dataset.slide, 10);
                if (Number.isNaN(indice)) {
                    return;
                }

                indiceActual = Math.max(0, Math.min(indice, slides.length - 1));
                pintar();
            });
        });

        pintar();
        carrusel.dataset.inicializado = '1';
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
    document.addEventListener('click', (evento) => {
        const enlace = evento.target.closest('a[data-vista]');

        // Si el click no ocurrió sobre un enlace de vista, no hacemos nada.
        if (!enlace) {
            return;
        }

        // Solo interceptamos enlaces internos de esta portada renderizada por templates.
        const vista = enlace.dataset.vista;
        if (!vista) {
            return;
        }

        // Cancelamos la navegación normal para manejar el cambio desde JavaScript.
        evento.preventDefault();

        window.location.hash = vista;
        mostrarVista(vista);
        actualizarEnlaceActivo(vista);

        if (vista === 'historial') {
            cargarHistorialDesdeStorage();
        }
    });
}

// obtenerVistaDesdeHash: lee window.location.hash, elimina el '#' y devuelve
// el nombre de la vista si es válida, o 'home' como valor por defecto.
// Impide que un hash manipulado manualmente provoque errores.
function obtenerVistaDesdeHash() {
    const vistaHash = window.location.hash.replace('#', '').trim();
    const vistasValidas = new Set(['home', 'guia', 'historial', 'cargarPartida']);

    return vistasValidas.has(vistaHash) ? vistaHash : 'home';
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
        configurarBotonIrAlJuego();
        configurarCarruselMonstruosGuia();

        const vistaInicial = obtenerVistaDesdeHash();
        mostrarVista(vistaInicial);
        actualizarEnlaceActivo(vistaInicial);

        if (vistaInicial === 'historial') {
            cargarHistorialDesdeStorage();
        }

        console.log('Sistema cargado: Navegador y Tutorial listos.');
    } catch (error) {
        console.error('Error cargando la interfaz:', error);
    }
}

// Arrancamos la lógica de la portada.
iniciarPantallaWeb();
