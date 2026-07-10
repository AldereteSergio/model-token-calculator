# Code Review — Commit `ffe77bb`

**Fecha:** 2026-07-09  
**Rama:** `main` (6 commits ahead of `origin/main`)  
**Alcance:** `git show HEAD` (último commit)  
**Commit:** `ffe77bb` — *fix: address JSX error and improve area chart handling*  
**Archivos:** `src/App.tsx`, `documents/reviews/2026-07-09-commits-ed285ba-ba43bcd.md`  
**Build:** `tsc` OK · `vite build` — **FALLA** (`Cannot apply unknown utility class group` en `src/index.css`)

---

## Review Summary

Este commit cierra bien la deuda crítica del review de `ed285ba`+`ba43bcd`: JSX del header del gráfico cerrado, guard `denom` en el area chart, `Math.max(..., 1e-9)` en barras apiladas, y `z-[var(--z-modal)]` en el modal. **Como patch de correctness del gráfico: ship.** El repo sigue sin build completo por un problema de Tailwind en `index.css` (`.island-button` con `@apply ... group`), predado a este commit pero **bloqueante de merge/deploy**.

---

## Critical (must fix before merge)

### 1. `vite build` falla: `@apply group` en `.island-button`

**Archivo:** `src/index.css` (líneas 35–37)  
**No introducido en `ffe77bb`**, pero el build actual en HEAD falla.

```css
.island-button {
  @apply ... flex items-center gap-2 group active:scale-[0.98];
}
```

Tailwind v4 rechaza `@apply group` (“Cannot apply unknown utility class `group`”).

**Por qué importa:** CI / GitHub Pages / `npm run build` no publican.

**Fix sugerido:** sacar `group` del `@apply` y ponerlo en el markup (`className="island-button group ..."`), o definir el variante hover del icono sin depender de `group` en la clase compuesto.

---

## Suggestions (should fix)

### 2. Touch tooltip: `group-active` no alcanza en mobile

**Archivo:** `src/App.tsx` (aprox. línea 1300)

```tsx
className="... group-hover/point:opacity-100 group-active/point:opacity-100 ..."
```

`active` solo dura mientras el dedo está abajo; al soltar desaparece. En SVG/`foreignObject` el soporte táctil es irregular.

**Sugerencia:** estado React `selectedTrendIndex` al `onClick`/`onPointerDown` del punto, o panel fijo debajo del chart con el día seleccionado.

---

### 3. Mensaje de commit sobreestima el cambio de CSS

El body dice *"Adjusted z-index usage in CSS"*, pero el diff de `ffe77bb` **no toca** `index.css` — solo pasa el modal a `z-[var(--z-modal)]` en `App.tsx` (tokens ya existían desde `ed285ba`).

**Sugerencia:** mensajes más precisos; no bloquea merge.

---

## Nitpicks (optional)

1. **Indentación irregular** en el `modelComparisons.map` del gráfico (mezcla de 2 niveles) — cosmético.
2. **`heightPercent` usa `model.totalCost` crudo** mientras los segmentos usan `totalCost = Math.max(..., 1e-9)` — consistente para altura visual (barra mínima 3%), ok.
3. **Review previo versionado** en el mismo commit — bien como trazabilidad.

---

## What looks good

- **Fix JSX quirúrgico:** se cerró el `<div>` del header del gráfico; la estructura vuelve a anidar bien toggles + badge Óptimo.
- **Edge cases del chart atendidos:** `denom = Math.max(trendData.length - 1, 1)` y floor `1e-9` en stacks cierran NaN/Infinity que el review anterior marcó como should-fix.

---

## Delta vs review `ed285ba`+`ba43bcd`

| Hallazgo previo | Estado en `ffe77bb` |
|-----------------|---------------------|
| JSX sin `</div>` (build TS) | ✅ Corregido (`tsc` pasa) |
| División por cero en area chart | ✅ Corregido (`denom`) |
| NaN en barras si `totalCost === 0` | ✅ Mitigado (`1e-9`) |
| Modal `z-[100]` hardcodeado | ✅ `z-[var(--z-modal)]` |
| Tooltips touch | ⚠️ Intento con `group-active` (insuficiente) |
| Build completo (`vite`) | ❌ Sigue fallando por `@apply group` |

---

## Veredicto

**`ffe77bb`:** buen fix-commit de follow-up; tipado/JSX y guards del gráfico en orden.

**HEAD del repo:** aún **no mergeable para deploy** hasta arreglar `.island-button` / `@apply group` en `src/index.css`.

---

## Próximos pasos sugeridos

1. Quitar `group` del `@apply` de `.island-button` y re-correr `npm run build`.
2. (Opcional) Tooltip de tendencia con estado click/tap persistente.
3. Empujar a origin cuando el build verde esté estable.

---

## ¿Implementar fixes?

Este informe es read-only. Si querés, puedo aplicar el fix de Tailwind `@apply group` para dejar el build verde.
