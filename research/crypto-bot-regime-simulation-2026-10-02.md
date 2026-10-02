# Crypto bot: düşüş ve yatay piyasa simülasyonu (2026-10-02)

Gerçek Binance 15m verisi. Başlangıç 10.000 USDT, işlem başına %1 risk, komisyon %0,1 + 5 bps. Her coin ayrı hesapta simüle edildi.
Al-tut maks. düşüş: dönem içindeki en yüksek fiyattan en dip seviyeye kayıp.

### DÜŞÜŞ 1: 2022 ayı piyasası (LUNA, FTX) (2022-01-01 → 2023-01-01)

| Coin | Al-tut | Al-tut maks. düşüş | Ayar | Bot getirisi | Bot maks. düşüş | İşlem | Kazanan | Piyasada % | Çıkış nedenleri |
|---|---|---|---|---|---|---|---|---|---|
| BTC | %-64.2 | %68 | v01 | **%-5.4** | %7.5 | 36 | 12 | 21 | iz süren stop 12, zararı kes 14, 48 saatte +0.5R yok 4, güçlü ters sinyal 2, başabaş stop 4 |
| BTC |  |  | v02 | **%-7.2** | %9.3 | 23 | 2 | 22 | başabaş stop 10, zararı kes 8, 48 saatte +0.5R yok 4, güçlü ters sinyal 1 |
| BTC |  |  | v03 | **%-8.2** | %10.3 | 26 | 3 | 21 | başabaş stop 9, zararı kes 10, 48 saatte +0.5R yok 5, iz süren stop (atr, kapanış) 2 |
| ETH | %-67.5 | %77 | v01 | **%-0.1** | %5.3 | 32 | 11 | 20 | 48 saatte +0.5R yok 4, başabaş stop 6, zararı kes 11, iz süren stop 10, güçlü ters sinyal 1 |
| ETH |  |  | v02 | **%-0.9** | %5.3 | 18 | 4 | 21 | 48 saatte +0.5R yok 3, başabaş stop 6, zararı kes 5, güçlü ters sinyal 4 |
| ETH |  |  | v03 | **%1.4** | %4.7 | 18 | 4 | 20 | 48 saatte +0.5R yok 3, başabaş stop 6, zararı kes 5, iz süren stop (atr, kapanış) 3, güçlü ters sinyal 1 |
| SOL | %-94.1 | %96 | v01 | **%-3.8** | %8.2 | 28 | 5 | 14 | zararı kes 13, iz süren stop 5, güçlü ters sinyal 3, başabaş stop 5, 48 saatte +0.5R yok 2 |
| SOL |  |  | v02 | **%-1.5** | %11.0 | 16 | 1 | 13 | güçlü ters sinyal 3, zararı kes 5, başabaş stop 8 |
| SOL |  |  | v03 | **%-1.2** | %10.8 | 16 | 2 | 13 | iz süren stop (atr, kapanış) 2, zararı kes 5, başabaş stop 7, güçlü ters sinyal 2 |

### DÜŞÜŞ 2: Eki 2025 – Haz 2026 (2025-10-01 → 2026-07-01)

| Coin | Al-tut | Al-tut maks. düşüş | Ayar | Bot getirisi | Bot maks. düşüş | İşlem | Kazanan | Piyasada % | Çıkış nedenleri |
|---|---|---|---|---|---|---|---|---|---|
| BTC | %-48.6 | %54 | v01 | **%-7.2** | %9.3 | 43 | 10 | 25 | iz süren stop 9, başabaş stop 4, zararı kes 22, 48 saatte +0.5R yok 1, güçlü ters sinyal 7 |
| BTC |  |  | v02 | **%-5.2** | %9.5 | 18 | 2 | 27 | başabaş stop 7, zararı kes 8, 48 saatte +0.5R yok 1, güçlü ters sinyal 2 |
| BTC |  |  | v03 | **%-5.1** | %8.0 | 20 | 5 | 26 | iz süren stop (atr, kapanış) 5, başabaş stop 5, zararı kes 9, 48 saatte +0.5R yok 1 |
| ETH | %-62.1 | %68 | v01 | **%-10.2** | %12.2 | 35 | 7 | 23 | iz süren stop 7, zararı kes 18, güçlü ters sinyal 3, 48 saatte +0.5R yok 2, başabaş stop 5 |
| ETH |  |  | v02 | **%-8.1** | %10.5 | 19 | 1 | 23 | başabaş stop 7, güçlü ters sinyal 3, zararı kes 9 |
| ETH |  |  | v03 | **%-8.1** | %10.6 | 20 | 2 | 20 | başabaş stop 7, güçlü ters sinyal 2, zararı kes 9, iz süren stop (atr, kapanış) 2 |
| SOL | %-64.7 | %75 | v01 | **%-8.3** | %11.2 | 24 | 7 | 19 | iz süren stop 6, güçlü ters sinyal 1, zararı kes 12, 48 saatte +0.5R yok 3, başabaş stop 2 |
| SOL |  |  | v02 | **%-7.0** | %9.5 | 15 | 1 | 16 | başabaş stop 5, güçlü ters sinyal 2, zararı kes 7, 48 saatte +0.5R yok 1 |
| SOL |  |  | v03 | **%-6.2** | %8.4 | 16 | 2 | 16 | başabaş stop 4, güçlü ters sinyal 2, zararı kes 7, iz süren stop (atr, kapanış) 2, 48 saatte +0.5R yok 1 |

### YATAY 1: Mar – Eyl 2024 (2024-03-01 → 2024-10-01)

| Coin | Al-tut | Al-tut maks. düşüş | Ayar | Bot getirisi | Bot maks. düşüş | İşlem | Kazanan | Piyasada % | Çıkış nedenleri |
|---|---|---|---|---|---|---|---|---|---|
| BTC | %3.6 | %34 | v01 | **%-1.6** | %6.8 | 48 | 13 | 43 | 48 saatte +0.5R yok 5, iz süren stop 11, başabaş stop 5, zararı kes 11, güçlü ters sinyal 16 |
| BTC |  |  | v02 | **%-6.4** | %9.9 | 22 | 4 | 44 | 48 saatte +0.5R yok 1, başabaş stop 9, güçlü ters sinyal 6, zararı kes 5, backtest sonu 1 |
| BTC |  |  | v03 | **%-7.0** | %10.6 | 25 | 5 | 43 | 48 saatte +0.5R yok 1, başabaş stop 9, iz süren stop (atr, kapanış) 4, zararı kes 7, güçlü ters sinyal 4 |
| ETH | %-22.1 | %48 | v01 | **%-1.1** | %5.5 | 28 | 7 | 29 | 48 saatte +0.5R yok 2, iz süren stop 7, başabaş stop 3, zararı kes 9, güçlü ters sinyal 7 |
| ETH |  |  | v02 | **%0.1** | %7.9 | 16 | 3 | 30 | 48 saatte +0.5R yok 2, başabaş stop 5, güçlü ters sinyal 4, zararı kes 4, backtest sonu 1 |
| ETH |  |  | v03 | **%0.1** | %7.9 | 16 | 3 | 30 | 48 saatte +0.5R yok 2, başabaş stop 5, güçlü ters sinyal 3, zararı kes 4, iz süren stop (atr, kapanış) 1, backtest sonu 1 |
| SOL | %21.3 | %48 | v01 | **%-2.5** | %10.5 | 41 | 12 | 37 | 48 saatte +0.5R yok 2, iz süren stop 11, zararı kes 10, güçlü ters sinyal 14, başabaş stop 4 |
| SOL |  |  | v02 | **%-1.9** | %8.2 | 18 | 3 | 36 | zararı kes 4, 48 saatte +0.5R yok 1, güçlü ters sinyal 7, başabaş stop 5, backtest sonu 1 |
| SOL |  |  | v03 | **%-1.7** | %8.2 | 18 | 3 | 36 | zararı kes 4, 48 saatte +0.5R yok 1, iz süren stop (atr, kapanış) 2, başabaş stop 5, güçlü ters sinyal 5, backtest sonu 1 |

### YATAY 2: Nis – Eyl 2023 (2023-04-01 → 2023-10-01)

| Coin | Al-tut | Al-tut maks. düşüş | Ayar | Bot getirisi | Bot maks. düşüş | İşlem | Kazanan | Piyasada % | Çıkış nedenleri |
|---|---|---|---|---|---|---|---|---|---|
| BTC | %-5.3 | %22 | v01 | **%-5.7** | %5.9 | 41 | 7 | 31 | zararı kes 13, güçlü ters sinyal 11, iz süren stop 7, 48 saatte +0.5R yok 2, başabaş stop 7, backtest sonu 1 |
| BTC |  |  | v02 | **%-4.0** | %5.5 | 20 | 2 | 27 | zararı kes 9, güçlü ters sinyal 5, başabaş stop 4, 48 saatte +0.5R yok 1, backtest sonu 1 |
| BTC |  |  | v03 | **%-3.6** | %5.2 | 21 | 2 | 26 | zararı kes 9, güçlü ters sinyal 3, iz süren stop (atr, kapanış) 2, başabaş stop 5, 48 saatte +0.5R yok 1, backtest sonu 1 |
| ETH | %-8.3 | %29 | v01 | **%-5.7** | %8.5 | 37 | 9 | 27 | zararı kes 12, başabaş stop 2, iz süren stop 7, 48 saatte +0.5R yok 3, güçlü ters sinyal 12, backtest sonu 1 |
| ETH |  |  | v02 | **%-4.8** | %9.1 | 18 | 3 | 27 | zararı kes 5, güçlü ters sinyal 5, 48 saatte +0.5R yok 2, başabaş stop 5, backtest sonu 1 |
| ETH |  |  | v03 | **%-6.2** | %8.9 | 21 | 4 | 25 | zararı kes 5, iz süren stop (atr, kapanış) 2, başabaş stop 6, güçlü ters sinyal 5, 48 saatte +0.5R yok 2, backtest sonu 1 |
| SOL | %1.0 | %51 | v01 | **%-3.3** | %9.4 | 28 | 7 | 24 | iz süren stop 6, zararı kes 12, güçlü ters sinyal 4, başabaş stop 3, 48 saatte +0.5R yok 2, backtest sonu 1 |
| SOL |  |  | v02 | **%-2.7** | %8.3 | 16 | 2 | 23 | zararı kes 7, başabaş stop 6, güçlü ters sinyal 2, backtest sonu 1 |
| SOL |  |  | v03 | **%-2.1** | %8.3 | 17 | 2 | 23 | zararı kes 7, başabaş stop 6, iz süren stop (atr, kapanış) 2, güçlü ters sinyal 1, backtest sonu 1 |

Script: `npx tsx regimes.ts` (moonshot `claude/crypto-trading-bot` branch, `runBacktest` + `PRESETS`).
