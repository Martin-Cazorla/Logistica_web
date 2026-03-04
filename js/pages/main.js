/**
 * main.js - SISTEMA DE GESTIÓN DE LOGÍSTICA (TMS)
 */
import { auth } from '../firebase/firebase-config.js';
import { 
    guardarRegistro, 
    obtenerRegistrosPorFecha, 
    actualizarRegistro,
    eliminarRegistro // AGREGADO: Importación faltante que causaba el error
} from '../firebase/db-operations.js';
import { obtenerUnidades } from '../data/unidades.js';
import { mostrarNotificacion } from '../modules/utils.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- 1. CONFIGURACIÓN E INICIALIZACIÓN ---
const tbody = document.getElementById("tabla-body");
const fechaInput = document.getElementById('fecha-operacion');
const modal = document.getElementById('modalGestionVueltas');
const vueltasContainer = document.getElementById('vueltas-container');
const templateVuelta = document.getElementById('template-vuelta');

let registroActualId = null;

if (fechaInput) {
    fechaInput.valueAsDate = new Date();
    fechaInput.onchange = () => cargarJornada();
}

onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "pages/login.html";
    else cargarJornada(); 
});

document.getElementById('btn-logout').onclick = async () => {
    await signOut(auth);
    window.location.href = "pages/login.html";
};

// --- 2. LÓGICA DE CARGA ---

async function cargarJornada() {
    if (!fechaInput || !fechaInput.value) return;
    const registros = await obtenerRegistrosPorFecha(fechaInput.value);
    renderizarTablaEnVivo(registros);
}

document.addEventListener('keydown', async (e) => {
    if (e.target.classList.contains('input-id-unidad') && e.key === 'Enter') {
        const idValue = e.target.value.trim();
        if (!idValue) return;

        const unidadesData = await obtenerUnidades();
        const unidad = unidadesData.find(u => u.id === idValue);

        if (unidad) {
            const nuevoDoc = {
                fecha: fechaInput.value,
                unidad: idValue,
                chofer: unidad.chofer,
                modelo: unidad.modelo,
                tamano: unidad.tamaño,
                horarioIngreso: "10:00hs", // Valor inicial por defecto
                vueltasTotales: 0,
                detalleVueltas: [],
                finalizado: false
            };

            await guardarRegistro(nuevoDoc);
            mostrarNotificacion(`Unidad ${idValue} registrada`, "success");
            cargarJornada(); 
        } else {
            mostrarNotificacion("ID de unidad no encontrado", "error");
        }
    }
});

// --- 3. RENDERIZADO (MODIFICADO PUNTO 1) ---

function renderizarTablaEnVivo(lista) {
    if (!tbody) return;

    let html = lista.map(reg => {
        const ultimaVuelta = reg.detalleVueltas.length > 0 
            ? reg.detalleVueltas[reg.detalleVueltas.length - 1] 
            : null;

        const estadoClase = ultimaVuelta ? ultimaVuelta.estado.toLowerCase() : 'pendiente';
        const estadoTexto = ultimaVuelta ? ultimaVuelta.estado : 'En Espera';

        return `
            <tr>
                <td><strong>${reg.unidad}</strong></td>
                <td>${reg.modelo} <br><small>${reg.tamano}</small></td>
                <td>${reg.chofer}</td>
                <td style="text-align:center; font-weight:bold;">${reg.vueltasTotales} / 4</td>
                <td>
                    <select onchange="window.cambiarHorarioIngreso('${reg.idFirebase}', this.value)" style="padding: 2px; font-size: 0.85rem;">
                        <option value="10:00hs" ${reg.horarioIngreso === '10:00hs' ? 'selected' : ''}>10:00hs</option>
                        <option value="11:00hs" ${reg.horarioIngreso === '11:00hs' ? 'selected' : ''}>11:00hs</option>
                        <option value="Electro" ${reg.horarioIngreso === 'Electro' ? 'selected' : ''}>Electro</option>
                        <option value="Ausente" ${reg.horarioIngreso === 'Ausente' ? 'selected' : ''}>Ausente</option>
                    </select>
                </td>
                <td><span class="badge-${estadoClase}">${estadoTexto}</span></td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn-guardar" onclick="window.abrirGestionVueltas('${reg.idFirebase}')">GESTIONAR</button>
                        <button class="btn-limpiar" style="padding: 5px 10px;" onclick="window.eliminarUnidadJornada('${reg.idFirebase}', '${reg.unidad}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    html += `
        <tr class="fila-nueva">
            <td><input type="text" class="input-id-unidad" placeholder="ID + Enter"></td>
            <td colspan="6" style="color: #666; font-style: italic;">Ingrese nueva unidad para iniciar</td>
        </tr>
    `;

    tbody.innerHTML = html;
    actualizarContadores(lista);
}

// Función global para actualizar el horario de ingreso directamente
window.cambiarHorarioIngreso = async (id, nuevoValor) => {
    try {
        await actualizarRegistro(id, { horarioIngreso: nuevoValor });
        mostrarNotificacion("Horario actualizado", "info");
    } catch (e) {
        mostrarNotificacion("Error al actualizar horario", "error");
    }
};

function actualizarContadores(lista) {
    let enRuta = 0;
    let disponibles = 0;
    let totalVueltasDia = 0;
    
    // Contadores para bandas horarias
    const bandas = { "10-14": 0, "13-16": 0, "16-19": 0, "19-21": 0 };

    lista.forEach(reg => {
        totalVueltasDia += (reg.vueltasTotales || 0);

        // Procesamos cada vuelta del registro para las estadísticas
        reg.detalleVueltas.forEach(v => {
            if (v.estado === "Salida" && bandas[v.banda] !== undefined) {
                bandas[v.banda]++;
            }
        });

        const ultimaVuelta = reg.detalleVueltas.length > 0 
            ? reg.detalleVueltas[reg.detalleVueltas.length - 1] 
            : null;

        if (ultimaVuelta && ultimaVuelta.estado === "Salida") {
            enRuta++;
        } else if (reg.vueltasTotales < 3 && reg.horarioIngreso !== "Ausente") {
            disponibles++;
        }
    });

    // Actualizamos KPIs principales
    document.getElementById('contador-en-ruta').innerText = enRuta;
    document.getElementById('contador-disponibles').innerText = disponibles;
    document.getElementById('total-vueltas-dia').innerText = totalVueltasDia;

    // Actualizamos KPIs de bandas horarias
    document.getElementById('banda-10-14').innerText = bandas["10-14"];
    document.getElementById('banda-13-16').innerText = bandas["13-16"];
    document.getElementById('banda-16-19').innerText = bandas["16-19"];
    document.getElementById('banda-19-21').innerText = bandas["19-21"];
}

// --- 4. MODAL ---

/**
 * ABRE EL MODAL Y CARGA LOS DATOS DE LAS 4 VUELTAS
 * Incluye validación visual para la 4ta vuelta (Extra)
 */
window.abrirGestionVueltas = async function(idFirebase) {
    // 1. Asignamos el ID global para saber qué registro estamos editando
    registroActualId = idFirebase; 
    
    // 2. Obtenemos los datos frescos de la base de datos para la fecha seleccionada
    const registros = await obtenerRegistrosPorFecha(fechaInput.value);
    const registro = registros.find(r => r.idFirebase === idFirebase);

    // 3. Validación de seguridad por si el registro fue eliminado mientras se abría
    if (!registro) return mostrarNotificacion("Error: Registro no encontrado", "error");

    // 4. Seteamos el encabezado del modal con el ID de la unidad
    document.getElementById('modal-id-unidad').innerText = registro.unidad;
    vueltasContainer.innerHTML = ""; // Limpiamos el contenedor para evitar duplicados

    // 5. Construcción dinámica de los 4 bloques de vueltas
    for (let i = 1; i <= 4; i++) {
        // Clonamos el contenido del template HTML
        const clon = templateVuelta.content.cloneNode(true);
        const dataExistente = registro.detalleVueltas.find(v => v.nro === i);
        
        // Referenciamos el contenedor del bloque para aplicar estilos
        const bloqueVuelta = clon.querySelector('.vuelta-bloque');
        clon.querySelector('.nro-v').innerText = i;

        // LÓGICA DE NEGOCIO: Estilo diferencial para la 4ª vuelta (Extra)
        if (i === 4) {
            bloqueVuelta.style.border = "2px dashed #E30613"; // Rojo para advertencia de extra
            clon.querySelector('h4').innerText = "4ª VUELTA (SOLO EXTRA)";
        }

        // 6. Si ya existen datos guardados en Firebase para esta vuelta, los precargamos
        if (dataExistente) {
            clon.querySelector('.m-banda').value = dataExistente.banda;
            clon.querySelector('.m-zona').value = dataExistente.zona;
            clon.querySelector('.m-estado').value = dataExistente.estado;
        }

        // 7. Insertamos el bloque en el contenedor del modal
        vueltasContainer.appendChild(clon);
    }

    // 8. Mostramos el modal al usuario
    modal.style.display = 'block';
};

document.getElementById('btn-actualizar-vueltas').onclick = async () => {
    const bloques = vueltasContainer.querySelectorAll('.vuelta-bloque');
    const nuevasVueltas = [];
    let vueltasContadas = 0;

    bloques.forEach((bloque, index) => {
        const banda = bloque.querySelector('.m-banda').value;
        const zona = bloque.querySelector('.m-zona').value;
        const estado = bloque.querySelector('.m-estado').value;
        const obs = bloque.querySelector('.m-obs').value.trim();

        // Solo guardamos si se seleccionó una banda y un estado
        if (banda !== "---" && estado !== "---") {
            if (estado === "Salida") {
                vueltasContadas++;
            }

            nuevasVueltas.push({
                nro: index + 1,
                banda: banda,
                zona: zona,
                estado: estado,
                observaciones: obs // Se guarda siempre (sea Salida o Libre)
            });
        }
    });

    try {
        await actualizarRegistro(registroActualId, {
            detalleVueltas: nuevasVueltas,
            vueltasTotales: vueltasContadas
        });

        mostrarNotificacion("Jornada actualizada correctamente", "success");
        modal.style.display = 'none';
        cargarJornada(); 
    } catch (error) {
        console.error("Error al guardar:", error);
        mostrarNotificacion("Error crítico al guardar en Firebase", "error");
    }
};

const btnCerrar = document.getElementById('btn-cerrar-modal');
if (btnCerrar) btnCerrar.onclick = () => modal.style.display = 'none';

/**
 * ELIMINACIÓN CORREGIDA (Importante: debe existir eliminarRegistro en db-operations.js)
 */
window.eliminarUnidadJornada = async function(idFirebase, nroUnidad) {
    if (!confirm(`¿Estás seguro de eliminar la unidad ${nroUnidad}?`)) return;

    try {
        await eliminarRegistro(idFirebase);
        mostrarNotificacion(`Unidad ${nroUnidad} eliminada`, "success");
        cargarJornada(); 
    } catch (error) {
        console.error("Error al eliminar:", error);
        mostrarNotificacion("Error al intentar eliminar", "error");
    }
};

window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
};