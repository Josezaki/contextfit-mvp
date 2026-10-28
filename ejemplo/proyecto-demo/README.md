# Proyecto demo: sistema de préstamos de una biblioteca

Proyecto TypeScript pequeño con **errores provocados a propósito** para probar ContextFit.

| Archivo | Error | Código |
|---|---|---|
| `src/controllers/mostrador.ts` | Se pasa `"14"` (texto) donde se espera un número de días | TS2345 |
| `src/controllers/mostrador.ts` | Se asigna un `string` a una variable de tipo `Date` | TS2322 |
| `src/services/multas.ts` | Se multiplica un número por un texto | TS2363 |

- `src/services/inventario.ts` no está conectado con el mostrador: la selección lo deja fuera.
- `src/config/secret.ts` contiene una clave **falsa**: el guardrail de archivos sensibles
  impide que entre al paquete.
