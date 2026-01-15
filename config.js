// config.js
export const unidadesData = [
    { id: "99", modelo: "Renault Master 2,5 DCL", tamaño: "Grande", chofer: "Carlos Vitale" },
    { id: "591", modelo: "Citroen Jumper", tamaño: "Grande", chofer: "Emanuel Suarez" },
    { id: "130", modelo: "Lifan Foison Box", tamaño: "Grande", chofer: "Maximiliano Ramos" },
    { id: "635", modelo: "Peugeot Boxer 330M 2,3 HDI", tamaño: "Grande", chofer: "Oscar Calcada" },
    { id: "28", modelo: "Peugeot Boxer", tamaño: "Grande", chofer: "Ignacio Monteagudo" },
    { id: "218", modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "Gonzalo Morales" },
    { id: "126", modelo: "Peugeot Boxer 330M 2,3 HDI Confort", tamaño: "Grande", chofer: "Jonathan Gimenez" },
    { id: "123", modelo: "Peugeot Boxer 330M 2,3 HDI Confort", tamaño: "Grande", chofer: "Fabian Bustos" },
    { id: "170", modelo: "Renault Nueva Master L1H1 AA", tamaño: "Grande", chofer: "Dante" },
    { id: "976", modelo: "Renault Master", tamaño: "Grande", chofer: "Daniel Vietri" },
    { id: "21", modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "Federico" },
    { id: "17", modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "Cristian Miranda" },
    { id: "1017", modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "Nahuel Alarcon" },
    { id: "1018", modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "German Rivero" },
    { id: "173", modelo: "Kangoo", tamaño: "Chica", chofer: "Ramiro Torrico" },
    { id: "927", modelo: "Renault Master", tamaño: "Grande", chofer: "Daniel Martinez" },
    { id: "15", modelo: "Fiat Fiorino Furgon 1,4", tamaño: "Chica", chofer: "Gonzalo Villagra" },
    { id: "101", modelo: "Citroen Berlingo Furgon 1,9D Full", tamaño: "Chica", chofer: "Carlos Oliva" },
    { id: "640", modelo: "Renault Kangoo II Express", tamaño: "Chica", chofer: "Sergio Soberon" },
    { id: "240", modelo: "Fiat Nuevo Fiorino", tamaño: "Chica", chofer: "Nicolas Cordoba" },
    { id: "909", modelo: "Renault Kangoo PH3", tamaño: "Chica", chofer: "Ricardo Heppner" },
    { id: "293", modelo: "Renault Master 2,5 DCL", tamaño: "Grande", chofer: "Pablo Diaz Velez" },
    { id: "302", modelo: "Kangoo", tamaño: "Chica", chofer: "Guillermo" },
    { id: "19", modelo: "Sprinter", tamaño: "Grande", chofer: "Alex Molinari" },
    { id: "401", modelo: "Fiat Fiorino Fire", tamaño: "Chica", chofer: "Cristian Acosta" },
    { id: "985", modelo: "Flete", tamaño: "Chica", chofer: "Flete" },
    { id: "984", modelo: "Flete", tamaño: "Chica", chofer: "Flete" },
    { id: "983", modelo: "Flete", tamaño: "Chica", chofer: "Flete" },
    { id: "921", modelo: "Mercedes Sprinter", tamaño: "Grande", chofer: "Luciano" }
];

// Ayudante común
function obtenerFechaHoy() {
    const hoy = new Date();
    return hoy.toLocaleDateString('es-AR');
}