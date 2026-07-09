# 20260709 - Registro de Jornada

---
fecha: 20260709
autores: Sergio / Artifex
tags: journal, journal-zettel, kishotenketsu
estado: In Progress
---

## 16:28 - Fix: ERR_MODULE_NOT_FOUND en findskills-mcp

### 1. Entrada Principal (Sergio)
estoy queriendo instalar un mcp de findskills, pero no lo estoy logrando.

### 2. Análisis, Hipótesis y Solución (Vika)
**Análisis:** El paquete findskills-mcp (v0.1.25) en npm omite la carpeta lib/ en su package.json, pero api.js intenta importar de ella. Esto rompe la instalacion via npx.

**Hipótesis:** Inyectar manualmente el archivo faltante en la cache de Volta/npm permite que el servidor arranque sin modificar el flujo de instalacion del usuario.

**Solución:** Se creo lib/auth-error.js en la ruta de instalacion global con una implementacion funcional de buildAuthErrorMessage. El servidor ahora inicia correctamente.

---
