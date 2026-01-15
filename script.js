// script.js - CARGA CONTINUA POR TECLA ENTER
import { unidadesData } from './config.js';

const tbody = document.getElementById("tabla-body");
const fechaActual = new Date().toLocaleDateString('es-AR');

// 1. Función para crear la fila con detección de Enter
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
            </select>
        </td>
        <td>
            <input type="text" class="input-id-unidad" placeholder="N°..." style="width: 60px; font-weight: bold;">
        </td>
        <td class="res-modelo" style="color: #666;">-</td>
        <td class="res-tamano" style="color: #666;">-</td>
        <td class="res-chofer">
            <input type="text" class="input-chofer" placeholder="Chofer...">
        </td>
        <td>
            <select class="input-vueltas">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="0">0</option>
            </select>
        </td>
        <td>
            <select class="input-extra" onchange="actualizarContadores()">
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
    
    // ESCUCHA DE DATOS (Búsqueda automática)
    inputID.addEventListener('input', (e) => {
        const idIngresado = e.target.value.trim();
        const unidadEncontrada = unidadesData.find(u => u.id === idIngresado);

        if (unidadEncontrada) {
            fila.querySelector('.res-modelo').innerText = unidadEncontrada.modelo;
            fila.querySelector('.res-tamano').innerText = unidadEncontrada.tamaño;
            fila.querySelector('.input-chofer').value = unidadEncontrada.chofer;
            inputID.style.backgroundColor = "#d4edda"; 
        } else {
            fila.querySelector('.res-modelo').innerText = "-";
            fila.querySelector('.res-tamano').innerText = "-";
            fila.querySelector('.input-chofer').value = "";
            inputID.style.backgroundColor = ""; 
        }
        actualizarContadores();
    });

    // --- EL TRUCO DEL ENTER ---
    inputID.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita comportamientos raros
            if (inputID.value.trim() !== "") {
                agregarFilaVacia(); // Crea la siguiente fila automáticamente
            }
        }
    });

    tbody.appendChild(fila);
    inputID.focus(); 
}

// 2. Iniciar con una fila apenas abre la app
agregarFilaVacia();
actualizarContadores();

// 3. KPI y Archivar 
window.actualizarContadores = () => {
    const filas = document.querySelectorAll('#tabla-body tr');
    document.getElementById('contador-unidades').innerText = filas.length;

    let totalExtras = 0;
    filas.forEach(fila => {
        totalExtras += parseInt(fila.querySelector('.input-extra').value) || 0;
    });
    document.getElementById('contador-extras').innerText = totalExtras;
};

document.getElementById('btn-archivar').onclick = async () => {
    const { collection, addDoc } = window.firestoreLib;
    const filas = tbody.querySelectorAll('tr');
    
    // Filtrar filas vacías antes de guardar
    const filasConDatos = Array.from(filas).filter(f => f.querySelector('.input-id-unidad').value !== "");

    if (filasConDatos.length === 0) return alert("No hay unidades para archivar.");
    if (!confirm(`¿Archivar las ${filasConDatos.length} unidades registradas?`)) return;

    try {
        for (let fila of filasConDatos) {
            const data = {
                fecha: fechaActual,
                horario: fila.querySelector('.input-horario').value,
                unidad: fila.querySelector('.input-id-unidad').value,
                chofer: fila.querySelector('.input-chofer').value,
                vueltas: fila.querySelector('.input-vueltas').value,
                extra: fila.querySelector('.input-extra').value,
                obs: fila.querySelector('.input-obs').value
            };
            await addDoc(collection(window.db, "historialLogistica"), data);
        }
        alert("¡Todo guardado correctamente!");
        tbody.innerHTML = ""; 
        agregarFilaVacia(); // Reiniciar con una fila limpia
        actualizarContadores();
    } catch (error) {
        console.error("Error:", error);
        alert("Error al guardar.");
    }
};