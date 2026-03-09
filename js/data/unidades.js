/**
 * unidades.js - Proveedor de datos de flota
 */

let cacheUnidades = null; // Guardamos los datos para no hacer fetch constantes

export async function obtenerUnidades() {
    if (cacheUnidades) return cacheUnidades;

    try {
        // Importante: la ruta debe ser relativa a la raíz o al archivo
        const response = await fetch('./js/data/unidades.json'); 
        if (!response.ok) throw new Error("No se pudo cargar el JSON de unidades.");
        cacheUnidades = await response.json();
        return cacheUnidades;
    } catch (error) {
        console.error("Error cargando unidades:", error);
        return [];
    }
}

export function obtenerFechaHoy() {
    return new Date().toLocaleDateString('es-AR');
}
