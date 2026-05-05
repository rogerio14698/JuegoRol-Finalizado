# DWEC – Juego de Rol (Tarea 6)

Juego de rol basado en texto para el navegador, construido con **JavaScript Vanilla ES Modules** sin ningún framework. El jugador explora salas de una mazmorra, combate monstruos, compra equipo y busca ítems, hasta derrotar al jefe final.

---

## Tabla de Contenidos

1. [Cómo ejecutar el proyecto](#cómo-ejecutar-el-proyecto)
2. [Arquitectura general](#arquitectura-general)
3. [Modelo de navegación](#modelo-de-navegación)
4. [Mapa de módulos](#mapa-de-módulos)
5. [Flujo de inicio de la partida](#flujo-de-inicio-de-la-partida)
6. [Sistema de salas y mapa](#sistema-de-salas-y-mapa)
7. [Sistema de personajes y equipamiento](#sistema-de-personajes-y-equipamiento)
8. [Sistema de comandos](#sistema-de-comandos)
9. [Sistema de combate](#sistema-de-combate)
10. [Inventario y equipamiento del héroe](#inventario-y-equipamiento-del-héroe)
11. [Tienda](#tienda)
12. [Búsqueda de ítems](#búsqueda-de-ítems)
13. [Pociones](#pociones)
14. [Sistema de guardado y carga](#sistema-de-guardado-y-carga)
15. [Historial de partida](#historial-de-partida)
16. [Portada (index.html)](#portada-indexhtml)
17. [Carga de templates HTML](#carga-de-templates-html)
18. [Animaciones de combate](#animaciones-de-combate)
19. [Sistema de CSS y variables](#sistema-de-css-y-variables)
20. [Metodología de desarrollo](#metodología-de-desarrollo)

---

## Cómo ejecutar el proyecto

El juego usa módulos ES nativos (`type="module"`), por lo que **requiere un servidor HTTP local**. No funciona abriendo los archivos directamente desde el explorador de archivos.

**Con XAMPP (recomendado en Windows):**

1. Copia la carpeta del proyecto en `C:\xampp\htdocs\DWEC-JuegoROL-Tarea6\`.
2. Inicia Apache desde el panel de XAMPP.
3. Abre `http://localhost/DWEC-JuegoROL-Tarea6/` en el navegador.

**Con cualquier servidor estático** (Node.js, Live Server de VS Code, etc.) también funciona.

---

## Arquitectura general

```
index.html                  ← Portada del juego (SPA)
renderizarTemplatesExternos.js ← Lógica de la SPA de la portada
salas/entrada.html          ← Página principal del juego
app.js                      ← Orquestador del juego
js/
  mapa.js                   ← Definición del mapa y sus salas
  personajes.js             ← Datos del jugador, vendedor y monstruos
  equipamentos.js           ← Catálogo de armas y escudos
  cargarTemplates.js        ← Sistema de templates HTML
  animacionesCombate.js     ← Animaciones con Anime.js
  acciones.js               ← Punto de entrada de todos los módulos de acción
  acciones/
    shared.js               ← Estado global y utilidades compartidas
    sala.js                 ← Renderizar sala actual
    movimiento.js           ← Comandos de movimiento entre salas
    combate.js              ← Lógica del sistema de combate
    tienda.js               ← Comandos de tienda (comprar/vender)
    busqueda.js             ← Comando de búsqueda de ítems
    pociones.js             ← Comando de usar poción
    equipamiento.js         ← Comandos de equipar/desequipar
    drop.js                 ← Comando de tirar ítems
    salida.js               ← Comando de salida/victoria final
    mapaPanel.js            ← Panel de mapa lateral
    menu.js                 ← Menú de inventario/stats
    uiHeroe.js              ← Actualización de la UI del héroe
template/                   ← Archivos HTML de plantillas
css/                        ← Hojas de estilo modularizadas
img/                        ← Imágenes del juego
```

---

## Modelo de navegación

### Juego (salas)

El movimiento entre salas se resuelve **siempre** mediante el parámetro `?id=<número>` en la URL. Cuando el jugador se mueve, `app.js` ejecuta:

```js
window.location.href = `${pathname}?id=${destinoId}`;
```

Esto provoca una recarga completa de la página de juego con el nuevo id. No se usan rutas físicas de archivos HTML.

### Portada (index.html)

La portada es una **SPA basada en hash**: `#home`, `#guia`, `#historial`, `#cargarPartida`. Los enlaces usan `data-vista="nombre"` y se interceptan con delegación de eventos. No hay recarga de página al cambiar de sección.

---

## Mapa de módulos

```
app.js
 └─ cargarTemplates.js      → Inyecta templateMain y templateConsola en el DOM
 └─ acciones.js             → Registra el manejador de comandos en el input
     └─ shared.js           → Estado global (jugador, combate, mapa...)
     └─ sala.js             → Renderiza la sala actual
     └─ movimiento.js       → Norte/Sur/Este/Oeste
     └─ combate.js          → Atacar/Victoria de combate
     └─ tienda.js           → Comprar/Vender en la tienda
     └─ busqueda.js         → Buscar ítems ocultos
     └─ pociones.js         → Usar poción
     └─ equipamiento.js     → Equipar/Desequipar armas y escudos
     └─ drop.js             → Tirar ítem del inventario
     └─ salida.js           → Victoria final
     └─ mapaPanel.js        → Panel de mapa lateral
     └─ menu.js             → Panel de inventario y estadísticas
     └─ uiHeroe.js          → Barra de vida, oro, atributos, inventario visual
```

---

## Flujo de inicio de la partida

1. `salas/entrada.html` carga `app.js` como módulo.
2. `app.js` llama a `cargarTemplates()` que descarga `template/templateMain.html` y `template/templateConsola.html`, los parsea y los inyecta en el DOM.
3. Carga el estado guardado de `localStorage` (si existe) o inicializa el jugador desde cero.
4. Inicializa Anime.js de forma asíncrona desde CDN.
5. Llama a `mostrarSala()` para renderizar la sala actual según el `?id=` de la URL.
6. Registra el event listener en el campo de texto para procesar los comandos escritos por el jugador.

---

## Sistema de salas y mapa

El mapa está definido en `js/mapa.js` con dos exportaciones:

- **`idSalas`**: diccionario de nombres → números de sala (`entrada: 1`, `salaJefe: 10`, etc.). Se usa en todo el código en lugar de números mágicos.
- **`mapa`**: objeto con la información de cada sala. Cada sala tiene:
  - `nombre` y `descripcion`: textos que se muestran en pantalla.
  - `imagenSala`: imagen de fondo del área de juego.
  - `ubicacion`: objeto con cuatro direcciones (`norte`, `sur`, `este`, `oeste`). El valor es el id de la sala destino o `-1` si hay una pared.
  - `probEnemigos`: probabilidad (0–1) de que aparezca un monstruo al entrar.
  - `enemigos`: array de ids de monstruos posibles en esa sala.
  - `oro`: cantidad de oro que puede encontrarse en la sala.

---

## Sistema de personajes y equipamiento

### Jugador

Definido en `js/personajes.js` mediante la función `crearJugadorInicial()`. Sus propiedades son:

| Propiedad | Valor inicial | Descripción |
|---|---|---|
| `salud` | 300 + vida del escudo inicial | Puntos de vida |
| `ataque` | 40 | Daño base |
| `defensa` | 10 | Reducción de daño recibido |
| `fuerza` | 15 | Bonus extra de daño |
| `oro` | 50 | Moneda del juego |
| `nivel` | 1 | Nivel actual (sube al vencer enemigos) |
| `inventario` | `[]` | Ítems recogidos |
| `equipado` | `{ arma, escudo }` | Equipo activo que modifica stats |

### Vendedor

NPC especial que no combate. Su inventario incluye automáticamente todas las armas y escudos del catálogo (`equipamentos.js`) más pociones.

### Monstruos

Array de objetos en `personajes.monstruos`. Cada monstruo tiene `id`, `nombre`, `salud`, `ataque`, `defensa`, `dialogoIntro`, `equipo` (sus stats de combate), `inventario` (lo que suelta al morir) e `imagen`.

### Equipamiento

`js/equipamentos.js` exporta el objeto `equipamientos` con dos arrays:

- **`armas`**: Espada de Madera, Espada de Hierro, Espada de Acero, Espada Mágica.
- **`escudos`**: Escudo de Madera, Escudo de Cuero, Escudo de Hierro, Escudo Mágico.

---

## Sistema de comandos

El jugador escribe texto en una consola. El flujo de procesado es:

1. El texto se **normaliza** (se pasa a minúsculas y se eliminan acentos y tildes) mediante `normalizarComando()` en `shared.js`.
2. Se comprueba por prioridad si coincide con alguno de estos grupos de comandos:
   - **Movimiento**: norte, sur, este, oeste (y sus alias como "n", "ir al norte", etc.)
   - **Combate**: atacar, victoria (solo durante un encuentro activo)
   - **Tienda**: comprar, vender (solo en la sala de tienda)
   - **Buscar**: buscar/explorar (busca ítems ocultos en la sala)
   - **Pociones**: usar pocion / tomar pocion
   - **Equipamiento**: equipar, desequipar
   - **Drop**: tirar / drop / descartar
   - **Salida**: salir / victoria final (sala especial)
   - **Mapa**: mapa (abre/cierra el panel de mapa)
   - **Menú**: menu / inventario (abre/cierra el panel de inventario y stats)

---

## Sistema de combate

Implementado en `js/acciones/combate.js`. Cuando el jugador entra en una sala con enemigos:

1. Se calcula la probabilidad (`probEnemigos`) y se elige un monstruo al azar.
2. Se crea un objeto `statsCombate` con los stats del monstruo más los bonuses de su equipo.
3. Se muestra el `dialogoIntro` del monstruo y se activa `estadoCombate.activo = true`.
4. El jugador escribe `atacar` → se calcula el daño: `(ataque_jugador + tirarDado(1,fuerza) - defensa_monstruo)`.
5. El monstruo contraataca después de un retardo (`RETARDO_TURNO_MONSTRUO_TRAS_ATAQUE_HEROE_MS`): `(ataque_monstruo + tirarDado(1,10) - defensa_jugador)`.
6. Si el monstruo muere: el jugador gana oro, puede subir de nivel y recibe el inventario del monstruo.
7. Si el jugador muere: se reinicia el estado y se redirige a la sala de entrada.

---

## Inventario y equipamiento del héroe

Gestionado en `js/acciones/equipamiento.js` y `js/acciones/uiHeroe.js`.

- `equipar <nombre>`: busca el ítem en el inventario y lo pone en el slot de arma o escudo. Si ya había algo equipado, lo devuelve al inventario.
- `desequipar <nombre>`: mueve el ítem equipado de vuelta al inventario.
- Al cambiar el equipo, `recalcularAtributosPorEquipo()` recalcula el ataque, defensa y salud máxima del jugador. Si el escudo cambia, `ajustarSaludPorCambioDeEscudo()` ajusta la salud actual de forma proporcional.

---

## Tienda

`js/acciones/tienda.js` gestiona la interacción con el vendedor.

- `comprar <nombre>`: busca el ítem en el inventario del vendedor y, si el jugador tiene suficiente oro, se lo añade al inventario y descuenta el oro.
- `vender <nombre>`: busca el ítem en el inventario del jugador y lo vende al vendedor por la mitad del precio.

---

## Búsqueda de ítems

`js/acciones/busqueda.js` implementa el comando `buscar`. Cada sala tiene una propiedad `oro` y puede tener ítems ocultos. Al buscar, se genera un número aleatorio y se decide si el jugador encuentra algo.

---

## Pociones

`js/acciones/pociones.js` gestiona `usar pocion`. Busca en el inventario una poción y restaura puntos de vida al jugador, sin superar su salud máxima.

---

## Sistema de guardado y carga

Implementado en `js/acciones/shared.js`.

- **Guardado automático**: el evento `beforeunload` del navegador llama a `guardarEstadoJugador()`, que serializa `personajes.jugador` a JSON y lo guarda en `localStorage` con la clave `estadoJugador`.
- **Carga**: al iniciar `app.js`, se llama a `cargarEstadoJugador()`. Si hay datos en `localStorage`, se restaura el jugador. Las referencias de objetos equipados se resuelven comparando propiedades con `itemCoincideConReferencia()` para evitar problemas de referencias rotas tras la deserialización.
- **Reinicio**: `reiniciarEstadoJugador()` borra el localStorage y recrea el jugador desde cero. Se usa al morir y al iniciar nueva partida.

---

## Historial de partida

Cada acción relevante (moverse, atacar, comprar, etc.) llama a `actualizarHistorial(texto)` en `shared.js`, que guarda un array de strings en `localStorage` bajo la clave `historialPartida`. Desde la portada se puede consultar o limpiar este historial.

---

## Portada (index.html)

Gestionada por `renderizarTemplatesExternos.js`. Es una SPA que carga 5 templates desde la carpeta `/template/`:

| Template | Contenido |
|---|---|
| `navegadorExterno.html` | Barra de navegación superior |
| `home.html` | Pantalla de bienvenida con el botón "Empezar" |
| `guia.html` | Tutorial y lista de comandos disponibles |
| `historial.html` | Historial de partidas anteriores |
| `cargarPartida.html` | Pantalla para continuar una partida guardada |

La navegación entre secciones usa `window.location.hash` y delegación de eventos sobre `document`.

---

## Carga de templates HTML

`js/cargarTemplates.js` implementa la función `cargarTemplates(idContenedor, rutaHTML)`:

1. Hace `fetch()` al archivo HTML externo.
2. Lo parsea con `DOMParser`.
3. Localiza la etiqueta `<template>` dentro del documento parseado.
4. Clona el contenido con `cloneNode(true)` y lo inserta en el contenedor del DOM.

Esto permite separar el HTML de la lógica y mantener los archivos de template limpios.

---

## Animaciones de combate

`js/animacionesCombate.js` carga **Anime.js v3.2.1** dinámicamente desde CDN mediante `import()` asíncrono. Si el CDN no está disponible, el juego funciona sin animaciones (fallback silencioso).

Animaciones disponibles:

| Función | Efecto |
|---|---|
| `animarEntradaMonstruoDark()` | Niebla oscura y viñeta al aparecer el monstruo |
| `animarSlashBestia()` | Trazo SVG de garra para el ataque del monstruo |
| `animarGolpeEspadaMagica()` | Trazo SVG de espada para el ataque del héroe |

Cada animación crea un overlay `<div>` con SVG, lo anima y lo elimina del DOM al terminar.

---

## Sistema de CSS y variables

Las hojas de estilo están en la carpeta `css/` divididas por responsabilidad:

| Archivo | Propósito |
|---|---|
| `variables.css` | Variables CSS globales (colores, fuentes, espaciados) |
| `globales.css` | Reset y estilos base del documento |
| `normalize.css` | Normalize entre navegadores |
| `templateUi.css` | Layout de la UI del juego (consola, panel de mapa, etc.) |
| `consola.css` | Estilos de la consola de texto |
| `nav.css` | Barra de navegación |
| `fondoSalas.css` | Fondo e imagen de cada sala |
| `historial.css` | Vista de historial |
| `home.css` | Pantalla de inicio |
| `guia.css` | Vista de la guía/tutorial |
| `btn.css` | Estilos de botones |
| `ui.css` | Elementos de UI generales |
| `footer.css` | Pie de página |

Las fuentes del juego se definen como variables CSS:
- `--fuenteTitulo: "Cinzel", serif` (títulos y cabeceras)
- `--fuenteParrafo: "EB Garamond", serif` (texto narrativo)

Se cargan desde Google Fonts mediante `<link>` en el `<head>` de cada página HTML.

---

## Metodología de desarrollo

El proyecto sigue un enfoque **modular y progresivo**:

1. **Módulos ES nativos**: cada responsabilidad tiene su propio archivo `.js` con `import`/`export` explícitos. No se usan bundles ni transpiladores.

2. **Separación de responsabilidades**: la lógica de cada comando está en su propio archivo bajo `js/acciones/`. El estado global compartido está centralizado en `shared.js`.

3. **Estado mutable centralizado**: `personajes.jugador` es el único objeto de estado del héroe. Todos los módulos lo importan y modifican directamente. Esto simplifica la sincronización pero requiere cuidado al clonar ítems para evitar referencias compartidas.

4. **Delegación de eventos**: en lugar de registrar listeners en cada elemento dinámico, se escucha en `document` y se filtra el target con `closest()`. Esto evita fugas de memoria al reemplazar contenido del DOM.

5. **Persistencia con localStorage**: el guardado es automático (beforeunload) y transparente para el usuario. La carga al inicio restaura el estado completo incluyendo el equipo equipado.

6. **Sin dependencias externas en core**: la única dependencia externa es Anime.js para las animaciones, cargada bajo demanda desde CDN con fallback graceful.

7. **Navegación por query string**: el movimiento entre salas provoca una recarga completa de la página. Esto simplifica el estado de la sala (siempre se parte del id en la URL) a costa de no tener transiciones SPA en la parte del juego.
