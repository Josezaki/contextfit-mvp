export interface Socio {
  rut: string;
  nombre: string;
  prestamosActivos: number;
}

export const MAXIMO_PRESTAMOS = 3;

export function puedePedirPrestado(socio: Socio): boolean {
  return socio.prestamosActivos < MAXIMO_PRESTAMOS;
}
