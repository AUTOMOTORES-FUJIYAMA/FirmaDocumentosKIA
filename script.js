const { PDFDocument, rgb } = PDFLib;

async function generatePDFs() {
    const loader = document.getElementById('loading-message');
    loader.style.display = 'block';

    // Captura de datos del formulario (Se mantiene igual)
    const data = {
      nombreCli: document.getElementById('nombreCli').value.toUpperCase(),
         cedula: document.getElementById('cedula').value,
       telefono: document.getElementById('telefono').value,
         correo: document.getElementById('email').value,
         chasis: document.getElementById('chasis').value.toUpperCase(), 
          color: document.getElementById('color').value.toUpperCase(),
         modelo: document.getElementById('modelo').value.toUpperCase(),
          linea: document.getElementById('linea').value.toUpperCase(),
            año: document.getElementById('año').value.toUpperCase(),
    consecutivo: document.getElementById('consecutivo').value.toUpperCase(),
        vitrina: document.getElementById('vitrina').value.toUpperCase(),
       fecha: new Date().toLocaleDateString(),
        equipamiento: {
            abs: document.getElementById('abs').checked,
            esc: document.getElementById('esc').checked,
            fcw: document.getElementById('fcw').checked,
            fca: document.getElementById('fca').checked,
        airbags: document.getElementById('airbags').checked,
cantidadAirbags: document.getElementById('cantidadAirbags').value,
         isofix: document.getElementById('isofix').checked,
      lucesAuto: document.getElementById('lucesAuto').checked,
   lucesDiurnas: document.getElementById('lucesDiurnas').checked
        }
    };

    const files = [
        "FORMATO DE ENTREGA DE VENTA -SERVICIO.pdf",
        "FORMATO EQUIPAMIENTO DE SEGURIDAD.pdf"
    ];

    try {
        // 1. Creamos el PDF maestro donde uniremos todo
        const mergedPdf = await PDFDocument.create();

        // 2. Procesamos cada archivo y añadimos sus páginas al PDF maestro
        for (const fileName of files) {
            await processAndAppend(fileName, data, mergedPdf);
        }

        // 3. Una vez finalizado el ciclo, descargamos el PDF único unificado
        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `DOCUMENTOS_UNIFICADOS_${data.nombreCli}.pdf`; // Nombre personalizado
        link.click();

    } catch (error) {
        console.error(error);
        alert("Error al procesar los PDFs. Asegúrate de que los archivos están en la carpeta raíz.");
    } finally {
        loader.style.display = 'none';
    }
}

function incluido(valor) {
    return valor ? "INCLUIDO" : "NO INCLUIDO";
}

// Cambiamos el nombre de la función para reflejar que ahora "Anexa" páginas
async function processAndAppend(fileName, data, mergedPdf) {
    // 1. Cargar el PDF base de forma temporal
    const existingPdfBytes = await fetch(`./${fileName}`).then(res => res.arrayBuffer());
    const tempPdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = tempPdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    const draw = (text, x, y, z=10) => {
        if (!text) return;
        firstPage.drawText(text, {
            x: x,
            y: height - y, 
            size: z,
            color: rgb(0, 0, 0),
        });
    };

    const today = new Date().toLocaleDateString();
    const textoAirbags = data.equipamiento.airbags
            ? `(${data.equipamiento.cantidadAirbags}) INCLUIDO`
            : "NO INCLUIDO";

    // 2. Lógica de renderizado (Tu misma lógica exacta de coordenadas)
    switch (fileName) {
        case "FORMATO CLUB K.pdf":
            draw(data.nombreCli, 100, 150);
            draw(data.cedula, 100, 170);
            draw(data.placa, 400, 150);
            draw(data.vehiculo, 100, 200);
            draw(data.chasis, 100, 220);
            draw(data.vitrina, 100, 250);
            draw(today, 400, 170);
            break;

        case "FORMATO EQUIPAMIENTO DE SEGURIDAD.pdf":
            draw(data.nombreCli, 180, 196);
            draw(today, 400, 112);
            draw(today.split('/')[0], 30, 196);
            draw(today.split('/')[1], 70, 196);
            draw(today.split('/')[2], 100, 196);
            draw(data.vitrina, 30, 163);
            draw(data.cedula, 30, 233);
            draw(data.chasis, 165, 307);
            draw(data.telefono, 180, 230);
            draw(data.correo, 360, 230);
            draw(data.color, 420, 286);
            draw(data.modelo, 420, 267);
            draw(data.año, 165, 286, 7);
            draw(data.linea, 165, 267, 7);  
            draw(data.consecutivo, 360, 165);

            draw(incluido(data.equipamiento.abs), 350, 410);
            draw(incluido(data.equipamiento.esc), 350, 450);
            draw(incluido(data.equipamiento.fcw), 350, 480);
            draw(incluido(data.equipamiento.fca), 350, 510);
            draw(textoAirbags, 350, 540);
            draw(incluido(data.equipamiento.isofix), 350, 570);
            draw(incluido(data.equipamiento.lucesAuto), 350, 600);
            draw(incluido(data.equipamiento.lucesDiurnas), 350, 630);
            break;

        case "FORMATO DE ENTREGA DE VENTA -SERVICIO.pdf":
            draw(data.nombreCli, 135, 170);
            draw(data.nombreCli, 70, 509, 7);
            draw(data.modelo, 135, 187);
            draw(today, 435, 170);
            break;
    }

    // 3. COPIAR Y AGREGAR LA PÁGINA MODIFICADA AL PDF MAESTRO
    // Copiamos todas las páginas que tenga el archivo base por si tiene más de una página
    const copiedPages = await mergedPdf.copyPages(tempPdfDoc, tempPdfDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
}

// Oyente de eventos para la interfaz (Se mantiene igual)
document.getElementById("airbags").addEventListener("change", function () {
    document.getElementById("airbagsContainer").style.display = this.checked ? "block" : "none";
});