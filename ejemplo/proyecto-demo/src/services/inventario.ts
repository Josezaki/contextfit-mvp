import type { Libro } from "../models/libro";

export function totalCopias(libros: Libro[]): number {
  return libros.reduce((suma, libro) => suma + libro.copiasDisponibles, 0);
}

export function librosAgotados(libros: Libro[]): Libro[] {
  return libros.filter((libro) => libro.copiasDisponibles === 0);
}
