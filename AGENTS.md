# AGENTS.md

## Proposito
Este repositorio usa una arquitectura simple de juego web con renderizado por templates y navegacion por id de sala en URL. Todas las modificaciones deben respetar ese modelo.

## Contexto del Proyecto
- Entrada web: index.html
- Entrada de juego: salas/entrada.html
- Orquestacion principal: app.js
- Portada y templates externos: renderizarTemplatesExternos.js
- Modulos core: js/acciones.js, js/mapa.js, js/personajes.js, js/cargarTemplates.js
- Modelo de navegacion: ?id=<numero>

## Reglas Obligatorias
1. No introducir rutas fisicas de salas HTML para moverse entre salas. El movimiento siempre se resuelve por id en query string.
2. Mantener compatibilidad con renderizado por templates (templateMain y templateConsola).
3. Si se modifica el mapa o idSalas, revisar y ajustar aliases/comandos en js/acciones.js.
4. No eliminar imports, exports, funciones o archivos sin comprobar referencias globales en el workspace.
5. Evitar duplicados y codigo muerto. Priorizar cambios pequenos y verificables.
6. Mantener comentarios y textos en espanol, salvo peticion explicita.
7. Preservar estructura y estilo existentes; no hacer refactors masivos sin necesidad funcional clara.
8. Mantener sincronizado el archivo .github/agents/rol-game-maintainer.json con este AGENTS.md; si cambian reglas, flujo o checklist, actualizar ambos.

## Flujo de Trabajo Recomendado
1. Buscar referencias del simbolo o modulo que se va a tocar.
2. Aplicar cambios minimos en los archivos estrictamente necesarios.
3. Validar que no queden referencias rotas ni diagnosticos nuevos.
4. Resumir impacto tecnico y funcional de los cambios.

## Checklist Antes de Terminar
- Sin errores de diagnostico.
- Sin simbolos huerfanos tras refactor.
- Navegacion por comando intacta.
- Flujo index -> sala -> consola intacto.
- Sin introducir frameworks o dependencias nuevas sin justificacion.
- AGENTS.md y .github/agents/rol-game-maintainer.json sincronizados.

## Fuera de Alcance por Defecto
- Cambios de diseno CSS no solicitados.
- Reescrituras grandes sin beneficio funcional directo.
- Cambios de arquitectura no pedidos.

## Patrones de Busqueda Rapidos
Usar estos patrones para validar impactos:
- configurarMovimientoPorComando
- mostrarSala
- renderizarTemplate
- idSalas
- mapa
