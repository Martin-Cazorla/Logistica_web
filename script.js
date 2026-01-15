// script.js - PANEL DE CONTROL LOGÍSTICO (E-COMMERCE)
import { unidadesData } from './config.js';

const tbody = document.getElementById("tabla-body");
const fechaActual = new Date().toLocaleDateString('es-AR');

// 1. Función para crear la fila
function agregarFilaVacia() {
    const fila = document.createElement("tr");
    
    fila.innerHTML = `
        <td>${fechaActual}</td>
        <td>
            <select class="input-horario">
                <option value="10:00hs">10:00hs</option>
                <option value="11:00hs">11:00hs</option>
                <option value="Electro">Electro</option>
                <option value="Agregado">Agregado</option>
                <option value="No se presenta">No se presenta</option>
            </select>
        </td>
        <td>
            <input type="text" class="input-id-unidad" placeholder="N°..." style="width: 60px; font-weight: bold;">
        </td>
        <td class="res-modelo" style="color: #666;">-</td>
        <td class="res-tamano" style="color: #666;">-</td>
        <td class="res-chofer" style="color: #333;">-</td>
        <td>
            <select class="input-vueltas">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="0">0</option>
            </select>
        </td>
        <td>
            <select class="input-extra">
                <option value="0">0</option>
                <option value="1">1</option>
            </select>
        </td>
        <td><input type="text" class="input-obs" placeholder="..."></td>
        <td>
            <button class="btn-limpiar" style="padding: 2px 5px; background-color: #6c757d;" onclick="this.closest('tr').remove(); actualizarContadores();">X</button>
        </td>
    `;

    const inputID = fila.querySelector('.input-id-unidad');
    const selectHorario = fila.querySelector('.input-horario');
    const selectExtra = fila.querySelector('.input-extra');
    
    // Escuchadores para actualización inmediata de contadores
    selectHorario.addEventListener('change', actualizarContadores);
    selectExtra.addEventListener('change', actualizarContadores);

    // Búsqueda automática en config.js
    inputID.addEventListener('input', (e) => {
        const idIngresado = e.target.value.trim();
        const unidadEncontrada = unidadesData.find(u => u.id === idIngresado);

        if (unidadEncontrada) {
            fila.querySelector('.res-modelo').innerText = unidadEncontrada.modelo;
            fila.querySelector('.res-tamano').innerText = unidadEncontrada.tamaño;
            fila.querySelector('.res-chofer').innerText = unidadEncontrada.chofer; // Ahora es innerText
            inputID.style.backgroundColor = "#d4edda"; 
        } else {
            fila.querySelector('.res-modelo').innerText = "-";
            fila.querySelector('.res-tamano').innerText = "-";
            fila.querySelector('.res-chofer').innerText = "-";
            inputID.style.backgroundColor = ""; 
        }
        actualizarContadores();
    });

    // Carga continua por tecla Enter
    inputID.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            if (inputID.value.trim() !== "") {
                agregarFilaVacia(); 
            }
        }
    });

    tbody.appendChild(fila);
    inputID.focus(); 
}

// 2. Iniciar con una fila limpia
agregarFilaVacia();
actualizarContadores();

// 3. Lógica de Indicadores (KPIs) - REFORZADA
function actualizarContadores() {
    const filas = document.querySelectorAll('#tabla-body tr');
    let unidadesContadas = 0;
    let totalExtras = 0;

    filas.forEach(fila => {
        const inputID = fila.querySelector('.input-id-unidad');
        const selectHorario = fila.querySelector('.input-horario');
        const selectExtra = fila.querySelector('.input-extra');

        if (inputID && selectHorario) {
            const idValue = inputID.value.trim();
            const horarioValue = selectHorario.value;

            // Contar unidad: debe tener ID y no ser "No se presenta"
            if (idValue !== "" && horarioValue !== "No se presenta") {
                unidadesContadas++;
            }
        }

        if (selectExtra) {
            totalExtras += parseInt(selectExtra.value) || 0;
        }
    });

    // Actualización del DOM
    const kpiUnidades = document.getElementById('contador-unidades');
    const kpiExtras = document.getElementById('contador-extras');

    if (kpiUnidades) kpiUnidades.innerText = unidadesContadas;
    if (kpiExtras) kpiExtras.innerText = totalExtras;
}

// Hacer la función accesible globalmente para el botón de borrar (X)
window.actualizarContadores = actualizarContadores;

// 4. Archivar datos en Firebase
document.getElementById('btn-archivar').onclick = async () => {
    const { collection, addDoc } = window.firestoreLib;
    const filas = tbody.querySelectorAll('tr');  
    const filasConDatos = Array.from(filas).filter(f => f.querySelector('.input-id-unidad').value !== "");

    if (filasConDatos.length === 0) return alert("No hay unidades para archivar.");
    if (!confirm(`¿Archivar las ${filasConDatos.length} unidades registradas?`)) return;

    try {
        for (let fila of filasConDatos) {
            const data = {
                fecha: fechaActual,
                horario: fila.querySelector('.input-horario').value,
                unidad: fila.querySelector('.input-id-unidad').value,
                chofer: fila.querySelector('.res-chofer').innerText, // Extraemos de la celda de texto
                vueltas: fila.querySelector('.input-vueltas').value,
                extra: fila.querySelector('.input-extra').value,
                obs: fila.querySelector('.input-obs').value
            };
            await addDoc(collection(window.db, "historialLogistica"), data);
        }
        alert("¡Datos archivados correctamente!");
        tbody.innerHTML = ""; 
        agregarFilaVacia(); 
        actualizarContadores();
    } catch (error) {
        console.error("Error al archivar:", error);
        alert("Error al guardar en la base de datos.");
    }
};