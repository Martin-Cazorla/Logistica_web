/**
 * indicadores-handler.js - Versión Unificada y Corregida
 */
import { obtenerRegistrosPorFecha, obtenerTodosLosRegistros } from '../firebase/db-operations.js';

let chartBandas = null;
let chartFlota = null;

const colores = { 
    azul: '#003366', 
    rojo: '#E30613', 
    gris: '#6c757d',
    rojoTransparente: 'rgba(227, 6, 19, 0.1)'
};

// --- 1. FUNCIONES DE PROCESAMIENTO ---

async function actualizarGraficosDia(fecha) {
    try {
        const registros = await obtenerRegistrosPorFecha(fecha);
        procesarYRenderizar(registros, 'dia');
    } catch (error) {
        console.error("Error cargando indicadores del día:", error);
    }
}

async function prepararDatosMensuales() {
    try {
        const mes = document.getElementById('select-mes').value;
        const anio = document.getElementById('select-anio').value;
        const prefijo = `${anio}-${mes}`;

        const todos = await obtenerTodosLosRegistros();
        const filtrados = todos.filter(reg => reg.fecha.startsWith(prefijo));
        
        procesarYRenderizar(filtrados, 'mes');
    } catch (error) {
        console.error("Error preparando datos mensuales:", error);
    }
}

function procesarYRenderizar(registros, modo) {
    let totales = registros.length;
    let extras = 0;
    const dataBandas = { "10-14": 0, "13-16": 0, "16-19": 0, "19-21": 0 };
    let enRuta = 0;
    let enEspera = 0;
    const evolucionDiaria = {}; // Para el modo mes

    registros.forEach(reg => {
        // Conteo de Extras (4ta vuelta)
        if (reg.detalleVueltas.some(v => v.nro === 4 && v.estado === "Salida")) extras++;
        
        // Conteo por Bandas
        reg.detalleVueltas.forEach(v => {
            if (v.estado === "Salida" && dataBandas[v.banda] !== undefined) {
                dataBandas[v.banda]++;
            }
        });

        // Estado de flota / Evolución
        const ultimaV = reg.detalleVueltas[reg.detalleVueltas.length - 1];
        if (ultimaV?.estado === "Salida") enRuta++;
        else enEspera++;

        if (modo === 'mes') {
            evolucionDiaria[reg.fecha] = (evolucionDiaria[reg.fecha] || 0) + 1;
        }
    });

    // Actualizar KPIs en pantalla
    document.getElementById('total-unidades-kpi').innerText = totales;
    document.getElementById('total-extras-kpi').innerText = extras;

    // Renderizar Gráfico de Barras (Bandas)
    renderizarChartBandas(Object.values(dataBandas));
    
    // Renderizar Gráfico Secundario (Doughnut o Line)
    if (modo === 'dia') {
        renderizarChartFlota(enRuta, enEspera);
    } else {
        renderizarEvolucionMensual(evolucionDiaria);
    }
}

// --- 2. FUNCIONES DE CHART.JS ---

function renderizarChartBandas(valores) {
    const ctx = document.getElementById('chartBandas').getContext('2d');
    if (chartBandas) chartBandas.destroy();

    chartBandas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['10-14hs', '13-16hs', '16-19hs', '19-21hs'],
            datasets: [{
                label: 'Unidades Salientes',
                data: valores,
                backgroundColor: colores.azul,
                borderRadius: 5
            }]
        },
        options: { 
            responsive: true, 
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } 
        }
    });
}

function renderizarChartFlota(enRuta, enEspera) {
    const ctx = document.getElementById('chartFlota').getContext('2d');
    if (chartFlota) chartFlota.destroy();

    chartFlota = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['En Ruta', 'En Espera'],
            datasets: [{
                data: [enRuta, enEspera],
                backgroundColor: [colores.rojo, colores.gris]
            }]
        },
        options: { 
            responsive: true,
            plugins: { title: { display: true, text: 'ESTADO ACTUAL DE FLOTA' } }
        }
    });
}

function renderizarEvolucionMensual(data) {
    const ctx = document.getElementById('chartFlota').getContext('2d');
    if (chartFlota) chartFlota.destroy();

    const etiquetas = Object.keys(data).sort();
    const valores = etiquetas.map(f => data[f]);

    chartFlota = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetas.map(f => f.split('-')[2]),
            datasets: [{
                label: 'Unidades por Día',
                data: valores,
                borderColor: colores.rojo,
                backgroundColor: colores.rojoTransparente,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: 'PRODUCTIVIDAD DIARIA (MES)' } }
        }
    });
}

// --- 3. INICIALIZACIÓN ---

document.addEventListener('DOMContentLoaded', () => {
    const fechaInput = document.getElementById('fecha-indicador');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const controlesPeriodo = document.getElementById('controles-periodo');
    const selectMes = document.getElementById('select-mes');
    const selectAnio = document.getElementById('select-anio');

    if (fechaInput) {
        fechaInput.valueAsDate = new Date();
        actualizarGraficosDia(fechaInput.value);
        fechaInput.onchange = () => actualizarGraficosDia(fechaInput.value);
    }

    if (selectMes) selectMes.onchange = prepararDatosMensuales;
    if (selectAnio) selectAnio.onchange = prepararDatosMensuales;

    tabBtns.forEach(btn => {
        btn.onclick = (e) => {
            tabBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            if (e.target.dataset.tab === 'dia') {
                controlesPeriodo.style.display = 'none';
                fechaInput.style.display = 'block';
                actualizarGraficosDia(fechaInput.value);
            } else {
                controlesPeriodo.style.display = 'flex';
                fechaInput.style.display = 'none';
                prepararDatosMensuales();
            }
        };
    });
});