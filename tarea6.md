
__Puntos de la tarea 6__

## Unir asignaturas

- Hacer una interfaz no interactiva para juntar los videos generados y un btn de inicio que nos lleve al juego.
- Implementar sistema de compra, comprar pociones en la tienda. 
    - Implementar recuperar vida com las pociones.
    - Precio de las pociones 5 de oro.
    - Aumnetar en 10 los puntos de vida.
    - Comando por btn o por el campo de input

## Combate

- Al entrar en una sala, el primero en atacar es el monstruo.
    - "Extra": Quiero implementar que tenga un delay entre cada combate,
        una pequeña animacion introductoria al monstruo estilo pokemon y al final que el monstruo ataque".
    - Fuerza del ataque del monstruo: 
        - Fuerza + aleatorio entre 1-10 - Defensa heroe - Bonus de defensa del heroe = Puntos de vida a restar del heroe.
    
    - Si el heroe muere se vuelve al principio perdiendo todo: ORO, POCIONES, BONIFICACIONES DE DEFENSA, ATK ETC...

    - Si el heroe gana el combate: 
        1º ese monstruo ya no puede salir en niguna otra sala.
        2º El heroe gana bonus de atak y de defensa, recompensa de oro y puntos de vida.
    - Calcular la fuerza de ataque del heroe.
        - Fuerza: fuerza del heroe + fuerza bonus + aleatorio(1-10) - defensa del monstruo - defensa bonus del monstruo.
    - Repetir el proceso hasta que uno de los dos muera o la vida <=0;

## Objetos

- Al matar el monstruo implementar un sistema de DROP
    - Mejores armas, equipamento en general.
    - Generar un aleatorio al matar el monstruo de 40% de que pueda dropear un item.
    - Si encuentra un objeto tendremos que generar otro aleatorio, si es menor que 50% encontro una espada, caso contrario un escudo.
    - Generar otro aleatorio, entre 1 y 10, si los atributos de esa espada o escudo es mejor que el equipo actual. informamos al jugado que si quiere sustituirlo, caso no lo quiera se guarda en el inventario


## Balance del juego:

- Si nos topamos con monstruos muy fuertes al pricipio que estos sean capaces de matarnos muy facil, pero con el avanzar del juego lo podamos matar sin problemas.

