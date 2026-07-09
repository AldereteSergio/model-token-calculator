# Code Review — Working Tree

**Fecha:** 2026-07-09  
**Rama:** `main`  
**Alcance:** `git diff HEAD` (staged + unstaged vs último commit)  
**Archivos:** `.gitignore`, `src/App.tsx`  
**Build:** `tsc && vite build` — OK

---

## Review Summary

Es un WIP sólido: mejora UX (modal de modelos, comparativa 3-way, fechas dinámicas), corrige bugs reales de fechas/semanas y suma tipado TypeScript. No vi bloqueantes de seguridad ni de compilación. Antes de commitear conviene ajustar la lógica de `last30CoversAll` y un par de detalles de UX/mantenibilidad.

---

## Critical (must fix before merge)

*(Sin hallazgos en esta categoría.)*

---

## Suggestions (should fix)

### 1. `last30CoversAll` puede mostrar un mensaje falso

**Archivo:** `src/App.tsx` (aprox. línea 306)

```typescript
const last30CoversAll = spanDays <= 30 || last30Tokens === totalTokens;
```

Si el CSV abarca más de 30 días calendario pero todo el consumo cayó en la ventana final, `last30Tokens === totalTokens` es `true` aunque `spanDays > 30`. La UI entonces dice *"El dataset cabe en ≤30 días"*, lo cual es incorrecto.

**Por qué importa:** puede llevar a interpretar mal el período y la proyección mensual.

**Fix sugerido:**

```typescript
const last30CoversAll = spanDays <= 30;
```

Si querés detectar redundancia entre tarjetas, usá otra condición explícita (p. ej. `last30Tokens === totalTokens && spanDays <= 30`).

---

### 2. `parsePriceInput` silencia entradas inválidas a `0`

**Archivo:** `src/App.tsx` (aprox. líneas 77–82)

```typescript
const parsePriceInput = (raw: string): number => {
  const normalized = raw.trim().replace(',', '.');
  if (normalized === '' || normalized === '.') return 0;
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};
```

Un typo como `"0..5"` o `"abc"` termina guardándose como precio cero sin aviso.

**Fix sugerido:** validar en `handleAddOrUpdateModel` y mostrar `showNotification(..., 'error')` si algún campo tiene texto no vacío que no parsea a un número válido.

---

### 3. `setTimeout` de notificaciones sin cleanup ni cancelación

**Archivo:** `src/App.tsx` (aprox. líneas 161–164)

```typescript
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  setNotification({ message, type });
  setTimeout(() => setNotification(null), 4000);
};
```

Notificaciones rápidas en cadena pueden borrar una más nueva cuando vence el timer de una anterior.

**Fix sugerido:** guardar el `timeoutId` en un `useRef` y limpiarlo antes de programar otro (y en unmount con `useEffect` cleanup).

---

### 4. Comparativa 3-way: empates y categorías distintas

**Archivo:** `src/App.tsx` (aprox. líneas 418–420)

```typescript
const winnerKey = contenders.reduce((best, cur) =>
  cur.monthly < best.monthly ? cur : best
).key;
```

En empate gana siempre el primero (modelo A). Además, API proyectada vs plan fijo de Cursor es una comparación aproximada (bien aclarada en el disclaimer).

**Sugerencia:** en empate mostrar varios badges "Gana" o un texto "Empate", y/o excluir al plan Cursor del badge automático si la diferencia es marginal.

---

### 5. `.gitignore` ignora todo `.cursor`

```diff
+.cursor
```

Hoy no hay archivos `.cursor` trackeados, así que no rompe nada. Si más adelante querés versionar skills o reglas del equipo en `.cursor/skills`, este patrón los excluiría. Considerá `.cursor/*` con excepciones (`!.cursor/skills/`) si eso es intención futura.

---

## Nitpicks (optional)

1. **`formatDateRangeLabel` tiene ramas redundantes** — las líneas 106–109 devuelven lo mismo en ambos `if`; la rama por mes podría formatear más compacto (`9–30 jun 2026`).

2. **Modal sin Escape ni focus trap** — funciona con backdrop y botón ×, pero le falta `onKeyDown` para `Escape` y foco inicial en el primer campo (ya tiene `autoFocus` en nombre).

3. **`App.tsx` ~1300 líneas** — helpers (`sanitizePriceInput`, stats, compare) podrían extraerse a módulos cuando el archivo siga creciendo.

---

## What looks good

- **Corrección de fechas/semanas:** `T00:00:00` local, ventana de 30 días inclusiva (`-29`), y el fix de `monday.setDate(diff)` sin mutar `dateObj` evitan desfases UTC y bugs de semana que antes eran reales.
- **CRUD de modelos más robusto:** precios como `string` en el form, modal dedicado, `e.target.value = ''` en el upload para re-subir el mismo CSV, y el delete usa `remaining` en lugar del state stale — todo mejora UX y corrige race conditions.

---

## Próximos pasos sugeridos

1. Corregir `last30CoversAll`.
2. Validar precios inválidos en el formulario de modelos.
3. Cleanup de timers en notificaciones.
