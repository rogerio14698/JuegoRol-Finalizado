

1. Las conexiones de las diferentes salas estan en el archivo mapa.js; ahi defino todo el mapa del juego.
2. El movimiento en el juego se hace mediante la consola, debes de poner norte, sur, este o oeste segun la sala en la que te encuentres
    Las posibles direcciones salen arriba debajo del titulo de la sala.
3. Desde el index.html ->  al apretar el btn de inicar nos encontraremos en la entrada del juego.
4. La aparicion de los monstruos está controlada por el mapa ya que ahi deifno que monstruo sale en cada sala, no siempre va a salir y el jefe final 
    Tiene una probabilidad del 2% de salir; para lograr que el boss salga para comprobar el codigo, basta con regargar varias veces la sala hasta que salga el jefe o monstruo de la sala.
5. La funcionalidad de oro no es por comando directo, en la consola tienes el botón de BUSCAR el cual busca si hay oro en la sala o no y lo guarda en tu inventario. También tiene implementado en la interfaz para mostrar la cantidad de oro que tiene el personaje.



______________

1. El juego cuenta con 3 templates, siendo una para la consola, una para la sala y otra para el personaje, todo ello se rendereiza con JS en el archivo import { configurarMovimientoPorComando, configurarBotonBuscar, mostrarSala } from './js/acciones.js';
import { renderizarTemplate } from './js/cargarTemplates.js'; app.js

