# 📊 Calculadora de Costos & Tokens de IA - Dashboard de Uso de Cursor

Una aplicación web moderna y de alto rendimiento diseñada para cargar e interpretar los historiales de consumo de tokens (como los logs exportados de **Cursor**), consolidar las métricas de uso y proyectar de manera exacta cuánto costaría ese mismo volumen de trabajo si utilizaras las APIs pay-as-you-go directamente, comparando las tarifas oficiales de los modelos líderes en **OpenRouter**.

El objetivo principal es contrastar de forma empírica y transparente si te conviene un plan de suscripción fijo o realizar llamadas directas mediante llaves de API, encontrando siempre el modelo más óptimo y económico para tu patrón real de consumo.

---

## ✨ Características Principales

* **📁 Carga Dinámica de CSV**: Sistema de importación de archivos `.csv` (con logs reales de Cursor) que parsea y agrupa de forma segura y automatizada los consumos por día.
* **📈 Panel de Métricas Clave (Últimos 30 Días)**: Visualización inmediata del volumen acumulado de tokens de entrada (Input), salida (Output) y caché (Cache Read).
* **⚡ Análisis de Picos de Gasto**: Identificación automática del día y de la semana más caros de todo tu historial basándose en las tarifas del modelo activo.
* **📊 Gráfico Comparativo de Gasto Real**: Gráfico interactivo escalado al 100% de precisión matemática que compara visualmente el gasto total proyectado entre todos los modelos, destacando automáticamente la **"Opción Óptima"** (la más barata).
* **🛠️ Gestión Dinámica de Modelos (CRUD)**:
  * **Agregar** nuevos modelos personalizados con tarifas por millón de tokens.
  * **Editar** precios de entrada, salida y lectura de caché de cualquier modelo existente en tiempo real.
  * **Eliminar** modelos para mantener el gráfico limpio y enfocado.
* **🤖 Preconfiguración Completa de OpenRouter**: Viene precargado con **17 modelos de referencia** en sus tarifas reales base (sin promociones temporales), incluyendo:
  * *DeepSeek V4 (Pro / Flash)* con sus bajísimos costos de caché.
  * *Google Gemini (3.5 Flash, 3.1 Flash-Lite, 3.1 Pro)*.
  * *Qwen (3.7 Max, 3.6 Flash)*.
  * *x-ai Grok 4.3*, *Minimax M3*, *Moonshot Kimi*, entre otros.

---

## 🛠️ Tecnologías Utilizadas

* **React 18** (Utilizando Hooks avanzados como `useMemo` y `useState` para recalcular costes masivos en microsegundos de forma local).
* **Vite** (Generador de entorno y bundler ultra veloz).
* **TypeScript** (Tipado seguro y robusto para evitar errores de parseo y cálculo).
* **Tailwind CSS v4** (Utilizando el nuevo compilador `@tailwindcss/vite` para un diseño fluido adaptado al 100% de la pantalla, con soporte de Scrollbars personalizados y transiciones suaves).

---

## 📋 Requisitos Previos

Asegúrate de tener instalado **Node.js** en tu sistema (se recomienda la versión v22 o superior para coincidir con el entorno de desarrollo optimizado).

---

## 🚀 Guía de Instalación y Ejecución

Sigue estos sencillos pasos para poner en marcha la aplicación en tu máquina local:

1. **Instalar Dependencias**:
   Instala todas las librerías necesarias ejecutando:
   ```bash
   npm install
   ```

2. **Iniciar el Servidor de Desarrollo**:
   Levanta la aplicación en modo desarrollo local:
   ```bash
   npm run dev
   ```
   *La aplicación estará disponible de inmediato en la dirección local proporcionada por la consola (habitualmente `http://localhost:5173`).*

3. **Compilar para Producción**:
   Si deseas construir un bundle optimizado y listo para ser desplegado en producción:
   ```bash
   npm run build
   ```

---

## 📊 Formato de Datos de Entrada (CSV)

El importador está diseñado para ser altamente flexible y auto-detectar las columnas clave de tus reportes de Cursor. Busca de manera insensible a mayúsculas o minúsculas palabras clave como:
* **Fecha**: `Date` (Soporta fechas simples o marcas de tiempo ISO).
* **Tokens de Entrada**: Columnas que contengan `input` (detecta `Input (w/ cache write)` e `Input (w/o cache write)`).
* **Tokens de Caché**: Columnas que contengan `cache read`.
* **Tokens de Salida**: Columnas que contengan `output tokens`.

Si la columna de caché no se encuentra, la aplicación asignará por defecto `0` para proteger la consistencia de los cálculos y proyectará los costes usando la tarifa de entrada estándar.

---

## 👤 Co-autores

Desarrollado en colaboración con **Oz** (AI Agent de Warp).

*Co-Authored-By: Oz <oz-agent@warp.dev>*
