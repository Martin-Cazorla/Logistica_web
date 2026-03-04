/**
 * login-handler.js - Gestión de autenticación
 */
import { auth } from '../firebase/firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    setPersistence, 
    browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const btnEntrar = document.getElementById('btn-entrar');
const errorMsg = document.getElementById('login-error');

btnEntrar.onclick = async () => {
    const email = document.getElementById('login-email').value.trim(); 
    const pass = document.getElementById('login-pass').value;

    if (!email || !pass) {
        mostrarError("Por favor, completa todos los campos.");
        return;
    }

    try {  
        // Aseguramos que la sesión se mantenga abierta al cerrar el navegador
        await setPersistence(auth, browserLocalPersistence);
    
        await signInWithEmailAndPassword(auth, email, pass);
        
        // CORRECCIÓN DE RUTA: 
        // Como estamos en /pages/login.html, para ir a index.html (raíz) usamos ../
        window.location.href = "../index.html"; 

    } catch (error) {
        console.error("Error en login:", error.code);
        manejarErroresFirebase(error.code);
    }
};

function mostrarError(mensaje) {
    errorMsg.innerText = mensaje; 
    errorMsg.style.display = "block";
}

function manejarErroresFirebase(code) {
    switch (code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            mostrarError("Email o contraseña incorrectos.");
            break;
        case 'auth/invalid-email':
            mostrarError("El formato del email no es válido.");
            break;
        default:
            mostrarError("Ocurrió un error inesperado. Intenta de nuevo.");
    }
}