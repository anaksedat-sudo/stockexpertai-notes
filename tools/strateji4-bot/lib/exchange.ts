/**
 * Borsa adaptör arayüzü. Motor yalnızca bu arayüzü bilir; paper ve Binance
 * spot aynı sözleşmeyi uygular.
 */
import type { Candle, Interval } from "./types";

export interface Fill {
  qty: number;
  avgPrice: number;
  /** Quote para birimi (USDT) cinsinden komisyon. */
  fee: number;
}

export interface ExchangeAdapter {
  readonly name: string;
  /** Sadece KAPANMIŞ mumlar, eskiden yeniye. */
  getCandles(symbol: string, interval: Interval, limit: number): Promise<Candle[]>;
  /** Serbest USDT bakiyesi. */
  getQuoteBalance(): Promise<number>;
  marketBuy(symbol: string, qty: number): Promise<Fill>;
  marketSell(symbol: string, qty: number): Promise<Fill>;
  /** Borsada bekleyen koruyucu satış stop'u. Emir kimliğini döner. */
  placeStop(symbol: string, qty: number, stopPrice: number): Promise<string>;
  cancelOrder(symbol: string, orderId: string): Promise<void>;
  /**
   * Stop emri dolduysa dolumu döner, dolmadıysa null.
   * Paper adaptör `bar` ile tetiklenmeyi simüle eder; canlı adaptör emir durumunu sorgular.
   */
  syncStop(symbol: string, orderId: string, bar: Candle): Promise<Fill | null>;
}
