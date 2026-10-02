/**
 * Binance spot REST istemcisi — bağımlılıksız (fetch + node:crypto HMAC).
 *
 * Modlar:
 *  - "testnet": https://testnet.binance.vision — sahte para, ayrı API anahtarı
 *  - "live":    https://api.binance.com        — GERÇEK PARA
 *
 * Halka açık uçlar (mum, exchangeInfo) anahtar gerektirmez.
 * ⚠️ İmzalı emir uçları bu oturumda canlı borsaya karşı test EDİLMEDİ;
 * önce testnet'te doğrulanmalı.
 */
import { createHmac } from "node:crypto";
import type { Candle, Interval } from "./types";
import type { ExchangeAdapter, Fill } from "./exchange";

export type BinanceMode = "testnet" | "live";

export const BINANCE_BASE_URL: Record<BinanceMode, string> = {
  testnet: "https://testnet.binance.vision",
  live: "https://api.binance.com",
};

export interface SymbolFilters {
  stepSize: number;
  minQty: number;
  tickSize: number;
  minNotional: number;
  baseAsset: string;
  quoteAsset: string;
}

/** Adım büyüklüğüne AŞAĞI yuvarlar (borsa fazlasını reddeder). */
export function floorToStep(value: number, step: number): number {
  if (!(step > 0)) return value;
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  return Number((Math.floor(value / step + 1e-9) * step).toFixed(decimals));
}

export function parseKlines(rows: unknown[][], now = Date.now()): Candle[] {
  return rows
    .map((r) => ({
      openTime: Number(r[0]),
      open: Number(r[1]),
      high: Number(r[2]),
      low: Number(r[3]),
      close: Number(r[4]),
      volume: Number(r[5]),
      closeTime: Number(r[6]),
    }))
    .filter((c) => c.closeTime < now);
}

export class BinanceClient {
  readonly baseUrl: string;
  private filters = new Map<string, SymbolFilters>();
  /** Sunucu saati − yerel saat (ms). `syncTime()` ile ayarlanır; imzalı isteklerde kullanılır. */
  private timeOffset = 0;

  constructor(
    readonly mode: BinanceMode,
    private apiKey = "",
    private apiSecret = "",
    private recvWindow = 5000,
  ) {
    this.baseUrl = BINANCE_BASE_URL[mode];
  }

  private async request(method: "GET" | "POST" | "DELETE", path: string, params: Record<string, string | number> = {}, signed = false) {
    const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
    const headers: Record<string, string> = {};
    if (signed) {
      if (!this.apiKey || !this.apiSecret) throw new Error("Binance API anahtarı tanımlı değil");
      qs.set("timestamp", String(Date.now() + this.timeOffset));
      qs.set("recvWindow", String(this.recvWindow));
      qs.set("signature", createHmac("sha256", this.apiSecret).update(qs.toString()).digest("hex"));
      headers["X-MBX-APIKEY"] = this.apiKey;
    }
    const res = await fetch(`${this.baseUrl}${path}?${qs.toString()}`, { method, headers });
    const text = await res.text();
    if (!res.ok) throw new Error(`Binance ${method} ${path} ${res.status}: ${text.slice(0, 300)}`);
    return JSON.parse(text);
  }

  async klines(symbol: string, interval: Interval, limit = 500, startTime?: number): Promise<Candle[]> {
    const params: Record<string, string | number> = { symbol, interval, limit };
    if (startTime !== undefined) params.startTime = startTime;
    return parseKlines(await this.request("GET", "/api/v3/klines", params));
  }

  async symbolFilters(symbol: string): Promise<SymbolFilters> {
    const cached = this.filters.get(symbol);
    if (cached) return cached;
    const info = await this.request("GET", "/api/v3/exchangeInfo", { symbol });
    const s = info.symbols?.[0];
    if (!s) throw new Error(`Bilinmeyen sembol: ${symbol}`);
    const f = (type: string) => s.filters.find((x: { filterType: string }) => x.filterType === type) ?? {};
    const lot = f("LOT_SIZE");
    const price = f("PRICE_FILTER");
    const notional = f("NOTIONAL").minNotional ?? f("MIN_NOTIONAL").minNotional ?? 0;
    const out: SymbolFilters = {
      stepSize: Number(lot.stepSize ?? 0),
      minQty: Number(lot.minQty ?? 0),
      tickSize: Number(price.tickSize ?? 0),
      minNotional: Number(notional),
      baseAsset: s.baseAsset,
      quoteAsset: s.quoteAsset,
    };
    this.filters.set(symbol, out);
    return out;
  }

  /** Yerel saat kaymasından kaynaklı -1021 hatalarını önler. */
  async syncTime(): Promise<number> {
    const t0 = Date.now();
    const { serverTime } = await this.request("GET", "/api/v3/time");
    this.timeOffset = Number(serverTime) - Math.round((t0 + Date.now()) / 2);
    return this.timeOffset;
  }

  async tickerPrice(symbol: string): Promise<number> {
    const r = await this.request("GET", "/api/v3/ticker/price", { symbol });
    return Number(r.price);
  }

  /** Serbest bakiyeler (asset → miktar). */
  async balances(): Promise<Record<string, number>> {
    const acc = await this.account();
    const out: Record<string, number> = {};
    for (const b of acc.balances ?? []) out[b.asset] = Number(b.free);
    return out;
  }

  account() {
    return this.request("GET", "/api/v3/account", { omitZeroBalances: "true" }, true);
  }

  newOrder(params: Record<string, string | number>) {
    return this.request("POST", "/api/v3/order", { newOrderRespType: "FULL", ...params }, true);
  }

  cancelOrder(symbol: string, orderId: string) {
    return this.request("DELETE", "/api/v3/order", { symbol, orderId }, true);
  }

  getOrder(symbol: string, orderId: string) {
    return this.request("GET", "/api/v3/order", { symbol, orderId }, true);
  }
}

interface OrderFillRow {
  price: string;
  qty: string;
  commission: string;
  commissionAsset: string;
}

/** FULL emir yanıtından ortalama fiyat ve USDT cinsinden komisyon. */
export function fillFromResponse(resp: { executedQty: string; cummulativeQuoteQty: string; fills?: OrderFillRow[] }, f: SymbolFilters): Fill {
  const qty = Number(resp.executedQty);
  const quote = Number(resp.cummulativeQuoteQty);
  const avgPrice = qty > 0 ? quote / qty : 0;
  let fee = 0;
  let baseFee = 0;
  for (const row of resp.fills ?? []) {
    const c = Number(row.commission);
    if (row.commissionAsset === f.quoteAsset) fee += c;
    else if (row.commissionAsset === f.baseAsset) {
      fee += c * Number(row.price);
      baseFee += c;
    }
    // BNB ile ödenen komisyon burada sıfır sayılır (ayrı bakiyeden düşer).
  }
  return { qty: qty - baseFee, avgPrice, fee };
}

export class BinanceSpotAdapter implements ExchangeAdapter {
  readonly name: string;

  constructor(
    private client: BinanceClient,
    /** Stop tetiklenince limit fiyatı stop'un bu oran kadar altına konur (dolum garantisi için). */
    private stopLimitOffset = 0.005,
  ) {
    this.name = `binance-${client.mode}`;
  }

  getCandles(symbol: string, interval: Interval, limit: number) {
    return this.client.klines(symbol, interval, limit);
  }

  async getQuoteBalance(): Promise<number> {
    const acc = await this.client.account();
    const usdt = acc.balances?.find((b: { asset: string }) => b.asset === "USDT");
    return usdt ? Number(usdt.free) : 0;
  }

  private async order(symbol: string, side: "BUY" | "SELL", qty: number): Promise<Fill> {
    const f = await this.client.symbolFilters(symbol);
    const q = floorToStep(qty, f.stepSize);
    if (q < f.minQty) throw new Error(`${symbol} miktar ${q} < minQty ${f.minQty}`);
    const resp = await this.client.newOrder({ symbol, side, type: "MARKET", quantity: q });
    return fillFromResponse(resp, f);
  }

  marketBuy(symbol: string, qty: number) {
    return this.order(symbol, "BUY", qty);
  }

  marketSell(symbol: string, qty: number) {
    return this.order(symbol, "SELL", qty);
  }

  async placeStop(symbol: string, qty: number, stopPrice: number): Promise<string> {
    const f = await this.client.symbolFilters(symbol);
    const q = floorToStep(qty, f.stepSize);
    const stop = floorToStep(stopPrice, f.tickSize);
    const limit = floorToStep(stopPrice * (1 - this.stopLimitOffset), f.tickSize);
    const resp = await this.client.newOrder({
      symbol,
      side: "SELL",
      type: "STOP_LOSS_LIMIT",
      timeInForce: "GTC",
      quantity: q,
      stopPrice: stop,
      price: limit,
    });
    return String(resp.orderId);
  }

  async cancelOrder(symbol: string, orderId: string): Promise<void> {
    await this.client.cancelOrder(symbol, orderId);
  }

  async syncStop(symbol: string, orderId: string): Promise<Fill | null> {
    const o = await this.client.getOrder(symbol, orderId);
    if (o.status !== "FILLED") return null;
    const qty = Number(o.executedQty);
    const quote = Number(o.cummulativeQuoteQty);
    // Sorgu yanıtında komisyon yok; %0.1 taker varsayımıyla tahmin edilir.
    return { qty, avgPrice: qty > 0 ? quote / qty : 0, fee: quote * 0.001 };
  }
}
