//  Base de Datos Completa de Choferes 
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
let datosHistorialCompleto = []; 

function obtenerFechaHoy() {
    const hoy = new Date();
    return hoy.toLocaleDateString('es-AR');
}

// --- CARGA DIARIA ---
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
        <td><input type="text" id="input-unidad-${contadorFilas}" oninput="actualizarFila(${contadorFilas})" onkeydown="revisarTecla(event, ${contadorFilas})" placeholder="N°"></td>
        <td id="cell-modelo-${contadorFilas}">---</td><td id="cell-tamaño-${contadorFilas}">---</td><td id="cell-chofer-${contadorFilas}">---</td>
        <td><select id="select-vueltas-${contadorFilas}"><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></td>
        <td><select id="select-extra-${contadorFilas}" onchange="actualizarFila(${contadorFilas})"><option value="0">0</option><option value="1">1</option></select></td>
        <td class="col-obs"><input type="text" id="input-obs-${contadorFilas}" placeholder="..."></td>
        <td id="cell-presencia-${contadorFilas}" class="presencia-dato">0</td>
    `;
    tbody.appendChild(nuevaFila);
}

function actualizarFila(idFila) {
    const unidadId = document.getElementById(`input-unidad-${idFila}`).value;
    const horario = document.getElementById(`select-horario-${idFila}`).value;
    const extraValue = document.getElementById(`select-extra-${idFila}`).value;
    const resultado = baseDeDatosChoferes[unidadId];
    const filaElemento = document.getElementById(`fila-${idFila}`);
    const cellPresencia = document.getElementById(`cell-presencia-${idFila}`);
    const selectExtra = document.getElementById(`select-extra-${idFila}`);

    if (resultado) {
        document.getElementById(`cell-modelo-${idFila}`).innerText = resultado.modelo;
        document.getElementById(`cell-tamaño-${idFila}`).innerText = resultado.tamaño;
        document.getElementById(`cell-chofer-${idFila}`).innerText = resultado.chofer;
        const esAusente = (horario === "No se presenta");
        cellPresencia.innerText = esAusente ? "0" : "1";
        if (esAusente) { filaElemento.classList.add("fila-ausente"); cellPresencia.classList.add("status-ausente"); }
        else { filaElemento.classList.remove("fila-ausente"); cellPresencia.classList.remove("status-ausente"); }
        if (extraValue === "1") selectExtra.classList.add("status-extra"); else selectExtra.classList.remove("status-extra");
    } else {
        ["modelo", "tamaño", "chofer"].forEach(id => { const el = document.getElementById(`cell-${id}-${idFila}`); if(el) el.innerText = "---"; });
        cellPresencia.innerText = "0";
    }
    calcularTotales();
}

function calcularTotales() {
    let totalUnidades = 0;
    document.querySelectorAll(".presencia-dato").forEach(celda => totalUnidades += parseInt(celda.innerText));
    const elUnidades = document.getElementById("contador-unidades");
    if(elUnidades) elUnidades.innerText = totalUnidades;

    let totalExtras = 0;
    for (let i = 1; i <= contadorFilas; i++) {
        const sel = document.getElementById(`select-extra-${i}`);
        if (sel && sel.value === "1") totalExtras++;
    }
    const elExtras = document.getElementById("contador-extras");
    if(elExtras) elExtras.innerText = totalExtras;
}

function revisarTecla(event, idFila) {
    if ((event.keyCode === 13 || event.keyCode === 9) && idFila === contadorFilas) {
        if (document.getElementById(`input-unidad-${idFila}`).value !== "") {
            if(event.keyCode === 13) event.preventDefault();
            agregarFila();
            setTimeout(() => document.getElementById(`input-unidad-${contadorFilas}`).focus(), 10);
        }
    }
}

// --- EXPORTAR Y LIMPIAR (ACTUALIZADO CON FIREBASE) ---
function exportarExcel() {
    const tablaOriginal = document.querySelector(".tabla-logistica");
    if (!tablaOriginal) return;
    const tablaClonada = tablaOriginal.cloneNode(true);
    tablaClonada.querySelectorAll("tbody tr").forEach(fila => {
        fila.querySelectorAll("select").forEach(sel => sel.parentElement.innerText = document.getElementById(sel.id).value);
        fila.querySelectorAll("input").forEach(inp => inp.parentElement.innerText = document.getElementById(inp.id).value);
    });
    const hoja = XLSX.utils.table_to_sheet(tablaClonada);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Carga Diaria");
    XLSX.writeFile(libro, `Logistica_${obtenerFechaHoy().replace(/\//g, '-')}.xlsx`);
}

// guardar cada registro en Firebase
async function guardarEnFirebase(registro) {
    try {
        await window.firestoreLib.addDoc(window.firestoreLib.collection(window.db, "historialLogistica"), registro);
    } catch (e) {
        console.error("Error al guardar en Firebase:", e);
    }
}

async function limpiarDia() {
    if (confirm("¿Deseas archivar los datos de hoy en la nube para todo el equipo?")) {
        
        for (let i = 1; i <= contadorFilas; i++) {
            const unid = document.getElementById(`input-unidad-${i}`).value;
            if (unid !== "") {
                const registro = {
                    fecha: obtenerFechaHoy(),
                    horario: document.getElementById(`select-horario-${i}`).value,
                    unidad: unid,
                    chofer: document.getElementById(`cell-chofer-${i}`).innerText,
                    vueltas: document.getElementById(`select-vueltas-${i}`).value,
                    extra: document.getElementById(`select-extra-${i}`).value,
                    obs: document.getElementById(`input-obs-${i}`).value,
                    createdAt: new Date() 
                };
                await guardarEnFirebase(registro);
            }
        }
        

        document.getElementById("tabla-body").innerHTML = "";
        contadorFilas = 0;
        agregarFila();
        calcularTotales();
        alert("¡Archivado y sincronizado en la nube correctamente!");
    }
}

// --- GESTIÓN DE HISTORIAL (ACTUALIZADO CON FIREBASE) ---


async function cargarHistorialDesdeFirebase() {
    const { collection, getDocs, query, orderBy } = window.firestoreLib;
    const q = query(collection(window.db, "historialLogistica"), orderBy("createdAt", "desc"));
    
    try {
        const querySnapshot = await getDocs(q);
        datosHistorialCompleto = [];
        querySnapshot.forEach((doc) => {

            datosHistorialCompleto.push({ idFirebase: doc.id, ...doc.data() });
        });
        renderizarTabla(datosHistorialCompleto);
    } catch (e) {
        console.error("Error al cargar historial:", e);
    }
}

function renderizarTabla(lista) {
    const tbody = document.getElementById("tabla-historial-body");
    const contador = document.getElementById("total-registros");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (contador) contador.innerText = lista.length;

    lista.forEach((reg, index) => {
        const fila = `<tr>
            <td>${reg.fecha}</td>
            <td>${reg.horario}</td>
            <td>${reg.unidad}</td>
            <td>${reg.chofer}</td>
            <td>${reg.vueltas}</td>
            <td>${reg.extra}</td>
            <td>${reg.obs}</td>
            <td>
                <button onclick="abrirModalEditar(${index})" style="cursor:pointer; background:none; border:none; font-size:1.2rem;">✏️</button>
            </td>
        </tr>`;
        tbody.innerHTML += fila;
    });
}

// --- NUEVA LÓGICA DE FILTRADO EXACTO ---
function filtrarHistorial() {
    let fFechaOriginal = document.getElementById("filtro-fecha").value; 
    const fUnid = document.getElementById("filtro-unidad").value.trim();
    
    let fFechaFormateada = "";

    // Convertimos la fecha del input al formato DD/MM/YYYY de la base de datos
    if (fFechaOriginal) {
        const partes = fFechaOriginal.split("-");
        const dia = parseInt(partes[2], 10);
        const mes = parseInt(partes[1], 10);
        const anio = partes[0];
        fFechaFormateada = `${dia}/${mes}/${anio}`;
    }

    const resultados = datosHistorialCompleto.filter(reg => {
        // Coincidencia exacta de fecha
        const coincideFecha = fFechaFormateada === "" || String(reg.fecha) === fFechaFormateada;
        
        // Coincidencia exacta de unidad
        const coincideUnidad = fUnid === "" || String(reg.unidad) === fUnid;

        return coincideFecha && coincideUnidad;
    });

    renderizarTabla(resultados);
}

// Función para limpiar filtros y ver todo de nuevo
function limpiarFiltrosBusqueda() {
    document.getElementById("filtro-fecha").value = "";
    document.getElementById("filtro-unidad").value = "";
    renderizarTabla(datosHistorialCompleto);
}

function abrirModalEditar(index) {
    const reg = datosHistorialCompleto[index];
    if (!reg) return;

    document.getElementById("edit-index").value = index;
    document.getElementById("edit-fecha").value = reg.fecha;
    document.getElementById("edit-horario").value = reg.horario;
    document.getElementById("edit-unidad").value = reg.unidad;
    document.getElementById("edit-vueltas").value = reg.vueltas;
    document.getElementById("edit-extra").value = reg.extra;
    document.getElementById("edit-obs").value = reg.obs;

    document.getElementById("modalEditar").style.display = "block";
}

function cerrarModal() { document.getElementById("modalEditar").style.display = "none"; }

async function guardarCambiosModal() {
    const { doc, updateDoc } = window.firestoreLib;
    const idx = document.getElementById("edit-index").value;
    const registroOriginal = datosHistorialCompleto[idx];
    const nuevaUnid = document.getElementById("edit-unidad").value;

    const datosActualizados = {
        fecha: document.getElementById("edit-fecha").value,
        horario: document.getElementById("edit-horario").value,
        unidad: nuevaUnid,
        vueltas: document.getElementById("edit-vueltas").value,
        extra: document.getElementById("edit-extra").value,
        obs: document.getElementById("edit-obs").value,
        chofer: baseDeDatosChoferes[nuevaUnid] ? baseDeDatosChoferes[nuevaUnid].chofer : "---"
    };

    try {
        // Firebase usando su ID único
        const docRef = doc(window.db, "historialLogistica", registroOriginal.idFirebase);
        await updateDoc(docRef, datosActualizados);
        
        alert("Cambios guardados en la nube.");
        cerrarModal();
        cargarHistorialDesdeFirebase(); 
    } catch (e) {
        console.error("Error al actualizar:", e);
        alert("Error al guardar cambios.");
    }
}

function exportarHistorialExcel() {
    if (datosHistorialCompleto.length === 0) return alert("No hay datos.");

    const datosParaExcel = datosHistorialCompleto.map(({idFirebase, createdAt, ...resto}) => resto);
    const hoja = XLSX.utils.json_to_sheet(datosParaExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Historial");
    XLSX.writeFile(libro, "Historial_Completo.xlsx");
}

async function borrarTodoElHistorial() {
    if (confirm("⚠️ ¿Borrar TODO el historial de la NUBE?") && confirm("🛑 ¿Estás REALMENTE seguro? Esto afectará a todo el equipo.")) {
        const { collection, getDocs, deleteDoc, doc } = window.firestoreLib;
        const querySnapshot = await getDocs(collection(window.db, "historialLogistica"));
        
        // hay que borrar uno por uno
        const promesasBorrado = [];
        querySnapshot.forEach((documento) => {
            promesasBorrado.push(deleteDoc(doc(window.db, "historialLogistica", documento.id)));
        });
        
        await Promise.all(promesasBorrado);
        alert("Historial borrado completamente.");
        cargarHistorialDesdeFirebase();
    }
}

// --- INICIO  ---
window.onload = function() {
    const esHistorial = document.getElementById("tabla-historial-body");
    
    if (esHistorial) {
        console.log("Detectada página de historial, esperando a Firebase...");
        let intentos = 0;
        const checkDB = setInterval(() => {
            intentos++;
            if (window.db && window.firestoreLib) {
                console.log("Firebase conectado, cargando datos...");
                clearInterval(checkDB);
                cargarHistorialDesdeFirebase();
            }
            if (intentos > 50) { 
                clearInterval(checkDB);
                console.error("No se pudo conectar con Firebase.");
            }
        }, 100); 
    } else {
        agregarFila();
    }
};