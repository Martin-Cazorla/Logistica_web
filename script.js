// --- BASE DE DATOS DE CHOFERES ---
const baseDeDatosChoferes = {
    "99": { modelo: "Renault Master 2,5 DCL", tamaño: "Grande", chofer: "Carlos Vitale" },
    "591": { modelo: "Citroen Jumper", tamaño: "Grande", chofer: "Emanuel Suarez" },
    "130": { modelo: "Lifan Foison Box", tamaño: "Grande", chofer: "Maximiliano Ramos" },
    "635": { modelo: "Peugeot Boxer 330M 2,3 HDI", tamaño: "Grande", chofer: "Oscar Calcada" },
    "28": { modelo: "Peugeot Boxer", tamaño: "Grande", chofer: "Ignacio Monteagudo" },
    "218": { modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "Gonzalo Morales" },
    "126": { modelo: "Peugeot Boxer 330M 2,3 HDI Confort", tamaño: "Grande", chofer: "Jonathan Gimenez" },
    "123": { modelo: "Peugeot Boxer 330M 2,3 HDI Confort", tamaño: "Grande", chofer: "Fabian Bustos" },
    "170": { modelo: "Renault Nueva Master L1H1 AA", tamaño: "Grande", chofer: "Dante" },
    "976": { modelo: "Renault Master", tamaño: "Grande", chofer: "Daniel Vietri" },
    "21": { modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "Federico" },
    "17": { modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "Cristian Miranda" },
    "1017": { modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "Nahuel Alarcon" },
    "1018": { modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "German Rivero" },
    "173": { modelo: "Kangoo", tamaño: "Chica", chofer: "Ramiro Torrico" },
    "927": { modelo: "Renault Master", tamaño: "Grande", chofer: "Daniel Martinez" },
    "15": { modelo: "Fiat Fiorino Furgon 1,4", tamaño: "Chica", chofer: "Gonzalo Villagra" },
    "101": { modelo: "Citroen Berlingo Furgon 1,9D Full", tamaño: "Chica", chofer: "Carlos Oliva" },
    "640": { modelo: "Renault Kangoo II Express", tamaño: "Chica", chofer: "Sergio Soberon" },
    "240": { modelo: "Fiat Nuevo Fiorino", tamaño: "Chica", chofer: "Nicolas Cordoba" },
    "909": { modelo: "Renault Kangoo PH3", tamaño: "Chica", chofer: "Ricardo Heppner" },
    "293": { modelo: "Renault Master 2,5 DCL", tamaño: "Grande", chofer: "Pablo Diaz Velez" },
    "302": { modelo: "Kangoo", tamaño: "Chica", chofer: "Guillermo" },
    "19": { modelo: "Sprinter", tamaño: "Grande", chofer: "Alex Molinari" },
    "401": { modelo: "Fiat Fiorino Fire", tamaño: "Chica", chofer: "Cristian Acosta" },
    "985": { modelo: "Flete", tamaño: "Chica", chofer: "Flete" },
    "984": { modelo: "Flete", tamaño: "Chica", chofer: "Flete" },
    "983": { modelo: "Flete", tamaño: "Chica", chofer: "Flete" },
    "921": { modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "Luciano" }
};

let contadorFilas = 0;
let datosGlobales = []; 
let chartInstance = null;

// Ayudante para formatear fechas
function obtenerFechaHoy() {
    const hoy = new Date();
    return hoy.toLocaleDateString('es-AR');
}

// --- LÓGICA DE CARGA DIARIA ---
function agregarFila() {
    const tbody = document.getElementById("tabla-body");
    if (!tbody) return; 
    contadorFilas++;
    const nuevaFila = document.createElement("tr");
    nuevaFila.id = `fila-${contadorFilas}`;
    nuevaFila.innerHTML = `
        <td class="cell-fecha">${obtenerFechaHoy()}</td>
        <td><select id="select-horario-${contadorFilas}" onchange="actualizarFila(${contadorFilas})">
            <option value="10:00hs">10:00hs</option><option value="11:00hs">11:00hs</option>
            <option value="Electro">Electro</option><option value="Agregado">Agregado</option>
            <option value="No se presenta">No se presenta</option>
        </select></td>
        <td><input type="text" id="input-unidad-${contadorFilas}" oninput="actualizarFila(${contadorFilas})" placeholder="N°"></td>
        <td id="cell-modelo-${contadorFilas}">---</td><td id="cell-tamaño-${contadorFilas}">---</td><td id="cell-chofer-${contadorFilas}">---</td>
        <td><select id="select-vueltas-${contadorFilas}"><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></td>
        <td><select id="select-extra-${contadorFilas}" onchange="actualizarFila(${contadorFilas})"><option value="0">0</option><option value="1">1</option></select></td>
        <td class="col-obs"><input type="text" id="input-obs-${contadorFilas}" placeholder="..."></td>
        <td id="cell-presencia-${contadorFilas}" class="presencia-dato">0</td>
    `;
    tbody.appendChild(nuevaFila);
}

window.actualizarFila = function(idFila) {
    const unidadId = document.getElementById(`input-unidad-${idFila}`).value;
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
            if(document.getElementById(`cell-${id}-${idFila}`)) document.getElementById(`cell-${id}-${idFila}`).innerText = "---";
        });
        cellPresencia.innerText = "0";
    }
    calcularTotalesCarga();
};

function calcularTotalesCarga() {
    let totalUnidades = 0;
    document.querySelectorAll(".presencia-dato").forEach(celda => totalUnidades += parseInt(celda.innerText));
    if(document.getElementById("contador-unidades")) document.getElementById("contador-unidades").innerText = totalUnidades;
}

// --- HISTORIAL (Búsqueda en tiempo real) ---
window.filtrarHistorial = function() {
    const fFechaRaw = document.getElementById("filtro-fecha").value;
    const fUnidad = document.getElementById("filtro-unidad").value.trim();
    
    let fechaConCero = "";
    let fechaSinCero = "";
    
    if (fFechaRaw) {
        const partes = fFechaRaw.split("-");
        fechaConCero = `${partes[2]}/${partes[1]}/${partes[0]}`; 
        fechaSinCero = `${parseInt(partes[2])}/${parseInt(partes[1])}/${partes[0]}`;
    }

    const resultados = datosGlobales.filter(reg => {
        const valorFecha = String(reg.fecha || reg.Fecha || "").trim();
        const coincideUnidad = fUnidad === "" || String(reg.unidad).includes(fUnidad);
        const coincideFecha = fFechaRaw === "" || (valorFecha === fechaConCero || valorFecha === fechaSinCero);
        
        return coincideUnidad && coincideFecha;
    });

    renderizarTablaHistorial(resultados);
};

window.limpiarFiltrosBusqueda = function() {
    if(document.getElementById("filtro-fecha")) document.getElementById("filtro-fecha").value = "";
    if(document.getElementById("filtro-unidad")) document.getElementById("filtro-unidad").value = "";
    renderizarTablaHistorial(datosGlobales);
};

function renderizarTablaHistorial(lista) {
    const tbody = document.getElementById("tabla-historial-body");
    const kpiTotal = document.getElementById("total-registros");
    if (!tbody) return;  
    if (kpiTotal) kpiTotal.innerText = lista.length;

    tbody.innerHTML = lista.map(reg => `
        <tr>
            <td>${reg.fecha}</td>
            <td>${reg.horario}</td>
            <td>${reg.unidad}</td>
            <td>${reg.chofer}</td>
            <td>${reg.vueltas}</td>
            <td>${reg.extra}</td>
            <td>${reg.obs}</td>
            <td><button onclick="abrirModalEditar('${reg.idFirebase}')" style="border:none; background:none; cursor:pointer;">✏️</button></td>
        </tr>
    `).join('');
}

// --- DASHBOARD ---
function actualizarDashboard(datos) {
    if (!document.getElementById('kpi-unidades')) return;

    const totalUnidades = datos.length;
    const totalVueltas = datos.reduce((sum, reg) => sum + Number(reg.vueltas || 0), 0);
    const totalExtras = datos.filter(reg => Number(reg.extra) > 0).length;

    document.getElementById('kpi-unidades').innerText = totalUnidades;
    document.getElementById('kpi-productividad').innerText = totalUnidades > 0 ? (totalVueltas / totalUnidades).toFixed(2) : "0.00";
    document.getElementById('kpi-extras').innerText = totalUnidades > 0 ? ((totalExtras / totalUnidades) * 100).toFixed(0) + "%" : "0%";
    
    const statsPorDia = {};
    datos.forEach(reg => {
        const f = reg.fecha || reg.Fecha;
        if (!statsPorDia[f]) statsPorDia[f] = { vueltas: 0, unidades: 0 };
        statsPorDia[f].vueltas += Number(reg.vueltas || 0);
        statsPorDia[f].unidades += 1;
    });

    const fechas = Object.keys(statsPorDia);
    const dataVueltas = fechas.map(f => statsPorDia[f].vueltas);
    const dataUnidades = fechas.map(f => statsPorDia[f].unidades);

    renderizarGrafico(fechas, dataVueltas, dataUnidades);
}

function renderizarGrafico(fechas, vueltas, unidades) {
    const canvas = document.getElementById('graficoVueltas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');   
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: fechas,
            datasets: [
                { label: 'Vueltas Totales', data: vueltas, borderColor: '#2d7a44', backgroundColor: 'rgba(45, 122, 68, 0.1)', yAxisID: 'y', tension: 0.3, fill: true },
                { label: 'Unidades Presentes', data: unidades, borderColor: '#007bff', backgroundColor: 'rgba(0, 123, 255, 0.1)', yAxisID: 'y1', tension: 0.3 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { type: 'linear', position: 'left', title: { display: true, text: 'Vueltas' }, beginAtZero: true },
                y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Unidades' }, beginAtZero: true }
            }
        }
    });
}

// --- FIREBASE: CARGA ---
async function obtenerDatos() {
    const { collection, getDocs, query, orderBy } = window.firestoreLib;
    const q = query(collection(window.db, "historialLogistica"), orderBy("fecha", "asc"));
    
    try {
        const querySnapshot = await getDocs(q);
        datosGlobales = [];
        querySnapshot.forEach(doc => {
            datosGlobales.push({ idFirebase: doc.id, ...doc.data() });
        });
        
        console.log("¡Firebase respondió! Registros cargados:", datosGlobales.length);
        actualizarDashboard(datosGlobales);
        renderizarTablaHistorial(datosGlobales);
    } catch (e) {
        console.error("Error al obtener datos:", e);
    }
}    

window.onload = function() {  
    if (document.getElementById('graficoVueltas') || document.getElementById('tabla-historial-body')) {
        let intentos = 0;
        const checkDB = setInterval(() => {

            if (window.db && window.firestoreLib) {

                clearInterval(checkDB);
                obtenerDatos();
            }
            if (++intentos > 50) clearInterval(checkDB);
        }, 100);
    }

    if (document.getElementById("tabla-body")) {
        agregarFila();
    }
    
    const btnFiltrar = document.getElementById('btn-aplicar-filtro');
    const btnVerTodo = document.getElementById('btn-quitar-filtro');

    if (btnFiltrar) {
        btnFiltrar.onclick = () => {
            const f = document.getElementById('filtro-fecha-dashboard').value;
            if (!f) return alert("Selecciona una fecha");
            
            const partes = f.split("-");
            const fechaConCero = `${partes[2]}/${partes[1]}/${partes[0]}`; 
            const fechaSinCero = `${parseInt(partes[2])}/${parseInt(partes[1])}/${partes[0]}`;
              
            const filtrados = datosGlobales.filter(reg => {
                const valorFecha = String(reg.fecha || reg.Fecha || "").trim();
                return valorFecha === fechaConCero || valorFecha === fechaSinCero;
            });
            
            if (filtrados.length === 0) alert("No se encontraron datos.");
            actualizarDashboard(filtrados);
        };
    }

    if (btnVerTodo) {
        btnVerTodo.onclick = () => {
            document.getElementById('filtro-fecha-dashboard').value = "";
            actualizarDashboard(datosGlobales);
        };
    }
};
  
window.exportarHistorialExcel = function() {
    if (datosGlobales.length === 0) return alert("No hay datos para exportar.");
    const hoja = XLSX.utils.json_to_sheet(datosGlobales);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Historial");
    XLSX.writeFile(libro, "Historial_Logistica.xlsx");
};