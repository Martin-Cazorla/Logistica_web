/**
 * utils.js - Funciones de utilidad global
 * Centralizamos lógica repetitiva para mantener el código DRY (Don't Repeat Yourself).
 */

/**
 * Valida que un objeto de datos no tenga campos vacíos importantes
 * @param {Object} data - El objeto con los datos del formulario (unidad, chofer, etc.)
 * @returns {Boolean}
 */
export function validarDatosLogistica(data) {
    const camposObligatorios = ['unidad', 'horario', 'fecha'];
    
    for (const campo of camposObligatorios) {
        if (!data[campo] || data[campo].trim() === "") {
            console.error(`Error de validación: El campo ${campo} es obligatorio.`);
            return false;
        }
    }
    return true;
}

/**
 * Formatea una fecha de objeto Date a string legible (DD/MM/YYYY)
 * @param {Date} date 
 * @returns {String}
 */
export function formatearFecha(date = new Date()) {
    return date.toLocaleDateString('es-AR');
}

/**
 * Genera una alerta visual rápida (Snackbar/Toast)
 * @param {String} mensaje 
 * @param {String} tipo - 'success', 'error', 'info'
 */
export function mostrarNotificacion(mensaje, tipo = 'info') {
    // Aquí podrías usar una librería como SweetAlert2 o crear un div temporal
    alert(`[${tipo.toUpperCase()}]: ${mensaje}`);
}

/**
 * Limpia los espacios en blanco de todos los valores de un objeto
 * @param {Object} obj 
 * @returns {Object}
 */
export function limpiarObjeto(obj) {
    const nuevoObj = {};
    Object.keys(obj).forEach(key => {
        nuevoObj[key] = typeof obj[key] === 'string' ? obj[key].trim() : obj[key];
    });
    return nuevoObj;
}