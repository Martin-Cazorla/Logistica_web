/**
 * historial-handler.js - GESTIÓN DE INTERFAZ DE HISTORIAL
 */
import { obtenerTodosLosRegistros, actualizarRegistro, eliminarRegistro } from '../firebase/db-operations.js';
import { mostrarNotificacion } from '../modules/utils.js';

let datosGlobales = [];

async function cargarHistorial() {
    datosGlobales = await obtenerTodosLosRegistros();
    
    // El orden ya viene descendente de Firebase, pero reforzamos por seguridad
    datosGlobales.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    renderizarTabla(datosGlobales);
}

function renderizarTabla(lista) {
    const tbody = document.getElementById("tabla-historial-body");
    const kpiTotal = document.getElementById("total-registros");
    
    if (!tbody) return;
    if (kpiTotal) kpiTotal.innerText = lista.length;

    tbody.innerHTML = lista.map(reg => {
        // Generamos un resumen de texto de las vueltas
        const resumenVueltas = reg.detalleVueltas.map(v => 
            `V${v.nro}: ${v.banda} (${v.estado})`
        ).join(' | ');

        return `
            <tr>
                <td>${reg.fecha}</td>
                <td>${reg.horarioIngreso || '---'}</td>
                <td><strong>${reg.unidad}</strong></td>
                <td>${reg.chofer}</td>
                <td style="text-align:center;">${reg.vueltasTotales} / 4</td>
                <td style="font-size: 0.8rem; color: #555;">${resumenVueltas}</td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn-guardar" onclick="window.abrirModalEditar('${reg.idFirebase}')" title="Editar">✏️</button>
                        <button class="btn-limpiar" onclick="window.borrarRegistro('${reg.idFirebase}')" title="Eliminar">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// FILTROS EN TIEMPO REAL
function ejecutarFiltros() {
    const fFecha = document.getElementById("filtro-fecha").value;
    const fUnidad = document.getElementById("filtro-unidad").value.toLowerCase();

    const filtrados = datosGlobales.filter(reg => {
        const coincideFecha = fFecha ? reg.fecha === fFecha : true;
        const coincideUnidad = fUnidad ? reg.unidad.toString().includes(fUnidad) : true;
        return coincideFecha && coincideUnidad;
    });

    renderizarTabla(filtrados);
}

// EXPORTACIÓN A EXCEL (Avanzada: incluye observaciones)
function exportarExcel() {
    if (datosGlobales.length === 0) return;

    const dataParaExcel = datosGlobales.map(reg => ({
        Fecha: reg.fecha,
        Unidad: reg.unidad,
        Chofer: reg.chofer,
        Ingreso: reg.horarioIngreso,
        Total_Vueltas: reg.vueltasTotales,
        Detalle: reg.detalleVueltas.map(v => `V${v.nro}:${v.banda}-${v.estado} Obs:${v.observaciones || ''}`).join(' // ')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataParaExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial_Logistica");
    XLSX.writeFile(workbook, `Historial_${new Date().toLocaleDateString()}.xlsx`);
}

// FUNCIONES GLOBALES PARA BOTONES
window.abrirModalEditar = (id) => {
    const reg = datosGlobales.find(r => r.idFirebase === id);
    if (!reg) return;
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-horario').value = reg.horarioIngreso || "10:00hs";
    document.getElementById('modalEditar').style.display = 'block';
};

window.borrarRegistro = async (id) => {
    if (!confirm("¿Deseas eliminar este registro de forma permanente?")) return;
    try {
        await eliminarRegistro(id);
        mostrarNotificacion("Eliminado", "success");
        cargarHistorial();
    } catch (e) { mostrarNotificacion("Error al borrar", "error"); }
};

// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
    cargarHistorial();
    document.getElementById("filtro-fecha").oninput = ejecutarFiltros;
    document.getElementById("filtro-unidad").oninput = ejecutarFiltros;
    document.getElementById("btn-limpiar-filtros").onclick = () => {
        document.getElementById("filtro-fecha").value = "";
        document.getElementById("filtro-unidad").value = "";
        renderizarTabla(datosGlobales);
    };
    document.getElementById("btn-descargar-excel").onclick = exportarExcel;
    document.getElementById("btn-cerrar-modal").onclick = () => {
        document.getElementById('modalEditar').style.display = 'none';
    };
});