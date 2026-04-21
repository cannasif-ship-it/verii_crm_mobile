type PerfMetric = {
  name: string;
  durationMs: number;
  timestamp: number;
};

type PerfStore = {
  marks: Map<string, number>;
  measures: PerfMetric[];
};

declare global {
  // eslint-disable-next-line no-var
  var __crmMobilePerfMetrics: PerfStore | undefined;
}

function getStore(): PerfStore {
  if (!globalThis.__crmMobilePerfMetrics) {
    globalThis.__crmMobilePerfMetrics = {
      marks: new Map<string, number>(),
      measures: [],
    };
  }

  return globalThis.__crmMobilePerfMetrics;
}

export function perfMark(name: string): void {
  getStore().marks.set(name, Date.now());
}

export function perfMeasure(name: string, startMark: string, endMark: string): number | null {
  const store = getStore();
  const start = store.marks.get(startMark);
  const end = store.marks.get(endMark);

  if (typeof start !== "number" || typeof end !== "number") {
    return null;
  }

  const durationMs = Math.max(0, end - start);
  const metric: PerfMetric = { name, durationMs, timestamp: Date.now() };
  store.measures.push(metric);
  console.log(`[perf] ${name}: ${durationMs.toFixed(2)} ms`);
  return durationMs;
}

export function perfMeasureOnNextPaint(
  name: string,
  startMark: string,
  endMark: string,
): void {
  requestAnimationFrame(() => {
    perfMark(endMark);
    void perfMeasure(name, startMark, endMark);
  });
}

export function clearPerfMarks(...markNames: string[]): void {
  const store = getStore();
  markNames.forEach((markName) => {
    store.marks.delete(markName);
  });
}
