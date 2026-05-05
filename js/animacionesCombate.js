// ─────────────────────────────────────────────────────────────────────────────
// js/animacionesCombate.js  — Animaciones de combate con Anime.js
//
// Este módulo carga Anime.js desde CDN de forma dinámica (import() asíncrono)
// y expone funciones de animación que se usan durante el combate.
// Si el CDN no está disponible, el módulo funciona en modo "sin animaciones"
// y el juego sigue siendo jugable (las funciones simplemente devuelven sin hacer nada).
//
// Animaciones disponibles:
//   · animarEntradaMonstruoDark(): niebla/vigneta al aparecer el monstruo.
//   · animarSlashBestia():         trazo SVG de garra al atacar el monstruo.
//   · animarGolpeEspadaMagica():   trazo SVG de espada al atacar el héroe.
// ─────────────────────────────────────────────────────────────────────────────

// Instancia de la función anime() cargada desde el CDN.
let animeInstancia = null;
// Flag que indica si Anime.js está disponible para usar.
let animeDisponible = false;

// URL del módulo ESM de Anime.js (versión sin bundle, importable directamente).
const CDN_ANIME_ESM = 'https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.es.js';

// presetsTiempo: valores de duración en milisegundos para cada tipo de animación.
// Se pueden modificar con actualizarPresetsAnimacionCombate() para ajustar la velocidad.
const presetsTiempo = {
    entradaDark: {
        fadeIn: 240,
        humo: 950,
        vigneta: 800,
    },
    slashBestia: {
        trazado: 580,
        afterimageDelay: 110,
        disipa: 420,
        shake: 220,
    },
    espadaMagica: {
        trazado: 620,
        afterimageDelay: 120,
        disipa: 470,
        shake: 240,
    },
    hitStopMs: 56,
};

// obtenerEscenario (privada): devuelve el elemento .fondoSala que actúa como
// contenedor de todas las animaciones de combate.
function obtenerEscenario() {
    return document.querySelector('.fondoSala');
}

// crearOverlayAnimacion (privada): crea un <div> vacío con la clase indicada
// y lo inserta en el escenario (.fondoSala). Se usa como capa de animación
// que se elimina del DOM al terminar la animación.
function crearOverlayAnimacion(clase) {
    const escenario = obtenerEscenario();
    if (!escenario) {
        return null;
    }

    const overlay = document.createElement('div');
    overlay.className = clase;
    escenario.appendChild(overlay);
    return overlay;
}

// obtenerLongitudAproximada (privada): devuelve la longitud del path SVG
// usando getTotalLength(). Si el navegador no lo soporta, usa 1200 como fallback.
function obtenerLongitudAproximada(pathEl) {
    try {
        return pathEl.getTotalLength();
    } catch (e) {
        return 1200;
    }
}

// aplicarHitStop (privada): congela visualmente el escenario durante hitStopMs
// añadiendo/quitando la clase CSS 'hitstopCombate'. El efecto de "freeze frame"
// se consigue con un cambio de clase que pausa las animaciones CSS de ese elemento.
function aplicarHitStop() {
    const escenario = obtenerEscenario();
    if (!escenario) {
        return;
    }

    escenario.classList.add('hitstopCombate');
    setTimeout(() => {
        escenario.classList.remove('hitstopCombate');
    }, presetsTiempo.hitStopMs);
}

// sacudirCamara (privada): anima el escenario con una pequeña vibración
// usando translate para simular el sacudón de cámara (camera shake) de los videojuegos.
function sacudirCamara() {
    const escenario = obtenerEscenario();
    if (!escenario || !animeDisponible || !animeInstancia) {
        return;
    }

    animeInstancia({
        targets: escenario,
        keyframes: [
            { translateX: -7, translateY: 3 },
            { translateX: 6, translateY: -2 },
            { translateX: -4, translateY: 2 },
            { translateX: 0, translateY: 0 },
        ],
        easing: 'easeOutQuad',
        duration: 220,
    });
}

// generarParticulasSVG (privada): genera un string de elementos SVG <circle>
// que representan las partículas de impacto del golpe.
function generarParticulasSVG(cantidad = 12) {
    const particulas = [];
    for (let i = 0; i < cantidad; i += 1) {
        particulas.push(`<circle class="particulaImpacto" cx="58%" cy="45%" r="${1 + Math.random() * 2.6}" />`);
    }
    return particulas.join('');
}

// construirOverlayVectorial (privada): crea y rellena el overlay con la estructura
// SVG completa para una animación de combate. El tipo 'bestia' o 'magia' cambia
// el tema visual (colores definidos en CSS).
function construirOverlayVectorial(tipo) {
    const overlay = crearOverlayAnimacion(`overlayCombateVector ${tipo === 'bestia' ? 'temaBestia' : 'temaMagia'}`);
    if (!overlay) {
        return null;
    }

    overlay.innerHTML = `
        <div class="capaVigneta"></div>
        <div class="capaNiebla"></div>
        <div class="capaFlashImpacto"></div>
        <svg class="svgAtaque" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">
            <defs>
                <filter id="fBlurTrazo" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3.2" />
                </filter>
            </defs>
            <g class="grupoSlashPrincipal">
                <path class="slashPrincipal" d="M120 420 C 250 340, 430 300, 600 240 S 840 120, 940 70" />
                <path class="slashAfterImage" d="M120 420 C 250 340, 430 300, 600 240 S 840 120, 940 70" />
            </g>
            <g class="grupoEstelas">
                <path class="estelaSecundaria" d="M150 450 C 300 360, 480 310, 650 250" />
                <path class="estelaSecundaria" d="M110 390 C 270 300, 450 240, 620 190" />
                <path class="estelaSecundaria" d="M180 470 C 350 390, 520 340, 720 260" />
            </g>
            <g class="grupoParticulasImpacto">
                ${generarParticulasSVG(15)}
            </g>
        </svg>
        <div class="capaRuido"></div>
    `;

    return overlay;
}

// inicializarAnimeJS: intenta cargar Anime.js desde el CDN con import() dinámico.
// Si lo consigue, guarda la instancia en animeInstancia y pone animeDisponible=true.
// Si falla (sin internet, CDN caído, etc.), el módulo queda en modo fallback silencioso.
export async function inicializarAnimeJS() {
    if (animeDisponible && animeInstancia) {
        return true;
    }

    try {
        const moduloAnime = await import(CDN_ANIME_ESM);
        animeInstancia = moduloAnime.default;
        animeDisponible = typeof animeInstancia === 'function';

        if (animeDisponible) {
            console.log('Anime.js cargado correctamente.');
            return true;
        }
    } catch (error) {
        console.warn('No se pudo cargar Anime.js por CDN. Se usara fallback sin animaciones avanzadas.', error);
    }

    animeDisponible = false;
    animeInstancia = null;
    return false;
}

// animeEstaDisponible: indica si Anime.js fue cargado correctamente.
// Se usa como guard antes de llamar a cualquier función de animación.
export function animeEstaDisponible() {
    return animeDisponible;
}

// obtenerPresetsAnimacionCombate: devuelve una copia profunda de los presets
// para que el código externo no los modifique accidentalmente por referencia.
export function obtenerPresetsAnimacionCombate() {
    return JSON.parse(JSON.stringify(presetsTiempo));
}

// actualizarPresetsAnimacionCombate: permite sobreescribir valores de presetsTiempo
// de forma recursiva (deep merge). Útil para ajustar la velocidad sin reescribir
// todo el objeto de presets.
export function actualizarPresetsAnimacionCombate(nuevosPresets = {}) {
    const fusionar = (destino, origen) => {
        Object.keys(origen || {}).forEach((clave) => {
            const valor = origen[clave];
            if (valor && typeof valor === 'object' && !Array.isArray(valor) && destino[clave]) {
                fusionar(destino[clave], valor);
            } else {
                destino[clave] = valor;
            }
        });
    };

    fusionar(presetsTiempo, nuevosPresets);
}

export function animarEntradaMonstruoDark() {
    if (!animeDisponible || !animeInstancia) {
        return;
    }

    const overlay = construirOverlayVectorial('bestia');
    if (!overlay) {
        return;
    }

    const capaNiebla = overlay.querySelector('.capaNiebla');
    const capaVigneta = overlay.querySelector('.capaVigneta');
    const capaRuido = overlay.querySelector('.capaRuido');

    animeInstancia.timeline({
        easing: 'easeOutQuart',
        complete: () => overlay.remove(),
    })
        .add({
            targets: overlay,
            opacity: [0, 1],
            duration: presetsTiempo.entradaDark.fadeIn,
        })
        .add({
            targets: [capaNiebla, capaRuido],
            opacity: [0.18, 0.46, 0.1],
            duration: presetsTiempo.entradaDark.humo,
        }, '-=80')
        .add({
            targets: capaVigneta,
            opacity: [0.1, 0.42, 0],
            duration: presetsTiempo.entradaDark.vigneta,
        }, '-=760')
        .add({
            targets: overlay,
            opacity: [1, 0],
            duration: 220,
        }, '-=190');
}

export function animarSlashBestia() {
    if (!animeDisponible || !animeInstancia) {
        return;
    }

    const overlay = construirOverlayVectorial('bestia');
    if (!overlay) {
        return;
    }

    const slash = overlay.querySelector('.slashPrincipal');
    const afterImage = overlay.querySelector('.slashAfterImage');
    const estelas = overlay.querySelectorAll('.estelaSecundaria');
    const particulas = overlay.querySelectorAll('.particulaImpacto');
    const flash = overlay.querySelector('.capaFlashImpacto');
    const capaNiebla = overlay.querySelector('.capaNiebla');

    const longitud = obtenerLongitudAproximada(slash);
    [slash, afterImage, ...estelas].forEach((pathEl) => {
        pathEl.style.strokeDasharray = `${longitud}`;
        pathEl.style.strokeDashoffset = `${longitud}`;
    });

    animeInstancia.timeline({
        easing: 'easeOutExpo',
        complete: () => overlay.remove(),
    })
        .add({
            targets: slash,
            strokeDashoffset: [longitud, 0],
            opacity: [0, 1],
            skewX: [-8, 0],
            duration: presetsTiempo.slashBestia.trazado,
            begin: () => {
                aplicarHitStop();
                sacudirCamara();
            },
        })
        .add({
            targets: afterImage,
            strokeDashoffset: [longitud, -80],
            opacity: [0, 0.55, 0],
            duration: presetsTiempo.slashBestia.trazado,
            delay: presetsTiempo.slashBestia.afterimageDelay,
        }, '-=540')
        .add({
            targets: estelas,
            strokeDashoffset: [longitud, 0],
            opacity: [0, 0.45, 0],
            duration: presetsTiempo.slashBestia.disipa,
            delay: animeInstancia.stagger(70),
        }, '-=420')
        .add({
            targets: flash,
            opacity: [0, 0.65, 0],
            duration: 220,
            easing: 'easeOutQuad',
        }, '-=300')
        .add({
            targets: particulas,
            translateX: () => animeInstancia.random(60, 260),
            translateY: () => animeInstancia.random(-140, 120),
            opacity: [0, 1, 0],
            scale: [0.6, 1.15, 0.2],
            duration: 420,
            delay: animeInstancia.stagger(22),
            easing: 'easeOutQuart',
        }, '-=300')
        .add({
            targets: capaNiebla,
            opacity: [0.4, 0],
            duration: 260,
        }, '-=260')
        .add({
            targets: overlay,
            opacity: [1, 0],
            duration: 220,
        }, '-=120');
}

export function animarGolpeEspadaMagica() {
    if (!animeDisponible || !animeInstancia) {
        return;
    }

    const overlay = construirOverlayVectorial('magia');
    if (!overlay) {
        return;
    }

    const slash = overlay.querySelector('.slashPrincipal');
    const afterImage = overlay.querySelector('.slashAfterImage');
    const estelas = overlay.querySelectorAll('.estelaSecundaria');
    const particulas = overlay.querySelectorAll('.particulaImpacto');
    const flash = overlay.querySelector('.capaFlashImpacto');
    const capaNiebla = overlay.querySelector('.capaNiebla');

    const longitud = obtenerLongitudAproximada(slash);
    [slash, afterImage, ...estelas].forEach((pathEl) => {
        pathEl.style.strokeDasharray = `${longitud}`;
        pathEl.style.strokeDashoffset = `${longitud}`;
    });

    animeInstancia.timeline({
        easing: 'easeOutQuart',
        complete: () => overlay.remove(),
    })
        .add({
            targets: slash,
            strokeDashoffset: [longitud, 0],
            opacity: [0, 1],
            rotate: [-8, 4],
            scale: [0.96, 1.05, 1],
            duration: presetsTiempo.espadaMagica.trazado,
            begin: () => {
                aplicarHitStop();
                sacudirCamara();
            },
        })
        .add({
            targets: afterImage,
            strokeDashoffset: [longitud, -120],
            opacity: [0, 0.55, 0],
            duration: presetsTiempo.espadaMagica.trazado,
            delay: presetsTiempo.espadaMagica.afterimageDelay,
        }, '-=580')
        .add({
            targets: estelas,
            strokeDashoffset: [longitud, -50],
            opacity: [0, 0.5, 0],
            duration: 520,
            delay: animeInstancia.stagger(60),
        }, '-=470')
        .add({
            targets: flash,
            opacity: [0, 0.7, 0],
            duration: 260,
        }, '-=340')
        .add({
            targets: particulas,
            translateX: () => animeInstancia.random(80, 310),
            translateY: () => animeInstancia.random(-190, 145),
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.2],
            duration: 470,
            delay: animeInstancia.stagger(20),
            easing: 'easeOutExpo',
        }, '-=320')
        .add({
            targets: capaNiebla,
            opacity: [0.52, 0],
            duration: presetsTiempo.espadaMagica.disipa,
        }, '-=360')
        .add({
            targets: overlay,
            opacity: [1, 0],
            duration: 240,
        }, '-=180');
}

export function animarAranazoMonstruo() {
    animarSlashBestia();
}

export function animarEspadaMagicaHeroe() {
    animarGolpeEspadaMagica();
}
