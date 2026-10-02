/**
 * Strateji 4 botu — günde bir kez portföyü hedef ağırlıklara göre ayarlar.
 * Ek paket gerekmez: yalnızca Node.js 22+ ve `npx tsx`.
 *
 *   npx --yes tsx bot.ts             # sanal hesap, sürekli çalışır (günde 1 işlem)
 *   npx --yes tsx bot.ts --once      # bir kez çalış ve çık
 *   npx --yes tsx bot.ts --status    # sadece durumu ve sinyalleri göster
 *
 * Gerçek para (ALT HESAPTA kullanın — bot hesaptaki bu 10 coin'i kendi portföyü sayar):
 *   CRYPTO_BOT_MODE=live CRYPTO_BOT_LIVE_CONFIRM=yes CRYPTO_BOT_MAX_USDT=500 \
 *   BINANCE_API_KEY=... BINANCE_API_SECRET=... npx --yes tsx bot.ts
 *
 * Ortam değişkenleri:
 *   CRYPTO_BOT_MODE=paper|testnet|live     (varsayılan paper)
 *   CRYPTO_BOT_PAPER_CASH=10000            (sanal başlangıç bakiyesi)
 *   CRYPTO_BOT_MAX_USDT                    (botun yöneteceği en fazla tutar)
 *   CRYPTO_BOT_STATE=.crypto-bot/daily-<mod>.json
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { BinanceClient, floorToStep } from "./lib/binance";
import { planRebalance, strategy4Targets, STRATEGY4_UNIVERSE, type Order } from "./lib/daily-strategy";
import type { Candle } from "./lib/types";

type Mode = "paper" | "testnet" | "live";

interface State {
  mode: Mode;
  startedAt: string;
  startEquity: number;
  startBtcPrice: number;
  lastProcessedDay: number;
  /** Yalnızca paper modunda: sanal bakiye. */
  paper?: { cash: number; holdings: Record<string, number> };
  log: { time: string; day: string; equity: number; btcHoldEquity: number; orders: { symbol: string; side: string; usdt: number }[] }[];
}

const FEE = 0.001;
const SLIP = 0.0005;
const log = (m: string) => console.log(`[strateji4 ${new Date().toISOString().slice(0, 19).replace("T", " ")}] ${m}`);

async function loadState(file: string): Promise<State | undefined> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return undefined;
  }
}

async function saveState(file: string, s: State) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(`${file}.tmp`, JSON.stringify(s, null, 2));
  await fs.rename(`${file}.tmp`, file);
}

async function fetchDaily(market: BinanceClient): Promise<Record<string, Candle[]>> {
  const out: Record<string, Candle[]> = {};
  for (const s of STRATEGY4_UNIVERSE) {
    try {
      out[s] = await market.klines(s, "1d", 1000); // ~2,7 yıl: 360 günlük bekçi için yeterli ısınma
    } catch (e) {
      log(`${s} verisi alınamadı (${(e as Error).message}) — bu tur atlanıyor`);
    }
  }
  return out;
}

async function runOnce(opts: { mode: Mode; stateFile: string; statusOnly: boolean }) {
  const market = new BinanceClient("live"); // fiyat ve mum verisi her zaman gerçek piyasadan
  const trader = opts.mode === "paper" ? undefined : new BinanceClient(opts.mode, process.env.BINANCE_API_KEY ?? "", process.env.BINANCE_API_SECRET ?? "");
  if (trader) await trader.syncTime();

  const series = await fetchDaily(market);
  if (Object.keys(series).length < STRATEGY4_UNIVERSE.length) throw new Error("Eksik veri — güvenlik için işlem yapılmadı");
  const { day, weights, signals } = strategy4Targets(series);
  const dayStr = new Date(day).toISOString().slice(0, 10);

  const prices: Record<string, number> = {};
  for (const s of STRATEGY4_UNIVERSE) prices[s] = await market.tickerPrice(s);

  // Bakiye: paper → dosya, gerçek → borsa (her çalışmada borsadan okunur).
  let state = await loadState(opts.stateFile);
  let cash: number;
  const holdings: Record<string, number> = {};
  if (opts.mode === "paper") {
    const p = state?.paper ?? { cash: Number(process.env.CRYPTO_BOT_PAPER_CASH ?? 10_000), holdings: {} };
    cash = p.cash;
    Object.assign(holdings, p.holdings);
  } else {
    const bal = await trader!.balances();
    cash = bal.USDT ?? 0;
    for (const s of STRATEGY4_UNIVERSE) holdings[s] = bal[s.replace(/USDT$/, "")] ?? 0;
  }

  const maxEquity = process.env.CRYPTO_BOT_MAX_USDT ? Number(process.env.CRYPTO_BOT_MAX_USDT) : undefined;
  const plan = planRebalance({ weights, prices, holdings, cash, maxEquity });
  if (!state) state = { mode: opts.mode, startedAt: new Date().toISOString(), startEquity: plan.equity, startBtcPrice: prices.BTCUSDT, lastProcessedDay: 0, log: [] };
  const btcHold = state.startEquity * (prices.BTCUSDT / state.startBtcPrice);

  console.log("");
  log(`Mod: ${opts.mode} · Son kapanan gün: ${dayStr} · Özsermaye: ${plan.equity.toFixed(2)} USDT`);
  log(`Başlangıçtan beri: bot ${((plan.equity / state.startEquity - 1) * 100).toFixed(2)}% · aynı parayla BTC tutsaydık ${((btcHold / state.startEquity - 1) * 100).toFixed(2)}%`);
  console.log("  Coin       Sinyal   Hedef %   Şu an %");
  for (const s of STRATEGY4_UNIVERSE) {
    const now = plan.equity > 0 ? (((holdings[s] ?? 0) * prices[s]) / plan.equity) * 100 : 0;
    console.log(`  ${s.replace("USDT", "").padEnd(8)} ${`${Math.round(signals[s] * 9)}/9`.padStart(6)}   ${((weights[s] ?? 0) * 100).toFixed(1).padStart(6)}   ${now.toFixed(1).padStart(7)}`);
  }
  const invested = Object.values(weights).reduce((a, b) => a + b, 0);
  console.log(`  Nakit hedefi: %${((1 - invested) * 100).toFixed(1)}`);

  if (opts.statusOnly) return;
  if (state.lastProcessedDay >= day) {
    log(`${dayStr} günü zaten işlendi — yeni gün kapanışı bekleniyor.`);
    return;
  }
  if (!plan.orders.length) log("Hedefe yeterince yakın — işlem gerekmiyor.");

  const done: { symbol: string; side: string; usdt: number }[] = [];
  for (const o of plan.orders) {
    try {
      if (opts.mode === "paper") paperFill(state, o);
      else await liveFill(trader!, o);
      done.push({ symbol: o.symbol, side: o.side, usdt: Math.round(o.notional * 100) / 100 });
      log(`${o.side === "BUY" ? "ALIŞ " : "SATIŞ"} ${o.symbol.replace("USDT", "").padEnd(5)} ${o.notional.toFixed(2)} USDT`);
    } catch (e) {
      log(`${o.symbol} ${o.side} BAŞARISIZ: ${(e as Error).message} — sonraki çalışmada tekrar denenecek`);
    }
  }
  // Tüm emirler başarılı olduysa günü işlenmiş say; aksi halde bir sonraki turda yeniden dener.
  if (done.length === plan.orders.length) state.lastProcessedDay = day;
  state.log.push({ time: new Date().toISOString(), day: dayStr, equity: Math.round(plan.equity * 100) / 100, btcHoldEquity: Math.round(btcHold * 100) / 100, orders: done });
  await saveState(opts.stateFile, state);
}

function paperFill(state: State, o: Order) {
  const p = (state.paper ??= { cash: Number(process.env.CRYPTO_BOT_PAPER_CASH ?? 10_000), holdings: {} });
  if (o.side === "BUY") {
    const px = o.price * (1 + SLIP);
    const qty = (o.notional / px) * (1 - FEE);
    p.cash -= o.notional;
    p.holdings[o.symbol] = (p.holdings[o.symbol] ?? 0) + qty;
  } else {
    const qty = Math.min(o.qty, p.holdings[o.symbol] ?? 0);
    p.cash += qty * o.price * (1 - SLIP) * (1 - FEE);
    p.holdings[o.symbol] = (p.holdings[o.symbol] ?? 0) - qty;
  }
}

async function liveFill(client: BinanceClient, o: Order) {
  const f = await client.symbolFilters(o.symbol);
  if (o.notional < Math.max(f.minNotional, 5)) throw new Error(`asgari tutarın altında (${o.notional.toFixed(2)})`);
  if (o.side === "BUY") {
    await client.newOrder({ symbol: o.symbol, side: "BUY", type: "MARKET", quoteOrderQty: o.notional.toFixed(2) });
  } else {
    const qty = floorToStep(o.qty, f.stepSize);
    if (qty < f.minQty) throw new Error(`miktar ${qty} < minQty ${f.minQty}`);
    await client.newOrder({ symbol: o.symbol, side: "SELL", type: "MARKET", quantity: qty });
  }
}

async function main() {
  const mode = (process.env.CRYPTO_BOT_MODE ?? "paper") as Mode;
  if (mode === "live" && process.env.CRYPTO_BOT_LIVE_CONFIRM !== "yes") throw new Error("Gerçek para için CRYPTO_BOT_LIVE_CONFIRM=yes gerekli.");
  if (mode === "live" && !process.env.CRYPTO_BOT_MAX_USDT) throw new Error("Gerçek parada CRYPTO_BOT_MAX_USDT (en fazla yönetilecek tutar) zorunlu.");
  const stateFile = process.env.CRYPTO_BOT_STATE ?? `.crypto-bot/daily-${mode}.json`;
  const once = process.argv.includes("--once");
  const statusOnly = process.argv.includes("--status");

  const tick = async () => {
    try {
      await runOnce({ mode, stateFile, statusOnly });
    } catch (e) {
      log(`HATA: ${(e as Error).message}`);
    }
  };
  await tick();
  if (once || statusOnly) return;
  log("Bot çalışıyor. Her 30 dakikada yeni gün kapanışı kontrol edilir (kapanış: 03:00 Türkiye saati). Durdurmak için Ctrl+C.");
  setInterval(tick, 30 * 60_000);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
