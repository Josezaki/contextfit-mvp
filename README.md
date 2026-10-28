# ContextFit — implementación parcial (Tarea 1, TAL)

**Autora:** Josefina Leal Gallegos — Ingeniería Civil en Informática, UACh

Implementación del **workflow principal** de ContextFit: dado un proyecto TypeScript con
errores, selecciona los archivos relacionados con el error usando el grafo de
dependencias, los ajusta a un presupuesto de tokens y le pide al desarrollador que
apruebe el paquete antes de guardarlo.

Los LLM del diseño (el modelo pequeño que describe los archivos y el LLM externo que
propone la corrección) **no están implementados**: quedaron solo diseñados.

## Instalación y uso

Requiere Node.js 20 o superior.

```bash
npm install
npm run demo                                      # analiza el proyecto de ejemplo
npm run contextfit -- ejemplo/proyecto-demo 300   # con un presupuesto de 300 tokens
```

El programa muestra el paquete de contexto y pregunta `¿Apruebas este paquete? (s/n)`.
Si se aprueba, se guarda en `salidas/paquete_aprobado.json`.

## Workflow

```
entrada → obtenerError ──(sin errores)──→ FIN
               └→ construirGrafo → seleccionarArchivos → revisionHumana
                                                            ├─ aprueba → guardarPaquete → FIN
                                                            └─ rechaza → FIN
```

| Nodo | Qué hace |
|---|---|
| 1. `entrada` | Revisa que la carpeta exista |
| 2. `obtenerError` | Ejecuta `tsc` y toma el primer error |
| 3. `construirGrafo` | Arma el grafo de dependencias con dependency-cruiser |
| 4. `seleccionarArchivos` | Archivo del error + lo que importa + quién lo importa, hasta llenar el presupuesto |
| 5. `revisionHumana` | Muestra el paquete y pregunta si se aprueba |
| 6. `guardarPaquete` | Guarda el paquete aprobado en JSON |

## Archivos

Organizados igual que el ejemplo `sarah-graph` de la clase:

| Archivo | Equivalente en `sarah-graph` | Contenido |
|---|---|---|
| `src/state.ts` | `state.py` | El State |
| `src/tools.ts` | `tools.py` | Las tools |
| `src/nodes.ts` | `nodes.py` | Los 6 nodos |
| `src/graph.ts` | `graph.py` + `routing.py` | Las bifurcaciones y el armado del grafo |
| `src/main.ts` | `main.py` | Programa principal |

## Guardrails implementados

| # | Guardrail | Dónde |
|---|---|---|
| 1 | Aprobación humana antes de guardar/enviar | Workflow: nodo `revisionHumana` y bifurcación posterior |
| 2 | Presupuesto de tokens | Código: nodo `seleccionarArchivos` |
| 3 | Bloqueo de archivos sensibles (`.env`, llaves, `secret`…) | Tool: `leerArchivo` y nodo `seleccionarArchivos` |

## Proyecto de ejemplo

`ejemplo/proyecto-demo` es un sistema de préstamos de biblioteca con 3 errores
provocados (TS2345, TS2322 y TS2363). Incluye `src/config/secret.ts`, con una clave
falsa, para mostrar el guardrail 3: aunque el archivo del error lo importa, nunca entra
al paquete.

## Stack

TypeScript · LangGraph (JS) · dependency-cruiser
