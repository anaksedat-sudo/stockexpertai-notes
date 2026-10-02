# Günlük stratejiler — BTC al-tut ölçütüyle (2026-10-02)

**Ölçüt:** BTC'yi alıp hiç dokunmamak. "Kat" sütunu, stratejinin bitiş sermayesinin BTC al-tut bitiş sermayesine oranıdır; 1,00× üstü BTC'yi geçti demektir.

**Veri:** Binance spot günlük mumlar, 10 coin: BTC, ETH, SOL, BNB, XRP, TRX, DOGE, ZEC, ADA, BCH.

**Varsayımlar:**
- Sinyal gün kapanışında üretilir, işlem ertesi günün açılışında yapılır.
- Maliyet: her alım ve satımda %0,15.
- Spot işlem, kaldıraç yok. Pozisyonda olmayan para USDT olarak bekler.

**Yöntem:**
- Adaylar literatürden önceden belirlendi.
- Geliştirme dönemi: 2018-03 – 2024-12.
- Test dönemi: 2025-01 – 2026-09. Bu dönem geliştirme sırasında kilitli tutuldu, adaylar burada değiştirilmeden yalnızca bir kez çalıştırıldı.
- Ana aday (Strateji 4) kilitli test çalıştırılmadan önce seçildi.

**Yeniden üretmek için:**

```bash
npx tsx scripts/crypto-bot/portfolio-research.ts --data-dir <klasör> --phase dev|holdout [--exclude SYM,...] [--from YYYY-MM-DD]
```

Script, moonshot reposunun `claude/crypto-trading-bot` branch'inde.
## Geliştirme dönemi: 2018-03-01 → 2024-12-31
| Strateji | Toplam getiri % | BTC al-tut'a göre (kat) | CAGR % | Maks. düşüş % | Sharpe | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Ölçüt: BTC al-tut | 756.8 | 1.00× | 36.9 | 76.6 | 0.81 | -66.1 | 94.3 | 302.0 | 59.8 | -64.2 | 155.6 | 121.3 |
| 1) BTC > SMA200 ise BTC, değilse nakit | 664.3 | 0.89× | 34.6 | 64.4 | 0.88 | -35.0 | 56.9 | 173.3 | -21.7 | 0.0 | 93.8 | 80.8 |
| 2a) BTC Donchian topluluğu (9 dönem) | 742.8 | 0.98× | 36.6 | 49.5 | 1.08 | -12.0 | 67.7 | 139.2 | 31.0 | -27.8 | 55.5 | 62.4 |
| 2b) BTC Donchian + oynaklık hedefi %50 | 568.8 | 0.78× | 32.0 | 41.9 | 1.16 | -9.2 | 68.5 | 109.8 | 13.8 | -24.9 | 49.1 | 63.7 |
| 3) Rotasyon: en güçlü 3 coin (90g), BTC>SMA200 iken, haftalık | 9338.8 | 11.02× | 94.5 | 75.0 | 1.15 | -4.2 | 26.6 | -40.9 | 3158.5 | 0.0 | 51.2 | 167.2 |
| 4) 10 coin Donchian topluluğu, eşit sermaye | 2298.3 | 2.80× | 59.2 | 37.3 | 1.45 | -8.0 | 22.5 | 61.1 | 547.8 | -19.5 | 39.1 | 82.2 |

**Dayanıklılık testi (geliştirme dönemi, DOGE ve SOL hariç):**

| Strateji | Toplam getiri % | BTC al-tut'a göre (kat) | CAGR % | Maks. düşüş % | Sharpe | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Ölçüt: BTC al-tut | 756.8 | 1.00× | 36.9 | 76.6 | 0.81 | -66.1 | 94.3 | 302.0 | 59.8 | -64.2 | 155.6 | 121.3 |
| 1) BTC > SMA200 ise BTC, değilse nakit | 664.3 | 0.89× | 34.6 | 64.4 | 0.88 | -35.0 | 56.9 | 173.3 | -21.7 | 0.0 | 93.8 | 80.8 |
| 2a) BTC Donchian topluluğu (9 dönem) | 742.8 | 0.98× | 36.6 | 49.5 | 1.08 | -12.0 | 67.7 | 139.2 | 31.0 | -27.8 | 55.5 | 62.4 |
| 2b) BTC Donchian + oynaklık hedefi %50 | 568.8 | 0.78× | 32.0 | 41.9 | 1.16 | -9.2 | 68.5 | 109.8 | 13.8 | -24.9 | 49.1 | 63.7 |
| 3) Rotasyon: en güçlü 3 coin (90g), BTC>SMA200 iken, haftalık | 673.5 | 0.90× | 34.9 | 74.7 | 0.81 | -4.2 | 26.6 | -27.4 | 223.1 | 0.0 | 9.4 | 148.3 |
| 4) 10 coin Donchian topluluğu, eşit sermaye | 964.5 | 1.24× | 41.3 | 43.9 | 1.15 | -8.0 | 20.3 | 68.5 | 231.5 | -20.1 | 22.9 | 75.3 |

**Dayanıklılık testi (yalnız 2022–2024):**

| Strateji | Toplam getiri % | BTC al-tut'a göre (kat) | CAGR % | Maks. düşüş % | Sharpe | 2022 | 2023 | 2024 |
|---|---|---|---|---|---|---|---|---|
| Ölçüt: BTC al-tut | 96.1 | 1.00× | 25.2 | 66.9 | 0.68 | -65.3 | 155.6 | 121.3 |
| 1) BTC > SMA200 ise BTC, değilse nakit | 250.3 | 1.79× | 51.9 | 26.0 | 1.33 | 0.0 | 93.8 | 80.8 |
| 2a) BTC Donchian topluluğu (9 dönem) | 81.0 | 0.92× | 21.9 | 28.3 | 0.87 | -28.3 | 55.5 | 62.4 |
| 2b) BTC Donchian + oynaklık hedefi %50 | 82.3 | 0.93× | 22.2 | 25.3 | 0.92 | -25.3 | 49.1 | 63.7 |
| 3) Rotasyon: en güçlü 3 coin (90g), BTC>SMA200 iken, haftalık | 303.9 | 2.06× | 59.3 | 39.6 | 1.23 | 0.0 | 51.2 | 167.2 |
| 4) 10 coin Donchian topluluğu, eşit sermaye | 102.5 | 1.03× | 26.5 | 21.0 | 1.05 | -20.1 | 39.1 | 82.2 |

## KİLİTLİ TEST dönemi: 2025-01-01 → 2026-09-30
| Strateji | Toplam getiri % | BTC al-tut'a göre (kat) | CAGR % | Maks. düşüş % | Sharpe | 2025 | 2026 |
|---|---|---|---|---|---|---|---|
| Ölçüt: BTC al-tut | -11.6 | 1.00× | -6.8 | 52.9 | 0.06 | -7.3 | -4.6 |
| 1) BTC > SMA200 ise BTC, değilse nakit | -2.0 | 1.11× | -1.1 | 32.0 | 0.10 | -18.6 | 20.4 |
| 2a) BTC Donchian topluluğu (9 dönem) | -6.4 | 1.06× | -3.7 | 20.8 | -0.13 | -7.6 | 1.3 |
| 2b) BTC Donchian + oynaklık hedefi %50 | -5.8 | 1.07× | -3.4 | 20.3 | -0.12 | -7.6 | 1.9 |
| 3) Rotasyon: en güçlü 3 coin (90g), BTC>SMA200 iken, haftalık | 163.4 | 2.98× | 74.3 | 42.7 | 1.37 | 86.6 | 41.2 |
| 4) 10 coin Donchian topluluğu, eşit sermaye | 24.0 | 1.40× | 13.1 | 21.1 | 0.65 | 16.2 | 6.7 |

**Kilitli test, ZEC hariç** (ZEC bu dönemde 58 dolardan 1.438 dolara çıktı, yaklaşık 25 kat):

| Strateji | Toplam getiri % | BTC al-tut'a göre (kat) | CAGR % | Maks. düşüş % | Sharpe | 2025 | 2026 |
|---|---|---|---|---|---|---|---|
| Ölçüt: BTC al-tut | -11.6 | 1.00× | -6.8 | 52.9 | 0.06 | -7.3 | -4.6 |
| 1) BTC > SMA200 ise BTC, değilse nakit | -2.0 | 1.11× | -1.1 | 32.0 | 0.10 | -18.6 | 20.4 |
| 2a) BTC Donchian topluluğu (9 dönem) | -6.4 | 1.06× | -3.7 | 20.8 | -0.13 | -7.6 | 1.3 |
| 2b) BTC Donchian + oynaklık hedefi %50 | -5.8 | 1.07× | -3.4 | 20.3 | -0.12 | -7.6 | 1.9 |
| 3) Rotasyon: en güçlü 3 coin (90g), BTC>SMA200 iken, haftalık | 11.0 | 1.26× | 6.1 | 38.9 | 0.35 | -2.6 | 13.9 |
| 4) 10 coin Donchian topluluğu, eşit sermaye | -13.9 | 0.97× | -8.2 | 26.4 | -0.32 | -10.2 | -4.1 |

## Sonuç

- **Strateji 4 (10 coin Donchian topluluğu) en sağlam aday.**
  - Geliştirme döneminde BTC'nin 2,80 katı kazandırdı. DOGE ve SOL çıkarılınca 1,24 kat, yalnız 2022–2024'te 1,03 kat.
  - Kilitli testte 1,40 kat. Bu dönemde BTC −%11,6, strateji +%24 getirdi.
  - En büyük düşüşü her dönemde BTC'nin yaklaşık yarısı ya da daha azı oldu.
- **Kilitli testteki üstünlüğün kaynağı tek bir coin.** ZEC'in yaklaşık 25 kat yükselişi çıkarılınca Strateji 4, BTC ile başa baş kalıyor (0,97 kat); yine de en büyük düşüşü BTC'nin yarısı.
  - Trend takibi zaten böyle çalışır: kazanç az sayıdaki büyük hareketten gelir.
  - Ancak coin listesi bugün seçildi. ZEC'in listede olması hayatta kalma yanlılığı riski taşıyor.
- **Rotasyon (Strateji 3) kırılgan.** Sonucu büyük ölçüde DOGE, SOL ve ZEC'e bağlı; bu coinler çıkarılınca BTC'nin altına düşebiliyor.
- **Yalnızca BTC üzerinde çalışan stratejiler (1, 2a, 2b)** düşüşü azaltıyor ama uzun vadede BTC al-tut getirisini geçmiyor.

## Bilinen sınırlar

- **Coin listesi bugünkü büyük coinlerden oluşuyor.** Gerçek uygulamada liste her tarihte o günün hacim sıralamasına göre seçilmeli; bu veri elimizde yok.
- **Tek veri kaynağı:** GitHub'daki bir veri seti. Binance'in kendi arşiviyle karşılaştırılmadı.
- **Kilitli dönem tamamen kör değildi.** Bu oturumda BTC'nin aylık fiyatları daha önce görüldü. Strateji parametreleri ise o veriye göre ayarlanmadı.
