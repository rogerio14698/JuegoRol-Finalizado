
import { renderizarTemplate } from "./cargarTemplates";
import { mapa } from "./mapa";

export async function cargarEscenariosDinamicamente() {

    //1. Obetener las ids de las salas.
    const parametrosURL =  new URLSearchParams(window.location.search);
    const idActual = parametrosURL.get('id') || 'entrada'; //Si no hay id en la URL, por defecto es la sala de entrada.

    //2. Buscar los datos de mi sala en el mapa.

    datosSala = mapa[idActual];
    if(!datosSala){
        console.error("La sala no existe o no esta definida en el mapa.");
        return;
    }
    //3. Renderizar el template en la sala.
    await renderizarTemplate('main', '../template/templateMain.html');
        //El orden es importante, primero el main y luego los componentes que van dentro del main.
        //4. Renderizar el template de la consola dentro de la sala.
    await renderizarTemplate('contenedor-consola', '../template/templateConsola.html');
    //5. Rellenar dinamicamente los datos de la sala en el template.

    document.getElementById('nombreSala').textContent = datosSala.nombre;
    document.getElementById('descripcionSala').textContent = datosSala.descripcion;
    
    //Aqui vamos a cambiar el fondo de la sala segun la sala que nos encontremos.
        const fondoSala = document.querySelector('.fondoSala');
        if (datosSala.imagenSala){
            fondoSala.style.backgroundImage = `url(${datosSala.imagenSala})`;
        }




}