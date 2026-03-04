/**
 * historial-handler.js - GESTIÓN DE INTERFAZ DE HISTORIAL
 */
import { obtenerTodosLosRegistros, actualizarRegistro, eliminarRegistro } from '../firebase/db-operations.js';
import { mostrarNotificacion } from '../modules/utils.js';

let datosGlobales = [];

export async function cargarHistorial() {
    datosGlobales = await obtenerTodosLosRegistros();
    
    // Ordenar por fecha descendente
    datosGlobales.sort((a, b) => {
        const parseDate = (d) => new Date(d.split('/').reverse().join('-'));
        return parseDate(b.fecha) - parseDate(a.fecha);
    });

    renderizarTabla(datosGlobales);
}

function renderizarTabla(lista) {
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
                <button class="btn-editar" data-id="${reg.idFirebase}" title="Editar">✏️</button>
                <button class="btn-borrar-unico" data-id="${reg.idFirebase}" title="Eliminar" style="background:none; border:none; cursor:pointer;">🗑️</button>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('.btn-editar').forEach(btn => {
        btn.onclick = () => abrirModalEditar(btn.dataset.id);
    });

    tbody.querySelectorAll('.btn-borrar-unico').forEach(btn => {
        btn.onclick = () => borrarRegistroIndividual(btn.dataset.id);
    });
}

// ... (Lógica de ejecutarFiltros y exportarExcel se mantiene igual que antes) ...

async function borrarRegistroIndividual(id) {
    if (!confirm("¿Eliminar este registro permanentemente?")) return;
    try {
        await eliminarRegistro(id);
        mostrarNotificacion("Registro eliminado", "success");
        cargarHistorial();
    } catch (e) {
        mostrarNotificacion("Error al borrar", "error");
    }
}

async function abrirModalEditar(idFirebase) {
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
}

document.addEventListener("DOMContentLoaded", () => {
    cargarHistorial();

    // Eventos de Filtros y Excel (igual que antes)
    document.getElementById("filtro-fecha").addEventListener("input", ejecutarFiltros);
    document.getElementById("filtro-unidad").addEventListener("input", ejecutarFiltros);
    document.getElementById("btn-descargar-excel").onclick = exportarExcel;
    
    document.getElementById("btn-cerrar-modal").onclick = () => {
        document.getElementById('modalEditar').style.display = 'none';
    };

    document.getElementById("btn-guardar-modal").onclick = async () => {
        const id = document.getElementById('edit-id').value;
        const nuevosDatos = {
            fecha: document.getElementById('edit-fecha').value,
            horario: document.getElementById('edit-horario').value,
            unidad: document.getElementById('edit-unidad').value,
            vueltas: document.getElementById('edit-vueltas').value,
            extra: document.getElementById('edit-extra').value,
            obs: document.getElementById('edit-obs').value
        };

        try {
            await actualizarRegistro(id, nuevosDatos);
            document.getElementById('modalEditar').style.display = 'none';
            mostrarNotificacion("Actualizado correctamente", "success");
            cargarHistorial();
        } catch (e) {
            mostrarNotificacion("Error al actualizar", "error");
        }
    };
});