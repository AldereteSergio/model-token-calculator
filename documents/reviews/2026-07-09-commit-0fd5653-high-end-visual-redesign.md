# Code Review — Commit `0fd5653` (High-End Visual Redesign)

**Fecha:** 2026-07-09  
**Rama:** `main` (3 commits ahead of `origin/main`)  
**Alcance:** `git show HEAD` (último commit)  
**Commit:** `0fd5653` — *feat: integrate Framer Motion for enhanced animations and update UI components*  
**Plan de referencia:** `high-end-visual-redesign` (`high-end-visual-redesign_1a8528da.plan.md`)  
**Archivos:** `index.html`, `package.json`, `package-lock.json`, `skills-lock.json`, `src/index.css`, `src/App.tsx` (+831 / −644 líneas)  
**Build:** `tsc && vite build` — **FALLA** (9 errores TS en `itemVariants`)

---

## Review Summary

El commit avanza de forma clara el plan visual (OLED, Geist, Double-Bezel, Island buttons, Framer Motion con stagger). La dirección estética es coherente con el arquetipo **Ethereal Glass**. Sin embargo, **no es mergeable tal cual**: `tsc` rompe por tipado de `ease` en variantes de Framer Motion. Además, varios ítems del plan y guardrails de la skill `high-end-visual-design` quedaron a medias (bento asimétrico limitado, blur en entrada ausente, `backdrop-blur` en tarjetas scrollables, fuente Jakarta cargada pero no usada).

---

## Critical (must fix before merge)

### 1. Build roto: tipos de Framer Motion en `itemVariants`

**Archivo:** `src/App.tsx` (aprox. líneas 635–646)

```typescript
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.32, 0.72, 0, 1]  // TS infiere number[], no Bezier easing
    }
  }
};
```

**Error:** `TS2322` — `number[]` no es asignable a `Easing | Easing[]` (9 ocurrencias en `motion.header`, `motion.section`, `motion.footer`).

**Por qué importa:** el script `build` ejecuta `tsc` antes de Vite; CI y deploy fallan.

**Fix sugerido:**

```typescript
import { motion, AnimatePresence, type Variants } from 'framer-motion';

const premiumEase = [0.32, 0.72, 0, 1] as const;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: premiumEase },
  },
};
```

Alternativa: usar string CSS `"cubic-bezier(0.32, 0.72, 0, 1)"`.

---

## Suggestions (should fix)

### 2. `backdrop-blur` en contenido scrollable (guardrail de performance)

**Archivo:** `src/index.css` (línea 26)

```css
.double-bezel-core {
  @apply ... backdrop-blur-xl ...;
}
```

La skill `high-end-visual-design` (§6) indica aplicar blur solo a elementos **fixed/sticky** (nav, overlays), no a contenedores que scrollean — en mobile puede causar repaints costosos.

**Sugerencia:** quitar `backdrop-blur-xl` del core scrollable; reservar blur para modal (`fixed`), notificaciones y header si aplica.

---

### 3. Plan: blur interpolation en entrada — no implementado

**Plan (§4 Choreograph):** *"Blur Interpolation en la entrada de datos"* (`translate-y-16 blur-md` → `blur-0`).

**Estado actual:** `itemVariants.hidden` usa `opacity`, `y: 20`, `scale: 0.98` — sin `filter: blur()`.

**Sugerencia:** agregar `filter: 'blur(8px)'` en `hidden` y `filter: 'blur(0px)'` en `visible` (solo `transform`/`opacity`/`filter` animables).

---

### 4. Plan: Bento asimétrico — parcialmente cumplido

**Plan (§2):** grid asimétrico con `col-span-8 row-span-2` junto a tarjetas apiladas.

**Estado actual:** métricas usan `md:col-span-2 xl:col-span-2` en historial, pero el grid sigue siendo `xl:grid-cols-4` simétrico; columna principal `lg:col-span-9` + sidebar `lg:col-span-3` es el layout previo con nuevo skin.

**Sugerencia:** variar `row-span` / `col-span` en comparativa vs gráfico vs métricas para cumplir el arquetipo Bento del plan.

---

### 5. Plus Jakarta Sans cargada pero no aplicada

**Archivos:** `index.html`, `src/index.css`

Se declara `--font-jakarta` y se importa desde Google Fonts, pero ningún componente usa `font-jakarta`. Solo Geist está activa.

**Sugerencia:** usar Jakarta en body copy / labels (`font-jakarta`) y Geist en números/títulos, o eliminar la carga externa para reducir peso y requests.

---

### 6. Dependencia externa de fuentes en runtime

**Archivo:** `index.html`

Geist desde jsDelivr + Plus Jakarta desde Google Fonts. Sin fallback local, offline o bloqueo de CDN degrada la UI.

**Sugerencia:** self-host en `public/fonts/` o aceptar explícitamente la dependencia de red (documentar en README).

---

### 7. `skills-lock.json` en raíz del repo

**Archivo:** `skills-lock.json` (nuevo)

Registra la skill `high-end-visual-design` con hash. No está en `.gitignore`.

**Sugerencia:** confirmar si debe versionarse (equipo comparte skills) o ignorarse como artefacto local de Cursor.

---

### 8. Emojis residuales vs lenguaje premium

**Archivo:** `src/App.tsx` (métricas: 📈 📆 🔥 ⚡; notificaciones: ⚠️ ✅)

Parte del rediseño reemplazó emojis por SVG (lista de modelos, botón CSV). Las tarjetas de métricas aún usan emoji, lo que rompe parcialmente la coherencia “agency-tier” de la skill.

**Sugerencia:** reemplazar por iconos SVG ultra-light consistentes con el patrón del header.

---

## Nitpicks (optional)

1. **Animación solo on-mount** — se usa `animate="visible"` en el contenedor raíz, no `whileInView`. Todo entra al cargar; scroll largo no tiene reveals progresivos como describe la skill (§5.C).

2. **`z-[100]` / `z-[150]`** — la skill pide disciplina de z-index; reservar tokens semánticos (`z-modal`, `z-toast`).

3. **Duplicación de setup de fuentes** — variables en `index.html` `<style>` y en `src/index.css` `@theme`; consolidar en un solo lugar.

4. **Bundle size** — `framer-motion@12` suma ~30–40 KB gzip; aceptable si se explota; si solo hay stagger on-load, CSS + `ease-premium` podría bastar.

---

## What looks good

- **Double-Bezel bien abstraído:** clases `.double-bezel-shell` / `.double-bezel-core` en `index.css` y uso consistente en header, secciones, modal y sidebar — cumple el plan §2 y la skill §4.A.
- **Island Architecture en CTAs clave:** botón CSV con `island-button` + `button-icon-wrapper`, magnetic hover (`group-hover:translate-x-1`, `active:scale-[0.98]`), y curva `--ease-premium` — alineado con plan §3 y skill §4.B/C.

---

## Cumplimiento del plan `high-end-visual-redesign`

| Todo del plan | Estado | Notas |
|---------------|--------|-------|
| `setup-base-styles` | ✅ | OLED `#050505`, gradientes radiales, Geist, selection colors |
| `implement-double-bezel` | ✅ | CSS + aplicación en tarjetas principales |
| `bento-layout-refactor` | ⚠️ Parcial | Span 2 en historial; layout general aún 9/3 simétrico |
| `island-buttons` | ✅ | CSV, modal, badge óptimo en gráfico |
| `motion-choreography` | ⚠️ Parcial | Stagger + cubic-bezier sí; blur entry y scroll reveals no |

---

## Checklist skill `high-end-visual-design` (muestra)

| Criterio | ¿Cumple? |
|----------|----------|
| Fuentes premium (no Inter/Roboto) | ✅ Geist |
| Double-Bezel en cards mayores | ✅ |
| Island + button-in-button | ✅ (CTAs principales) |
| Cubic-bezier custom | ✅ CSS + Motion |
| Entry animations | ⚠️ On-load only, sin blur |
| Mobile collapse single column | ✅ |
| Blur solo fixed/sticky | ❌ `double-bezel-core` scrollable |
| Animar transform/opacity | ✅ |

---

## Próximos pasos sugeridos

1. **Arreglar `itemVariants` typing** para que `npm run build` pase.
2. Quitar o acotar `backdrop-blur` en cores scrollables.
3. Completar bento asimétrico + blur entry si se quiere cerrar el plan al 100%.
4. Decidir destino de `skills-lock.json` y fuentes externas.

---

## ¿Implementar fixes?

Este informe es read-only. Si querés, puedo aplicar el fix de TypeScript y/o los ajustes de performance del blur en un commit separado.
