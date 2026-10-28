import { atenderPrestamo } from "./controllers/mostrador";

const libro = { id: 1, titulo: "Cien años de soledad", autor: "G. García Márquez", copiasDisponibles: 2 };
const socio = { rut: "11.111.111-1", nombre: "Ana", prestamosActivos: 0 };

console.log(atenderPrestamo(libro, socio));
