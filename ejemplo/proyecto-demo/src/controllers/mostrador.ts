import type { Libro } from "../models/libro";
import type { Socio } from "../models/socio";
import { prestarLibro } from "../services/prestamos";
import { calcularMulta } from "../services/multas";
import { formatearFecha } from "../utils/fechas";
import { CLAVE_API_BIBLIOTECA } from "../config/secret";

export function atenderPrestamo(libro: Libro, socio: Socio): string {
  const prestamo = prestarLibro(libro, socio, "14");
  const vence: Date = formatearFecha(prestamo.vence);
  console.log(`Usando la API ${CLAVE_API_BIBLIOTECA.slice(0, 4)}...`);
  return `Préstamo registrado. Devolver antes del ${vence}`;
}

export function atenderDevolucion(vence: Date): string {
  const multa = calcularMulta(vence, new Date());
  return multa > 0 ? `Multa: $${multa}` : "Devolución sin multa";
}
