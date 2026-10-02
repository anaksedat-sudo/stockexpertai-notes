/**
 * Crypto bot — shared types.
 *
 * Bu modül Moonshot sunucusundan bağımsızdır: hiçbir route, DB veya cache
 * kullanmaz. Saf hesaplama (indicators/signal/position/risk/backtest) +
 * ince borsa adaptörleri (paper / Binance spot).
 */

export interface Candle {
  openTime: number; // ms epoch
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number; // ms epoch
}

export type Interval = "1m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "1d";

export const INTERVAL_MS: Record<Interval, number> = {
  "1m": 60_000,
  "5m": 5 * 60_000,
  "15m": 15 * 60_000,
  "30m": 30 * 60_000,
  "1h": 60 * 60_000,
  "2h": 2 * 60 * 60_000,
  "4h": 4 * 60 * 60_000,
  "1d": 24 * 60 * 60_000,
};

export interface CostConfig {
  /** Taker komisyon oranı (Binance spot varsayılan %0.1). */
  feeRate: number;
  /** Market emirlerinde varsayılan kayma (bps). */
  slippageBps: number;
}

export const DEFAULT_COSTS: CostConfig = { feeRate: 0.001, slippageBps: 5 };
