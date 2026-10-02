/**
 * Günlük portföy backtest'i (spot, long-only, kaldıraçsız).
 *
 * Her gün kapanışta hedef ağırlıklar hesaplanır, ERTESİ GÜNÜN AÇILIŞINDA uygulanır.
 * Ağırlık toplamı ≤ 1; kalan kısım USDT (nakit, getirisi 0).
 * Maliyet: |ağırlık değişimi| × (komisyon + kayma).
 *
 * Ölçüt: BTC'yi alıp hiç dokunmamak (al-tut).
 */
import type { Candle } from "./types";

export type Series = Record<string, Candle[]>;

/** Tüm sembolleri ortak (UTC gün) takvime hizalar; listelenmemiş günler null. */
export function alignDaily(series: Series): { days: number[]; bars: Record<string, (Candle | null)[]> } {
  const set = new Set<number>();
  for (const cs of Object.values(series)) for (const c of cs) set.add(c.openTime);
  const days = [...set].sort((a, b) => a - b);
  const bars: Record<string, (Candle | null)[]> = {};
  for (const [s, cs] of Object.entries(series)) {
    const m = new Map(cs.map((c) => [c.openTime, c]));
    bars[s] = days.map((d) => m.get(d) ?? null);
  }
  return { days, bars };
}

/** Strateji: i. gün KAPANIŞINA kadar bilinen veriyle hedef ağırlıklar. */
export type WeightFn = (i: number, ctx: { days: number[]; bars: Record<string, (Candle | null)[]> }) => Record<string, number>;

export interface PortfolioResult {
  label: string;
  equity: { t: number; v: number }[];
  totalReturnPct: number;
  cagrPct: number;
  maxDrawdownPct: number;
  sharpe: number;
  turnover: number;
  avgExposurePct: number;
  yearly: Record<string, number>;
}

export function runPortfolio(
  label: string,
  ctx: { days: number[]; bars: Record<string, (Candle | null)[]> },
  weightsAt: WeightFn,
  opts: { from: number; to: number; costPerSide?: number },
): PortfolioResult {
  const cost = opts.costPerSide ?? 0.0015;
  const { days, bars } = ctx;
  const syms = Object.keys(bars);
  let w: Record<string, number> = {};
  let v = 1;
  let turnover = 0;
  let expoSum = 0;
  let n = 0;
  const equity: { t: number; v: number }[] = [];
  const start = days.findIndex((d) => d >= opts.from);
  for (let i = Math.max(1, start); i < days.length && days[i] < opts.to; i++) {
    // Dün kapanışta hesaplanan hedef → bugün açılışta uygulanır.
    const target = sanitize(weightsAt(i - 1, ctx), syms, bars, i);
    let r = 0;
    for (const s of syms) {
      const prev = bars[s][i - 1];
      const cur = bars[s][i];
      if (!cur) continue;
      const wOld = w[s] ?? 0;
      const wNew = target[s] ?? 0;
      if (prev && wOld) r += wOld * (cur.open / prev.close - 1); // gece boşluğu eski ağırlıkla
      if (wNew) r += wNew * (cur.close / cur.open - 1);
      turnover += Math.abs(wNew - wOld);
      r -= Math.abs(wNew - wOld) * cost;
    }
    w = target;
    v *= 1 + r;
    expoSum += Object.values(w).reduce((a, b) => a + b, 0);
    n++;
    equity.push({ t: days[i], v });
  }
  return summarizeEquity(label, equity, turnover, n ? (expoSum / n) * 100 : 0);
}

function sanitize(w: Record<string, number>, syms: string[], bars: Record<string, (Candle | null)[]>, i: number) {
  const out: Record<string, number> = {};
  let sum = 0;
  for (const s of syms) {
    const x = w[s] ?? 0;
    if (x > 0 && bars[s][i] && bars[s][i - 1]) {
      out[s] = x;
      sum += x;
    }
  }
  if (sum > 1) for (const s of Object.keys(out)) out[s] /= sum;
  return out;
}

export function summarizeEquity(label: string, equity: { t: number; v: number }[], turnover = 0, avgExposurePct = 100): PortfolioResult {
  const vals = equity.map((e) => e.v);
  let peak = 0;
  let dd = 0;
  for (const x of vals) {
    peak = Math.max(peak, x);
    dd = Math.max(dd, 1 - x / peak);
  }
  const rets = vals.slice(1).map((x, i) => x / vals[i] - 1);
  const mean = rets.reduce((a, b) => a + b, 0) / (rets.length || 1);
  const sd = Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, rets.length - 1));
  const years = equity.length ? (equity[equity.length - 1].t - equity[0].t) / (365.25 * 864e5) : 0;
  const final = vals.length ? vals[vals.length - 1] : 1;
  const yearly: Record<string, number> = {};
  let prevYearEnd = 1;
  let curYear = "";
  for (const e of equity) {
    const y = new Date(e.t).toISOString().slice(0, 4);
    if (y !== curYear && curYear) prevYearEnd = equity[equity.indexOf(e) - 1].v;
    curYear = y;
    yearly[y] = (e.v / prevYearEnd - 1) * 100;
  }
  return {
    label,
    equity,
    totalReturnPct: (final - 1) * 100,
    cagrPct: years > 0 ? (final ** (1 / years) - 1) * 100 : 0,
    maxDrawdownPct: dd * 100,
    sharpe: sd > 0 ? (mean / sd) * Math.sqrt(365) : 0,
    turnover,
    avgExposurePct,
    yearly,
  };
}

// ---------- strateji yapı taşları (yalnızca i. güne kadarki veri) ----------

const closesUpTo = (bars: (Candle | null)[], i: number, n: number): number[] | null => {
  if (i - n + 1 < 0) return null;
  const out: number[] = [];
  for (let k = i - n + 1; k <= i; k++) {
    const b = bars[k];
    if (!b) return null;
    out.push(b.close);
  }
  return out;
};

export function smaAt(bars: (Candle | null)[], i: number, n: number): number {
  const c = closesUpTo(bars, i, n);
  return c ? c.reduce((a, b) => a + b, 0) / n : NaN;
}

export function returnAt(bars: (Candle | null)[], i: number, n: number): number {
  const a = bars[i - n];
  const b = bars[i];
  return a && b ? b.close / a.close - 1 : NaN;
}

/**
 * Donchian topluluk sinyali (0..1). Her lookback n için durum makinesi:
 * kapanış önceki n günün en yüksek kapanışını aşarsa AL; önceki n/2 günün en düşük
 * kapanışının altına inerse SAT. Sinyal = AL durumundaki lookback oranı.
 * Durum, çağrılar arasında `state` içinde tutulur (gün sırasıyla çağrılmalı).
 */
export function donchianEnsemble(bars: (Candle | null)[], i: number, lookbacks: number[], state: Map<number, boolean>): number {
  let on = 0;
  let valid = 0;
  const cur = bars[i];
  if (!cur) return 0;
  for (const n of lookbacks) {
    const hist = closesUpTo(bars, i - 1, n);
    if (!hist) continue;
    valid++;
    const hi = Math.max(...hist);
    const lo = Math.min(...hist.slice(-Math.max(2, Math.floor(n / 2))));
    let s = state.get(n) ?? false;
    if (!s && cur.close > hi) s = true;
    else if (s && cur.close < lo) s = false;
    state.set(n, s);
    if (s) on++;
  }
  return valid ? on / lookbacks.length : 0;
}

/** Oynaklık hedefleme çarpanı: hedef yıllık oynaklık / son `n` günün gerçekleşen oynaklığı, en fazla 1. */
export function volScale(bars: (Candle | null)[], i: number, n: number, targetAnnual: number): number {
  const c = closesUpTo(bars, i, n + 1);
  if (!c) return 0;
  const r = c.slice(1).map((x, k) => Math.log(x / c[k]));
  const m = r.reduce((a, b) => a + b, 0) / r.length;
  const sd = Math.sqrt(r.reduce((a, b) => a + (b - m) ** 2, 0) / (r.length - 1)) * Math.sqrt(365);
  return sd > 0 ? Math.min(1, targetAnnual / sd) : 0;
}
