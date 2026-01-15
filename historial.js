// historial.js - GESTIÓN DE ARCHIVOS Y RENDIMIENTO
let datosGlobales = [];

// --- LÓGICA DE CARGA Y RENDERIZADO ---

function convertirFechaParaOrdenar(fechaStr) {
    if (!fechaStr) return new Date(0);
    const [dia, mes, anio] = fechaStr.split('/');
    return new Date(anio, mes - 1, dia);
}

// Función global para que historial.html pueda llamarla tras verificar el login
window.cargarHistorialDesdeFirebase = async function() {
    if (!window.firestoreLib || !window.db) return; 

    const { collection, getDocs, query } = window.firestoreLib;
    try {
        const q = query(collection(window.db, "historialLogistica"));
        const querySnapshot = await getDocs(q);
        
        datosGlobales = [];
        querySnapshot.forEach(doc => {
            datosGlobales.push({ idFirebase: doc.id, ...doc.data() });
        });
        
        datosGlobales.sort((a, b) => convertirFechaParaOrdenar(b.fecha) - convertirFechaParaOrdenar(a.fecha));
        renderizarTablaHistorial(datosGlobales);
        console.log("Historial cargado correctamente desde Firebase.");
    } catch (e) {
        console.error("Error al obtener datos:", e);
    }
}

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
            <td>
                <button onclick="window.abrirModalEditar('${reg.idFirebase}')" class="btn-editar">✏️</button>
            </td>
        </tr>
    `).join('');
}

// --- FILTROS DE BÚSQUEDA ---

const ejecutarFiltros = () => {
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
        const valorFecha = String(reg.fecha || "").trim();
        const coincideUnidad = fUnidad === "" || String(reg.unidad).trim() === fUnidad;
        const coincideFecha = fFechaRaw === "" || (valorFecha === fechaConCero || valorFecha === fechaSinCero);
        return coincideUnidad && coincideFecha;
    });

    renderizarTablaHistorial(resultados);
};    

// --- GESTIÓN DE MODAL Y EDICIÓN ---

window.abrirModalEditar = function(idFirebase) {
    const registro = datosGlobales.find(r => r.idFirebase === idFirebase);
    if (!registro) return;

    document.getElementById('edit-id').value = idFirebase;
    document.getElementById('edit-fecha').value = registro.fecha;
    document.getElementById('edit-horario').value = registro.horario;
    document.getElementById('edit-unidad').value = registro.unidad;
    document.getElementById('edit-vueltas').value = registro.vueltas;
    document.getElementById('edit-extra').value = registro.extra;
    document.getElementById('edit-obs').value = registro.obs;

    document.getElementById('modalEditar').style.display = 'block';
};

const cerrarModal = () => {
    document.getElementById('modalEditar').style.display = 'none';
};

const guardarCambios = async () => {
    const { doc, updateDoc } = window.firestoreLib;
    const idFirebase = document.getElementById('edit-id').value;
    const nuevosDatos = {
        fecha: document.getElementById('edit-fecha').value,
        horario: document.getElementById('edit-horario').value,
        unidad: document.getElementById('edit-unidad').value,
        vueltas: document.getElementById('edit-vueltas').value,
        extra: document.getElementById('edit-extra').value,
        obs: document.getElementById('edit-obs').value
    };

    try {
        await updateDoc(doc(window.db, "historialLogistica", idFirebase), nuevosDatos);
        alert("¡Registro actualizado correctamente!");
        cerrarModal();
        window.cargarHistorialDesdeFirebase(); 
    } catch (e) {
        alert("Error al actualizar.");
    }
};

// --- ASIGNACIÓN DE EVENTOS ---

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("filtro-fecha").addEventListener("input", ejecutarFiltros);
    document.getElementById("filtro-unidad").addEventListener("input", ejecutarFiltros);

    
    document.getElementById("btn-limpiar-filtros").onclick = () => {
        document.getElementById("filtro-fecha").value = "";
        document.getElementById("filtro-unidad").value = "";
        renderizarTablaHistorial(datosGlobales);
    };

    document.getElementById("btn-descargar-excel").onclick = () => {
        if (datosGlobales.length === 0) return alert("No hay datos para exportar.");
        const hoja = XLSX.utils.json_to_sheet(datosGlobales);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Historial_Logistica");
        XLSX.writeFile(libro, "Reporte_Envíos.xlsx");
    };

    document.getElementById("btn-borrar-todo").onclick = async () => {
        const { doc, deleteDoc } = window.firestoreLib;
        if (!confirm("¿Eliminar TODO el historial? Esta acción no se puede deshacer.")) return;
        
        try {
            for (let reg of datosGlobales) {
                await deleteDoc(doc(window.db, "historialLogistica", reg.idFirebase));
            }
            alert("Historial vaciado.");
            window.cargarHistorialDesdeFirebase();
        } catch (e) {
            alert("Error al borrar.");
        }
    };

    // Modal
    document.getElementById("btn-cerrar-modal").onclick = cerrarModal;
    document.getElementById("btn-guardar-modal").onclick = guardarCambios;

});