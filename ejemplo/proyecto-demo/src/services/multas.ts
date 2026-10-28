import { diasEntre } from "../utils/fechas";

const MULTA_DIARIA = 500;

export function calcularMulta(vence: Date, devolucion: Date): number {
  const diasAtraso = diasEntre(vence, devolucion);
  if (diasAtraso <= 0) return 0;
  return diasAtraso * "500";
}

export function multaMaxima(): number {
  return MULTA_DIARIA * 30;
}
