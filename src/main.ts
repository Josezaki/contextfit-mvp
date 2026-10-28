/**
 * main.ts — Programa principal.
 *
 * Uso:
 *   npm run demo
 *   npm run contextfit -- <carpeta> [presupuesto]
 */
import { graph } from "./graph.js";

async function main() {
  const carpeta = process.argv[2];
  const presupuestoTokens = Number(process.argv[3] ?? 4000);

  if (!carpeta) {
    console.log("Uso: npm run contextfit -- <carpeta> [presupuesto]");
    return;
  }

  console.log("=".repeat(50));
  console.log("  ContextFit — selección de contexto");
  console.log("=".repeat(50));
  console.log(`Proyecto: ${carpeta}`);
  console.log(`Presupuesto: ${presupuestoTokens} tokens`);

  const resultado = await graph.invoke({ carpeta, presupuestoTokens });

  console.log("\n" + "-".repeat(50));
  if (!resultado.error) {
    console.log("El proyecto compila sin errores. No hay nada que hacer.");
  } else if (resultado.aprobado) {
    console.log(`Paquete aprobado y guardado en: ${resultado.rutaPaquete}`);
  } else {
    console.log("Paquete rechazado. No se guardó ni se envió nada.");
  }
}

main().catch((e) => console.error(`\n[ERROR] ${e.message}`));
