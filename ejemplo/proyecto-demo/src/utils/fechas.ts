const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function sumarDias(fecha: Date, dias: number): Date {
  return new Date(fecha.getTime() + dias * MS_POR_DIA);
}

export function diasEntre(desde: Date, hasta: Date): number {
  return Math.floor((hasta.getTime() - desde.getTime()) / MS_POR_DIA);
}

export function formatearFecha(fecha: Date): string {
  return fecha.toLocaleDateString("es-CL");
}
