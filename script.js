// script.js - ENFOCADO EN PANEL DE CARGA DIARIA

let contadorFilas = 0;

// --- LÓGICA DE CARGA DIARIA ---

// Función para agregar una fila nueva al presionar Enter o al cargar la página
function agregarFila() {
    const tbody = document.getElementById("tabla-body");
    if (!tbody) return; 
    
    contadorFilas++;
    const nuevaFila = document.createElement("tr");
    nuevaFila.id = `fila-${contadorFilas}`;
    nuevaFila.innerHTML = `
        <td class="cell-fecha">${obtenerFechaHoy()}</td>
        <td><select id="select-horario-${contadorFilas}" onchange="actualizarFila(${contadorFilas})">
            <option value="10:00hs">10:00hs</option>
            <option value="11:00hs">11:00hs</option>
            <option value="Electro">Electro</option>
            <option value="Agregado">Agregado</option>
            <option value="No se presenta">No se presenta</option>
        </select></td>
        <td><input type="text" id="input-unidad-${contadorFilas}" oninput="actualizarFila(${contadorFilas})" placeholder="N°"></td>
        <td id="cell-modelo-${contadorFilas}">---</td>
        <td id="cell-tamaño-${contadorFilas}">---</td>
        <td id="cell-chofer-${contadorFilas}">---</td>
        <td><select id="select-vueltas-${contadorFilas}">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
        </select></td>
        <td><select id="select-extra-${contadorFilas}" onchange="actualizarFila(${contadorFilas})">
            <option value="0">0</option>
            <option value="1">1</option>
        </select></td>
        <td class="col-obs"><input type="text" id="input-obs-${contadorFilas}" placeholder="..."></td>
        <td id="cell-presencia-${contadorFilas}" class="presencia-dato">0</td>
    `;
    tbody.appendChild(nuevaFila);

    // Salto automático de celda al presionar Enter
    const inputUnidad = document.getElementById(`input-unidad-${contadorFilas}`);
    inputUnidad.focus(); // Pone el foco automáticamente en la nueva unidad
    
    inputUnidad.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            e.preventDefault(); 
            agregarFila(); 
        }
    });
}

// Función que cruza el ID de unidad con la base de datos de config.js
window.actualizarFila = function(idFila) {
    const unidadId = document.getElementById(`input-unidad-${idFila}`).value.trim();
    const horario = document.getElementById(`select-horario-${idFila}`).value;     
    const resultado = baseDeDatosChoferes[unidadId];     
    const cellPresencia = document.getElementById(`cell-presencia-${idFila}`);

    if (resultado) {
        document.getElementById(`cell-modelo-${idFila}`).innerText = resultado.modelo;
        document.getElementById(`cell-tamaño-${idFila}`).innerText = resultado.tamaño;
        document.getElementById(`cell-chofer-${idFila}`).innerText = resultado.chofer;
        cellPresencia.innerText = (horario === "No se presenta") ? "0" : "1";
    } else {
        ["modelo", "tamaño", "chofer"].forEach(id => {
            const el = document.getElementById(`cell-${id}-${idFila}`);
            if(el) el.innerText = "---";
        });
        cellPresencia.innerText = "0";
    }
    calcularTotalesCarga();
};

// Cálculo de KPIs en tiempo real para el Panel
function calcularTotalesCarga() {
    let totalUnidades = 0;
    let totalExtras = 0;

    // Unidades presentes
    document.querySelectorAll(".presencia-dato").forEach(celda => {
        totalUnidades += parseInt(celda.innerText) || 0;
    });

    // Extras (buscamos todos los select de extra)
    document.querySelectorAll('[id^="select-extra-"]').forEach(select => {
        totalExtras += parseInt(select.value) || 0;
    });

    if(document.getElementById("contador-unidades")) {
        document.getElementById("contador-unidades").innerText = totalUnidades;
    }
    if(document.getElementById("contador-extras")) {
        document.getElementById("contador-extras").innerText = totalExtras;
    }
}

// Inicio al cargar la página
window.onload = function() {    
    if (document.getElementById("tabla-body")) {
        agregarFila();
  }
};

window.exportarExcel = function() {
    const tabla = document.querySelector(".tabla-logistica");
    if (!tabla) return alert("No hay tabla para exportar");

    // Crea el Excel directamente desde el elemento HTML de la tabla
    const hoja = XLSX.utils.table_to_sheet(tabla);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Carga_Diaria");

    XLSX.writeFile(libro, `Logistica_Dia_${obtenerFechaHoy().replace(/\//g, '-')}.xlsx`);
};