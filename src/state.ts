/**
 * state.ts — El State: la memoria de trabajo del workflow.
 *
 * Cada nodo lee información del state y devuelve solo lo que cambió.
 * Se guarda solo lo necesario para las siguientes decisiones, no el proyecto completo.
 */
import { Annotation } from "@langchain/langgraph";

/** Un error de compilación de TypeScript. */
export interface ErrorTS {
  archivo: string; // ej. "src/controllers/mostrador.ts"
  linea: number;
  codigo: string; // ej. "TS2345"
  mensaje: string;
}

/** Un archivo seleccionado para el paquete de contexto. */
export interface ArchivoContexto {
  ruta: string;
  motivo: "semilla" | "importa" | "importado_por"; // por qué entró
  tokens: number;
  contenido: string;
  descripcion?: string; // la escribe el LLM pequeño (nodo 5)
}

export const ContextFitState = Annotation.Root({
  carpeta: Annotation<string>(), // Nodo 1: proyecto a analizar
  presupuestoTokens: Annotation<number>(), // Configuracion/CLI: tamano maximo del paquete

  error: Annotation<ErrorTS | null>(), // Nodo 2: error que se va a resolver
  grafo: Annotation<Record<string, string[]>>(), // Nodo 3: archivo -> archivos que importa

  paquete: Annotation<ArchivoContexto[]>(), // Nodos 4, 5 y 6: archivos seleccionados y descritos
  excluidos: Annotation<string[]>(), // Nodo 4: archivos conectados, pero que no cupieron
  tokensUsados: Annotation<number>(), // Nodo 4: tamano actual del paquete

  aprobado: Annotation<boolean>(), // Nodo 6: decision del desarrollador
  rutaPaquete: Annotation<string>(), // Nodo 7: donde se guardo el paquete aprobado
});

export type State = typeof ContextFitState.State;
