/**
 * tools.ts — Herramientas que usan los nodos.
 *
 * En ContextFit ningún LLM decide qué tool usar: cada nodo llama a la que necesita.
 * Por eso son funciones normales (no usan @tool ni ToolNode como en Sarah).
 * Todas son de solo lectura: ninguna modifica el proyecto.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { cruise, type ICruiseResult } from "dependency-cruiser";
import type { ErrorTS } from "./state.js";

// ─────────────────────────────────────────────
// TOOL ejecutar_tsc
// Ejecuta el compilador de TypeScript sin generar archivos (--noEmit)
// y devuelve la lista de errores.
// ─────────────────────────────────────────────

const require = createRequire(import.meta.url);

export function ejecutarTsc(carpeta: string): ErrorTS[] {
  const tsc = require.resolve("typescript/bin/tsc");
  const resultado = spawnSync(process.execPath, [tsc, "--noEmit", "--pretty", "false"], {
    cwd: carpeta,
    encoding: "utf8",
  });

  // Cada línea de error tiene la forma: src/archivo.ts(8,47): error TS2345: mensaje
  const formato = /^(.+)\((\d+),\d+\): error (TS\d+): (.+)$/;
  const errores: ErrorTS[] = [];
  for (const linea of resultado.stdout.split("\n")) {
    const m = formato.exec(linea.trim());
    if (m) errores.push({ archivo: m[1]!, linea: Number(m[2]), codigo: m[3]!, mensaje: m[4]! });
  }
  return errores;
}

// ─────────────────────────────────────────────
// TOOL construir_grafo
// Usa dependency-cruiser para saber qué archivo importa a qué archivo.
// Devuelve: { "src/a.ts": ["src/b.ts", "src/c.ts"], ... }
// ─────────────────────────────────────────────

export async function construirGrafo(carpeta: string): Promise<Record<string, string[]>> {
  const { output } = await cruise([path.join(carpeta, "src")], {
    exclude: { path: "node_modules" },
    tsPreCompilationDeps: true, // incluye los `import type`, clave para errores de tipos
  });

  const relativa = (ruta: string) => path.relative(carpeta, path.resolve(ruta));
  const grafo: Record<string, string[]> = {};
  for (const modulo of (output as ICruiseResult).modules) {
    grafo[relativa(modulo.source)] = modulo.dependencies.map((d) => relativa(d.resolved));
  }
  return grafo;
}

// ─────────────────────────────────────────────
// TOOL obtener_vecinos
// Busca en el grafo los archivos que la semilla importa y los que la importan.
// ─────────────────────────────────────────────

export function obtenerVecinos(grafo: Record<string, string[]>, semilla: string) {
  const importa = grafo[semilla] ?? [];
  const importadoPor = Object.keys(grafo).filter((archivo) => grafo[archivo]!.includes(semilla));
  return { importa, importadoPor };
}

// ─────────────────────────────────────────────
// TOOL leer_archivo
// Lee un archivo del proyecto.
//
// GUARDRAIL 3 — Archivos sensibles: nunca lee .env, llaves ni certificados,
// para que no puedan terminar en el paquete que se envía a un LLM externo.
// ─────────────────────────────────────────────

const ARCHIVOS_SENSIBLES = /(^|\/)\.env|\.(pem|key|crt)$|secret|password/i;

export function esArchivoSensible(ruta: string): boolean {
  return ARCHIVOS_SENSIBLES.test(ruta);
}

export function leerArchivo(carpeta: string, ruta: string): string {
  if (esArchivoSensible(ruta)) throw new Error(`"${ruta}" es un archivo sensible y no se puede leer`);
  return readFileSync(path.join(carpeta, ruta), "utf8");
}

// ─────────────────────────────────────────────
// TOOL contar_tokens
// Estimación simple: ~4 caracteres por token.
// ─────────────────────────────────────────────

export function contarTokens(texto: string): number {
  return Math.ceil(texto.length / 4);
}
