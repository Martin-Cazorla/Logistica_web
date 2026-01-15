// --- CONFIGURACIÓN DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBa1n9yQJ33viJ_3P-99yuL4-fzQFzLPis",
    authDomain: "logistica-envios-44bf6.firebaseapp.com",
    projectId: "logistica-envios-44bf6",
    storageBucket: "logistica-envios-44bf6.firebasestorage.app",
    messagingSenderId: "611013572218",
    appId: "1:611013572218:web:beb687be674a65ceafadc3",
    measurementId: "G-V14SKXYCJ5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Hacemos las herramientas accesibles globalmente para que funcionen los onclick del HTML
window.db = db;
window.firestoreLib = { collection, getDocs, query, doc, updateDoc, deleteDoc };

let datosGlobales = [];

// --- LÓGICA DE CARGA Y RENDERIZADO ---

function convertirFechaParaOrdenar(fechaStr) {
    if (!fechaStr) return new Date(0);
    const [dia, mes, anio] = fechaStr.split('/');
    return new Date(anio, mes - 1, dia);
}

async function cargarHistorialDesdeFirebase() {
    try {
        const q = query(collection(db, "historialLogistica"));
        const querySnapshot = await getDocs(q);
        datosGlobales = [];
        querySnapshot.forEach(doc => {
            datosGlobales.push({ idFirebase: doc.id, ...doc.data() });
        });

        datosGlobales.sort((a, b) => convertirFechaParaOrdenar(b.fecha) - convertirFechaParaOrdenar(a.fecha));
        renderizarTablaHistorial(datosGlobales);
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
            <td><button onclick="abrirModalEditar('${reg.idFirebase}')" style="border:none; background:none; cursor:pointer;">✏️</button></td>
        </tr>
    `).join('');
}

// --- FILTROS Y BÚSQUEDA ---

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
        const coincideUnidad = fUnidad === "" || String(reg.unidad).trim() === fUnidad;
        const coincideFecha = fFechaRaw === "" || (valorFecha === fechaConCero || valorFecha === fechaSinCero);
        return coincideUnidad && coincideFecha;
    });

    renderizarTablaHistorial(resultados);
};

window.limpiarFiltrosBusqueda = function() {
    document.getElementById("filtro-fecha").value = "";
    document.getElementById("filtro-unidad").value = "";
    renderizarTablaHistorial(datosGlobales);
};

// --- GESTIÓN DE MODAL Y EDICIÓN ---

window.abrirModalEditar = function(idFirebase) {
    const registro = datosGlobales.find(r => r.idFirebase === idFirebase);
    if (!registro) return;

    document.getElementById('edit-index').value = idFirebase;
    document.getElementById('edit-fecha').value = registro.fecha;
    document.getElementById('edit-horario').value = registro.horario;
    document.getElementById('edit-unidad').value = registro.unidad;
    document.getElementById('edit-vueltas').value = registro.vueltas;
    document.getElementById('edit-extra').value = registro.extra;
    document.getElementById('edit-obs').value = registro.obs;

    document.getElementById('modalEditar').style.display = 'block';
};

window.cerrarModal = function() {
    document.getElementById('modalEditar').style.display = 'none';
};

window.guardarCambiosModal = async function() {
    const idFirebase = document.getElementById('edit-index').value;
    const nuevosDatos = {
        fecha: document.getElementById('edit-fecha').value,
        horario: document.getElementById('edit-horario').value,
        unidad: document.getElementById('edit-unidad').value,
        vueltas: document.getElementById('edit-vueltas').value,
        extra: document.getElementById('edit-extra').value,
        obs: document.getElementById('edit-obs').value
    };

    try {
        await updateDoc(doc(db, "historialLogistica", idFirebase), nuevosDatos);
        alert("Registro actualizado!");
        cerrarModal();
        cargarHistorialDesdeFirebase();
    } catch (e) {
        console.error("Error al actualizar:", e);
    }
};

// --- EXPORTACIÓN Y BORRADO ---

window.exportarHistorialExcel = function() {
    if (datosGlobales.length === 0) return alert("No hay datos.");
    const hoja = XLSX.utils.json_to_sheet(datosGlobales);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Historial");
    XLSX.writeFile(libro, "Historial_Logistica.xlsx");
};

window.borrarTodoElHistorial = async function() {
    if (!confirm("¿ESTÁS SEGURO? Se borrarán todos los datos de Firebase.")) return;
    try {
        for (let reg of datosGlobales) {
            await deleteDoc(doc(db, "historialLogistica", reg.idFirebase));
        }
        alert("Historial vaciado.");
        cargarHistorialDesdeFirebase();
    } catch (e) {
        console.error("Error al borrar:", e);
    }
};

// INICIALIZACIÓN
cargarHistorialDesdeFirebase();