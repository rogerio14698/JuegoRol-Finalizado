

//Gerar una funcion que me renderize el template por el id del area donde quiero renderizarlo, y el template que quiero renderizar.

//Ruta de donde tengo el archivo html del template.
const rutaTemplate = '../template/templateConsola.html';
//Clonar el contenido del template y renderizarlo en el area deseada.

export async function renderizarTemplate(idArea, rutaTemplate) {
    const area = document.getElementById(idArea);
    //Como es un archivo html externo no podemos accder a su contenido directamente.
    //Por lo que haremos lo siguiente.
    try {
        //1. Buscamos el archivo html externo en la carpeta template/
        const respuestaFetch = await fetch(rutaTemplate);
        const textoTemplate = await respuestaFetch.text();

        //2. Convertimos el html en nodos HTML para poder manipularlo.
        const parser = new DOMParser();
        const doc = parser.parseFromString(textoTemplate, 'text/html');

        //3. Buscamos las etiquetas del tempalte que queremos modificar.
        const contenidoTemplate = doc.querySelector('template');

        if (area && contenidoTemplate) {
            //4. Clonamos el contenido y lo añadimos al DOM
            const clone = contenidoTemplate.content.cloneNode(true);
            //Limpiamos el area antes de renderizar el template.
            area.innerHTML = '';
            area.appendChild(clone);            
        }

    } catch (error) {
        console.error('Error al cargar el template:', error);
    }
}