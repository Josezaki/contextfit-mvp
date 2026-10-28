import type { Libro } from "../models/libro";
import { estaDisponible } from "../models/libro";
import type { Socio } from "../models/socio";
import { puedePedirPrestado } from "../models/socio";
import { sumarDias } from "../utils/fechas";

export interface Prestamo {
  libroId: number;
  rutSocio: string;
  inicio: Date;
  vence: Date;
}

export function prestarLibro(libro: Libro, socio: Socio, dias: number): Prestamo {
  if (!estaDisponible(libro)) {
    throw new Error(`No quedan copias de "${libro.titulo}"`);
  }
  if (!puedePedirPrestado(socio)) {
    throw new Error(`${socio.nombre} alcanzó el máximo de préstamos`);
  }
  libro.copiasDisponibles -= 1;
  socio.prestamosActivos += 1;
  const inicio = new Date();
  return { libroId: libro.id, rutSocio: socio.rut, inicio, vence: sumarDias(inicio, dias) };
}
