export interface Libro {
  id: number;
  titulo: string;
  autor: string;
  copiasDisponibles: number;
}

export function estaDisponible(libro: Libro): boolean {
  return libro.copiasDisponibles > 0;
}
