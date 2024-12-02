// Diccionarios globales para almacenar los resultados
let diccionarioHuffman = {};
let diccionarioLZW = {};

// Graficos de Barra
let tasaCompresionChart, tamanoDiccionarioChart, longitudCadenaChart;

// Huffman coding
class HuffmanNode {
    constructor(character, frequency) {
        this.character = character;
        this.frequency = frequency;
        this.left = null;
        this.right = null;
    }
}

function buildHuffmanTree(text) {
    const frequencyMap = {};
    for (const char of text) {
        if (!frequencyMap[char]) {
            frequencyMap[char] = 0;
        }
        frequencyMap[char]++;
    }

    const nodes = Object.entries(frequencyMap).map(
        ([character, frequency]) => new HuffmanNode(character, frequency)
    );

    // Caso especial: solo un carácter único en el texto
    if (nodes.length === 1) {
        const singleNode = nodes[0];
        const dummyNode = new HuffmanNode(null, 0); // Nodo ficticio
        const rootNode = new HuffmanNode(null, singleNode.frequency);
        rootNode.left = singleNode;
        rootNode.right = dummyNode;
        return rootNode;
    }

    while (nodes.length > 1) {
        nodes.sort((a, b) => a.frequency - b.frequency);
        const left = nodes.shift();
        const right = nodes.shift();
        const newNode = new HuffmanNode(null, left.frequency + right.frequency);
        newNode.left = left;
        newNode.right = right;
        nodes.push(newNode);
    }

    return nodes[0];
}

function generateHuffmanCodes(node, prefix = "", codes = {}) {
    if (node.character !== null) {
        codes[node.character] = prefix;
    } else {
        if (node.left) generateHuffmanCodes(node.left, prefix + "0", codes);
        if (node.right) generateHuffmanCodes(node.right, prefix + "1", codes);
    }
    return codes;
}

function huffmanCompress(text) {
    const huffmanTree = buildHuffmanTree(text);
    
    // Generar los códigos y guardar en la variable global
    diccionarioHuffman = generateHuffmanCodes(huffmanTree);

    // Construir la cadena comprimida
    let compressed = "";
    for (const char of text) {
        compressed += diccionarioHuffman[char];
    }
    return compressed;
}

// LZW coding
function compresorLZWConBinariosSoloCadena(cadena) {
    if (!cadena || typeof cadena !== "string") {
        throw new Error("La entrada debe ser una cadena válida.");
    }

    let diccionario = {};
    let codigo = 0; // Iniciar códigos desde 0

    // Inicializar el diccionario con los caracteres únicos de la cadena
    for (let i = 0; i < cadena.length; i++) {
        let caracter = cadena[i];
        if (!(caracter in diccionario)) {
            diccionario[caracter] = codigo++;
        }
    }

    let secuencia = [];
    let w = ""; // Cadena actual

    for (let i = 0; i < cadena.length; i++) {
        let c = cadena[i];
        let wc = w + c;

        if (wc in diccionario) {
            w = wc; // Extiende la cadena
        } else {
            // Guarda el código de la cadena anterior
            secuencia.push(diccionario[w]);
            // Añade la nueva combinación al diccionario
            diccionario[wc] = codigo++;
            w = c; // Actualiza la cadena actual
        }
    }

    // Guarda el código de la última cadena
    if (w !== "") {
        secuencia.push(diccionario[w]);
    }

    // Calcular el número de bits necesarios para representar todos los códigos
    let bitsNecesarios = Math.max(1, Math.ceil(Math.log2(codigo)));

    // Convertir los códigos a binario en el diccionario
    for (const [clave, valor] of Object.entries(diccionario)) {
        diccionario[clave] = valor.toString(2).padStart(bitsNecesarios, "0");
    }

    // Guardar el diccionario generado en la variable global
    diccionarioLZW = diccionario;

    // Convertir los códigos de la secuencia a binario y concatenar
    let secuenciaBinaria = secuencia
        .map(num => num.toString(2).padStart(bitsNecesarios, "0")) // Convertir a binario y rellenar con ceros
        .join(""); // Concatenar todos los códigos binarios

    return secuenciaBinaria;
}

function compressText() {
    const inputText = document.getElementById('inputText').value;

    // Calcular información de la cadena
    const charCount = inputText.length;
    const asciiBits = charCount * 8;

    // Mostrar información en la interfaz
    document.getElementById('charCount').textContent = `Cantidad de caracteres: ${charCount}`;
    document.getElementById('asciiBits').textContent = `Bits necesarios en ASCII: ${asciiBits}`;

    // Aquí irían las llamadas a las funciones de compresión (Huffman y LZW)
    const huffmanResult = huffmanCompress(inputText);
    const lzwResult = compresorLZWConBinariosSoloCadena(inputText);

    // Mostrar resultados en los respectivos contenedores
    document.getElementById('huffmanResult').textContent = huffmanResult;
    document.getElementById('lzwResult').textContent = lzwResult;
}

// Funciones para mostrar los diccionarios
function mostrarDiccionarioHuffman() {
    const div = document.getElementById("diccionarioHuffman");
    
    // Ordenar las claves del diccionario por la longitud del código
    const diccionarioOrdenado = Object.entries(diccionarioHuffman).sort(
        ([, codeA], [, codeB]) => codeA.length - codeB.length
    );

    // Construir la tabla HTML
    let tablaHTML = "<table border='1' style='border-collapse: collapse;'>";
    tablaHTML += "<tr><th>Caracter</th><th>Código</th></tr>"; // Encabezado

    diccionarioOrdenado.forEach(([character, code]) => {
        tablaHTML += `<tr><td>${character}</td><td>${code}</td></tr>`;
    });

    tablaHTML += "</table>";

    // Mostrar la tabla en el contenedor
    div.innerHTML = tablaHTML;
    div.style.display = div.style.display === "none" ? "block" : "none"; // Alternar visibilidad
}

function mostrarDiccionarioLZW() {
    
    const div = document.getElementById("diccionarioLZW");
    
    // Ordenar el diccionario por longitud de los códigos binarios y alfabéticamente en caso de empate
    const diccionarioOrdenado = Object.entries(diccionarioLZW).sort(
        ([, binA], [, binB]) => binA.length - binB.length || binA.localeCompare(binB)
    );
    
    // Construir la tabla HTML
    let tablaHTML = "<table border='1' style='border-collapse: collapse;'>";
    tablaHTML += "<tr><th>Secuencia</th><th>Código (Binario)</th></tr>"; // Encabezado
    
    diccionarioOrdenado.forEach(([sequence, binaryCode]) => {
        tablaHTML += `<tr><td>${sequence}</td><td>${binaryCode}</td></tr>`;
    });
    
    tablaHTML += "</table>";
    
    // Mostrar la tabla en el contenedor
    div.innerHTML = tablaHTML;
    div.style.display = div.style.display === "none" ? "block" : "none"; // Alternar visibilidad
   
}


function toggleVisibility(elementId, buttonId) {
    const element = document.getElementById(elementId);
    const button = document.getElementById(buttonId);

    if (element.classList.contains("truncate")) {
        // Mostrar el contenido completo
        element.classList.remove("truncate");
        button.textContent = "Ver menos";
    } else {
        // Volver a truncar el contenido
        element.classList.add("truncate");
        button.textContent = "Ver completo";
    }
}


function mostrarInfoCompresionHuffman() {
    const inputText = document.getElementById('inputText').value;

    if (!inputText) {
        alert("Ingrese texto para obtener información.");
        return;
    }

    const charCount = inputText.length;
    const asciiBits = charCount * 8;

    // Obtener los códigos de Huffman generados previamente
    const huffmanCodes = document.getElementById('huffmanResult').textContent;

    if (!huffmanCodes) {
        alert("Primero comprima el texto con Huffman para ver la información.");
        return;
    }

    // Longitud de la cadena resultante (en bits)
    let huffmanLength = 0;
    const huffmanCodeMap = generateHuffmanCodes(buildHuffmanTree(inputText));
    for (let i = 0; i < inputText.length; i++) {
        huffmanLength += huffmanCodeMap[inputText[i]].length;
    }

    // Tasa de compresión
    const compressionRate = ((1 - (huffmanLength / asciiBits)) * 100).toFixed(2);

    // Tamaño del diccionario
    const diccionarioTamaño = Object.keys(huffmanCodeMap).length;

    // Memoria ocupada por el diccionario
    let memoriaDiccionario = 0;
    for (const [char, code] of Object.entries(huffmanCodeMap)) {
        memoriaDiccionario += 1; // 1 byte por el carácter
        memoriaDiccionario += Math.ceil(code.length / 8); // Longitud del código en bytes
    }

    // Entropía y redundancia
    const frequencyMap = {};
    for (const char of inputText) {
        if (!frequencyMap[char]) frequencyMap[char] = 0;
        frequencyMap[char]++;
    }
    const totalChars = inputText.length;
    let entropy = 0;
    for (const char in frequencyMap) {
        const p = frequencyMap[char] / totalChars;
        entropy -= p * Math.log2(p);
    }

    let maxEntropy = Math.log2(diccionarioTamaño);

    let redundancy; 
    if (maxEntropy === 0) 
        { redundancy = 100;

         } else { 
            redundancy = ((maxEntropy - entropy) / maxEntropy) * 100; 
        }

    // Mostrar información
    const infoDiv = document.getElementById('infoCompresionHuffman');
    infoDiv.style.display = "block";
    infoDiv.innerHTML = `
        <p><strong>Longitud de la cadena resultante:</strong> ${huffmanLength} bits</p>
        <p><strong>Tasa de compresión:</strong> ${compressionRate}%</p>
        <p><strong>Tamaño del diccionario:</strong> ${diccionarioTamaño} símbolos (${memoriaDiccionario} bytes)</p>
        <p><strong>Entropía del mensaje:</strong> ${entropy.toFixed(2)}</p>
        <p><strong>Redundancia del mensaje:</strong> ${redundancy.toFixed(2)}%</p>
    `;

    // Asignar los valores al dataset
    const infoCompresionHuffman = document.getElementById('infoCompresionHuffman');
    infoCompresionHuffman.dataset.tasaCompresion = compressionRate;
    infoCompresionHuffman.dataset.tamanoDiccionario = memoriaDiccionario;
    infoCompresionHuffman.dataset.longitudCadena = huffmanLength;
    infoCompresionHuffman.dataset.entropia = entropy;
    infoCompresionHuffman.dataset.redundancia = redundancy;

}


function mostrarInfoCompresionLZW() {
    const inputText = document.getElementById('inputText').value;

    if (!inputText) {
        alert("Ingrese texto para obtener información.");
        return;
    }

    const charCount = inputText.length;
    const asciiBits = charCount * 8;

    // Obtener diccionario LZW generado previamente
    if (!diccionarioLZW) {
        alert("Primero comprima el texto con LZW para ver la información.");
        return;
    }

    // Tamaño del diccionario (número de patrones)
    const diccionarioTamaño = Object.keys(diccionarioLZW).length;

    // Longitud de la cadena resultante
    const lzwResult = document.getElementById('lzwResult').textContent;
    const lzwLength = lzwResult.length;

    // Tasa de compresión
    const compressionRate = ((1 - (lzwLength / asciiBits)) * 100).toFixed(2);

    // Longitud promedio de los patrones
    const patternLengths = Object.keys(diccionarioLZW).map(pattern => pattern.length);
    const promedioPatrones = (patternLengths.reduce((sum, len) => sum + len, 0) / patternLengths.length).toFixed(2);

    // Factor de compresión
    const compressionFactor = (diccionarioTamaño / charCount).toFixed(2);

    // Calcular tamaño en memoria del diccionario (en bytes)
    let tamanoMemoriaDiccionario = 0;
    for (const pattern in diccionarioLZW) {
        tamanoMemoriaDiccionario += pattern.length * 8; // Tamaño del patrón (en bits)
    }

    // Mostrar información
    const infoDiv = document.getElementById('infoCompresionLZW');
    infoDiv.style.display = "block";
    infoDiv.innerHTML = `
        <p><strong>Longitud de la cadena resultante:</strong> ${lzwLength} bits</p>
        <p><strong>Tasa de compresión:</strong> ${compressionRate}%</p>
        <p><strong>Tamaño del diccionario:</strong> ${diccionarioTamaño} patrones</p>
        <p><strong>Tamaño en memoria del diccionario:</strong> ${tamanoMemoriaDiccionario} bits (${(tamanoMemoriaDiccionario / 8).toFixed(2)} bytes)</p>
        <p><strong>Longitud promedio de patrones:</strong> ${promedioPatrones}</p>
        <p><strong>Factor de compresión:</strong> ${compressionFactor}</p>
    `;

    // Almacenar los datos para la comparativa
    infoDiv.dataset.tasaCompresion = compressionRate;
    infoDiv.dataset.tamanoDiccionario = tamanoMemoriaDiccionario;
    infoDiv.dataset.longitudCadena = lzwLength;
}


function generarComparativa() {

    mostrarInfoCompresionHuffman();
    mostrarInfoCompresionLZW();

    const comparativaContainer = document.getElementById('comparativaContainer');
    comparativaContainer.style.display = "flex";

    // Leer datos de los datasets
    const tasaCompresionHuffman = parseFloat(document.getElementById('infoCompresionHuffman').dataset.tasaCompresion || 0);
    const tasaCompresionLZW = parseFloat(document.getElementById('infoCompresionLZW').dataset.tasaCompresion || 0);
    const tamanoDiccionarioHuffman = parseFloat(document.getElementById('infoCompresionHuffman').dataset.tamanoDiccionario || 0);
    const tamanoDiccionarioLZW = parseFloat(document.getElementById('infoCompresionLZW').dataset.tamanoDiccionario || 0);
    const longitudCadenaHuffman = parseFloat(document.getElementById('infoCompresionHuffman').dataset.longitudCadena || 0);
    const longitudCadenaLZW = parseFloat(document.getElementById('infoCompresionLZW').dataset.longitudCadena || 0);

    // Destruir gráficos anteriores si existen
    if (tasaCompresionChart) tasaCompresionChart.destroy();
    if (tamanoDiccionarioChart) tamanoDiccionarioChart.destroy();
    if (longitudCadenaChart) longitudCadenaChart.destroy();

    // Gráfico 1: Tasa de Compresión
    tasaCompresionChart = new Chart(document.getElementById('tasaCompresionChart'), {
        type: 'bar',
        data: {
            labels: ['Huffman', 'LZW'],
            datasets: [{
                label: 'Tasa de Compresión (%)',
                data: [tasaCompresionHuffman, tasaCompresionLZW],
                backgroundColor: ['#4caf50', '#2196f3'],
                barThickness: 40
            }]
        },
        options: { responsive: true }
    });

    // Gráfico 2: Tamaño del Diccionario
    tamanoDiccionarioChart = new Chart(document.getElementById('tamanoDiccionarioChart'), {
        type: 'bar',
        data: {
            labels: ['Huffman', 'LZW'],
            datasets: [{
                label: 'Tamaño del Diccionario (bytes)',
                data: [tamanoDiccionarioHuffman, tamanoDiccionarioLZW],
                backgroundColor: ['#4caf50', '#2196f3'],
                barThickness: 40
            }]
        },
        options: { responsive: true }
    });

    // Gráfico 3: Longitud de la Cadena
    longitudCadenaChart = new Chart(document.getElementById('longitudCadenaChart'), {
        type: 'bar',
        data: {
            labels: ['Huffman', 'LZW'],
            datasets: [{
                label: 'Longitud de la Cadena (bits)',
                data: [longitudCadenaHuffman, longitudCadenaLZW],
                backgroundColor: ['#4caf50', '#2196f3'],
                barThickness: 40
            }]
        },
        options: { responsive: true }
    });
}
