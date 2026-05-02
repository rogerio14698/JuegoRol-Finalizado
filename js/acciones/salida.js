import { idSalas, reiniciarEstadoJugador } from './shared.js';

export function configurarBotonAbandonar() {
    const btnAbandonar = document.getElementById('btn-abandonar');

    if (!btnAbandonar) {
        return;
    }

    btnAbandonar.addEventListener('click', () => {
        reiniciarEstadoJugador();
        window.location.href = `${window.location.pathname}?id=${idSalas.entrada}`;
    });
}
