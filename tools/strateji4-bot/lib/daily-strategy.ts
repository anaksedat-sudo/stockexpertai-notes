/**
 * Strateji 4 — 10 coin Donchian topluluğu (günlük).
 *
 * Her coin'e eşit pay. Her payın içinde 9 "bekçi" (5..360 günlük Donchian kanalı):
 * kapanış önceki n günün en yüksek kapanışını aşarsa AL, önceki n/2 günün en düşük
 * kapanışının altına inerse SAT. Coin ağırlığı = (AL'daki bekçi oranı) / coin sayısı.
 * Kalan para USDT'de bekler. Spot, kaldıraçsız.
 *
 * Araştırma ve sonuçlar: moonshot reposu, claude/crypto-trading-bot branch (scripts/crypto-bot/portfolio-research.ts)
 */
import type { Candle } from "./types";
import { alignDaily, donchianEnsemble } from "./portfolio";

export const STRATEGY4_UNIVERSE = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "TRXUSDT", "DOGEUSDT", "ZECUSDT", "ADAUSDT", "BCHUSDT"];
export const STRATEGY4_LOOKBACKS = [5, 10, 20, 30, 60, 90, 150, 250, 360];

/**
 * Son KAPANMIŞ güne göre hedef ağırlıklar. Durum tüm geçmiş yeniden oynatılarak
 * hesaplanır; bu yüzden bot yeniden başlatılsa da aynı sonucu verir.
 */
export function strategy4Targets(series: Record<string, Candle[]>): { day: number; weights: Record<string, number>; signals: Record<string, number> } {
  const ctx = alignDaily(series);
  const last = ctx.days.length - 1;
  const syms = Object.keys(series);
  const avail = syms.filter((s) => ctx.bars[s][last]);
  const signals: Record<string, number> = {};
  for (const s of syms) {
    const state = new Map<number, boolean>();
    let sig = 0;
    for (let i = 0; i <= last; i++) sig = ctx.bars[s][i] ? donchianEnsemble(ctx.bars[s], i, STRATEGY4_LOOKBACKS, state) : 0;
    signals[s] = sig;
  }
  const weights: Record<string, number> = {};
  for (const s of avail) weights[s] = signals[s] / avail.length;
  return { day: ctx.days[last] ?? 0, weights, signals };
}

export interface Order {
  symbol: string;
  side: "BUY" | "SELL";
  /** USDT cinsinden tutar. */
  notional: number;
  qty: number;
  price: number;
}

/**
 * Mevcut bakiyeden hedef ağırlıklara geçiş emirleri. Önce satışlar, sonra alışlar.
 * `minTradeUsd` ve `bandPct` altındaki küçük farklar işlem maliyeti yaratmasın diye atlanır.
 */
export function planRebalance(params: {
  weights: Record<string, number>;
  prices: Record<string, number>;
  holdings: Record<string, number>;
  cash: number;
  /** Botun yöneteceği en fazla özsermaye (USDT). Undefined = tamamı. */
  maxEquity?: number;
  minTradeUsd?: number;
  bandPct?: number;
}): { equity: number; orders: Order[] } {
  const { weights, prices, holdings, cash } = params;
  const minTrade = params.minTradeUsd ?? 10;
  const band = params.bandPct ?? 1;
  const syms = [...new Set([...Object.keys(weights), ...Object.keys(holdings)])].filter((s) => prices[s] > 0);
  const value = (s: string) => (holdings[s] ?? 0) * prices[s];
  const total = cash + syms.reduce((a, s) => a + value(s), 0);
  const equity = Math.min(total, params.maxEquity ?? Infinity);
  const sells: Order[] = [];
  const buys: Order[] = [];
  for (const s of syms) {
    const diff = (weights[s] ?? 0) * equity - value(s);
    if (Math.abs(diff) < Math.max(minTrade, (equity * band) / 100)) continue;
    const price = prices[s];
    if (diff < 0) {
      const qty = Math.min(holdings[s] ?? 0, -diff / price);
      sells.push({ symbol: s, side: "SELL", notional: qty * price, qty, price });
    } else buys.push({ symbol: s, side: "BUY", notional: diff, qty: diff / price, price });
  }
  // Alışlar eldeki nakit + satış gelirini aşmasın (komisyon payı %0.5 bırakılır).
  let budget = (cash + sells.reduce((a, o) => a + o.notional, 0)) * 0.995;
  const fitted: Order[] = [];
  for (const o of buys.sort((a, b) => b.notional - a.notional)) {
    const n = Math.min(o.notional, budget);
    if (n < minTrade) continue;
    fitted.push({ ...o, notional: n, qty: n / o.price });
    budget -= n;
  }
  return { equity, orders: [...sells, ...fitted] };
}
