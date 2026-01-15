// --- BASE DE DATOS DE CHOFERES ---
const baseDeDatosChoferes = {
    "99": { modelo: "Renault Master 2,5 DCL", tamaño: "Grande", chofer: "Carlos Vitale" },
    "591": { modelo: "Citroen Jumper", tamaño: "Grande", chofer: "Emanuel Suarez" },
    "130": { modelo: "Lifan Foison Box", tamaño: "Grande", chofer: "Maximiliano Ramos" },
    "635": { modelo: "Peugeot Boxer 330M 2,3 HDI", tamaño: "Grande", chofer: "Oscar Calcada" },
    "28": { modelo: "Peugeot Boxer", tamaño: "Grande", chofer: "Ignacio Monteagudo" },
    "218": { modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "Gonzalo Morales" },
    "126": { modelo: "Peugeot Boxer 330M 2,3 HDI Confort", tamaño: "Grande", chofer: "Jonathan Gimenez" },
    "123": { modelo: "Peugeot Boxer 330M 2,3 HDI Confort", tamaño: "Grande", chofer: "Fabian Bustos" },
    "170": { modelo: "Renault Nueva Master L1H1 AA", tamaño: "Grande", chofer: "Dante" },
    "976": { modelo: "Renault Master", tamaño: "Grande", chofer: "Daniel Vietri" },
    "21": { modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "Federico" },
    "17": { modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "Cristian Miranda" },
    "1017": { modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "Nahuel Alarcon" },
    "1018": { modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "German Rivero" },
    "173": { modelo: "Kangoo", tamaño: "Chica", chofer: "Ramiro Torrico" },
    "927": { modelo: "Renault Master", tamaño: "Grande", chofer: "Daniel Martinez" },
    "15": { modelo: "Fiat Fiorino Furgon 1,4", tamaño: "Chica", chofer: "Gonzalo Villagra" },
    "101": { modelo: "Citroen Berlingo Furgon 1,9D Full", tamaño: "Chica", chofer: "Carlos Oliva" },
    "640": { modelo: "Renault Kangoo II Express", tamaño: "Chica", chofer: "Sergio Soberon" },
    "240": { modelo: "Fiat Nuevo Fiorino", tamaño: "Chica", chofer: "Nicolas Cordoba" },
    "909": { modelo: "Renault Kangoo PH3", tamaño: "Chica", chofer: "Ricardo Heppner" },
    "293": { modelo: "Renault Master 2,5 DCL", tamaño: "Grande", chofer: "Pablo Diaz Velez" },
    "302": { modelo: "Kangoo", tamaño: "Chica", chofer: "Guillermo" },
    "19": { modelo: "Sprinter", tamaño: "Grande", chofer: "Alex Molinari" },
    "401": { modelo: "Fiat Fiorino Fire", tamaño: "Chica", chofer: "Cristian Acosta" },
    "985": { modelo: "Flete", tamaño: "Chica", chofer: "Flete" },
    "984": { modelo: "Flete", tamaño: "Chica", chofer: "Flete" },
    "983": { modelo: "Flete", tamaño: "Chica", chofer: "Flete" },
    "921": { modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "Luciano" }
};

// Ayudante común
function obtenerFechaHoy() {
    const hoy = new Date();
    return hoy.toLocaleDateString('es-AR');
}