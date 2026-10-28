/**
 * graph.ts — Arma el workflow con LangGraph.
 *
 *  entrada → obtenerError ──(sin errores)──→ FIN
 *                 └→ construirGrafo → seleccionarArchivos → explicarArchivos → revisionHumana
 *                                                                                    ├─ aprueba → guardarPaquete → FIN
 *                                                                                    └─ rechaza → FIN
 */
import { END, START, StateGraph } from "@langchain/langgraph";
import * as nodes from "./nodes.js";
import { ContextFitState, type State } from "./state.js";

// ─────────────────────────────────────────────
// Routing: funciones que deciden el siguiente paso
// ─────────────────────────────────────────────

function routeError(state: State) {
  return state.error ? "hay_error" : "sin_error";
}

function routeRevision(state: State) {
  return state.aprobado ? "aprobado" : "rechazado";
}

// ─────────────────────────────────────────────
// Graph
// ─────────────────────────────────────────────

export const graph = new StateGraph(ContextFitState)
  // Nodes
  .addNode("entrada", nodes.entrada)
  .addNode("obtenerError", nodes.obtenerError)
  .addNode("construirGrafo", nodes.construirGrafo)
  .addNode("seleccionarArchivos", nodes.seleccionarArchivos)
  .addNode("explicarArchivos", nodes.explicarArchivos)
  .addNode("revisionHumana", nodes.revisionHumana)
  .addNode("guardarPaquete", nodes.guardarPaquete)

  // Edges
  .addEdge(START, "entrada")
  .addEdge("entrada", "obtenerError")
  .addConditionalEdges("obtenerError", routeError, {
    hay_error: "construirGrafo",
    sin_error: END,
  })
  .addEdge("construirGrafo", "seleccionarArchivos")
  .addEdge("seleccionarArchivos", "explicarArchivos")
  .addEdge("explicarArchivos", "revisionHumana")
  .addConditionalEdges("revisionHumana", routeRevision, {
    aprobado: "guardarPaquete",
    rechazado: END,
  })
  .addEdge("guardarPaquete", END)

  .compile();
