# ContextFit — implementación parcial (Tarea 1, TAL)

**Autora:** Josefina Leal Gallegos — Ingeniería Civil en Informática, UACh

Implementación del **workflow principal** de ContextFit: dado un proyecto TypeScript con
errores, selecciona los archivos relacionados con el error usando el grafo de
dependencias, los ajusta a un presupuesto de tokens y le pide al desarrollador que
apruebe el paquete antes de guardarlo.

Incluye el **LLM pequeño** del diseño, que corre en el computador con Ollama y describe
cada archivo del paquete. El LLM externo que propone la corrección **no está
implementado**: quedó solo diseñado.

## Instalación y uso

Requiere Node.js 20 o superior y, para las descripciones, [Ollama](https://ollama.com).

```bash
ollama pull qwen2.5-coder:1.5b    # una sola vez (~1 GB)
npm install
npm run demo                                      # analiza el proyecto de ejemplo
npm run contextfit -- ejemplo/proyecto-demo 300   # con un presupuesto de 300 tokens
```

El programa muestra el paquete de contexto y pregunta `¿Apruebas este paquete? (s/n)`.
Si se aprueba, se guarda en `salidas/paquete_aprobado.json`.

Si Ollama no está abierto, el programa funciona igual, pero sin las descripciones.
Para usar otro modelo: `OLLAMA_MODELO=nombre-del-modelo npm run demo`.

## Workflow

```
entrada → obtenerError ──(sin errores)──→ FIN
               └→ construirGrafo → seleccionarArchivos → explicarArchivos → revisionHumana
                                                                                  ├─ aprueba → guardarPaquete → FIN
                                                                                  └─ rechaza → FIN
```

| Nodo | Qué hace |
|---|---|
| 1. `entrada` | Revisa que la carpeta exista |
| 2. `obtenerError` | Ejecuta `tsc` y toma el primer error |
| 3. `construirGrafo` | Arma el grafo de dependencias con dependency-cruiser |
| 4. `seleccionarArchivos` | Archivo del error + lo que importa + quién lo importa, hasta llenar el presupuesto |
| 5. `explicarArchivos` | El LLM pequeño (Ollama) describe cada archivo en 1–2 líneas |
| 6. `revisionHumana` | Muestra el paquete con las descripciones y pregunta si se aprueba |
| 7. `guardarPaquete` | Guarda el paquete aprobado en JSON |

## Archivos
|Archivo | Contenido |
|---|---|
| `state.py` | El State |
| `tools.py` | Las tools |
| `nodes.py` | 7 nodos |
| `graph.py` + `routing.py` | Las bifurcaciones y el armado del grafo |
| `main.py` | Programa principal |

## Guardrails implementados

| # | Guardrail | Dónde |
|---|---|---|
| 1 | Aprobación humana antes de guardar/enviar | Workflow: nodo `revisionHumana` y bifurcación posterior |
| 2 | Presupuesto de tokens | Código: nodo `seleccionarArchivos` |
| 3 | Bloqueo de archivos sensibles (`.env`, llaves, `secret`…) | Tool: `leerArchivo` y nodo `seleccionarArchivos` |
| 5 | Descripciones ancladas al código | Prompt de la tool `explicarArchivo`; además, las descripciones se marcan con `[IA]` |

## Proyecto de ejemplo

`ejemplo/proyecto-demo` es un sistema de préstamos de biblioteca con 3 errores
provocados (TS2345, TS2322 y TS2363). Incluye `src/config/secret.ts`, con una clave
falsa, para mostrar el guardrail 3: aunque el archivo del error lo importa, nunca entra
al paquete.

## Stack

TypeScript · LangGraph (JS) · dependency-cruiser · Ollama
