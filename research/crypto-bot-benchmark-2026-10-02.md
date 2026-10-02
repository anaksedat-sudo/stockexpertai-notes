# Crypto Bot Benchmark Raporu — 2026-10-02

**Veri:** Binance spot 15 dakikalık mumlar, BTC/ETH/SOL, **Şubat 2021 – Eylül 2026** (5,7 yıl, coin başına ~197 bin bar).
Veri kaynağı: [Speirsy11/crypto-dataset](https://github.com/Speirsy11/crypto-dataset) (Binance 1m'den türetilmiş). 4 saatlik barlar 15m'den birleştirildi.
Dönem 2021 boğa, 2022 ayı, 2023–24 toparlanma ve 2025–26 piyasasını kapsıyor. Üç coinde aynı 26 veri boşluğu var (en uzunu 16,5 saat; Binance bakım kesintileriyle uyumlu).

**Varsayımlar:** 10.000 USDT başlangıç · işlem başına %1 risk · %0,1 komisyon + 5 bps kayma (gidiş-dönüş ~%0,30) · giriş sinyalden sonraki barın açılışında · stop ve hedef aynı barda değerse önce stop sayılır.

Ham sonuçların tamamı: [`BENCHMARK-raw-2026-10-02.md`](https://github.com/anaksedat-sudo/moonshot/blob/claude/crypto-trading-bot/server/services/crypto-bot/BENCHMARK-raw-2026-10-02.md)

**Yeniden üretmek için:**

```bash
npx tsx scripts/crypto-bot/benchmark.ts --data-dir <csv-klasörü> --random-runs 200
```

Alternatif olarak, internet bağlantısı varsa veri doğrudan Binance'ten de çekilebilir: `npx tsx scripts/crypto-bot/benchmark.ts --days 2000`

---

## 1. Kısa sonuç

1. **v0.1 (ilk tasarım) başarısız.**
   - BTC'de −%12,5, ETH'de +%16, SOL'da +%38 getiri.
   - Aynı dönemde al-tut getirileri: BTC +%105, ETH +%61, SOL +%1.939.
   - Deflated Sharpe her coinde 0,95'in çok altında (0,00 / 0,18 / 0,57). Sonuç şanstan ayırt edilemiyor.
2. **Giriş sinyali işe yarıyor.**
   - Aynı çıkış kurallarıyla rastgele zamanlarda giren 200 denemenin ETH'de %100'ünü, SOL'da %100'ünü, BTC'de %91'ini geçti.
   - Filtrelerin açık olduğu anlarda rastgele giren denemelere göre: SOL %96, ETH %90, BTC %9. BTC'de kırılım tetikleyicisi bir şey katmıyor.
3. **Asıl sorun çıkışlarda.**
   - En çok zararı, 4 saatlik ATR'ye göre 3×ATR mesafeli iz süren stop veriyor; bu mesafe trende göre çok dar.
   - Sadece iz süren stop kapatıldığında Sharpe değerleri şöyle değişiyor: BTC −0,26 → 0,56, ETH 0,35 → 0,87, SOL 0,71 → 1,21.
   - +2R'de %50 kısmi kâr da her üç coinde getiriyi düşürüyor.
4. **Maliyet belirleyici.**
   - Komisyon ve kayma sıfır olsaydı BTC +%22 kazanırdı; gerçek maliyetle −%12.
   - BNB ile ödenen indirimli ücret (%0,075) her coinde açıkça iyileştiriyor.
5. **Aday v0.2** (iz süren stop ve kısmi kâr kapalı, eşik 80):

   | Coin | Sharpe | Getiri | Max DD | Profit factor | DSR |
   |---|---|---|---|---|---|
   | BTC | 0,70 | +%43 | %15 | 1,56 | 0,62 |
   | ETH | 0,95 | +%82 | %15 | 2,09 | 0,66 |
   | SOL | 1,33 | +%216 | %17 | 2,57 | 0,83 |

   - Altı dönemin çoğunda pozitif.
   - **Ancak bu ayar tüm veri görülerek seçildi.** DSR hâlâ 0,95'in altında ve işlem sayıları (139–170) güvenilir sonuç için önerilen 200'ün altında.
   - v0.2 bir **hipotezdir**: ileriye dönük sanal hesap testiyle doğrulanmalı.
6. **Hiçbir ayar al-tut getirisini geçmiyor** (özellikle SOL'un 19 katlık yükselişini).
   - Stratejinin değeri daha düşük düşüşte: max DD %13–20, al-tutta %75–95.
   - Piyasada kalma süresi %30–40. Kalan zamanda para nakitte duruyor.

---

## 2. v0.1 temel sonuçlar ve kıyaslar

| Coin | Strateji getiri | Sharpe | Max DD | İşlem | Kazanma | Ort. R | PF | Al-tut | Rastgele giriş yüzdeliği | DSR | PBO |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BTC | −%12,5 | −0,26 | %20,4 | 435 | %28 | −0,02 | 0,91 | +%105 | %91 | 0,00 | 0,06 |
| ETH | +%16,2 | 0,35 | %14,2 | 350 | %32 | 0,06 | 1,12 | +%61 | %100 | 0,18 | 0,04 |
| SOL | +%37,8 | 0,71 | %13,5 | 353 | %34 | 0,10 | 1,23 | +%1.939 | %100 | 0,57 | 0,26 |

- **PBO düşük (0,04–0,26).** Parametre ızgarasında en iyi görünen ayarın başka dönemde çökme olasılığı düşük; sonuçlar tek bir şanslı noktaya bağlı değil.
- **Izgara sağlamlığı coin'e göre değişiyor.** 36 kombinasyonun pozitif Sharpe verdiği oran: ETH %89, SOL %100, BTC %11.

## 3. Hangi kural ne katıyor? (ablasyon, Sharpe)

| Değişiklik | BTC | ETH | SOL | Yorum |
|---|---|---|---|---|
| v0.1 varsayılan | −0,26 | 0,35 | 0,71 | |
| Başabaş yok | −0,21 | 0,30 | 0,71 | Etkisi nötr |
| Kısmi kâr yok | −0,08 | 0,45 | 0,82 | **Kısmi kâr zarar veriyor** |
| İz süren stop yok | **0,56** | **0,87** | **1,21** | **En büyük iyileşme** |
| 48 saat kuralı yok | −0,21 | 0,34 | 0,69 | Etkisi nötr |
| Ters sinyal çıkışı yok | −0,15 | 0,42 | 0,71 | Hafif olumsuz |
| BTC rejim filtresi yok | – | 0,04 | 0,43 | **Filtre altcoinlerde çok faydalı** |
| Eşik 80 | −0,02 | 0,52 | 0,50 | Karışık |
| Hacim bileşeni yok | −0,17 | 0,36 | 0,78 | Hacim filtresi kanıtlanmadı |
| Volatilite tabanı %1,5 | −0,38 | 0,12 | 0,74 | Faydasız |

**Neden iz süren stop zarar veriyor?**
- 4 saatlik grafikte 3×ATR, normal bir düzeltmenin içinde kalan bir mesafe. Trend devam ederken pozisyon erken kapanıyor, sonra yeniden giriliyor ve her seferinde %0,3 maliyet ödeniyor.
- Ters sinyal çıkışı (EMA20'nin EMA50'nin altına inmesi) zaten daha yavaş ve geniş bir iz süren çıkış gibi çalışıyor.
- Bu, literatürle uyumlu. Dar iz süren stoplar maliyet sonrası getiriyi düşürüyor, geniş olanlar ayakta kalıyor (Dai vd. 2021; Lo & Remorov 2017). Trend takibinde kârın büyük kısmı az sayıdaki büyük işlemden geliyor ve kısmi kâr ile erken başabaş bu kuyruğu kesiyor (Wilcox & Crittenden 2005).

## 4. Maliyet duyarlılığı (Sharpe)

| Senaryo | BTC | ETH | SOL |
|---|---|---|---|
| Maliyetsiz (referans) | 0,49 | 0,91 | 1,12 |
| BNB indirimli %0,075 + 5 bps | −0,12 | 0,44 | 0,77 |
| Varsayılan %0,1 + 5 bps | −0,26 | 0,35 | 0,71 |
| Kötü: %0,1 + 20 bps | −1,01 | −0,21 | 0,32 |
| Çok kötü: %0,2 + 30 bps | −2,03 | −0,99 | −0,20 |

**Pratik sonuç:** Komisyonu BNB ile ödeyin ve piyasa emri yerine mümkünse limit emir kullanın.

## 5. Dönem ve walk-forward

- **Dönem sonuçları (v0.1):**
  - Kötü dönemler: 2022 ayı piyasası (dönem 2) ve 2025–26 (dönem 5–6).
  - İyi dönemler: 2021 ve 2023–24.
  - Bu tipik bir trend takibi davranışı: yatay ve dalgalı piyasada kan kaybediyor.
- **Walk-forward:** Her dönemde ızgaradaki en iyi ayar seçildi ve bir sonraki dönemde test edildi.
  - OOS sonuçlar karışık. Seçim çoğunlukla "trail 4×ATR + eşik 80" yönünde birleşti; bu da v0.2 yönünü destekliyor.
  - Son dönemde (2025-11 – 2026-09) BTC ve SOL'de varsayılan ayar da optimize edilen ayar da negatif. Mevcut piyasa rejimi trend dostu değil.

## 6. Literatürle karşılaştırma

| Kaynak | Ne buldu | Bizim sonuçla ilişkisi |
|---|---|---|
| Zarattini, Pagani & Barbon 2025 (SSRN 5209907) | Günlük Donchian topluluğu, BTC net Sharpe ~1,56, DD ~%19 | v0.2 SOL'da benzer, BTC'de altında. Günlük sinyal + volatilite hedefleme bizim 15m yaklaşımından daha sağlam görünüyor. |
| Hudson & Urquhart 2021 | 15.000 kural, veri madenciliği kontrolünden sonra BTC'de OOS tahmin gücü yok | BTC'deki zayıf sonucumuzla uyumlu |
| Kang & Ryu 2026 | BTC'de yavaş (~12 hafta) sinyaller hızlı sinyalleri geçiyor | 15m tetikleyicinin BTC'de değer katmamasıyla uyumlu |
| Beluská & Vojtko 2024 | BTC'de 20 günlük zirve kırılımı OOS'ta çalışmaya devam ediyor | Kırılım fikrini destekliyor, ama günlük zaman diliminde |
| IsaacDodds (GitHub, 2021–2026) | BTC 200 günlük filtresi düşüşü yarıya indiriyor, alfa yaratmıyor | Bizde de rejim filtresi ETH/SOL'de düşüşü ve kaybı azaltıyor |
| Dai vd. 2021; Lo & Remorov 2017 | Dar iz süren stoplar maliyet sonrası zayıf, geniş olanlar daha iyi | 3×ATR(4h) trail'in zarar vermesiyle birebir uyumlu |
| Mroziewicz & Ślepaczuk 2026 | Walk-forward EMA kuralları al-tut getirisine yakın, daha düşük düşüşle | "İyi" sonucun gerçekçi tanımı: al-tutu geçmek değil, daha az düşüşle yaklaşmak |

**"İyi" ve "şüpheli" sınırları (araştırmaya göre, maliyet sonrası ve OOS):**
- Gerçekçi iyi sonuç: Sharpe 0,7–1,3, PF 1,2–1,6, ortalama R +0,1–0,3, DSR ≥ 0,95, ≥200 OOS işlem.
- Şüpheli sonuç: Sharpe 2'nin üstünde, PF 2,5'in üstünde.
- v0.2'nin SOL'deki PF 2,57 ve ortalama 1,06R değerleri **şüpheli bölgede**. Örneklem içi seçim ve SOL'un olağanüstü 2021–2024 yükselişi bunu açıklıyor olabilir.

## 7. Öneriler

1. **Sanal hesapta v0.2'yi v0.1'le paralel çalıştırın** (`CRYPTO_BOT_PRESET=v02`). En az 8–12 hafta ve en az 30–50 işlem gerekli. Bu süre istatistiksel kanıt için yine yetersiz; amaç hataları ve maliyet farkını görmek.
2. **BNB ile komisyon ödeyin.** BNB indirimini koda maliyet ayarı olarak ekleyelim.
3. **BTC'de bu stratejiyi kullanmayın ya da ağırlığını düşük tutun.** BTC'de giriş sinyali filtrelerin ötesinde değer katmıyor (%9).
4. **Sonraki araştırma adımı:** Literatürde en güçlü kanıt günlük zaman diliminde (Zarattini). Günlük Donchian + volatilite hedefleme varyantını aynı düzenekte test edelim.
5. **Gerçek para için asgari ölçüt:** OOS (ileriye dönük) Sharpe ≥ 0,7, DSR ≥ 0,95 ve ≥ 200 işlem. Bu ölçütlere ulaşılana kadar sadece küçük tutarla deneme.

## 8. Daha akıllı iz süren stop formülleri (ek test)

Tabloda 15 çıkış formülü karşılaştırılıyor; v02 aday çizgisi dahil.

**Ortak ayarlar:** Hepsi v02 girişini kullanıyor (eşik 80, kısmi kâr yok). +1R'de başabaş, 48 saat kuralı ve ters sinyal çıkışı açık (13 ve 14. satırlar hariç).
**"4h kapanışla":** İz süren seviye yalnızca 4 saatlik bar o seviyenin altında kapanınca çıkış yaptırıyor. Borsadaki sert stop başlangıç veya başabaş seviyesinde kalıyor.
**Kod:** `ExitConfig.trailMode` (`atr` | `atr-tighten` | `donchian` | `ema`), `trailOnClose`, `trailActivationR`.

| Formül | BTC Sharpe | ETH Sharpe | SOL Sharpe | Ort. Sharpe | Ort. getiri % | Ort. maks. DD % | Toplam işlem | Pozitif dönem (18'de) | Ort. DSR |
|---|---|---|---|---|---|---|---|---|---|
| 0 v02: iz süren stop yok (trend dönüşüyle çık) | 0.70 | 0.95 | 1.33 | **0.99** | 113.6 | 15.5 | 455 | 13 | 0.86 |
| 1 ATR×3, bar içi (v01 tipi) | 0.18 | 0.55 | 0.65 | **0.46** | 26.0 | 14.2 | 872 | 13 | 0.42 |
| 2 ATR×5, bar içi | 0.28 | 0.89 | 1.19 | **0.79** | 68.6 | 15.4 | 593 | 14 | 0.70 |
| 3 ATR×3, 4h kapanışla | 0.30 | 0.86 | 1.01 | **0.72** | 51.6 | 15.0 | 731 | 14 | 0.66 |
| 4 ATR×5, 4h kapanışla | 0.38 | 0.87 | 1.24 | **0.83** | 78.8 | 15.1 | 535 | 14 | 0.74 |
| 5 ATR×3, +2R sonra aktif | 0.08 | 0.60 | 0.69 | **0.45** | 26.5 | 15.3 | 795 | 12 | 0.42 |
| 6 ATR×3, +2R sonra aktif, kapanışla | 0.27 | 0.83 | 1.03 | **0.71** | 51.1 | 15.3 | 703 | 13 | 0.65 |
| 7 daralan ATR (5→2), kapanışla | 0.25 | 0.87 | 0.89 | **0.67** | 43.2 | 14.7 | 717 | 13 | 0.61 |
| 8 Donchian 10 bar dibi, kapanışla | 0.22 | 0.92 | 1.07 | **0.74** | 56.3 | 14.5 | 761 | 12 | 0.67 |
| 9 Donchian 20 bar dibi, kapanışla | 0.35 | 0.95 | 1.05 | **0.78** | 71.5 | 15.1 | 589 | 12 | 0.71 |
| 10 Donchian 20 bar dibi, bar içi | 0.37 | 0.86 | 1.14 | **0.79** | 71.5 | 14.8 | 662 | 14 | 0.71 |
| 11 EMA20 (4h) altı kapanış | 0.03 | 0.66 | 1.14 | **0.61** | 42.9 | 13.9 | 1190 | 13 | 0.56 |
| 12 EMA50 (4h) altı kapanış | 0.40 | 0.81 | 1.14 | **0.78** | 70.7 | 14.8 | 743 | 15 | 0.71 |
| 13 Donchian 20 kapanış, ters sinyal yok | 0.34 | 0.88 | 1.09 | **0.77** | 71.2 | 15.9 | 574 | 13 | 0.70 |
| 14 EMA50 kapanış, ters sinyal yok | 0.40 | 0.81 | 1.14 | **0.78** | 70.7 | 14.8 | 743 | 15 | 0.71 |

> DSR burada yaklaşık hesaplandı (önceki 59 denemenin dağılımı simüle edildi). Mutlak değerleri değil, sıralamayı esas alın.

**Sonuçlar:**
- **Hiçbir iz süren stop formülü, iz süren stop kullanmamaktan iyi değil.** v02'nin ortalama Sharpe'ı 0,99. Trend dönüş sinyali ile çıkmak (EMA20 < EMA50, kapanış EMA50 altında ve RSI < 45) zaten en iyi "iz süren çıkış" olarak çalışıyor.
- **İz süren stop kullanılacaksa en büyük iyileştirmeler:**
  1. Bar içi fitil yerine **4h kapanışla** tetiklemek. ATR×3'te Sharpe 0,46'dan 0,72'ye çıkıyor.
  2. **Daha geniş mesafe.** ATR×5 ile Sharpe 0,79–0,83.
  3. **Donchian 20 dibi** veya **4h EMA50 altı kapanış**: Sharpe 0,78–0,79.
- **"Akıllı" görünen iki fikir işe yaramadı:**
  - Kâr büyüdükçe stopu daraltmak: 0,67.
  - Stopu +2R'den sonra devreye almak: bar içinde 0,45.
- Literatürle uyumlu: dar stoplar ve kâr arttıkça daralan stoplar, trend takibinin büyük kazançlarını kesiyor.

## 9. Sınırlar

- Tek kaynaklı veri (GitHub'daki veri seti); Binance'in kendi arşiviyle çapraz kontrol edilmedi.
- Coin başına ayrı hesap simüle edildi; ortak portföy (aynı sermayeyle 3 coin) simüle edilmedi.
- Kayma sabit varsayıldı. Gerçek kırılım anlarında kayma daha yüksek olabilir.
- Hayatta kalma yanlılığı var. BTC/ETH/SOL bugün hâlâ büyük olduğu için seçildi; SOL'un 19 katlık yükselişi geriye dönük seçilmiş bir örnek.
- Yapay zeka kapıları (Jev/Claude) test edilmedi; geçmişe dönük testte ezber riski yüzünden yalnızca ileriye dönük test edilebilirler.
