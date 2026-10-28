/**
 * nodes.ts — Los nodos del workflow.
 *
 * Todos siguen la misma regla: reciben el state y devuelven solo lo que cambió.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import type { ArchivoContexto, State } from "./state.js";
import { construirGrafo as toolConstruirGrafo, contarTokens, ejecutarTsc, esArchivoSensible, leerArchivo, obtenerVecinos } from "./tools.js";

// ─────────────────────────────────────────────
// NODO 1 — Entrada: revisa que la carpeta exista
// ─────────────────────────────────────────────

export function entrada(state: State) {
  const carpeta = path.resolve(state.carpeta);
  if (!existsSync(carpeta)) throw new Error(`La carpeta "${state.carpeta}" no existe`);
  return { carpeta };
}

// ─────────────────────────────────────────────
// NODO 2 — Obtener error: ejecuta tsc y toma el primer error
// ─────────────────────────────────────────────

export function obtenerError(state: State) {
  const errores = ejecutarTsc(state.carpeta);
  console.log(`\ntsc encontró ${errores.length} error(es).`);

  if (errores.length === 0) return { error: null };
  return { error: errores[0]! };
}

// ─────────────────────────────────────────────
// NODO 3 — Construir el grafo de dependencias entre archivos
// ─────────────────────────────────────────────

export async function construirGrafo(state: State) {
  return { grafo: await toolConstruirGrafo(state.carpeta) };
}

// ─────────────────────────────────────────────
// NODO 4 — Seleccionar archivos
// Semilla (archivo del error) + lo que importa + quién la importa.
//
// GUARDRAIL 2 — Presupuesto de tokens: se agregan archivos en ese orden de
// prioridad hasta llenar el presupuesto. Lo que no cabe queda en `excluidos`.
// ─────────────────────────────────────────────

export function seleccionarArchivos(state: State) {
  const semilla = state.error!.archivo;
  const { importa, importadoPor } = obtenerVecinos(state.grafo, semilla);

  const candidatos: [string, ArchivoContexto["motivo"]][] = [
    [semilla, "semilla"],
    ...importa.map((r): [string, ArchivoContexto["motivo"]] => [r, "importa"]),
    ...importadoPor.map((r): [string, ArchivoContexto["motivo"]] => [r, "importado_por"]),
  ];

  const paquete: ArchivoContexto[] = [];
  const excluidos: string[] = [];
  let tokensUsados = 0;

  for (const [ruta, motivo] of candidatos) {
    if (esArchivoSensible(ruta)) {
      console.log(`Guardrail: se bloqueó ${ruta} (archivo sensible)`);
      continue;
    }

    const contenido = leerArchivo(state.carpeta, ruta);
    const tokens = contarTokens(contenido);

    // La semilla entra siempre; el resto, solo si cabe en el presupuesto.
    if (motivo === "semilla" || tokensUsados + tokens <= state.presupuestoTokens) {
      paquete.push({ ruta, motivo, tokens, contenido });
      tokensUsados += tokens;
    } else {
      excluidos.push(ruta);
    }
  }
  return { paquete, excluidos, tokensUsados };
}

// ─────────────────────────────────────────────
// NODO 5 — Revisión humana
//
// GUARDRAIL 1 — Aprobación humana: nada se guarda ni se envía sin que el
// desarrollador vea el paquete y lo apruebe.
// ─────────────────────────────────────────────

export async function revisionHumana(state: State) {
  const e = state.error!;
  console.log("\n════════ REVISIÓN DEL PAQUETE DE CONTEXTO ════════");
  console.log(`Error: ${e.codigo} en ${e.archivo}:${e.linea}`);
  console.log(`  ${e.mensaje}`);
  console.log(`\nSe enviaría (~${state.tokensUsados} de ${state.presupuestoTokens} tokens):`);
  for (const archivo of state.paquete) {
    console.log(`  • ${archivo.ruta}  (${archivo.motivo}, ~${archivo.tokens} tokens)`);
  }
  if (state.excluidos.length > 0) {
    console.log("\nNo cupieron en el presupuesto:");
    for (const ruta of state.excluidos) console.log(`  ◦ ${ruta}`);
  }

  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  const respuesta = await terminal.question("\n¿Apruebas este paquete? (s/n): ");
  terminal.close();

  return { aprobado: respuesta.trim().toLowerCase() === "s" };
}

// ─────────────────────────────────────────────
// NODO 6 — Guardar paquete aprobado
// Lo guarda como JSON. En el diseño completo, aquí se enviaría al LLM externo.
// ─────────────────────────────────────────────

export function guardarPaquete(state: State) {
  const carpetaSalida = path.resolve("salidas");
  mkdirSync(carpetaSalida, { recursive: true });

  const rutaPaquete = path.join(carpetaSalida, "paquete_aprobado.json");
  const paquete = {
    error: state.error,
    tokensUsados: state.tokensUsados,
    archivos: state.paquete,
  };
  writeFileSync(rutaPaquete, JSON.stringify(paquete, null, 2));

  return { rutaPaquete };
}
