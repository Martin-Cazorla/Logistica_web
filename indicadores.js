// indicadores.js - Lógica del Dashboard y Estadísticas
let datosGlobales = [];
let chartInstance = null;

// --- CARGA DE DATOS ---

window.obtenerDatos = async function() {
    if (!window.firestoreLib || !window.db) return;

    const { collection, getDocs, query } = window.firestoreLib;
    
    try {
        const q = query(collection(window.db, "historialLogistica"));
        const querySnapshot = await getDocs(q);
        datosGlobales = [];
        querySnapshot.forEach(doc => {
            datosGlobales.push({ idFirebase: doc.id, ...doc.data() });
        });
        
        actualizarDashboard(datosGlobales);
        console.log("Indicadores actualizados desde Firebase.");
    } catch (e) {
        console.error("Error al obtener datos:", e);
    }
}

// --- LÓGICA DE NEGOCIO (KPIs) ---
function actualizarDashboard(datos) {
    const kpiUnidades = document.getElementById('kpi-unidades');
    if (!kpiUnidades) return;

    const totalUnidades = datos.length;
    const totalVueltas = datos.reduce((sum, reg) => sum + Number(reg.vueltas || 0), 0);
    const totalExtras = datos.filter(reg => Number(reg.extra) > 0).length;

    // Actualizar Cards
    document.getElementById('kpi-unidades').innerText = totalUnidades;
    document.getElementById('kpi-productividad').innerText = totalUnidades > 0 ? (totalVueltas / totalUnidades).toFixed(2) : "0.00";
    document.getElementById('kpi-extras').innerText = totalUnidades > 0 ? ((totalExtras / totalUnidades) * 100).toFixed(0) + "%" : "0%";
    
    // Datos para el gráfico por fecha
    const statsPorDia = {};
    datos.forEach(reg => {
        const f = reg.fecha;
        if (!statsPorDia[f]) statsPorDia[f] = { vueltas: 0, unidades: 0 };
        statsPorDia[f].vueltas += Number(reg.vueltas || 0);
        statsPorDia[f].unidades += 1;
    });

    const fechas = Object.keys(statsPorDia).sort((a,b) => {
        const [dA, mA, yA] = a.split('/');
        const [dB, mB, yB] = b.split('/');
        return new Date(yA, mA-1, dA) - new Date(yB, mB-1, dB);
    });

    const dataVueltas = fechas.map(f => statsPorDia[f].vueltas);
    const dataUnidades = fechas.map(f => statsPorDia[f].unidades);

    renderizarGrafico(fechas, dataVueltas, dataUnidades);
}

// --- RENDERIZADO DE GRÁFICO ---
function renderizarGrafico(fechas, vueltas, unidades) {
    const ctx = document.getElementById('graficoVueltas').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: fechas,
            datasets: [
                { 
                    label: 'Vueltas Totales', 
                    data: vueltas, 
                    borderColor: '#2d7a44', 
                    backgroundColor: 'rgba(45, 122, 68, 0.1)', 
                    yAxisID: 'y', 
                    tension: 0.3, 
                    fill: true 
                },
                { 
                    label: 'Unidades Presentes', 
                    data: unidades, 
                    borderColor: '#007bff', 
                    backgroundColor: 'rgba(0, 123, 255, 0.1)', 
                    yAxisID: 'y1', 
                    tension: 0.3 
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { type: 'linear', position: 'left', title: { display: true, text: 'Vueltas' } },
                y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Unidades' } }
            }
        }
    });
}

// --- EVENTOS DE FILTRO ---
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('btn-aplicar-filtro').onclick = () => {
        const f = document.getElementById('filtro-fecha-dashboard').value;
        if (!f) return alert("Selecciona una fecha");
        
        const [y, m, d] = f.split("-");
        const fechaConCero = `${d}/${m}/${y}`; 
        const fechaSinCero = `${parseInt(d)}/${parseInt(m)}/${y}`;
        
        const filtrados = datosGlobales.filter(reg => {
            const valorFecha = String(reg.fecha || "").trim();
            return valorFecha === fechaConCero || valorFecha === fechaSinCero;
        });
        
        actualizarDashboard(filtrados);
    };

    document.getElementById('btn-quitar-filtro').onclick = () => {
        document.getElementById('filtro-fecha-dashboard').value = "";
        actualizarDashboard(datosGlobales);
    };
});