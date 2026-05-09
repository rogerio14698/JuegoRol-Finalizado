// ─────────────────────────────────────────────────────────────────────────────
// js/landingVideos.js  —  Control de intro de videos en Home (portada)
//
// Gestiona:
// - Secuencia Video 1 -> transicion -> Video 2 (en bucle)
// - Intento de autoplay con audio (con fallback silencioso)
// - Boton de mute/unmute para el usuario
// - Pausa automatica cuando la vista Home no esta activa
// ─────────────────────────────────────────────────────────────────────────────

let estado = null;

function obtenerElementos() {
    const video1 = document.getElementById('videoLanding1');
    const video2 = document.getElementById('videoLanding2');
    const pantallaNegra = document.getElementById('pantallaNegraLanding');
    const veloTransicion = document.getElementById('veloTransicionLanding');
    const avisoAudio = document.getElementById('avisoAudioLanding');
    const btnAudio = document.getElementById('btnAudioLanding');

    if (!video1 || !video2 || !pantallaNegra || !veloTransicion || !avisoAudio || !btnAudio) {
        return null;
    }

    return { video1, video2, pantallaNegra, veloTransicion, avisoAudio, btnAudio };
}

function aplicarEstadoAudio() {
    if (!estado) {
        return;
    }

    const muted = estado.forzarMuteUsuario || !estado.audioHabilitado;

    estado.videos.forEach((video) => {
        video.muted = muted;
    });

    estado.btnAudio.textContent = muted ? 'Activar sonido' : 'Silenciar';
    estado.btnAudio.setAttribute('aria-pressed', String(muted));
}

async function intentarReproducir(video) {
    if (!estado) {
        return;
    }

    try {
        aplicarEstadoAudio();
        await video.play();
    } catch (error) {
        estado.audioHabilitado = false;
        aplicarEstadoAudio();
        estado.avisoAudio.textContent = 'Autoplay con audio bloqueado por el navegador. Usa el control de sonido.';

        try {
            await video.play();
        } catch (segundoError) {
            estado.avisoAudio.textContent = 'No fue posible reproducir automaticamente. Interactua con la pagina.';
        }
    }
}

function transicionarASiguiente() {
    if (!estado || !estado.activo) {
        return;
    }

    const actual = estado.videos[estado.indiceActual];
    estado.indiceActual = (estado.indiceActual + 1) % estado.videos.length;
    const siguiente = estado.videos[estado.indiceActual];

    estado.veloTransicion.classList.add('activa');

    window.setTimeout(() => {
        actual.classList.remove('activo');
        actual.pause();
        actual.currentTime = 0;

        siguiente.classList.add('activo');
        intentarReproducir(siguiente);
    }, 360);

    window.setTimeout(() => {
        estado.veloTransicion.classList.remove('activa');
    }, 920);
}

function habilitarAudioPorInteraccion() {
    if (!estado || estado.audioHabilitado || estado.forzarMuteUsuario || !estado.activo) {
        return;
    }

    estado.audioHabilitado = true;
    aplicarEstadoAudio();

    const actual = estado.videos[estado.indiceActual];
    actual.play().then(() => {
        estado.avisoAudio.textContent = '';
    }).catch(() => {
        estado.audioHabilitado = false;
        aplicarEstadoAudio();
    });
}

function iniciarTransicionInicial() {
    if (!estado) {
        return;
    }

    window.setTimeout(() => {
        estado.pantallaNegra.classList.add('oculta');
    }, 1600);
}

export function inicializarLandingVideos() {
    const elementos = obtenerElementos();

    if (!elementos) {
        return;
    }

    if (estado && estado.inicializado) {
        return;
    }

    const videos = [elementos.video1, elementos.video2];

    estado = {
        ...elementos,
        videos,
        indiceActual: 0,
        audioHabilitado: true,
        forzarMuteUsuario: false,
        activo: false,
        inicializado: true
    };

    videos.forEach((video) => {
        video.loop = false;
        video.playsInline = true;
        video.addEventListener('ended', transicionarASiguiente);
    });

    estado.btnAudio.addEventListener('click', () => {
        estado.forzarMuteUsuario = !estado.forzarMuteUsuario;
        aplicarEstadoAudio();
    });

    document.addEventListener('pointerdown', habilitarAudioPorInteraccion, { passive: true });

    aplicarEstadoAudio();
    iniciarTransicionInicial();
}

export function actualizarEstadoLandingVideos(vistaActiva) {
    if (!estado || !estado.inicializado) {
        return;
    }

    estado.activo = vistaActiva === 'home';

    if (estado.activo) {
        const actual = estado.videos[estado.indiceActual];
        intentarReproducir(actual);
        return;
    }

    estado.videos.forEach((video) => {
        video.pause();
    });
}
