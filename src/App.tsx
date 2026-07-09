import React, { useState, useMemo, useRef } from 'react';

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

  React.useEffect(() => {
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

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModelModalOpen) {
        handleCancelEdit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModelModalOpen]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8 selection:bg-cyan-500 selection:text-slate-900">
      
      {/* Alerta de Notificaciones */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl transition-all transform translate-y-0 scale-100 ${
          notification.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          <span>{notification.type === 'error' ? '⚠️' : '✅'}</span>
          <span className="font-semibold text-sm">{notification.message}</span>
        </div>
      )}

      {/* Header Principal */}
      <header className="max-w-full mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 backdrop-blur-md p-6 rounded-3xl border border-slate-700/60 shadow-xl">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 font-bold text-xs rounded-full uppercase tracking-wider">
                Consumos Reales de CSV
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {stats.startDate
                  ? `${dateRangeLabel} · ${stats.spanDays} días · ${stats.activeDays} con uso`
                  : 'Sin datos cargados'}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
              Calculadora de Costos & Tokens de IA
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Compara tarifas reales de tokens contra tu historial real de uso y escoge la opción más barata.
            </p>
          </div>

          {/* Subir nuevo CSV */}
          <div className="flex items-center">
            <label className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-5 py-3 rounded-2xl cursor-pointer shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="text-sm">Subir otro CSV de Uso</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA ampliada (9 de 12) */}
        <div className="lg:col-span-9 flex flex-col gap-6">

          {/* VS 3-way: Modelo A vs Modelo B vs Cursor */}
          <section className="bg-slate-800/50 p-5 md:p-6 rounded-3xl border border-slate-700/70 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Comparativa directa</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dos modelos API (proyección /mes) contra un plan Cursor. Gana el más barato.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <label className="flex items-center gap-1.5 text-slate-400">
                  <span className="text-cyan-400 font-semibold">A</span>
                  <select
                    value={vsModelAId}
                    onChange={(e) => setVsModelAId(e.target.value)}
                    className="bg-slate-900 border border-slate-600 text-slate-200 rounded-lg px-2 py-1.5 max-w-[160px] focus:outline-none focus:border-cyan-500"
                  >
                    {models.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </label>
                <span className="text-slate-600 font-bold">VS</span>
                <label className="flex items-center gap-1.5 text-slate-400">
                  <span className="text-violet-400 font-semibold">B</span>
                  <select
                    value={vsModelBId}
                    onChange={(e) => setVsModelBId(e.target.value)}
                    className="bg-slate-900 border border-slate-600 text-slate-200 rounded-lg px-2 py-1.5 max-w-[160px] focus:outline-none focus:border-violet-500"
                  >
                    {models.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </label>
                <span className="text-slate-600 font-bold">VS</span>
                <label className="flex items-center gap-1.5 text-slate-400">
                  <span className="text-amber-400 font-semibold">Plan</span>
                  <select
                    value={cursorPlanId}
                    onChange={(e) => setCursorPlanId(e.target.value)}
                    className="bg-slate-900 border border-slate-600 text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-500"
                  >
                    {CURSOR_PLANS.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {threeWayCompare.contenders.map((c) => {
                const isWinner = threeWayCompare.winnerKeys.includes(c.key);
                const accent =
                  c.key === 'a' ? 'cyan' : c.key === 'b' ? 'violet' : 'amber';
                const borderCls = isWinner
                  ? accent === 'cyan'
                    ? 'border-cyan-400/70 bg-cyan-500/10'
                    : accent === 'violet'
                      ? 'border-violet-400/70 bg-violet-500/10'
                      : 'border-amber-400/70 bg-amber-500/10'
                  : 'border-slate-700/60 bg-slate-900/40';
                const priceCls = isWinner
                  ? accent === 'cyan'
                    ? 'text-cyan-300'
                    : accent === 'violet'
                      ? 'text-violet-300'
                      : 'text-amber-300'
                  : 'text-white';

                return (
                  <div
                    key={c.key}
                    className={`relative rounded-2xl border p-4 transition-all ${borderCls}`}
                  >
                    {isWinner && (
                      <span className="absolute -top-2.5 left-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                        Gana
                      </span>
                    )}
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                      {c.kind === 'plan' ? 'Suscripción' : `Modelo ${c.key.toUpperCase()} · API`}
                    </div>
                    <div className="text-sm font-semibold text-slate-200 truncate" title={c.label}>
                      {c.label}
                    </div>
                    <div className={`mt-3 text-2xl font-extrabold font-mono ${priceCls}`}>
                      {formatCurrency(c.monthly)}
                      <span className="text-xs font-sans font-normal text-slate-500 ml-1">/mes</span>
                    </div>
                    {c.kind === 'api' && (
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">
                        período CSV: {formatCurrency(c.periodCost)}
                      </p>
                    )}
                    {c.kind === 'plan' && (
                      <p className="text-[10px] text-slate-500 mt-1">
                        precio fijo del plan
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
              * Las APIs se proyectan a 30 días con el ritmo de tu CSV. El plan Cursor es fijo; no incluye extras ni límites de uso reales.
            </p>
          </section>

          {/* Costo del modelo activo (compacto) */}
          <section className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5 rounded-3xl border border-cyan-500/25 shadow-xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-xs text-cyan-400 font-medium uppercase tracking-wider">Costo proyectado · modelo activo</span>
                <h2 className="text-sm text-slate-300 mt-0.5 font-semibold">{activeModel.name}</h2>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  {formatCurrency(dynamicCosts.overall)}
                </div>
                <p className="text-[11px] text-slate-400">
                  ~{formatCurrency(dynamicCosts.monthlyProjection)}/mes · {formatNum(stats.totalTokens)} tokens
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="bg-slate-950/40 rounded-xl px-3 py-2 border border-slate-700/50">
                <span className="block text-cyan-400 font-semibold text-[10px]">Input</span>
                <span className="text-white font-bold">{formatCurrency(dynamicCosts.breakdown.inputCost)}</span>
              </div>
              <div className="bg-slate-950/40 rounded-xl px-3 py-2 border border-slate-700/50">
                <span className="block text-indigo-400 font-semibold text-[10px]">Output</span>
                <span className="text-white font-bold">{formatCurrency(dynamicCosts.breakdown.outputCost)}</span>
              </div>
              <div className="bg-slate-950/40 rounded-xl px-3 py-2 border border-slate-700/50">
                <span className="block text-amber-400 font-semibold text-[10px]">Cache</span>
                <span className="text-white font-bold">{formatCurrency(dynamicCosts.breakdown.cacheCost)}</span>
              </div>
            </div>
            {dynamicCosts.breakdown.cacheSavings > 0 && (
              <p className="mt-2 text-[11px] text-amber-300/90">
                Ahorro por cache vs input full: <strong>{formatCurrency(dynamicCosts.breakdown.cacheSavings)}</strong>
                {bestVsActive > 0.0001 && (
                  <span className="text-slate-400"> · vs óptimo +{formatCurrency(bestVsActive)}</span>
                )}
              </p>
            )}
          </section>
          
          {/* Grid de Métricas Generales */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all shadow-md sm:col-span-2 xl:col-span-2">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Historial Total</span>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{dateRangeLabel}</p>
                </div>
                <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs">📈</span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">{formatNum(stats.totalTokens)}</div>
              <div className="text-xs text-slate-400 mt-1">tokens procesados en total</div>
              
              <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-3 gap-1 text-[10px] text-slate-400 font-mono">
                <div>
                  <span className="block text-cyan-400 font-semibold">IN · {formatPct(stats.inputPct)}</span>
                  {formatNum(stats.totalInput)}
                </div>
                <div>
                  <span className="block text-indigo-400 font-semibold">OUT · {formatPct(stats.outputPct)}</span>
                  {formatNum(stats.totalOutput)}
                </div>
                <div>
                  <span className="block text-amber-400 font-semibold">CACHE · {formatPct(stats.cachePct)}</span>
                  {formatNum(stats.totalCache)}
                </div>
              </div>

              <div className="mt-3 h-2 rounded-full overflow-hidden flex bg-slate-900/80">
                <div className="bg-cyan-500" style={{ width: `${stats.inputPct}%` }} title={`Input ${formatPct(stats.inputPct)}`} />
                <div className="bg-indigo-500" style={{ width: `${stats.outputPct}%` }} title={`Output ${formatPct(stats.outputPct)}`} />
                <div className="bg-amber-500" style={{ width: `${stats.cachePct}%` }} title={`Cache ${formatPct(stats.cachePct)}`} />
              </div>
              <p className="text-[10px] text-amber-300/80 mt-2">
                Cache = {formatPct(stats.cachePct)} del volumen — el precio de cache define gran parte del ranking.
              </p>
            </div>

            {!stats.last30CoversAll ? (
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Últimos 30 Días</span>
                  <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg text-xs">📆</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">{formatNum(stats.last30Tokens)}</div>
                <div className="text-xs text-slate-400 mt-1">tokens en la ventana activa</div>

                <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-3 gap-1 text-[10px] text-slate-400 font-mono">
                  <div>
                    <span className="block text-cyan-400 font-semibold">IN:</span>
                    {formatNum(stats.last30Input)}
                  </div>
                  <div>
                    <span className="block text-indigo-400 font-semibold">OUT:</span>
                    {formatNum(stats.last30Output)}
                  </div>
                  <div>
                    <span className="block text-amber-400 font-semibold">CACHE:</span>
                    {formatNum(stats.last30Cache)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Ventana del CSV</span>
                  <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg text-xs">📆</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">{stats.spanDays} días</div>
                <div className="text-xs text-slate-400 mt-1">
                  El dataset cabe en ≤30 días: historial y “últimos 30” son el mismo período.
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400">
                  <span className="text-slate-300 font-semibold">{stats.activeDays}</span> días con consumo
                </div>
              </div>
            )}

            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all shadow-md">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Día Más Caro</span>
                <span className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg text-xs">🔥</span>
              </div>
              <div className="text-xl font-bold text-rose-400 font-mono">{formatCurrency(mostExpensiveDay.cost)}</div>
              <div className="text-xs text-slate-300 font-semibold mt-0.5">{mostExpensiveDay.date}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Volumen: <span className="font-mono text-white">{formatNum(mostExpensiveDay.totalTokens)}</span> tokens
              </div>
              <div className="text-[10px] text-cyan-400/80 italic mt-0.5 font-mono">Calculado con {activeModel.name}</div>
            </div>

            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all shadow-md">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Semana Más Cara</span>
                <span className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg text-xs">⚡</span>
              </div>
              <div className="text-xl font-bold text-purple-400 font-mono">{formatCurrency(mostExpensiveWeek.cost)}</div>
              <div className="text-xs text-slate-300 font-semibold mt-0.5">Semana del {mostExpensiveWeek.weekStart}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Volumen: <span className="font-mono text-white">{formatNum(mostExpensiveWeek.totalTokens)}</span> tokens
              </div>
              <div className="text-[10px] text-cyan-400/80 italic mt-0.5 font-mono">Calculado con {activeModel.name}</div>
            </div>

          </section>

          {/* Gráfico Comparativo Dinámico de Costos */}
          <section className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/70 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📊</span> Comparativa de Gasto Real
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proyección del gasto total acumulado en dólares utilizando la carga total de tokens.
                </p>
              </div>

              {bestModel && (
                <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-2">
                  <span className="animate-pulse">✨</span>
                  <span>Opción óptima: <strong>{bestModel.name}</strong></span>
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
                  className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-slate-800/10 pb-2 cursor-grab active:cursor-grabbing select-none"
                >
                  <div 
                    style={{ minWidth: `${Math.max(modelComparisons.length * 85, 500)}px` }}
                    className="relative z-10 flex justify-around items-end h-[220px] pt-4"
                  >
                    {/* Líneas Guía de Fondo (Estiradas por todo el minWidth) */}
                    <div className="absolute inset-x-0 top-[30px] h-[140px] flex flex-col justify-between pointer-events-none">
                      {[0, 0.25, 0.5, 0.75, 1].map((_, i) => (
                        <div key={i} className="w-full border-b border-slate-700/40 border-dashed"></div>
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
                          <div className="absolute mb-[240px] opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-950/95 text-slate-200 text-[10px] p-2.5 rounded-xl border border-slate-600 shadow-2xl pointer-events-none z-50 text-center w-36">
                            <p className="font-bold border-b border-slate-700 pb-1 mb-1 text-white">{model.name}</p>
                            <p>Input: {formatCurrency((stats.totalInput / 1000000) * model.inputPrice)}</p>
                            <p>Output: {formatCurrency((stats.totalOutput / 1000000) * model.outputPrice)}</p>
                            <p>Cache: {formatCurrency((stats.totalCache / 1000000) * model.cachePrice)}</p>
                          </div>

                          {/* Contenedor de la Barra con altura fija para resolver el porcentaje */}
                          <div className="h-[140px] w-full flex items-end justify-center relative">
                            {/* Barra */}
                            <div 
                              style={{ height: `${heightPercent}%` }}
                              className={`w-10 sm:w-12 rounded-t-lg transition-all duration-300 relative ${
                                isCheapest 
                                  ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                                  : isSelected
                                    ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                                    : 'bg-gradient-to-t from-slate-700 to-slate-500/80 group-hover:from-slate-600 group-hover:to-slate-400'
                              }`}
                            >
                              {/* Valor arriba de la barra (Posicionado Absolutamente) */}
                              <span className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap text-[10px] font-bold font-mono transition-colors ${
                                isCheapest ? 'text-emerald-400' : isSelected ? 'text-cyan-400' : 'text-slate-400'
                              }`}>
                                {formatCurrency(model.totalCost)}
                              </span>

                              {/* Destello sutil para la más barata */}
                              {isCheapest && (
                                <div className="absolute inset-x-0 top-0 h-1 bg-white/40 rounded-t-lg"></div>
                              )}
                            </div>
                          </div>

                          {/* Etiqueta / Nombre */}
                          <span className={`text-[9px] font-semibold mt-2.5 text-center truncate w-full px-1 transition-colors ${
                            isSelected ? 'text-cyan-400 font-extrabold' : 'text-slate-400'
                          }`}>
                            {model.name}
                          </span>
                          
                          {/* Badges de condición */}
                          <div className="h-4 flex items-center justify-center">
                            {isCheapest && (
                              <span className="text-[8px] px-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-bold uppercase mt-0.5 tracking-wider">
                                Más Barato
                              </span>
                            )}
                            {!isCheapest && isSelected && (
                              <span className="text-[8px] px-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded font-bold uppercase mt-0.5 tracking-wider">
                                Activo
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
          </section>

          {/* Tabla de análisis por rango temporal para el modelo activo */}
          <section className="bg-slate-800/50 rounded-3xl border border-slate-700/70 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/60 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>💵</span> Costo Proyectado: <span className="text-cyan-400">{activeModel.name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proyección financiera basada en las tarifas del modelo activo.
                </p>
              </div>
              <div className="text-xs font-mono bg-slate-700/50 px-3 py-1.5 rounded-xl border border-slate-600/60 text-slate-300">
                Tarifas por 1M: In ${activeModel.inputPrice} | Out ${activeModel.outputPrice} | Cache ${activeModel.cachePrice}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/40 text-xs text-slate-400 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-6 py-4">Rango Temporal</th>
                    <th className="px-6 py-4 text-right">Tokens Input</th>
                    <th className="px-6 py-4 text-right">Tokens Output</th>
                    <th className="px-6 py-4 text-right">Tokens Cache (Read)</th>
                    <th className="px-6 py-4 text-right font-semibold text-white">Costo Proyectado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  <tr className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                      <span className="text-blue-400 text-base">🌐</span> Todo el Historial
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-300">{formatNum(stats.totalInput)}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-300">{formatNum(stats.totalOutput)}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-300">{formatNum(stats.totalCache)}</td>
                    <td className="px-6 py-4 text-right font-mono text-cyan-400 font-bold text-base">
                      {formatCurrency(dynamicCosts.overall)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-700/20 transition-colors bg-slate-800/20">
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                      <span className="text-cyan-400 text-base">📅</span>
                      {stats.last30CoversAll ? 'Ventana del CSV (≤30 días)' : 'Últimos 30 Días'}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-300">{formatNum(stats.last30Input)}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-300">{formatNum(stats.last30Output)}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-300">{formatNum(stats.last30Cache)}</td>
                    <td className="px-6 py-4 text-right font-mono text-cyan-400 font-bold text-base">
                      {formatCurrency(dynamicCosts.last30)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-300 flex items-center gap-2">
                      <span className="text-purple-400 text-base">🔥</span> Día Más Caro ({mostExpensiveDay.date})
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400">
                      {formatNum(csvData.find(d => d.date === mostExpensiveDay.date)?.input || 0)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400">
                      {formatNum(csvData.find(d => d.date === mostExpensiveDay.date)?.output || 0)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400">
                      {formatNum(csvData.find(d => d.date === mostExpensiveDay.date)?.cache || 0)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-rose-400 font-bold">
                      {formatCurrency(mostExpensiveDay.cost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* COLUMNA DERECHA más angosta (3 de 12) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Lista Interactiva de Modelos */}
          <section className="bg-slate-800/50 p-4 rounded-3xl border border-slate-700/70 shadow-xl flex-1 flex flex-col min-h-0">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white">Modelos</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Click = activo · editar / borrar a la derecha
                </p>
              </div>
              <button
                type="button"
                onClick={openAddModelModal}
                className="shrink-0 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors"
              >
                + Nuevo
              </button>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[min(70vh,720px)] pr-0.5 flex-1">
              {models.map((model) => {
                const isSelected = model.id === selectedModelId;
                const isCheapest = model.id === bestModel?.id;
                const totalCost = calculateCost(stats.totalInput, stats.totalOutput, stats.totalCache, model);

                return (
                  <div 
                    key={model.id}
                    onClick={() => setSelectedModelId(model.id)}
                    className={`px-2.5 py-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-800 border-cyan-500/70' 
                        : 'bg-slate-900/40 border-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className={`font-semibold text-xs truncate ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                            {model.name}
                          </h4>
                          {isCheapest && (
                            <span className="shrink-0 text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-px rounded border border-emerald-500/20">
                              OPT
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline justify-between gap-2 mt-0.5">
                          <span className="text-[9px] font-mono text-slate-500 truncate">
                            ${model.inputPrice}/{model.outputPrice}/{model.cachePrice}
                          </span>
                          <strong className={`text-[11px] font-mono shrink-0 ${isCheapest ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {formatCurrency(totalCost)}
                          </strong>
                        </div>
                      </div>

                      <div className="flex flex-col gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleEditClick(model)}
                          title="Editar"
                          className="p-0.5 text-[11px] text-slate-500 hover:text-cyan-400 transition-colors"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteModel(model.id, model.name)}
                          title="Eliminar"
                          className="p-0.5 text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>

      </main>

      {/* Modal Agregar / Editar Modelo */}
      {isModelModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          onClick={handleCancelEdit}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {isEditing ? 'Editar Modelo' : 'Agregar Nuevo Modelo'}
              </h3>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-slate-400 hover:text-white text-xl leading-none px-2"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddOrUpdateModel} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 font-mono uppercase tracking-wider mb-1.5">
                  Nombre del Modelo
                </label>
                <input 
                  type="text" 
                  value={modelForm.name}
                  onChange={(e) => setModelForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. GPT-4o, Custom Fine-Tuned"
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">
                  Input / 1M tokens (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-mono text-sm">$</span>
                  <input 
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={modelForm.inputPrice}
                    onChange={(e) => handlePriceFieldChange('inputPrice', e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="2.50"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 rounded-xl pl-8 pr-4 py-2.5 text-sm transition-all focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">
                  Output / 1M tokens (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-mono text-sm">$</span>
                  <input 
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={modelForm.outputPrice}
                    onChange={(e) => handlePriceFieldChange('outputPrice', e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="10.00"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 rounded-xl pl-8 pr-4 py-2.5 text-sm transition-all focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">
                  Cache Read / 1M tokens (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-mono text-sm">$</span>
                  <input 
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={modelForm.cachePrice}
                    onChange={(e) => handlePriceFieldChange('cachePrice', e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="1.25"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 rounded-xl pl-8 pr-4 py-2.5 text-sm transition-all focus:outline-none font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Acepta punto o coma (0.15 / 0,15).
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-95"
                >
                  {isEditing ? 'Guardar Cambios' : 'Agregar a la Lista'}
                </button>
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer corporativo */}
      <footer className="max-w-full mx-auto mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 Panel Calculadora de Tokens de IA - Creado para simular con máxima precisión tu patrón de uso.</p>
        <p className="mt-1">Todos los cálculos de precios se realizan bajo demanda y de manera local.</p>
      </footer>

    </div>
  );
}