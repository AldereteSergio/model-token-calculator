import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Datos agregados del CSV original proveído por el usuario
const INITIAL_CSV_DATA = [
  { "date": "2026-05-09", "input": 2237930.0, "output": 79606.0, "cache": 9466292.0, "total": 11783828.0 },
  { "date": "2026-05-10", "input": 53779.0, "output": 2291.0, "cache": 147616.0, "total": 203686.0 },
  { "date": "2026-05-12", "input": 1252724.0, "output": 29492.0, "cache": 3916320.0, "total": 5198536.0 },
  { "date": "2026-05-13", "input": 13427.0, "output": 710.0, "cache": 7680.0, "total": 21817.0 },
  { "date": "2026-05-14", "input": 913805.0, "output": 332747.0, "cache": 2110477.0, "total": 3357029.0 },
  { "date": "2026-05-15", "input": 0.0, "output": 0.0, "cache": 0.0, "total": 0.0 },
  { "date": "2026-05-16", "input": 1454864.0, "output": 52838.0, "cache": 2712929.0, "total": 4220631.0 },
  { "date": "2026-05-17", "input": 2975122.0, "output": 226231.0, "cache": 26875537.0, "total": 30076890.0 },
  { "date": "2026-05-18", "input": 1862092.0, "output": 95434.0, "cache": 8770185.0, "total": 10727711.0 },
  { "date": "2026-05-20", "input": 247287.0, "output": 15982.0, "cache": 1718252.0, "total": 1981521.0 },
  { "date": "2026-05-21", "input": 2004957.0, "output": 113279.0, "cache": 12688293.0, "total": 14806529.0 },
  { "date": "2026-05-22", "input": 5106596.0, "output": 321434.0, "cache": 14563113.0, "total": 19991143.0 },
  { "date": "2026-05-23", "input": 4649333.0, "output": 244976.0, "cache": 20848073.0, "total": 25742382.0 },
  { "date": "2026-05-24", "input": 3075159.0, "output": 103856.0, "cache": 13018788.0, "total": 16197803.0 },
  { "date": "2026-05-26", "input": 8522.0, "output": 398.0, "cache": 5746.0, "total": 14666.0 },
  { "date": "2026-05-28", "input": 2547090.0, "output": 124077.0, "cache": 9464047.0, "total": 12135214.0 },
  { "date": "2026-05-29", "input": 2328774.0, "output": 111230.0, "cache": 6893254.0, "total": 9333258.0 },
  { "date": "2026-05-30", "input": 561262.0, "output": 47140.0, "cache": 3376702.0, "total": 3985104.0 },
  { "date": "2026-05-31", "input": 11039351.0, "output": 553362.0, "cache": 67957598.0, "total": 79550311.0 },
  { "date": "2026-06-01", "input": 3246517.0, "output": 203302.0, "cache": 24918176.0, "total": 28367995.0 },
  { "date": "2026-06-02", "input": 133776.0, "output": 2829.0, "cache": 364136.0, "total": 500741.0 },
  { "date": "2026-06-03", "input": 1754192.0, "output": 32919.0, "cache": 2262545.0, "total": 4049656.0 },
  { "date": "2026-06-04", "input": 1069412.0, "output": 48835.0, "cache": 3821954.0, "total": 4940201.0 },
  { "date": "2026-06-05", "input": 530722.0, "output": 6971.0, "cache": 1729897.0, "total": 2267590.0 },
  { "date": "2026-06-06", "input": 1345005.0, "output": 54545.0, "cache": 6774201.0, "total": 8173751.0 },
  { "date": "2026-06-07", "input": 7738433.0, "output": 355164.0, "cache": 32094962.0, "total": 40188559.0 }
];

// Modelos iniciales de ejemplo con tarifas reales por 1 Millón de tokens (USD)
const INITIAL_MODELS = [
  { id: '1', name: 'nemotron-3-ultra-550b-a55b', inputPrice: 0.50, outputPrice: 2.50, cachePrice: 0.50 },
  { id: '2', name: 'minimax-m3', inputPrice: 0.60, outputPrice: 2.40, cachePrice: 0.12 },
  { id: '3', name: 'qwen3.7-max', inputPrice: 1.25, outputPrice: 3.75, cachePrice: 0.25 },
  { id: '4', name: 'gemini-3.5-flash', inputPrice: 1.50, outputPrice: 9.00, cachePrice: 0.15 },
  { id: '5', name: 'gemini-3.1-flash-lite', inputPrice: 0.25, outputPrice: 1.50, cachePrice: 0.025 },
  { id: '6', name: 'grok-4.3', inputPrice: 1.25, outputPrice: 2.50, cachePrice: 0.20 },
  { id: '7', name: 'qwen3.6-flash', inputPrice: 0.25, outputPrice: 1.50, cachePrice: 0.025 },
  { id: '8', name: 'deepseek-v4-pro', inputPrice: 0.435, outputPrice: 0.87, cachePrice: 0.003625 },
  { id: '9', name: 'deepseek-v4-flash', inputPrice: 0.0983, outputPrice: 0.1966, cachePrice: 0.0197 },
  { id: '10', name: 'kimi-k2.6', inputPrice: 0.95, outputPrice: 4.00, cachePrice: 0.25 },
  { id: '11', name: 'glm-5.1', inputPrice: 0.98, outputPrice: 3.08, cachePrice: 0.182 },
  { id: '12', name: 'minimax-m2.7', inputPrice: 0.30, outputPrice: 1.20, cachePrice: 0.06 },
  { id: '13', name: 'gemini-3.1-flash-lite-preview', inputPrice: 0.25, outputPrice: 1.50, cachePrice: 0.025 },
  { id: '14', name: 'gemini-3.1-pro-preview', inputPrice: 2.00, outputPrice: 12.00, cachePrice: 0.20 },
  { id: '15', name: 'minimax-m2.5', inputPrice: 0.15, outputPrice: 1.15, cachePrice: 0.03 },
  { id: '16', name: 'kimi-k2.5', inputPrice: 0.40, outputPrice: 1.90, cachePrice: 0.09 },
  { id: '17', name: 'gemini-3-flash-preview', inputPrice: 0.50, outputPrice: 3.00, cachePrice: 0.05 }
];

const CURSOR_PLANS = [
  { id: 'pro', name: 'Cursor Pro', price: 20 },
  { id: 'pro_plus', name: 'Cursor Pro+', price: 60 },
  { id: 'ultra', name: 'Cursor Ultra', price: 200 }
];

const EMPTY_MODEL_FORM = {
  name: '',
  inputPrice: '',
  outputPrice: '',
  cachePrice: ''
};

/** Acepta punto o coma; permite vacío mientras se escribe. */
const sanitizePriceInput = (raw: string): string => {
  let s = raw.replace(/[^\d.,]/g, '').replace(/,/g, '.');
  const parts = s.split('.');
  if (parts.length > 2) {
    s = parts[0] + '.' + parts.slice(1).join('');
  }
  return s;
};

const parsePriceInput = (raw: string): number | null => {
  const normalized = raw.trim().replace(',', '.');
  if (normalized === '' || normalized === '.') return 0;
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const formatPriceForInput = (n: number): string => {
  if (!Number.isFinite(n)) return '';
  // Evita notación científica y ceros basura
  return String(n);
};

const MONTH_NAMES_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
];

const formatShortDate = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTH_NAMES_ES[m - 1]} ${y}`;
};

const formatDateRangeLabel = (start: string, end: string): string => {
  if (!start || !end) return 'Sin datos';
  if (start === end) return formatShortDate(start);
  
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  
  // Mismo año y mes: "9–30 jun 2026"
  if (sy === ey && sm === em) {
    return `${sd}–${ed} ${MONTH_NAMES_ES[sm - 1]} ${sy}`;
  }
  
  // Mismo año: "9 may – 30 jun 2026"
  if (sy === ey) {
    return `${sd} ${MONTH_NAMES_ES[sm - 1]} – ${ed} ${MONTH_NAMES_ES[em - 1]} ${sy}`;
  }
  
  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
};

type ModelFormState = typeof EMPTY_MODEL_FORM;
type NotificationState = { message: string; type: 'success' | 'error' } | null;

export default function App() {
  const [csvData, setCsvData] = useState(INITIAL_CSV_DATA);
  const [models, setModels] = useState(INITIAL_MODELS);
  const [selectedModelId, setSelectedModelId] = useState('4'); // gemini-3.5-flash por defecto
  const [vsModelAId, setVsModelAId] = useState('4');
  const [vsModelBId, setVsModelBId] = useState('9'); // deepseek-v4-flash por defecto
  const [cursorPlanId, setCursorPlanId] = useState('pro');
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  
  // Referencias y estados para el scroll por arrastre horizontal del gráfico de comparación
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Velocidad de arrastre
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  
  // Modos de formulario para modelos (Agregar / Editar) — precios como string para UX
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modelForm, setModelForm] = useState<ModelFormState>({ ...EMPTY_MODEL_FORM });

  // Notificación local personalizada
  const [notification, setNotification] = useState<NotificationState>(null);
  const notificationTimeoutRef = useRef<number | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ message, type });
    notificationTimeoutRef.current = window.setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const handlePriceFieldChange = (field: 'inputPrice' | 'outputPrice' | 'cachePrice', raw: string) => {
    setModelForm(prev => ({ ...prev, [field]: sanitizePriceInput(raw) }));
  };

  // Modelo actualmente seleccionado
  const activeModel = useMemo(() => {
    const found = models.find(m => m.id === selectedModelId) ?? models[0];
    return found ?? { id: '', name: 'Ninguno', inputPrice: 0, outputPrice: 0, cachePrice: 0 };
  }, [models, selectedModelId]);

  // Manejo de carga de nuevo archivo CSV personalizado
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') return;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        // Mapeo flexible para detectar columnas
        const dateIdx = headers.findIndex(h => h.toLowerCase().includes('date'));
        const inputWithCacheIdx = headers.findIndex(h => h.toLowerCase().includes('input (w/ cache write)'));
        const inputWithoutCacheIdx = headers.findIndex(h => h.toLowerCase().includes('input (w/o cache write)'));
        const cacheReadIdx = headers.findIndex(h => h.toLowerCase().includes('cache read'));
        const outputIdx = headers.findIndex(h => h.toLowerCase().includes('output tokens'));
        
        if (dateIdx === -1) {
          showNotification('Formato inválido. No se detectó columna de fecha (Date).', 'error');
          return;
        }

        const dailyAggregates: Record<string, { input: number; output: number; cache: number; total: number }> = {};

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          // Regex robusto para separar comas respetando comillas
          const cols = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
          if (cols.length < headers.length) continue;

          const rawDate = cols[dateIdx]?.replace(/"/g, '').trim();
          if (!rawDate) continue;

          const dateStr = rawDate.split('T')[0]; // Extrae YYYY-MM-DD
          
          // Parsear valores de tokens de forma segura
          const valInputWithCache = inputWithCacheIdx !== -1 ? parseFloat(cols[inputWithCacheIdx]?.replace(/"/g, '') || '0') : 0;
          const valInputWithoutCache = inputWithoutCacheIdx !== -1 ? parseFloat(cols[inputWithoutCacheIdx]?.replace(/"/g, '') || '0') : 0;
          const valCacheRead = cacheReadIdx !== -1 ? parseFloat(cols[cacheReadIdx]?.replace(/"/g, '') || '0') : 0;
          const valOutput = outputIdx !== -1 ? parseFloat(cols[outputIdx]?.replace(/"/g, '') || '0') : 0;

          const parsedInput = (isNaN(valInputWithCache) ? 0 : valInputWithCache) + (isNaN(valInputWithoutCache) ? 0 : valInputWithoutCache);
          const parsedCache = isNaN(valCacheRead) ? 0 : valCacheRead;
          const parsedOutput = isNaN(valOutput) ? 0 : valOutput;

          if (!dailyAggregates[dateStr]) {
            dailyAggregates[dateStr] = { input: 0, output: 0, cache: 0, total: 0 };
          }

          dailyAggregates[dateStr].input += parsedInput;
          dailyAggregates[dateStr].output += parsedOutput;
          dailyAggregates[dateStr].cache += parsedCache;
          dailyAggregates[dateStr].total += (parsedInput + parsedOutput + parsedCache);
        }

        const sortedData = Object.keys(dailyAggregates).sort().map(date => ({
          date,
          input: dailyAggregates[date].input,
          output: dailyAggregates[date].output,
          cache: dailyAggregates[date].cache,
          total: dailyAggregates[date].total
        }));

        if (sortedData.length > 0) {
          setCsvData(sortedData);
          showNotification(`¡Datos cargados correctamente! ${sortedData.length} días procesados.`, 'success');
        } else {
          showNotification('No se pudieron extraer registros válidos del archivo.', 'error');
        }
      } catch (err) {
        console.error(err);
        showNotification('Ocurrió un error al procesar el archivo CSV.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Cálculos de Tokens Generales
  const stats = useMemo(() => {
    const empty = {
      totalInput: 0, totalOutput: 0, totalCache: 0, totalTokens: 0,
      last30Input: 0, last30Output: 0, last30Cache: 0, last30Tokens: 0,
      startDate: '', endDate: '', spanDays: 0, activeDays: 0,
      last30CoversAll: true, cachePct: 0, inputPct: 0, outputPct: 0
    };

    if (csvData.length === 0) return empty;

    let totalInput = 0;
    let totalOutput = 0;
    let totalCache = 0;

    csvData.forEach(d => {
      totalInput += d.input;
      totalOutput += d.output;
      totalCache += d.cache;
    });

    const totalTokens = totalInput + totalOutput + totalCache;
    const startDate = csvData[0].date;
    const endDate = csvData[csvData.length - 1].date;

    const startMs = new Date(startDate + 'T00:00:00').getTime();
    const endMs = new Date(endDate + 'T00:00:00').getTime();
    const spanDays = Math.max(1, Math.round((endMs - startMs) / 86400000) + 1);
    const activeDays = csvData.filter(d => d.total > 0).length;

    const lastDate = new Date(endDate + 'T00:00:00');
    const thirtyDaysAgo = new Date(lastDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // ventana inclusiva de 30 días

    let last30Input = 0;
    let last30Output = 0;
    let last30Cache = 0;

    csvData.forEach(d => {
      const dDate = new Date(d.date + 'T00:00:00');
      if (dDate >= thirtyDaysAgo && dDate <= lastDate) {
        last30Input += d.input;
        last30Output += d.output;
        last30Cache += d.cache;
      }
    });

    const last30Tokens = last30Input + last30Output + last30Cache;
    const last30CoversAll = spanDays <= 30;

    const pct = (part: number) => (totalTokens > 0 ? (part / totalTokens) * 100 : 0);

    return {
      totalInput,
      totalOutput,
      totalCache,
      totalTokens,
      last30Input,
      last30Output,
      last30Cache,
      last30Tokens,
      startDate,
      endDate,
      spanDays,
      activeDays,
      last30CoversAll,
      cachePct: pct(totalCache),
      inputPct: pct(totalInput),
      outputPct: pct(totalOutput)
    };
  }, [csvData]);

  // Función genérica para calcular costos basados en un modelo específico
  const calculateCost = (input: number, output: number, cache: number, model: { inputPrice: number; outputPrice: number; cachePrice: number }) => {
    const inputCost = (input / 1000000) * model.inputPrice;
    const outputCost = (output / 1000000) * model.outputPrice;
    const cacheCost = (cache / 1000000) * model.cachePrice;
    return inputCost + outputCost + cacheCost;
  };

  const calculateCostBreakdown = (input: number, output: number, cache: number, model: { inputPrice: number; outputPrice: number; cachePrice: number }) => {
    const inputCost = (input / 1000000) * model.inputPrice;
    const outputCost = (output / 1000000) * model.outputPrice;
    const cacheCost = (cache / 1000000) * model.cachePrice;
    const asInputCost = (cache / 1000000) * model.inputPrice;
    return {
      inputCost,
      outputCost,
      cacheCost,
      total: inputCost + outputCost + cacheCost,
      cacheSavings: Math.max(0, asInputCost - cacheCost)
    };
  };

  // Cálculos dinámicos de costos por periodos basados en el modelo activo
  const dynamicCosts = useMemo(() => {
    if (csvData.length === 0) {
      return {
        overall: 0, last30: 0,
        breakdown: { inputCost: 0, outputCost: 0, cacheCost: 0, total: 0, cacheSavings: 0 },
        monthlyProjection: 0
      };
    }
    const overall = calculateCost(stats.totalInput, stats.totalOutput, stats.totalCache, activeModel);
    const last30 = calculateCost(stats.last30Input, stats.last30Output, stats.last30Cache, activeModel);
    const breakdown = calculateCostBreakdown(stats.totalInput, stats.totalOutput, stats.totalCache, activeModel);
    const monthlyProjection = stats.spanDays > 0 ? (overall / stats.spanDays) * 30 : overall;
    return { overall, last30, breakdown, monthlyProjection };
  }, [stats, activeModel, csvData]);

  const activeCursorPlan = useMemo(
    () => CURSOR_PLANS.find(p => p.id === cursorPlanId) || CURSOR_PLANS[0],
    [cursorPlanId]
  );

  const vsModelA = useMemo(
    () => models.find(m => m.id === vsModelAId) || models[0],
    [models, vsModelAId]
  );

  const vsModelB = useMemo(
    () => models.find(m => m.id === vsModelBId) || models[1] || models[0],
    [models, vsModelBId]
  );

  const threeWayCompare = useMemo(() => {
    const span = Math.max(stats.spanDays, 1);
    const toMonthly = (totalCost: number) => (totalCost / span) * 30;

    const aCost = vsModelA
      ? calculateCost(stats.totalInput, stats.totalOutput, stats.totalCache, vsModelA)
      : 0;
    const bCost = vsModelB
      ? calculateCost(stats.totalInput, stats.totalOutput, stats.totalCache, vsModelB)
      : 0;

    const contenders = [
      {
        key: 'a',
        kind: 'api' as const,
        label: vsModelA?.name || 'Modelo A',
        monthly: toMonthly(aCost),
        periodCost: aCost
      },
      {
        key: 'b',
        kind: 'api' as const,
        label: vsModelB?.name || 'Modelo B',
        monthly: toMonthly(bCost),
        periodCost: bCost
      },
      {
        key: 'cursor',
        kind: 'plan' as const,
        label: activeCursorPlan.name,
        monthly: activeCursorPlan.price,
        periodCost: activeCursorPlan.price
      }
    ];

    const minMonthly = Math.min(...contenders.map(c => c.monthly));
    const winnerKeys = contenders
      .filter(c => Math.abs(c.monthly - minMonthly) < 0.0001)
      .map(c => c.key);

    return { contenders, winnerKeys };
  }, [stats, vsModelA, vsModelB, activeCursorPlan]);

  // Encontrar el día más caro basado en el modelo seleccionado
  const mostExpensiveDay = useMemo(() => {
    if (csvData.length === 0) return { date: 'N/A', cost: 0, totalTokens: 0 };
    let maxCost = -1;
    let bestDay: { date: string; cost: number; totalTokens: number } | null = null;

    csvData.forEach(d => {
      const dayCost = calculateCost(d.input, d.output, d.cache, activeModel);
      if (dayCost > maxCost) {
        maxCost = dayCost;
        bestDay = {
          date: d.date,
          cost: dayCost,
          totalTokens: d.total
        };
      }
    });

    return bestDay || { date: 'N/A', cost: 0, totalTokens: 0 };
  }, [csvData, activeModel]);

  // Encontrar la semana más cara basada en el modelo seleccionado
  // Se agrupan los días en semanas ISO
  const mostExpensiveWeek = useMemo(() => {
    if (csvData.length === 0) return { weekStart: 'N/A', cost: 0, totalTokens: 0 };
    
    const weeksMap: Record<string, { input: number; output: number; cache: number; total: number }> = {};

    csvData.forEach(d => {
      const dateObj = new Date(d.date + 'T00:00:00');
      // Obtener el lunes de esa semana
      const day = dateObj.getDay();
      const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(dateObj);
      monday.setDate(diff);
      const weekKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;

      if (!weeksMap[weekKey]) {
        weeksMap[weekKey] = { input: 0, output: 0, cache: 0, total: 0 };
      }

      weeksMap[weekKey].input += d.input;
      weeksMap[weekKey].output += d.output;
      weeksMap[weekKey].cache += d.cache;
      weeksMap[weekKey].total += d.total;
    });

    let maxCost = -1;
    let bestWeekData = { weekStart: 'N/A', cost: 0, totalTokens: 0 };

    Object.keys(weeksMap).forEach(weekStart => {
      const w = weeksMap[weekStart];
      const weekCost = calculateCost(w.input, w.output, w.cache, activeModel);
      if (weekCost > maxCost) {
        maxCost = weekCost;
        bestWeekData = {
          weekStart,
          cost: weekCost,
          totalTokens: w.total
        };
      }
    });

    return bestWeekData;
  }, [csvData, activeModel]);

  // Costos por semana de todos los modelos para comparar y graficar
  const modelComparisons = useMemo(() => {
    return models.map(model => {
      const totalCost = calculateCost(stats.totalInput, stats.totalOutput, stats.totalCache, model);
      const last30Cost = calculateCost(stats.last30Input, stats.last30Output, stats.last30Cache, model);
      return {
        ...model,
        totalCost,
        last30Cost
      };
    }).sort((a, b) => a.totalCost - b.totalCost); // Ordenar de más económico a más caro
  }, [models, stats]);

  // El modelo más conveniente / económico para el volumen de datos actual
  const bestModel = useMemo(() => {
    if (modelComparisons.length === 0) return null;
    return modelComparisons[0]; // Ya ordenados ascendentemente
  }, [modelComparisons]);

  // Gestión de Modelos (CRUD)
  const openAddModelModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setModelForm({ ...EMPTY_MODEL_FORM });
    setIsModelModalOpen(true);
  };

  const handleAddOrUpdateModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelForm.name.trim()) {
      showNotification('Por favor escribe un nombre válido para el modelo.', 'error');
      return;
    }

    const inputPrice = parsePriceInput(modelForm.inputPrice);
    const outputPrice = parsePriceInput(modelForm.outputPrice);
    const cachePrice = parsePriceInput(modelForm.cachePrice);

    if (inputPrice === null || outputPrice === null || cachePrice === null) {
      showNotification('Por favor ingresa precios válidos (números positivos).', 'error');
      return;
    }

    const prices = { inputPrice, outputPrice, cachePrice };

    if (isEditing && editingId) {
      setModels(prev => prev.map(m => m.id === editingId ? { ...m, name: modelForm.name.trim(), ...prices } : m));
      showNotification(`Modelo "${modelForm.name}" actualizado exitosamente.`);
    } else {
      const newModel = {
        id: Date.now().toString(),
        name: modelForm.name.trim(),
        ...prices
      };
      setModels(prev => [...prev, newModel]);
      setSelectedModelId(newModel.id);
      setVsModelAId(newModel.id);
      showNotification(`Modelo "${newModel.name}" agregado y seleccionado.`);
    }

    setIsEditing(false);
    setEditingId(null);
    setModelForm({ ...EMPTY_MODEL_FORM });
    setIsModelModalOpen(false);
  };

  const handleEditClick = (model: typeof INITIAL_MODELS[number]) => {
    setIsEditing(true);
    setEditingId(model.id);
    setModelForm({
      name: model.name,
      inputPrice: formatPriceForInput(model.inputPrice),
      outputPrice: formatPriceForInput(model.outputPrice),
      cachePrice: formatPriceForInput(model.cachePrice)
    });
    setIsModelModalOpen(true);
  };

  const handleDeleteModel = (id: string, name: string) => {
    if (models.length <= 1) {
      showNotification('Debes mantener al menos un modelo de IA en la lista.', 'error');
      return;
    }
    const remaining = models.filter(m => m.id !== id);
    setModels(remaining);
    showNotification(`Modelo "${name}" eliminado.`);
    if (selectedModelId === id) setSelectedModelId(remaining[0].id);
    if (vsModelAId === id) setVsModelAId(remaining[0].id);
    if (vsModelBId === id) setVsModelBId(remaining[Math.min(1, remaining.length - 1)].id);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setModelForm({ ...EMPTY_MODEL_FORM });
    setIsModelModalOpen(false);
  };

  // Formateadores convenientes
  const formatNum = (num: number) => new Intl.NumberFormat('es-ES').format(Math.round(num));
  const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(num);
  const formatPct = (num: number) => `${num.toFixed(1)}%`;

  const dateRangeLabel = formatDateRangeLabel(stats.startDate, stats.endDate);
  const maxCompareCost = Math.max(...modelComparisons.map(m => m.totalCost), 1);
  const bestVsActive = bestModel && bestModel.id !== activeModel.id
    ? dynamicCosts.overall - bestModel.totalCost
    : 0;

  // Variantes de animación para Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.32, 0.72, 0, 1]
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModelModalOpen) {
        handleCancelEdit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModelModalOpen]);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen p-4 md:p-8"
    >
      
      {/* Alerta de Notificaciones */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed top-5 right-5 z-[150] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl transition-all duration-700 ease-premium transform ${
              notification.type === 'error' ? 'bg-rose-500/90 backdrop-blur-md text-white' : 'bg-emerald-500/90 backdrop-blur-md text-white'
            }`}
          >
            <span className="text-lg">{notification.type === 'error' ? '⚠️' : '✅'}</span>
            <span className="font-bold text-sm tracking-tight">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Principal */}
      <motion.header variants={itemVariants} className="max-w-full mx-auto mb-12">
        <div className="double-bezel-shell">
          <div className="double-bezel-core p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 font-bold text-[10px] rounded-full uppercase tracking-[0.2em] ring-1 ring-cyan-500/20">
                  Consumos Reales
                </span>
                <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">
                  {stats.startDate
                    ? `${dateRangeLabel} · ${stats.spanDays} días`
                    : 'Sin datos cargados'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                Token <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Calculator</span>
              </h1>
              <p className="text-slate-500 text-sm md:text-base max-w-2xl leading-relaxed">
                Ingeniería de costos para modelos de IA. Compara tarifas reales contra tu historial de uso y optimiza tu gasto mensual.
              </p>
            </div>

            {/* Subir nuevo CSV */}
            <div className="flex items-center">
              <label className="island-button bg-cyan-500/10 hover:bg-cyan-500/20 ring-cyan-500/20 hover:ring-cyan-500/30 text-cyan-400 cursor-pointer">
                <div className="button-icon-wrapper bg-cyan-500/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">Actualizar CSV</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA ampliada (9 de 12) */}
        <div className="lg:col-span-9 flex flex-col gap-8">

          {/* VS 3-way: Modelo A vs Modelo B vs Cursor */}
          <motion.section variants={itemVariants} className="double-bezel-shell">
            <div className="double-bezel-core p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    Comparativa Directa
                    {threeWayCompare.winnerKeys.length > 1 && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                        Empate
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">
                    Proyección mensual: APIs vs Planes Fijos
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 text-slate-400 bg-white/5 px-3 py-2 rounded-full ring-1 ring-white/10 hover:ring-white/20 transition-all cursor-pointer">
                    <span className="text-cyan-400 font-bold">A</span>
                    <select
                      value={vsModelAId}
                      onChange={(e) => setVsModelAId(e.target.value)}
                      className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
                    >
                      {models.map(m => (
                        <option key={m.id} value={m.id} className="bg-oled text-slate-200">{m.name}</option>
                      ))}
                    </select>
                  </label>
                  <span className="text-slate-700 font-black italic">VS</span>
                  <label className="flex items-center gap-2 text-slate-400 bg-white/5 px-3 py-2 rounded-full ring-1 ring-white/10 hover:ring-white/20 transition-all cursor-pointer">
                    <span className="text-violet-400 font-bold">B</span>
                    <select
                      value={vsModelBId}
                      onChange={(e) => setVsModelBId(e.target.value)}
                      className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
                    >
                      {models.map(m => (
                        <option key={m.id} value={m.id} className="bg-oled text-slate-200">{m.name}</option>
                      ))}
                    </select>
                  </label>
                  <span className="text-slate-700 font-black italic">VS</span>
                  <label className="flex items-center gap-2 text-slate-400 bg-white/5 px-3 py-2 rounded-full ring-1 ring-white/10 hover:ring-white/20 transition-all cursor-pointer">
                    <span className="text-amber-400 font-bold">Plan</span>
                    <select
                      value={cursorPlanId}
                      onChange={(e) => setCursorPlanId(e.target.value)}
                      className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
                    >
                      {CURSOR_PLANS.map(p => (
                        <option key={p.id} value={p.id} className="bg-oled text-slate-200">{p.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {threeWayCompare.contenders.map((c) => {
                  const isWinner = threeWayCompare.winnerKeys.includes(c.key);
                  const accent =
                    c.key === 'a' ? 'cyan' : c.key === 'b' ? 'violet' : 'amber';
                  
                  const accentColors = {
                    cyan: 'from-cyan-500/20 to-cyan-500/5 ring-cyan-500/30 text-cyan-300',
                    violet: 'from-violet-500/20 to-violet-500/5 ring-violet-500/30 text-violet-300',
                    amber: 'from-amber-500/20 to-amber-500/5 ring-amber-500/30 text-amber-300'
                  };

                  return (
                    <div
                      key={c.key}
                      className={`relative rounded-3xl border p-6 transition-all duration-700 ease-premium ${
                        isWinner 
                          ? `bg-gradient-to-br ${accentColors[accent]} ring-1 shadow-2xl shadow-${accent}-500/10` 
                          : 'border-white/5 bg-white/[0.02] grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                      }`}
                    >
                      {isWinner && (
                        <span className={`absolute -top-3 left-6 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                          accent === 'cyan' ? 'bg-cyan-400 text-cyan-950' : 
                          accent === 'violet' ? 'bg-violet-400 text-violet-950' : 
                          'bg-amber-400 text-amber-950'
                        }`}>
                          {threeWayCompare.winnerKeys.length > 1 ? 'Empate' : 'Gana'}
                        </span>
                      )}
                      <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">
                        {c.kind === 'plan' ? 'Suscripción' : `API · ${c.key.toUpperCase()}`}
                      </div>
                      <div className="text-base font-bold text-white truncate mb-4" title={c.label}>
                        {c.label}
                      </div>
                      <div className={`text-3xl font-black font-mono tracking-tighter ${isWinner ? '' : 'text-slate-300'}`}>
                        {formatCurrency(c.monthly)}
                        <span className="text-xs font-sans font-medium text-slate-500 ml-1">/mes</span>
                      </div>
                      {c.kind === 'api' && (
                        <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wider">
                          Período: {formatCurrency(c.periodCost)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-slate-600 mt-6 leading-relaxed uppercase tracking-widest font-bold text-center">
                * Proyección basada en el ritmo de consumo actual. No incluye límites de rate-limit.
              </p>
            </div>
          </motion.section>

          {/* Costo del modelo activo (compacto) */}
          <motion.section variants={itemVariants} className="double-bezel-shell">
            <div className="double-bezel-core p-6 md:p-8 bg-gradient-to-br from-cyan-500/[0.03] to-transparent">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.2em] mb-2 block">
                    Modelo Activo · Análisis de Gasto
                  </span>
                  <h2 className="text-2xl font-black text-white tracking-tight">{activeModel.name}</h2>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-black text-white font-mono tracking-tighter mb-1">
                    {formatCurrency(dynamicCosts.overall)}
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                    ~{formatCurrency(dynamicCosts.monthlyProjection)} / Mes proyectado
                  </p>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 shadow-inner group hover:bg-white/[0.05] transition-all duration-500 ease-premium">
                  <span className="block text-cyan-400 font-bold text-[9px] uppercase tracking-[0.2em] mb-1">Input Tokens</span>
                  <span className="text-xl font-black text-white font-mono tracking-tight group-hover:scale-105 transition-transform origin-left block">{formatCurrency(dynamicCosts.breakdown.inputCost)}</span>
                </div>
                <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 shadow-inner group hover:bg-white/[0.05] transition-all duration-500 ease-premium">
                  <span className="block text-indigo-400 font-bold text-[9px] uppercase tracking-[0.2em] mb-1">Output Tokens</span>
                  <span className="text-xl font-black text-white font-mono tracking-tight group-hover:scale-105 transition-transform origin-left block">{formatCurrency(dynamicCosts.breakdown.outputCost)}</span>
                </div>
                <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 shadow-inner group hover:bg-white/[0.05] transition-all duration-500 ease-premium">
                  <span className="block text-amber-400 font-bold text-[9px] uppercase tracking-[0.2em] mb-1">Cache Tokens</span>
                  <span className="text-xl font-black text-white font-mono tracking-tight group-hover:scale-105 transition-transform origin-left block">{formatCurrency(dynamicCosts.breakdown.cacheCost)}</span>
                </div>
              </div>

              {dynamicCosts.breakdown.cacheSavings > 0 && (
                <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <span className="text-xl">💎</span>
                  <p className="text-xs text-amber-200/80 font-medium">
                    Eficiencia de Cache: Has ahorrado <strong className="text-amber-300">{formatCurrency(dynamicCosts.breakdown.cacheSavings)}</strong> vs procesamiento full input.
                    {bestVsActive > 0.0001 && (
                      <span className="text-slate-500 ml-2">· Costo de oportunidad vs óptimo: +{formatCurrency(bestVsActive)}</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </motion.section>
          
          {/* Grid de Métricas Generales */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            
            {/* Historial Total - Span 2 */}
            <div className="md:col-span-2 xl:col-span-2 double-bezel-shell">
              <div className="double-bezel-core p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Historial Acumulado</span>
                    <p className="text-xs text-cyan-400/80 font-mono mt-1">{dateRangeLabel}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 ring-1 ring-blue-500/20 shadow-lg shadow-blue-500/10">
                    📈
                  </div>
                </div>
                
                <div className="text-4xl font-black text-white font-mono tracking-tighter mb-2">
                  {formatNum(stats.totalTokens)}
                  <span className="text-sm font-sans font-bold text-slate-500 ml-2 uppercase tracking-widest">Tokens</span>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-3 gap-4">
                  <div>
                    <span className="block text-cyan-400 font-bold text-[9px] uppercase tracking-[0.15em] mb-1">IN · {formatPct(stats.inputPct)}</span>
                    <span className="text-sm font-bold text-slate-300 font-mono">{formatNum(stats.totalInput)}</span>
                  </div>
                  <div>
                    <span className="block text-indigo-400 font-bold text-[9px] uppercase tracking-[0.15em] mb-1">OUT · {formatPct(stats.outputPct)}</span>
                    <span className="text-sm font-bold text-slate-300 font-mono">{formatNum(stats.totalOutput)}</span>
                  </div>
                  <div>
                    <span className="block text-amber-400 font-bold text-[9px] uppercase tracking-[0.15em] mb-1">CACHE · {formatPct(stats.cachePct)}</span>
                    <span className="text-sm font-bold text-slate-300 font-mono">{formatNum(stats.totalCache)}</span>
                  </div>
                </div>

                <div className="mt-6 h-1.5 rounded-full overflow-hidden flex bg-white/5 p-[1px]">
                  <div className="bg-cyan-500 rounded-full transition-all duration-1000 ease-premium" style={{ width: `${stats.inputPct}%` }} />
                  <div className="bg-indigo-500 rounded-full transition-all duration-1000 ease-premium" style={{ width: `${stats.outputPct}%` }} />
                  <div className="bg-amber-500 rounded-full transition-all duration-1000 ease-premium" style={{ width: `${stats.cachePct}%` }} />
                </div>
              </div>
            </div>

            {/* Ventana 30 días o CSV */}
            <div className="double-bezel-shell">
              <div className="double-bezel-core p-6">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                    {stats.last30CoversAll ? 'Ventana CSV' : 'Últimos 30 Días'}
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 ring-1 ring-cyan-500/20 shadow-lg shadow-cyan-500/10">
                    📆
                  </div>
                </div>
                
                <div className="text-3xl font-black text-white font-mono tracking-tighter mb-1">
                  {stats.last30CoversAll ? `${stats.spanDays} días` : formatNum(stats.last30Tokens)}
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  {stats.last30CoversAll 
                    ? `Dataset completo en ≤30 días (${stats.activeDays} activos)`
                    : 'Tokens en la ventana de facturación activa'}
                </p>
                
                {!stats.last30CoversAll && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                      <span className="text-cyan-400">IN</span>
                      <span className="text-slate-300 font-mono">{formatNum(stats.last30Input)}</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                      <span className="text-indigo-400">OUT</span>
                      <span className="text-slate-300 font-mono">{formatNum(stats.last30Output)}</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                      <span className="text-amber-400">CACHE</span>
                      <span className="text-slate-300 font-mono">{formatNum(stats.last30Cache)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Día más caro */}
            <div className="double-bezel-shell">
              <div className="double-bezel-core p-6">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Pico de Gasto</span>
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 ring-1 ring-rose-500/20 shadow-lg shadow-rose-500/10">
                    🔥
                  </div>
                </div>
                
                <div className="text-3xl font-black text-white font-mono tracking-tighter mb-1">
                  {formatCurrency(mostExpensiveDay.cost)}
                </div>
                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mb-4">
                  {formatShortDate(mostExpensiveDay.date)}
                </p>
                
                <div className="pt-4 border-t border-white/5 text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em]">
                  Volumen: <span className="text-slate-300 font-mono">{formatNum(mostExpensiveDay.totalTokens)} tokens</span>
                </div>
              </div>
            </div>

            {/* Semana más cara */}
            <div className="double-bezel-shell">
              <div className="double-bezel-core p-6">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Semana Pico</span>
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 ring-1 ring-purple-500/20 shadow-lg shadow-purple-500/10">
                    ⚡
                  </div>
                </div>
                
                <div className="text-3xl font-black text-white font-mono tracking-tighter mb-1">
                  {formatCurrency(mostExpensiveWeek.cost)}
                </div>
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-4">
                  Semana {mostExpensiveWeek.weekStart}
                </p>
                
                <div className="pt-4 border-t border-white/5 text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em]">
                  Volumen: <span className="text-slate-300 font-mono">{formatNum(mostExpensiveWeek.totalTokens)} tokens</span>
                </div>
              </div>
            </div>

          </motion.section>

          {/* Gráfico Comparativo Dinámico de Costos */}
          <motion.section variants={itemVariants} className="double-bezel-shell">
            <div className="double-bezel-core p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <span>📊</span> Comparativa de Gasto Real
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">
                    Proyección del gasto total acumulado en dólares
                  </p>
                </div>

                {bestModel && (
                  <div className="island-button bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 hover:bg-emerald-500/20">
                    <div className="button-icon-wrapper bg-emerald-500/20">
                      <span className="animate-pulse">✨</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Óptimo: {bestModel.name}</span>
                  </div>
                )}
              </div>

              {/* Visualización de Barras de Costo Custom SVG */}
              <div className="w-full mt-2 flex gap-1">
                
                {/* Eje Y Fijo (Etiquetas de costo) */}
                <div className="h-[140px] mt-[30px] flex flex-col justify-between pointer-events-none select-none text-right pr-2 shrink-0">
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                    <span key={i} className="text-[10px] text-slate-500 font-mono w-14 block">
                      {formatCurrency(maxCompareCost * (1 - ratio))}
                    </span>
                  ))}
                </div>

                {/* Contenedor Deslizable de las Barras */}
                <div className="flex-1 relative overflow-hidden">
                  <div 
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className="overflow-x-auto scrollbar-none pb-2 cursor-grab active:cursor-grabbing select-none"
                  >
                    <div 
                      style={{ minWidth: `${Math.max(modelComparisons.length * 85, 500)}px` }}
                      className="relative z-10 flex justify-around items-end h-[220px] pt-4"
                    >
                      {/* Líneas Guía de Fondo */}
                      <div className="absolute inset-x-0 top-[30px] h-[140px] flex flex-col justify-between pointer-events-none">
                        {[0, 0.25, 0.5, 0.75, 1].map((_, i) => (
                          <div key={i} className="w-full border-b border-white/5 border-dashed"></div>
                        ))}
                      </div>

                      {modelComparisons.map((model) => {
                        const heightPercent = Math.max((model.totalCost / maxCompareCost) * 100, 3);
                        const isSelected = model.id === selectedModelId;
                        const isCheapest = model.id === bestModel?.id;

                        return (
                          <div 
                            key={model.id} 
                            className="group flex flex-col items-center flex-1 max-w-[80px] cursor-pointer"
                            onClick={() => setSelectedModelId(model.id)}
                          >
                            {/* Tooltip con desglose en hover */}
                            <div className="absolute mb-[240px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-premium bg-oled/90 backdrop-blur-xl text-slate-200 text-[10px] p-3 rounded-2xl border border-white/10 shadow-2xl pointer-events-none z-50 text-center w-40 transform translate-y-2 group-hover:translate-y-0">
                              <p className="font-bold border-b border-white/10 pb-2 mb-2 text-white">{model.name}</p>
                              <div className="space-y-1 font-mono">
                                <p className="flex justify-between"><span>IN:</span> <span>{formatCurrency((stats.totalInput / 1000000) * model.inputPrice)}</span></p>
                                <p className="flex justify-between"><span>OUT:</span> <span>{formatCurrency((stats.totalOutput / 1000000) * model.outputPrice)}</span></p>
                                <p className="flex justify-between"><span>CA:</span> <span>{formatCurrency((stats.totalCache / 1000000) * model.cachePrice)}</span></p>
                              </div>
                            </div>

                            {/* Contenedor de la Barra */}
                            <div className="h-[140px] w-full flex items-end justify-center relative">
                              <div 
                                style={{ height: `${heightPercent}%` }}
                                className={`w-10 sm:w-12 rounded-t-xl transition-all duration-700 ease-premium relative ${
                                  isCheapest 
                                    ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                                    : isSelected
                                      ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                                      : 'bg-white/10 group-hover:bg-white/20'
                                }`}
                              >
                                <span className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap text-[10px] font-black font-mono tracking-tighter transition-colors ${
                                  isCheapest ? 'text-emerald-400' : isSelected ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                                }`}>
                                  {formatCurrency(model.totalCost)}
                                </span>
                              </div>
                            </div>

                            <span className={`text-[9px] font-bold mt-3 text-center truncate w-full px-1 transition-colors uppercase tracking-wider ${
                              isSelected ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                            }`}>
                              {model.name}
                            </span>
                            
                            <div className="h-4 flex items-center justify-center mt-1">
                              {isCheapest && (
                                <span className="text-[7px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-black uppercase tracking-widest">
                                  Óptimo
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Tabla de análisis por rango temporal para el modelo activo */}
          <motion.section variants={itemVariants} className="double-bezel-shell">
            <div className="double-bezel-core overflow-hidden">
              <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <span>💵</span> Proyección: <span className="text-cyan-400">{activeModel.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">
                    Desglose financiero por períodos
                  </p>
                </div>
                <div className="text-[10px] font-mono bg-white/5 px-4 py-2 rounded-full border border-white/5 text-slate-400 flex gap-4">
                  <span className="flex gap-1">IN <b className="text-slate-200">${activeModel.inputPrice}</b></span>
                  <span className="flex gap-1">OUT <b className="text-slate-200">${activeModel.outputPrice}</b></span>
                  <span className="flex gap-1">CA <b className="text-slate-200">${activeModel.cachePrice}</b></span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.02] text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                    <tr>
                      <th className="px-8 py-5">Rango Temporal</th>
                      <th className="px-8 py-5 text-right">Input</th>
                      <th className="px-8 py-5 text-right">Output</th>
                      <th className="px-8 py-5 text-right">Cache</th>
                      <th className="px-8 py-5 text-right text-white">Costo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6 font-bold text-white flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs">🌐</span>
                        Historial Total
                      </td>
                      <td className="px-8 py-6 text-right font-mono text-slate-400 group-hover:text-slate-200 transition-colors">{formatNum(stats.totalInput)}</td>
                      <td className="px-8 py-6 text-right font-mono text-slate-400 group-hover:text-slate-200 transition-colors">{formatNum(stats.totalOutput)}</td>
                      <td className="px-8 py-6 text-right font-mono text-slate-400 group-hover:text-slate-200 transition-colors">{formatNum(stats.totalCache)}</td>
                      <td className="px-8 py-6 text-right font-mono text-cyan-400 font-black text-lg">
                        {formatCurrency(dynamicCosts.overall)}
                      </td>
                    </tr>
                    <tr className="group hover:bg-white/[0.02] transition-colors bg-white/[0.01]">
                      <td className="px-8 py-6 font-bold text-white flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs">📅</span>
                        {stats.last30CoversAll ? 'Ventana CSV' : 'Últimos 30 Días'}
                      </td>
                      <td className="px-8 py-6 text-right font-mono text-slate-400 group-hover:text-slate-200 transition-colors">{formatNum(stats.last30Input)}</td>
                      <td className="px-8 py-6 text-right font-mono text-slate-400 group-hover:text-slate-200 transition-colors">{formatNum(stats.last30Output)}</td>
                      <td className="px-8 py-6 text-right font-mono text-slate-400 group-hover:text-slate-200 transition-colors">{formatNum(stats.last30Cache)}</td>
                      <td className="px-8 py-6 text-right font-mono text-cyan-400 font-black text-lg">
                        {formatCurrency(dynamicCosts.last30)}
                      </td>
                    </tr>
                    <tr className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6 font-bold text-slate-300 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 text-xs">🔥</span>
                        Pico Diario ({mostExpensiveDay.date})
                      </td>
                      <td className="px-8 py-6 text-right font-mono text-slate-500 group-hover:text-slate-400 transition-colors">
                        {formatNum(csvData.find(d => d.date === mostExpensiveDay.date)?.input || 0)}
                      </td>
                      <td className="px-8 py-6 text-right font-mono text-slate-500 group-hover:text-slate-400 transition-colors">
                        {formatNum(csvData.find(d => d.date === mostExpensiveDay.date)?.output || 0)}
                      </td>
                      <td className="px-8 py-6 text-right font-mono text-slate-500 group-hover:text-slate-400 transition-colors">
                        {formatNum(csvData.find(d => d.date === mostExpensiveDay.date)?.cache || 0)}
                      </td>
                      <td className="px-8 py-6 text-right font-mono text-rose-400 font-black">
                        {formatCurrency(mostExpensiveDay.cost)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        </div>

        {/* COLUMNA DERECHA (3 de 12) */}
        <aside className="lg:col-span-3 flex flex-col gap-8">
          
          {/* Lista Interactiva de Modelos */}
          <motion.section variants={itemVariants} className="double-bezel-shell flex-1 flex flex-col min-h-0">
            <div className="double-bezel-core p-6 flex flex-col min-h-0">
              <div className="mb-6 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Catálogo</h3>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest font-bold">
                    Click para activar
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddModelModal}
                  className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center hover:bg-cyan-500/20 transition-all ring-1 ring-cyan-500/20 active:scale-90"
                >
                  <span className="text-lg">+</span>
                </button>
              </div>

              <div className="space-y-2 overflow-y-auto pr-2 flex-1 scrollbar-none">
                {models.map((model) => {
                  const isSelected = model.id === selectedModelId;
                  const isCheapest = model.id === bestModel?.id;
                  const totalCost = calculateCost(stats.totalInput, stats.totalOutput, stats.totalCache, model);

                  return (
                    <div 
                      key={model.id}
                      onClick={() => setSelectedModelId(model.id)}
                      className={`group relative px-4 py-3 rounded-2xl border transition-all duration-500 ease-premium cursor-pointer ${
                        isSelected 
                          ? 'bg-cyan-500/10 border-cyan-500/30 shadow-lg shadow-cyan-500/5' 
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 min-w-0 mb-1">
                            <h4 className={`font-bold text-[11px] truncate uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                              {model.name}
                            </h4>
                            {isCheapest && (
                              <span className="shrink-0 text-[7px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                                OPT
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-400 transition-colors">
                              ${model.inputPrice}/${model.outputPrice}
                            </span>
                            <strong className={`text-xs font-mono shrink-0 ${isCheapest ? 'text-emerald-400' : isSelected ? 'text-cyan-400' : 'text-slate-300'}`}>
                              {formatCurrency(totalCost)}
                            </strong>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleEditClick(model)}
                            className="p-1 text-slate-500 hover:text-white transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteModel(model.id, model.name)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* Comparativa Cursor Plans */}
          <motion.section variants={itemVariants} className="double-bezel-shell">
            <div className="double-bezel-core p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6">Planes Cursor</h3>
              <div className="space-y-3">
                {CURSOR_PLANS.map((p) => (
                  <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 group hover:bg-white/[0.04] transition-all duration-500 ease-premium">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors uppercase tracking-wider">{p.name}</span>
                      <span className="text-sm font-black text-white font-mono">${p.price}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Suscripción Fija</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        </aside>
      </main>

      {/* Modal para Agregar/Editar Modelo */}
      <AnimatePresence>
        {isModelModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-oled/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="double-bezel-shell w-full max-w-md shadow-2xl shadow-cyan-500/10"
            >
              <div className="double-bezel-core p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {isEditing ? 'Editar Modelo' : 'Nuevo Modelo'}
                  </h2>
                  <button
                    onClick={handleCancelEdit}
                    className="w-10 h-10 rounded-full bg-white/5 text-slate-400 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all active:scale-90"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleAddOrUpdateModel} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Nombre del Modelo</label>
                    <input 
                      type="text" 
                      value={modelForm.name}
                      onChange={(e) => setModelForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej. GPT-4o, Claude 3.5 Sonnet"
                      autoFocus
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Input (1M)</label>
                      <div className="relative">
                        <input 
                          type="text"
                          inputMode="decimal"
                          value={modelForm.inputPrice}
                          onChange={(e) => handlePriceFieldChange('inputPrice', e.target.value)}
                          onFocus={(e) => e.target.select()}
                          placeholder="0.00"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-4 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Output (1M)</label>
                      <div className="relative">
                        <input 
                          type="text"
                          inputMode="decimal"
                          value={modelForm.outputPrice}
                          onChange={(e) => handlePriceFieldChange('outputPrice', e.target.value)}
                          onFocus={(e) => e.target.select()}
                          placeholder="0.00"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-4 text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Cache (1M)</label>
                      <div className="relative">
                        <input 
                          type="text"
                          inputMode="decimal"
                          value={modelForm.cachePrice}
                          onChange={(e) => handlePriceFieldChange('cachePrice', e.target.value)}
                          onFocus={(e) => e.target.select()}
                          placeholder="0.00"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-4 text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row gap-3">
                    <button 
                      type="submit" 
                      className="flex-1 island-button bg-cyan-500 text-cyan-950 hover:bg-cyan-400 ring-cyan-500/50 justify-center"
                    >
                      <span className="text-sm font-black uppercase tracking-widest">
                        {isEditing ? 'Guardar' : 'Crear'}
                      </span>
                    </button>
                    <button 
                      type="button" 
                      onClick={handleCancelEdit}
                      className="flex-1 island-button bg-white/5 text-white hover:bg-white/10 ring-white/10 justify-center"
                    >
                      <span className="text-sm font-black uppercase tracking-widest">Cancelar</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.footer variants={itemVariants} className="max-w-full mx-auto mt-20 pb-12 text-center">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] mb-2">
          © 2026 Token Calculator · High-End Engineering
        </p>
        <div className="flex justify-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/20"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-violet-500/20"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20"></div>
        </div>
      </motion.footer>
    </motion.div>
  );
}