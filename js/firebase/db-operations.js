/**
 * db-operations.js - Capa de Abstracción de Datos (DAO)
 */
import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, // Necesario para filtrar por fecha
    orderBy, 
    doc, 
    updateDoc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const COLECCION_HISTORIAL = "historialLogistica";

/**
 * Guarda un registro inicial de unidad al dar 'Enter'
 */
export async function guardarRegistro(datos) {
    try {
        const docRef = await addDoc(collection(db, COLECCION_HISTORIAL), datos);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error al crear registro inicial:", error);
        throw error;
    }
}

/**
 * OBTIENE LOS REGISTROS DE UNA FECHA ESPECÍFICA
 * Este es el corazón de la sincronización entre turnos.
 * @param {string} fechaSeleccionada - Formato YYYY-MM-DD del input date
 */
export async function obtenerRegistrosPorFecha(fechaSeleccionada) {
    try {
        // Creamos una consulta filtrada por el campo 'fecha'
        const q = query(
            collection(db, COLECCION_HISTORIAL), 
            where("fecha", "==", fechaSeleccionada)
        );
        
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            idFirebase: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error al filtrar por fecha:", error);
        return [];
    }
}

/**
 * ACTUALIZA LAS VUELTAS DE UNA UNIDAD
 * Se usará desde el modal para guardar cada vuelta individualmente.
 */
export async function actualizarRegistro(id, nuevosDatos) {
    try {
        const docRef = doc(db, COLECCION_HISTORIAL, id);
        await updateDoc(docRef, nuevosDatos);
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar vueltas:", error);
        throw error;
    }
}

/**
 * Obtiene todos los registros (Para el historial general/anual)
 */
export async function obtenerTodosLosRegistros() {
    try {
        const q = query(collection(db, COLECCION_HISTORIAL), orderBy("fecha", "desc"));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            idFirebase: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error al obtener historial completo:", error);
        return [];
    }
}

/**
 * Elimina un registro (Corrección de errores)
 */
export async function eliminarRegistro(id) {
    try {
        await deleteDoc(doc(db, COLECCION_HISTORIAL, id));
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar:", error);
        throw error;
    }
}