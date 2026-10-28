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
}

export const ContextFitState = Annotation.Root({
  carpeta: Annotation<string>(), // proyecto a analizar
  presupuestoTokens: Annotation<number>(), // tamaño máximo del paquete

  error: Annotation<ErrorTS | null>(), // error que se va a resolver
  grafo: Annotation<Record<string, string[]>>(), // archivo → archivos que importa

  paquete: Annotation<ArchivoContexto[]>(), // archivos seleccionados
  excluidos: Annotation<string[]>(), // conectados, pero no cupieron
  tokensUsados: Annotation<number>(),

  aprobado: Annotation<boolean>(), // decisión del desarrollador
  rutaPaquete: Annotation<string>(), // dónde se guardó el paquete aprobado
});

export type State = typeof ContextFitState.State;
