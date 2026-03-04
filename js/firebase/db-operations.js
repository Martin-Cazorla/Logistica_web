/**
 * db-operations.js - Capa de Abstracción de Datos (DAO)
 */
import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    doc, 
    updateDoc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const COLECCION_HISTORIAL = "historialLogistica";

/**
 * Guarda un registro inicial de unidad
 */
export async function guardarRegistro(datos) {
    try {
        // Añadimos por defecto el campo archivado en falso para que aparezca en el panel
        const datosConEstado = { ...datos, archivado: false };
        const docRef = await addDoc(collection(db, COLECCION_HISTORIAL), datosConEstado);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error al crear registro inicial:", error);
        throw error;
    }
}

/**
 * OBTIENE LOS REGISTROS DE UNA FECHA ESPECÍFICA QUE NO ESTÉN ARCHIVADOS
 */
export async function obtenerRegistrosPorFecha(fechaSeleccionada) {
    try {
        // Modificamos la consulta para que solo traiga lo que NO está archivado
        const q = query(
            collection(db, COLECCION_HISTORIAL), 
            where("fecha", "==", fechaSeleccionada),
            where("archivado", "==", false)
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
 * Función necesaria para el Cierre de Jornada Masivo
 */
export async function obtenerRegistrosActivos() {
    try {
        const q = query(
            collection(db, COLECCION_HISTORIAL), 
            where("archivado", "==", false)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            idFirebase: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error al obtener activos:", error);
        return [];
    }
}

export async function actualizarRegistro(id, nuevosDatos) {
    try {
        const docRef = doc(db, COLECCION_HISTORIAL, id);
        await updateDoc(docRef, nuevosDatos);
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar:", error);
        throw error;
    }
}

export async function obtenerTodosLosRegistros() {
    try {
        const q = query(collection(db, COLECCION_HISTORIAL), orderBy("fecha", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            idFirebase: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error al obtener historial:", error);
        return [];
    }
}

export async function eliminarRegistro(id) {
    try {
        await deleteDoc(doc(db, COLECCION_HISTORIAL, id));
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar:", error);
        throw error;
    }
}