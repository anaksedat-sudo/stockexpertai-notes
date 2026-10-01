# Trading Bot Araştırma Raporu (2026-08-01 – 2026-10-01)

> **Hazırlanma tarihi:** 2026-10-01
> **Güncellik penceresi:** 2026-08-01 – 2026-10-01
> **Hedef:** Pozisyonları saatlerden birkaç güne kadar tutan otomatik bir swing botu. Çıkışlar ATR tabanlı olacak, Claude Opus 5.5 döngüde kullanılacak ve bot mevcut TypeScript "Moonshot" kod tabanının üzerine kurulacak.
> **Lejant:** ✅ pencere içinde doğrulandı · ⚠️ belirsiz ya da dolaylı · ❌ pencere dışı
> **Kanıt düzeyleri:** güçlü / orta / zayıf / yok

---

## 1. Yönetici özeti

1. **LLM'ler tek başına kâr getiren bir sinyal üretmiyor.**
   - Penceredeki en kapsamlı kanıt DXRG'nin üretim kaydı. Yalnızca DXAP filosunda (8 Haziran – 15 Ağustos) 231.638 karar turu ve 14.596 dolum var; bu dolumların 5.035'i gerçek parayla yapıldı. Terminal Pro dağıtımı ayrıca yaklaşık 7,5 milyon çağrı içeriyor. Kayıt, filonun "yönsel bir üstünlük göstermediğini" açıkça yazıyor.
   - TradingAgents'ın tek bağımsız tekrarında ajan al-tut'a kaybetti: ajan −%0,9, al-tut +%15,7.
   - LLM sentiment'inin getiri öngörüsü, çoklu test düzeltmesinden sonra anlamlı çıkmıyor.
   - Maliyetler düşüldükten sonra ve örneklem dışında al-tut'u yenen, doğrulanmış bir LLM ajanı bulunamadı.
2. **Asıl fark çıkış ve risk mekaniğinden geliyor.**
   - DXRG'de pozisyonların %43,2'si 24 saat içinde +300 bps kâra ulaştı, ama bunların %49,3'ü yine zararla kapandı. Medyan kâr yakalama oranı %2,0'da kaldı.
   - Girişte konan sabit bir stop/hedef paranteziyle pozisyon başına ortalama +39,0 bps eklendi.
   - Sizin çıkış tasarımınız (2×ATR stop, +1R'de başabaş, yalnız yukarı giden ATR trail, +2R'de %50 kâr alma, 48 saat kuralı) tam olarak bu sorunu hedefliyor. Doğru yoldasınız.
   - ATR tabanlı çıkışlar için bağımsız bir kanıt doğrulanamadı. Bu kanıtı kendi ablasyon testimizle üretmemiz gerekiyor (madde 5).
3. **Claude'un yeri analiz, filtre ve açıklama; emir ve çıkış değil.**
   - Sektörde yaygın kalıp "LLM önerir, deterministik kod karar verir" (QuantDinger, ccxt-mcp, NOFX, alpaca-gatekeeper).
   - Claude girişte yalnızca veto ya da onay versin. Claude hata verir, zaman aşımına uğrar ya da `refusal` döndürürse giriş yapılmasın (fail-closed).
   - Çıkışlar hiçbir koşulda LLM'e bağlı olmasın.
4. **Önerilen çekirdek TypeScript ile yazılmalı.**
   - Moonshot'a eklenecekler:
     - `trading-signals`: ATR, NATR, ChandelierExit.
     - Borsa bağlantısı: kripto için `ccxt`; Binance için `@binance/spot`, Bybit TR için `sieblyio/bybit-api` ya da CCXT. ABD hisse için `@alpacahq/alpaca-trade-api`.
   - LLM katmanı için düz `@anthropic-ai/sdk` (MIT) yeterli. Kullanılacak yapılar:
     - Zod şemasıyla `messages.parse` (structured outputs),
     - cache'lenen sabit bir sistem promptu,
     - açıkça ayarlanmış `effort`.
     - Karar başına maliyet yaklaşık $0,01 artı thinking token'ları.
   - Claude Agent SDK isteğe bağlı. Lisansı tescilli, native Claude Code ikili dosyalarını da getiriyor; tek bir veto çağrısı için gereğinden ağır.
   - Onay eşiği, günlük işlem tavanı ve günlük zarar freni kodda tutulsun.
   - Yürütme açısından kritik bar ve ATR verisi broker ya da borsa beslemesinden alınsın. Yahoo (yahoo-finance2) Ağustos 2026'da bozuldu; v4 sürümü Node 22+ istiyor, `@binance/spot` ise Node ≥ 22.12.
5. **Doğrulama, Python yan araçlarıyla çevrimdışı yapılmalı.**
   - vectorbt 1.1.1 ve PyBroker 2.0.1: Çıkış merdiveninin her parçası için ablasyon testi yapılmalı. Maliyetler (komisyon + spread) dahil edilmeli, walk-forward uygulanmalı.
   - Jesse: Girişlerin rastgele girişlere karşı anlamlılık testi.
   - quantstats ve vectorbt: PSR ve deflated Sharpe.
   - freqtrade dry-run: Kripto için referans paper motoru.
6. **Türkiye kısıtı piyasa seçimini belirliyor.**
   - Doğrulanan TR kripto borsaları arasında borsa tarafı stop'u en iyi belgelenen **Bybit TR**. Güncel resmi V5 dokümanı (2026-09-29) spot'ta borsada bekleyen koşullu emirleri ve TP/SL'yi tanımlıyor. Ancak TR testnet'i yok; ücretleri ve lisans durumu doğrulanmadı.
   - **BtcTurk'ün kendi API dokümanı** `stopLimit` ve `stopMarket` emirlerini tanımlıyor. Ancak okunabilen doküman 2019 tarihli; güncel docs.btcturk.com açılamadı ⚠️. CCXT bu alanları ham parametre olarak geçirebiliyor (canlı test edilmedi). OCO ve trailing emri dokümante değil.
   - Binance TR ve Paribu için CCXT modülü yok; emir tipleri doğrulanamadı.
   - BIST: Deniz Yatırım'ın AlgoLab API'si 31.12.2025'te kapandı. Açık ve doğrulanabilir bir BIST emir API'si bulunamadı.
   - Alpaca, IBKR, Binance global, OKX ve Bybit TR için Türkiye'den hesap açılabilirliği ve lisans durumu doğrulanamadı. SPK listesi ve 7518 sayılı Kanun metni de açılamadı.
7. **"jev" büyük olasılıkla TypeSafe AI'ın Eylül 2026'da çıkan "Jev" (System One) karar modeli.**
   - Fiyat tahmini yapmıyor; ucuz, tipli çıktı veren bir sınıflandırıcı.
   - Doğrulanabilir bir işlem kanıtı yok. Gerçek parayla çalıştığı söylenen bir topluluk portu var (aowang-ai/jev-trade), ama P&L'i görülmedi.
   - Kullanılacaksa paper ortamında, deneysel olarak ve fail-closed çalışmalı.
   - Bunu sizden teyit etmemiz gerekiyor (Bölüm 7).
8. **Hugging Face zaman serisi modelleri giriş sinyali olarak kullanılmamalı.**
   - **Chronos-2** (MOEX ön-kayıtlı çalışması) ve **Kronos** (OpenAlpha ön-kayıtlı testi, kronos-evaluation) bağımsız testlerde yön tahmininde yazı-tura düzeyinde kaldı.
   - **TimesFM 3** için bağımsız bir yön testi yok; yalnızca rakip KiT'in RankIC tablosu ve doğrulanamayan arXiv rakamları var. Model ağırlıkları da ticari kullanıma kapalı.
   - **TTM** yön tahmininde değil, gerçekleşmiş volatilite tahmininde test edildi. Bağımsız replikasyonun sonucu karışık.
   - Bu modeller en fazla, volatilite tahmininde ATR'ye rakip olarak denenebilir.
9. **Bloomberg Terminal'e erişilemedi.**
   - Pratik açık kaynak alternatifler: OpenBB V5 (Apache-2.0, MCP 2.0) ve FinceptTerminal.
   - Kurumsal veri (FactSet, LSEG, S&P vb.) Claude'a `anthropics/financial-services` MCP bağlayıcılarıyla bağlanabilir, ancak pahalı abonelik gerektirir.
10. **İlk adım paper trading olmalı.**
    - Süre: 4–8 hafta.
    - Karşılaştırma: "kural + Claude" botu ile "yalnız kural" botu, aynı zaman penceresinde ve aynı maliyet varsayımıyla.
    - Getiri vaat eden hiçbir "AI trading bot" ürününe güvenmeyin.

---

## 2. Yöntem ve sınırlar

**Taranan kaynak aileleri (8):**
1. GitHub: yürütme ve backtest framework'leri
2. GitHub: LLM ajan sistemleri ve MCP sunucuları
3. Hugging Face: zaman serisi ve finans modelleri
4. Bloomberg ve basın
5. Makaleler ve canlı/paper benchmark'lar
6. Broker, borsa ve veri API'leri
7. Risk ve çıkış araçlarına ilişkin kanıtlar
8. Claude ekosistemi

Her aile önce tarandı, ardından ayrı bir doğrulama turundan geçti. Sonra 8 açık konu için ek bir **boşluk doldurma turu** yapıldı:
- TR kripto borsaları
- BIST
- Türkiye'den ABD piyasalarına erişim
- Claude SDK seçimi
- Qlib ve RD-Agent
- Veri kaynakları
- HF model kartları
- ATR çıkışlarına dair kanıt

Bu rapor yalnızca doğrulanmış korpusa dayanıyor.

**Güncelliğin doğrulanması:**
- Tarihler şu kaynaklardan alındı:
  - github.com'daki `/commits` ve `/tags` sayfaları
  - PyPI JSON `upload_time` alanı ve npm registry yayın zamanları
  - Boşluk doldurma turunda bazı repoların `git clone` ile alınan commit geçmişi
- api.github.com 403 döndü.
- Önemli bir yöntem bulgusu: WebFetch özetleyicisi GitHub release sayfalarında yılları sistematik olarak yanlış gösterdi (2026 sürümlerini 2024 veya 2025 olarak). Bu yüzden her tarih commits, tags ya da PyPI/npm kaydıyla çapraz kontrol edildi.

**Kanıt derecelendirmesi:**
- **Güçlü:** Uzun bakım geçmişi, çok sayıda katkıcı ve yaygın kullanım; ya da resmi satıcı; ya da bağımsız veya ön-kayıtlı bir değerlendirme.
- **Orta:** Makul düzeyde kullanılıyor ama genç; ya da tek kaynaklı ama ayrıntılı veri.
- **Zayıf:** Küçük veya yeni proje, satıcı beyanı ya da tek kişilik çalışma.
- **Yok:** Demo, pazarlama ya da sonuç yayımlanmamış.

> ⚠️ **Kritik uyarı:** Listedeki hiçbir araç ya da bot denetlenmiş bir canlı işlem performansına sahip değil. Araçlar için "güçlü kanıt", yazılımın olgunluğunu ve yaygın kullanımını gösterir. "Para kazandırır" anlamına gelmez.

**Erişilemeyen kaynaklar:**
- **Bloomberg Terminal'e erişim yoktu.** Yalnızca kamuya açık Bloomberg materyali denendi; bloomberg.com da egress proxy tarafından engellendi. Bu yüzden Bloomberg kaynaklı hiçbir iddia ilk elden doğrulanamadı.
- Engellenen diğer alan adları:
  - **Araştırma ve modeller:** arxiv.org, export.arxiv.org, api.semanticscholar.org, huggingface.co, SSRN, doi.org, quantpedia.com, quantifiedstrategies.com
  - **Jev:** typesafe.ai (docs ve evals alt alan adları dahil)
  - **Kripto borsaları:** binance.com, www.binance.tr, developers.binance.com, okx.com, www.btcturk.com, docs.btcturk.com, www.paribu.com
  - **ABD broker ve veri:** alpaca.markets, docs.alpaca.markets, www.interactivebrokers.com, sec.gov, data.sec.gov, finnhub.io
  - **Türk resmi kaynakları ve BIST:** spk.gov.tr, mevzuat.gov.tr, resmigazete.gov.tr, kap.org.tr, borsaistanbul.com, matriksdata.com, idealdata.com.tr, algolab.com.tr; Deniz, Gedik, İş Yatırım ve Midas siteleri
  - **Diğer:** nof1.ai, techcrunch, fortune, cnbc, wikipedia
- Doğrulama turunda WebSearch kotası (200/200) tükendi. Boşluk doldurma turu bu yüzden yalnızca WebFetch, GitHub HTML sayfaları, git clone ve npm/PyPI kayıtlarıyla yapıldı.

**Belirsiz kalanlar:**
- Türkiye'den hesap açılabilirliği: Alpaca, IBKR, Binance global, OKX, Bybit TR. alpaca-docs reposunda ülke listesi yok.
- BtcTurk'ün güncel API'sinde stop emir tipleri (yalnızca 2019 dokümanı okunabildi).
- Bybit TR'nin ücretleri, TRY çiftleri ve Türk hukukundaki lisans durumu.
- Binance TR ve Paribu'nun emir tipleri ve testnet'i.
- Borsa ve broker ücretleri.
- SPK listesi ve 7518 sayılı Kanun.
- Jev'in fiyatı, gecikmesi ve finansman iddiaları.
- Alpha Arena rakamları.
- arXiv makale metinleri. Rakamlar repo README'lerinden, DXRG için ise PDF metninden alındı.
- HF model kartları ve ağırlık lisansları (bu turda da açılamadı).
- ATR, Chandelier, başabaş ve zaman stop'ları için bağımsız kanıt.
- Akademik klasikler (Barber & Odean, Kaminski & Lo vb.); bu oturumda yeniden doğrulanmadılar.
- BIST aracı kurum API'leri: AlgoLab kapandı; Matriks IQ ve İdeal doğrulanamadı.

---

## 3. "Ne gerçekten işe yarıyor?"

### 3.1 LLM ajanları maliyetler düşüldükten sonra al-tut'u yeniyor mu?

**Kısa cevap: Kanıtlanmadı.**

| Kaynak | Ortam | Sonuç | Not |
|---|---|---|---|
| [DXRG üretim kaydı](https://github.com/ProjectDXAI/continuous-record-llm-trading-agents) (arXiv 2609.05663) | İki dağıtım, toplam yaklaşık 90 gün. Hyperliquid perp ve memecoin.<br>**Sayıların kapsamı:** PDF'i okuyan doğrulamaya göre 231.638 tur ve 14.596 dolum (5.035'i gerçek para) **yalnızca DXAP filosuna** ait (8 Haziran – 15 Ağustos). Terminal Pro ayrıca yaklaşık 7,5 milyon çağrı yaptı.<br>⚠️ Bir basın kaydı aynı rakamları "iki dağıtım genelinde" diye veriyor; bu çelişki çözülmedi. | "Filo düzeyinde yönsel üstünlük görülmedi."<br>Kazanma oranı: filo %41, Hyperliquid perakende %50 (son 4 gün).<br>Net pozitif hesaplar: %15'e karşı %53 (son 1 hafta).<br>Kümülatif P&L: 5,5 bps ücretle −$217K, ücretsiz −$148K (8 Haziran – 26 Temmuz). | Platform operatörünün kendi yayını. Hakemli değil. DXAP dolumlarının yaklaşık üçte ikisi paper. |
| [TradingAgents bağımsız tekrarı](https://github.com/Kantamaniprakash/trading-agents-lab) | Anonimleştirilmiş AAPL. 1 Mart – 1 Haziran 2026, 64 işlem günü, 10 bp maliyet. | Ajan −%0,9, al-tut +%15,7.<br>Sharpe −1,21'e karşı 2,66.<br>Karar günü başına yaklaşık $3,70 maliyet. | 0 yıldız, tek kaynak, hakemsiz. |
| TradingAgents makalesi (arXiv 2412.20138) | Ocak – Mart 2024 | CR %26,62, Sharpe 8,21 | ⚠️ Doğrulanamadı. Kısa pencere, örneklem-içi niteliğinde. |
| [AI Trading Arena verisi](https://github.com/ckamelhar-collab/ai-trading-arena-data) | Paper, ABD hisse. Sezon başlangıcı 2026-07-27. Yaklaşık 22 bot. | Patience·Opus 5.5 +%24,90<br>Grok 4.7 +%43,49<br>GPT-6 Sol +%14,54<br>Gemini 3.1 +%2,53<br>Sabit kurallı kontrol botu +%5,82<br>SPY +%3,21 | Paper işlem. Getirilerin çoğu `"afterCosts": false` olarak işaretli. Botlar farklı tarihlerde başlamış. Yaklaşık 22 bot arasından en iyisini seçme yanlılığı var. 2 ay, tek piyasa rejimi. |
| SynthFin ❌ (Temmuz 2026) | Sentetik veri | Claude Fable 5 −%8,90<br>GPT-5.5 −%16,40<br>Grok 4.5 −%15,66<br>Gemini 3.5 Flash −%24,31<br>Al-tut +%0,25, eşit ağırlık +%4,84 | Maliyet varsayımı belirtilmemiş. 4 yıldız. |
| QuantArena ❌ | — | Eşit ağırlıklı baz çizgisi iki piyasada da önde. | 2 yıldız |
| Alpha Arena (nof1.ai) | Gerçek para, kaldıraçlı, kısa süreli | ⚠️ Rakamlar doğrulanamadı ve kaynaklar arasında çelişiyor. Örneğin Claude Sonnet 4.5 için yaklaşık −%31 ile −%42 arası değerler aktarılıyor. Tutarlı olan tek bilgi, yalnızca Qwen3 Max ve DeepSeek'in pozitif kapatmış olması. | Pencere içinde yeni sezon yok. |
| [FinRL-X](https://github.com/AI4Finance-Foundation/FinRL-Trading) ❌ (sonuçlar kendi beyanı) | Alpaca paper, Ekim 2025 – Mart 2026 | +%19,76, SPY −%2,51.<br>Sharpe 1,96.<br>Maksimum düşüş −%12,22 (SPY −%5,35). | Denetlenmemiş. LLM değil, makine öğrenmesiyle portföy rotasyonu. |

**Yorum:**
- Tek olumlu sinyal zayıf bir paper arenasından geliyor ve getirilerin maliyetler düşüldükten sonra hesaplanıp hesaplanmadığı bile belirsiz.
- DXRG'nin "replay ligi"nde üç öncü model karar kalitesi açısından istatistiksel olarak ayırt edilemedi (en düşük Holm p = 0,46).
- Ancak kararlarda tutarlılık çok farklıydı. Aynı senaryoda kararını değiştirme oranı claude-fable-5'te %35, qwen3.7'de yaklaşık %90–95.
- Sonuç: Model seçiminden çok, modeli saran düzen (kurallar, limitler, çıkışlar) belirleyici. Claude'un kararlarının ne kadar tutarlı olduğu loglanmalı ve test edilmeli.

### 3.2 Haber ve sentiment

- **Luo (2026), QLoRA çalışması** (arXiv 2608.04200; [bağımsız yeniden uygulamanın README'sinden](https://github.com/chirindaopensource/from_financial_sentiment_classification_to_return_predictability)):
  - Sınıflandırma doğruluğu yüksek: Mistral-7B %88,40, FinBERT %69,30.
  - Ancak 28 model-ufuk testinin (1, 2, 3 ve 5 gün) hiçbiri Newey-West ve FDR düzeltmesinden sonra anlamlı kalmıyor. En düşük q = 0,9622; en yüksek 1 günlük rank IC 0,0143.
  - Sınırlar: Yalnızca 2019 verisi ve 72 S&P 100 hissesi; çalışmanın istatistiksel gücü düşük olabilir.
- **DXRG:** "Dünya bağlamı" verilen kol 84 denemenin hiçbirinde fark yaratmadı (0/84). Araştırma alt-ajanının da etkisi yok (n = 120).
- **Look-ahead (ezber) riski:** Bir LLM'i, eğitim kesim tarihinden önceki haberlerle backtest etmek sonuçları kirletir. Bu yüzden Claude'un sentiment yorumu yalnızca iki yolla doğrulanabilir: ileriye dönük paper trading ya da kesim tarihinden sonraki veri. İyi kontrol listeleri:
  - ai-hedge-fund v2.4.1: ticker, sektör ve tarihin modelden gizlendiği "kör" ajanlar.
  - TradingAgents v0.4–v0.5: point-in-time veri, SEC EDGAR "as-filed" kayıtları, dosyalama tarihi olmayan insider işlemlerinin dışlanması.
- **Türkçe finans sentiment'i:** GitHub'da bulunan repoların hepsi oyuncak ölçeğinde (en fazla 4 yıldız) ve hiçbirinde benchmark yok.
- **Sonuç:** Sentiment, Moonshot skorunda düşük ağırlıklı bir teyit ya da veto unsuru olmalı; işlemi tetikleyen sinyal olmamalı.

### 3.3 LLM'in doğru rolü

- **"LLM önerir, kod karar verir" kalıbı yaygın:**
  - QuantDinger: AI kapısı yalnızca girişte çalışıyor, çıkışlar AI'yı atlıyor. Ancak kapı fail-open, yani AI erişilemezse emir geçiyor.
  - NOFX: 2026-08-20'de "fail closed" yönünde bir commit yapıldı.
  - ccxt-mcp: Yazma yetkisi veren katmanlar varsayılan olarak kapalı. Preview/confirm akışı, `maxOrderValue`, `maxDailyValue` ve yalnızca ekleme yapılabilen bir denetim günlüğü var.
  - alpaca-gatekeeper: 23 deterministik kapı ve −%4 günlük zarar limiti var; çıkışlarda model kullanılmıyor. Bu botun "uydu" kolu, 4 ardışık işlemde toplam $1.500 zarardan sonra 2026-09-17'de kapatıldı.
- **LLM araştırma döngüsünde de kullanılabilir.** Microsoft RD-Agent v1.0.0 (2026-09-23) bu kalıbın örneği. LLM, Qlib üzerinde faktör ve model önerip backtest ediyor. Bu bizim için çevrimdışı bir seçenek: Claude yeni skor faktörleri önerir, canlıya almaya insan karar verir. Ancak RD-Agent'ın test dönemi (2017–2020) LLM eğitim verisinin içinde kalıyor (bkz. 4.2).
- **Hafıza zarar veriyor:**
  - DXRG'de ajanın hafızaya yazma sıklığı ile P&L arasında negatif ilişki var (ρ = −0,200, p = 0,002).
  - Bir ajan, pozisyonlarının 31/32'sini zaten değiştirmiş olduğu bir strateji metniyle yönetti ("hayalet strateji").
  - Sonuç: Claude'a kalıcı hafızayla karar verdirmeyin. Kurallar kodda durmalı ve sürümlenmeli.
- **Arayüz ve operasyon katmanı davranışı belirliyor:**
  - DXRG'de risk kaydırıcısının her kademesi kaldıracı +0,425 artırdı.
  - Ajana özgü sabit etkiler varyansın %60'ını açıklıyor.
  - Liderlik tablosu girişlerin %46,5'ini yönlendirdi.
  - Sonuç: LLM'in aşamayacağı sert limitler gerekli.
- **Maliyet:**
  - TradingAgents bağımsız tekrarında karar günü başına yaklaşık $3,70 harcandı (104 derin ve 39 hızlı LLM çağrısı).
  - Opus 5.5 fiyatları (resmi fiyat sayfası, 2026-10-01'de okundu):
    - 1 milyon token başına $4 girdi ve $20 çıktı.
    - Cache okuma $0,20.
    - Cache yazma: 5 dakikalık $5, 1 saatlik $8.
    - Batch $2/$10. Batch ve cache indirimleri birlikte uygulanıyor.
  - Örnek hesaplar:
    - Cache'siz, 10.000 girdi ve 1.000 çıktı token'lık bir inceleme yaklaşık $0,06 tutar.
    - Cache'li 3k token'lık sabit önek, 1k yeni girdi ve 300 görünür çıktı token'ı yaklaşık $0,01 tutar. Thinking token'ları buna eklenir ve çıktı fiyatından faturalanır.
  - Opus 5.5'te thinking kapatılamıyor; maliyet `effort` ayarıyla kontrol edilir. Varsayılan `medium`; sınıflandırma için `low` uygun.
  - Claude yalnızca Moonshot ön skorunu geçen adaylarda çağrılmalı ve günlük bir bütçe tavanı konmalı.
  - Acil olmayan işler, örneğin izleme listesinin gece haber ve sentiment taraması, Batch API ile yarı fiyatına yapılabilir. Batch giriş anındaki veto için uygun değil, çünkü sonuç 24 saate kadar gecikebilir.

### 3.4 Stop, trailing ve çıkış kanıtı

**DXRG bulguları (makalenin PDF metninden doğrulandı):**
- Girişte konan sabit %2 stop / %4 hedef parantezi pozisyon başına **+39,0 bps** [+21,3, +56,5] getirdi.
- Likidasyonlar hariç tutulduğunda bu değer **+16,6 bps**. Yani kazancın yaklaşık %60'ı pozisyonların patlamasını önlemekten geliyor.
- Test edilen 16 çıkış politikasından 11'i baz duruma göre iyileşme sağladı. Ancak hiçbiri tek başına mutlak kâr üretmedi (en iyisi −9,5 bps).
- En oynak çeyrekte stop'ları genişletmek **−68,9 bps** kaybettirdi.
- Medyan kaldıraç, her volatilite diliminde 5,0x'te sabit kaldı; yani pozisyon büyüklüğü volatiliteye göre ayarlanmadı. Tek bir ayar hücresi, likidasyonların %62'sini (205'te 128) içeriyordu.
- 48 saatlik bir pencerede açılan 35 pozisyonun 24'ü korumasız kaldı. Makale bu yüzden pozisyon açılışı ile korumanın aynı anda (atomik) gönderildiği bir emir yolu öneriyor.
- Kovalama riski: Son 1 saatte +%0,75'ten fazla yükselmiş durumlarda yapılan girişlerin sonraki 4 saatlik getirisi −6,9 bps [−15,8, +2,2]. Güven aralığı sıfırı kestiği için bu kesin bir sonuç değil, test edilmesi gereken bir hipotez.

**Nüans:**
- DXRG'deki parantez ATR'ye göre değil, sabit yüzdeyle kurulmuştu.
- "Stop'u genişletmek zarar verir" sonucu, büyüklüğün volatiliteye göre ayarlanmadığı (volatiliteye kör kaldıraç) koşullarda ölçüldü.
- Bizim planımızdaki ATR stop ile risk bazlı boyutlandırma birlikte doğrudan test edilmedi.
- Makalenin kendi kanon kuralı 6'ya göre, "uzun tutulan pozisyonlar daha iyi sonuç verdi" bulgusu nedensel olarak okunmamalı.

**ATR, Chandelier, başabaş ve zaman stop'u için bağımsız kanıt bulunamadı:**
- arXiv, SSRN ve Quantpedia engelli olduğu için bu kuralları destekleyen bağımsız bir kanıt doğrulanamadı.
- GitHub'da "chandelier exit backtest" araması yalnızca 2017'den kalma, 1 yıldızlı bir repo döndürdü.
- **Doğrulanabilir tek yol, kanıtı kendimiz üretmek:** vectorbt 1.1.1 ve PyBroker 2.0.1 ile bir ablasyon çalışması. Karşılaştırılacak varyantlar:
  - Sabit yüzde stop ile 2×ATR stop
  - +1R'de başabaş var/yok
  - 2,5–3×ATR trailing
  - +2R'de %50 kâr alma
  - 48 saat / +0,5R kuralı
- Tüm testlerde komisyon ve spread dahil edilmeli, walk-forward bölmeleri kullanılmalı ve deflated Sharpe kontrolü yapılmalı.

**Klasik literatür (arka plan, bu oturumda yeniden doğrulanmadı):**
- Kaminski & Lo (2014): Stop'lar rastgele yürüyüşte beklenen getiriyi düşürür; momentum ya da rejim değişimi olan piyasalarda değer katabilir.
- Han, Zhou & Zhu: Momentum çöküşlerinde %10'luk stop'un etkisini inceliyor.
- Barber & Odean (2000): Yüksek işlem sıklığı net getiriyi düşürür.
- Volatilite hedefleme literatürü (Harvey vd.; Moreira & Muir; Cederburg vd.'nin eleştirisi).
- Pratik çıkarım: ATR stop ve trailing'in trendli piyasalarda işe yaraması, yatay piyasada ise kanaması beklenir. Bu yüzden bir rejim filtresi test edilmeli.

**Zaman serisi temel modelleri (TSFM):**
- **Chronos-2, MOEX ön-kayıtlı çalışması:** Yön isabeti 0,46–0,51. Chronos'a özgü alfanın Sharpe'ı −0,38. Risk tahminlerinde (VaR/ES) yalnızca eşitlik.
- **Kronos, [bağımsız değerlendirme](https://github.com/imanly97/kronos-evaluation):** İsabet %49,5; "her zaman yukarı" tahmini ise %54,6. %90'lık güven aralıkları gerçekte yalnızca %68 kapsıyor.
- **Kronos, [OpenAlpha ön-kayıtlı testi](https://github.com/ThomasCaruso/OpenAlpha):** Hiçbir ETF'de (0/4) "değişmez" tahminini yenemedi. Yenme oranı %26–31, ön-kayıtlı eşik ise ≥%60 idi.
- **TimesFM 3:** Bağımsız ya da ön-kayıtlı bir yön testi bulunamadı. Elde yalnızca rakip model KiT'in RankIC tablosu ve doğrulanamayan arXiv rakamları var.
- **IBM TTM ([tsfm-rv](https://github.com/Alessiobrini/tsfm-rv)):** Yön değil, gerçekleşmiş volatilite tahmini test edildi. Log-HAR'ı yaklaşık %1,3–1,8 geçtiği iddia ediliyor. [Bağımsız replikasyon](https://github.com/hariharan-brucewayne220/rv-tsfm-bench) ise 1 günlük ufukta eşitlik buldu (0,998); 5 ve 22 günlük ufuklarda TTM kaybetti (oranlar 1,14–1,83).

### 3.5 Maliyet yükü ve backtest gerçekçiliği

- **Maliyeti R cinsinden hesaplayın:** `maliyet_R = gidiş-dönüş maliyeti % / stop mesafesi %`.
  - Örnek: %0,25 maliyet / %4 stop = **0,0625R**. Aynı maliyet %1'lik bir stop'ta 0,25R eder.
  - Sonuç: Yüksek sinyal eşiği ve günlük işlem tavanı şart.
  - Ücret verisi: CCXT'nin BtcTurk yapılandırmasında maker %0,05, taker %0,09 yazıyor; bu değerler güncel olmayabilir. Bybit TR ve diğer borsaların ücretleri doğrulanamadı.
- **freqtrade backtest'i iyimser varsayımlarla çalışıyor:**
  - "Kayma yok" varsayılıyor.
  - Stop, mum fiyatı daha aşağı inse bile tam stop fiyatından dolmuş sayılıyor (yalnızca "2 × ücret" ekleniyor).
  - Trailing'de "önce high oluşur" varsayılıyor: stop önce yükseltiliyor, low sonra test ediliyor.
  - Sonuç: ATR trailing backtest'leri gerçeğe göre iyimser çıkar. `--timeframe-detail` seçeneğini ve kayma payını kullanın.
- **Paper sonuçları canlıyla aynı değil:**
  - Binance Demo Mode'un kendi dokümanı, verilerinin canlı piyasadan farklı olduğunu belirtiyor.
  - Bybit testnet verisi "gerçek koşullardan çok farklı". Testnet yalnızca global host'ta var; Bybit TR için dokümante edilmiş bir testnet yok.
  - DXRG'nin DXAP filosundaki paper dolumlar kaymasız ve fonlama maliyetsiz hesaplandı.
- **Veri kaynaklı yanlılık:** yahoo-finance2'nin kendi README'si, Yahoo'nun borsadan çıkan hisselerin verisini geriye dönük sildiğini yazıyor. Bu, backtest'te hayatta kalma yanlılığı (survivorship bias) yaratır.
- **Aşırı uyumu (overfitting) kontrol edin:**
  - Deflated Sharpe (DSR), PBO ve PSR raporlayın; denenen kombinasyon sayısını dürüstçe kaydedin.
  - Eylül 2026 sonunda bu metrikleri üreten araçlarda istatistik düzeltmeleri yayımlandı: vectorbt 1.1.1 (DSR), quantstats 0.0.82–0.0.86, skfolio 1.4.x. Sürümleri sabitleyin ve eski raporları yeniden üretin.
- **DXRG'nin 17 kurallı değerlendirme kanonu** paper fazı için hazır bir kontrol listesi. Öne çıkan kurallar:
  - "Null" kontrol kolu (kural 13)
  - Tüm kollar için ortak ücret oranı (kural 11)
  - Günlere göre kümelenmiş istatistiksel çıkarım
  - Zamanlama şansı tabanı (kural 17): ±15 dakikalık bir kaydırma dolar sonucunu tersine çevirebildi (örneğin −88'e karşı +21).
  - Ajanın beyan ettiği P&L yerine gerçek dolumlardan yeniden hesaplanan P&L.

---

## 4. Kategori kategori bulgular

### 4.1 Yürütme ve backtest framework'leri

| Ad | Ne işe yarar | Son aktivite | Kanıt düzeyi | Bizim bota uygunluk |
|---|---|---|---|---|
| [freqtrade](https://github.com/freqtrade/freqtrade) | Python kripto botu. Dry-run ve backtest. `custom_stoploss`, `custom_exit`, `adjust_trade_position`, `confirm_trade_entry` callback'leri. Protections. | 2026-09-29 (2026.9) ✅ | Güçlü (55k yıldız, 33k commit, aylık sürüm; canlı P&L yok) | **Yüksek (kripto).** Tüm çıkış kurallarımız callback'lerle yazılabilir; referans ve paper motoru olarak kullanılabilir. Yerleşik günlük zarar freni yok; MaxDrawdown (equity, yaklaşık 1 günlük lookback) ile yaklaşık sağlanır ya da özel kod gerekir. GPLv3. Binance TR ve BtcTurk resmi destek listesinde yok. |
| [NautilusTrader](https://github.com/nautechsystems/nautilus_trader) | Rust/Python olay tabanlı motor. Native trailing ve koşullu (contingent) emirler. RiskEngine durumları ACTIVE/REDUCING/HALTED. | 2026-09-15 (v2.0.0rc5) ✅ | Güçlü (29,6k) | **Orta.** Kill switch için tasarım şablonu. Proje, v2 RC sürümleri için "üretimde önerilmez" diyor. Alpaca adaptörü yok. |
| [QuantConnect LEAN](https://github.com/QuantConnect/Lean) | C# backtest, paper ve canlı motor (Alpaca, IB, TradeStation). | 2026-10-01 ✅ | Güçlü (21,8k) | **Orta.** ABD hisse için çıkış kurallarını doğrulamakta kullanılabilir. 2026-09-25'te çekirdeğe OCO/OTO/OUO ve bracket emirleri eklendi (#9828). .NET ve Docker yığını ağır. |
| [Lumibot](https://github.com/Lumiwealth/lumibot) | Python. Alpaca, IBKR ve CCXT. AI ajan çalışma zamanı. Backtest'te LLM kararları için replay cache. | 2026-10-01 (v4.6.3) ✅ | Orta (2,1k) | **Orta.** ABD hisse + LLM backtest'inde Claude kararlarının deterministik tekrarı. Claude LiteLLM üzerinden destekleniyor; dokümanda `claude-opus-4-7` ve `claude-sonnet-4-6` var, Opus 5.5 desteği ⚠️. GPL-3.0. Satıcı kurs ve hizmet satıyor. |
| [Jesse](https://github.com/jesse-ai/jesse) | Python kripto framework'ü. Monte Carlo, kural anlamlılık testi, kısmi çıkışlar, Claude için Jesse MCP. | 2026-10-01 (v3.2.4) ✅ | Orta (8,6k) | **Orta–yüksek (doğrulama için).** Sinyal eşiğinin rastgele girişlere karşı anlamlılığını test eder. Canlı işlem eklentisi ücretli (fiyat doğrulanamadı). 4 haftada 10 sürüm çıktı; sürümü sabitleyin. |
| [Hummingbot](https://github.com/hummingbot/hummingbot) (+ Condor) | Kripto ve DEX. V2 PositionExecutor'daki TripleBarrierConfig (SL, TP, time_limit, trailing). | 2026-09-22 (v2.17.0); Condor 2026-09-30 ✅ | Güçlü (20,3k; "$34B+ hacim" iddiası satıcıya ait) | **Orta.** TypeScript PositionManager için veri modeli şablonu. Başabaş ve kısmi kâr alma yok. Condor'da doğrudan Anthropic sağlayıcısı yok. |
| [vectorbt](https://github.com/polakowo/vectorbt) | Vektörel backtest. `from_signals` parametreleri: `sl_stop` (bar bazında dizi olabilir), `sl_trail`, `tp_stop`, `adjust_sl_func_nb` (başabaş gibi özel stop ayarı). Deflated Sharpe. | 2026-09-26 (PyPI 1.1.1; git HEAD aynı gün) ✅ | Güçlü–orta (9,3k; yıldız sayısı bu turda yeniden kontrol edilmedi; uzun bakım geçmişi) | **Yüksek (doğrulama için).** Çıkış merdiveni ablasyonu ve eşik/ATR çarpanı/işlem tavanı için maliyet dahil ızgara taraması. Stop'lar giriş fiyatının oranı olarak verilir; ATR katlarını orana çevirin. Kısmi kâr ve koşullu zaman stop'u için `from_order_func` ya da Numba callback gerekir. DSR hesabı 1.1.1'de düzeltildi. Lisans: Apache 2.0 + Commons Clause, yani değeri buna dayanan bir ürün satılamaz, iç kullanım serbest. İleri özellikler ücretli PRO sürümünde. |
| [PyBroker](https://github.com/edtechre/pybroker) | Olay tabanlı backtest. Giriş başına stop'lar: `stop_loss`/`stop_loss_pct`, `stop_trailing` (girişten puan cinsinden, k×ATR verilebilir)/`stop_trailing_pct`, `stop_profit`, `hold_bars` (bar sayısıyla zaman stop'u). Walk-forward, bootstrap metrikleri, Alpaca verisi. | 2026-08-28 (PyPI 2.0.1; 2.0.0: 2026-08-17) ✅ | Orta (3,6k; yıllardır bakılıyor) | **Yüksek (bar bar çıkış testi ve ABD hisse doğrulaması).** `hold_bars` 48 saat kuralına yaklaşır, ancak koşulsuz çalışır; "+0,5R'ye ulaşmadıysa çık" koşulu özel kod gerektirir. Lisans: Apache 2.0 + Commons Clause. 2.0 major sürüm, kırıcı değişiklik olabilir. |
| [backtesting.py](https://github.com/kernc/backtesting.py) | Hızlı backtest. `TrailingStrategy` ile ATR katı cinsinden trailing. | 2026-08-05 ✅ (tek bugfix commit) | Orta–güçlü (~9k) | **Orta–düşük.** Hızlı ATR trailing prototipi. ATR'yi 100 barlık SMA ile hesaplıyor (Wilder değil). AGPL-3.0. |
| [FinRL-X](https://github.com/AI4Finance-Foundation/FinRL-Trading) | Alpaca paper'dan canlıya geçiş, trailing ve mutlak stop, cooldown, işlem öncesi risk kontrolleri. | 2026-09-18 ✅ | Zayıf–orta (sonuçlar kendi beyanı) | **Orta.** Alpaca paper → canlı akışı ve raporlama için şablon. Stratejisi (portföy rotasyonu) bizimkinden farklı. |
| [backtest-kit](https://github.com/tripolskypetr/backtest-kit) | TypeScript backtest, paper ve canlı (CCXT). Trailing, başabaş, kısmi çıkış, zaman çıkışı, Claude adaptörü. | 2026-10-01 ✅ | Zayıf (77 yıldız, tek geliştirici) | **Düşük.** Bağımlılık olarak değil, TS çıkış motoru için kod referansı olarak. Vitrindeki getiriler tek aylık ve özenle seçilmiş (+%67,85 getiri, Sharpe 0,12). |

**Dışarıda bırakılanlar:**
- **Microsoft Qlib:** 49,1k yıldız, ~168 katkıcı ve MIT lisanslı, ama fiilen bakım modunda. Pencere içinde yalnızca iki CI commit'i var (2026-09-16); son PyPI sürümü 0.9.7 (2025-08-15). Resmi veri seti "geçici olarak devre dışı". Kesitsel faktör araştırmasına yönelik; ATR stop'lu bir swing botuna katkısı düşük.
- **OctoBot:** Grid/DCA odaklı, v3 hâlâ beta, Claude desteği yok.
- **Passivbot:** Martingale tarzında zarardaki pozisyona ekleme yapıyor; 2×ATR stop kuralımızla çelişiyor.
- **NostalgiaForInfinity:** Commit mesajları ("7 yılda 20 zarar → 0") tipik örneklem-içi aşırı uyum. Ayrıca zarardaki pozisyona ekleme yapıyor.
- **Bayat projeler:** backtrader (2023), zipline-reloaded (2025), Superalgos, technicalindicators (2020), pyfolio / empyrical / alphalens-reloaded (2025).
- **vnpy:** Son sürüm 2026-05-14 ❌, Çin vadeli işlemlerine odaklı.
- **VectorBT PRO:** Doğrulanamadı.
- **bt / ffn:** Stop ve çıkış araçları yok.

### 4.2 LLM ajan sistemleri ve MCP sunucuları

| Ad | Ne işe yarar | Son aktivite | Kanıt düzeyi | Bizim bota uygunluk |
|---|---|---|---|---|
| [TradingAgents](https://github.com/TauricResearch/TradingAgents) | Çok ajanlı LLM analizi (haber, sentiment, temel analiz, risk ajanı, karar günlüğü). Point-in-time backtest. | 2026-09-29 (v0.5.2) ✅ | Kullanım güçlü (109,5k yıldız); işlem kanıtı zayıf ya da negatif | **Orta.** Claude katmanı için referans mimari. Python. Her kararda çok sayıda LLM çağrısı yapıyor. Varsayılan modeller GPT-6 Sol/Luna; Opus 5.5 seçilebilir. |
| [ai-hedge-fund](https://github.com/virattt/ai-hedge-fund) | Çok ajanlı LLM simülasyonu. "Kör" (anonimleştirilmiş) backtest. | 2026-09-26 ✅ | Orta (63,8k); getiri kanıtı yok | **Orta.** Claude'un ezberden yararlanmasını ayıklayan kör test yöntemi. PEAD/8-K kuralı skor için fikir verebilir. İşlem yapmaz. Ücretli veri API'si gerektirir. |
| [RD-Agent](https://github.com/microsoft/RD-Agent) (RD-Agent(Q) senaryosu) | LLM çok ajanlı Ar-Ge döngüsü: Qlib üzerinde faktör ve model önerir, kodlar, backtest eder. | 2026-09-23 (v1.0.0; PyPI aynı gün) ✅ | Kullanım güçlü (~14,8k yıldız, ~1,9k fork, ~50 katkıcı). Getiri kanıtı zayıf–orta: README'ye göre makale NeurIPS 2025'te kabul edilmiş; "daha az faktörle yaklaşık 2 kat ARR, $10'un altında LLM maliyeti" satıcının kendi iddiası. arXiv açılamadı. | **Orta (yalnızca çevrimdışı araştırma).** Claude'un yeni skor faktörleri önerip test ettiği, canlıya geçişe insanın karar verdiği bir kalıp. Varsayılan arka uç LiteLLM; Anthropic ile çalışması çıkarım, test edilmedi. Test dönemi CSI 300, 2017-01 – 2020-08 ("işlem maliyetleri dahil") ve LLM eğitim verisinin içinde, bu yüzden ezber riski var. Çin A-hisse, kesitsel günlük yeniden dengeleme; swing yürütmesine uymaz. Yalnız Linux, sudo'suz Docker gerekir. Kimlik doğrulamasız UI API'si ancak v1.0.0'da kapatıldı. MIT. |
| [dexter](https://github.com/virattt/dexter) | TypeScript (Bun) finansal araştırma ajanı. Anthropic structured output, LangSmith değerlendirmesi. | 2026-09-23 ✅ | Orta (27,6k) | **Orta.** Haber ve açıklama modülü için TS kalıpları. Kod Bun'a özgü; Node'a uyarlamak gerekir. |
| [claude-trading-skills](https://github.com/tradermonty/claude-trading-skills) | Claude beceri paketi: Position Sizer, Drawdown Circuit Breaker, Trader Memory, Signal Postmortem, bias ve data_provenance kapısı. | 2026-09-30 ✅ | Orta (2,9k); getiri kanıtı yok | **Yüksek (referans).** Günlük zarar freni ve pozisyon boyutlandırma için hazır şartname. Kuralların uygulanması yine TS motorunda olmalı. |
| [QuantDinger](https://github.com/OpenByteInc/QuantDinger) | Python "AI Trading OS". Giriş öncesi Jev kapısı, çıkışlar AI'yı atlar, varsayılan paper, ajan gateway'i ve MCP. | 2026-10-01 (v5.5.2) ✅ | Zayıf–orta (12,4k yıldız ama 653 commit ve tek aktif geliştirici) | **Düşük–orta.** Yalnızca tasarım referansı. Kapısı **fail-open** çalışıyor (AI yoksa emir geçiyor); bizimki fail-closed olmalı. 2026-10-01'de CCXT'yi kaldırıp yerine yerel borsa istemcileri koydu, yani mimari değişiyor. |
| [Alpaca MCP Server](https://github.com/alpacahq/alpaca-mcp-server) | Resmi Alpaca MCP sunucusu. Varsayılan olarak paper. `ALPACA_TOOLSETS` ile yalnızca veri ve haber araçları açılabilir. | 2026-09-25 ✅ | Orta (1,0k, resmi) | **Yüksek (ABD hisse).** Claude'a salt-okur bağlam sağlar; emirler TS motorundan gider. Trading araç seti açılırsa onay kapısı olmaz. |
| [ccxt-mcp](https://github.com/ccxt/ccxt) | CCXT'nin resmi MCP sunucusu. Katmanlar: market, read, trading, funds; yazma katmanları varsayılan olarak kapalı. preview/confirm, `maxOrderValue`, `maxDailyValue`. | Wiki 2026-08-22; v0.1.3 "Sep 7" (⚠️ yıl görünmüyor, büyük olasılıkla 2026) | Orta (ccxt güçlü; MCP sunucusu v0.1.x ve genç) | **Yüksek (kripto).** Claude'a yalnızca market ve read katmanlarını açın. Kurulum: `claude mcp add ccxt -- npx -y ccxt-mcp` |
| [OKX Agent Trade Kit](https://github.com/okx/agent-trade-kit) | Resmi OKX TS MCP sunucusu ve CLI. 167 araç, `--read-only` modu, OCO ve trailing algo emirleri. | 2026-09-23 (1.4.8) ✅ | Orta (458) | **Orta.** TypeScript. Paper modu yok. OKX TR uyumu belirsiz: CCXT'de ve python-okx'te Türkiye host'u yok. Grid ve DCA araçlarını LLM'e açmayın. |
| [Binance Agent OS / MCP](https://github.com/Medeton/binance-agent-os) | Resmi Binance ajan MCP'si (`agent.binance.com/mcp/agentic`). OAuth, izole "agentic" alt hesap, para çekme yetkisi yok. | ⚠️ yalnızca dolaylı (0 yıldızlı topluluk reposu, 2026-09-04..07) | Zayıf | **Orta (koşullu).** İzole alt hesap, dışarıdan bir kill switch işlevi görebilir. Türkiye'den kullanılabilirliği belirsiz. Yalnızca spot'la sınırlayın. |
| [AgenticTrading](https://github.com/Open-Finance-Lab/AgenticTrading) | Araştırma platformu: backtest → paper. Alpaca ve Robinhood. "Review-only" modu. | 2026-10-01 ✅ | Zayıf (767) | **Düşük.** Karşılaştırma ortamı. 2026-09-30'da repoya yanlışlıkla eklenmiş bir Polygon API anahtarı silindi; güvenlik hijyeni zayıf. |

**Dışarıda bırakılanlar:**
- **jarrodwatts/jev-trader:** 2 günlük demo. Mock modelle çalışıyor, sonuç yok, işlem ufku bizimkinden çok farklı.
- **aowang-ai/jev-trade:** Bir topluluk gist'inde listeleniyor (173 yıldız, MIT). Jev'in Hyperliquid portu; "real fills" ve jev-trade.com'da canlı bir masa iddia ediyor. P&L görülmedi ve varsayılan mod testnet ⚠️. Ayrıntılar Bölüm 7'de.
- **alpaca-gatekeeper:** Lisansı yok; yalnızca "öner, sonra kapıdan geçir" fikri alınabilir.
- **TradingGoose-Studio:** AGPL; pencere içinde tek bir staging commit'i var.
- **NOFX:** Kaldıraçlı perp ve pre-IPO perp odaklı; USDC ödemeli ek satış yapıyor.
- **Pencere dışı / bayat:** HKUDS/AI-Trader, LLM-Trading-Lab, ValueCell, hummingbot/mcp.
- **QuantConnect/mcp-server:** Kullanımdan kaldırıldı.
- **IBKR resmi MCP:** Duyuru tarihi belirsiz ⚠️. 2026-07-28/29 olarak aktarılıyor, ancak awesome-broker-mcp 2026-07-16'da doğrulanmış bir anlık görüntüde IBKR'yi zaten "Draft only" olarak listeliyordu. Her iki durumda da pencere dışı görünüyor ve yalnızca taslak emir üretiyor.
- **kraken-cli:** Türkiye için uygunluğu belirsiz.
- **CloddsBot:** pump.fun token'ı ve 200x kaldıraç tanıtıyor; dolandırıcılık riski.
- **berkcankeceli/btcturk-llm-trading-agent:** 0 yıldız. Tasarımı ilginç (LLM ile giriş, kurallarla çıkış), ama kanıtlanmamış.

### 4.3 Hugging Face ve model tarafı

> ⚠️ huggingface.co bu turda da engelliydi. Hiçbir model kartı, lisans alanı ya da indirme sayısı ilk elden görülmedi. Bilgiler GitHub ve PyPI üzerinden dolaylı olarak alındı.

| Ad | Ne işe yarar | Son aktivite | Kanıt düzeyi | Bizim bota uygunluk |
|---|---|---|---|---|
| [Chronos-2 / chronos-forecasting](https://github.com/amazon-science/chronos-forecasting) | Genel zaman serisi temel modeli: 120M parametre, Small sürümü 28M. Chronos-2 2025-10-20'de çıktı. HF kimlikleri: `amazon/chronos-2`, `autogluon/chronos-2-small`, `autogluon/chronos-2-synth`. CPU'da çalışabilir. | 2026-09-08 (PyPI 2.3.2) ✅ | Genel tahmin için orta (~6k yıldız); finans getirisi için yok (MOEX ön-kayıtlı testinde yön isabeti yazı-tura düzeyinde) | **Düşük.** Yalnızca volatilite tahmininde ATR'ye rakip olarak; walk-forward testinde HAR'ı veya ATR'yi yenerse. Kod Apache-2.0; ağırlık lisansı README'de belirtilmemiş, HF kartı açılamadı ⚠️. Node'da ONNX ile çalıştırma doğrulanmadı; Python yan servis planlayın. |
| [IBM Granite TTM-r3 / PatchTST-FM-r2](https://github.com/ibm-granite/granite-tsfm) | Hafif zaman serisi modelleri; gerçekleşmiş volatilite tahmini. | 2026-08-28 (PyPI 0.3.9) ✅ | Zayıf | **Düşük.** TTM + Log-HAR birleşimi 1 günlük ufukta umut verici. IBM kodun bakımını artık yapmayacağını söylüyor. Checkpoint başına lisanslar GitHub'da görünmüyor. "`granite` kimlikleri ticari, `ibm-research` varyantı ticari değil" bulgusu önceki taramadan geliyor ve HF'den yeniden doğrulanmalı ⚠️. |
| Jev (TypeSafe) + açık replikalar ([OpenJev](https://github.com/razorback16/openjev), [laya](https://github.com/NandhaKishorM/laya), kev) | Tipli karar modeli: Choice / Noul / Score yanıtları ve olasılık. | 2026-09-29 / 2026-10-01 ✅ | Zayıf (benchmark'ları satıcı ya da rakip yapmış; doğrulanabilir işlem kanıtı yok) | **Düşük–orta.** Ucuz bir ön filtre olabilir. Ayrıntılar Bölüm 7'de. |

**Dışarıda bırakılanlar:**
- **TimesFM 3.0** (2026-09-09): Model ağırlıkları "ticari olmayan, üretim dışı" lisanslı, yani gerçek parayla çalışan botta kendi sunucunuzda kullanılamaz. Ayrıca bağımsız bir yön testi yok; yalnızca rakip KiT'in RankIC tablosu var.
- **Kronos:** Bakımcının son commit'i 2026-04-13 ❌. Bağımsız testler olumsuz; yakın zamanda bir veri sızıntısı düzeltmesi yapıldı.
- **TiRex-2, Toto 2.0, TimeCopilot:** Finans kanıtı yok.
- **Bayat:** FinBERT (2022), FinGPT (modelleri 2023), FinText (2025-12).
- **KiT:** Kod ve ağırlıklar yayımlanmadı; AGPL.
- **Moirai, Sundial, Fin-R1:** Bayat.
- **GIFT-Eval, fev-bench, TIME tabloları:** Finans görevi ve işlem metriği içermiyor.
- **Türkçe finans/BIST sentiment modelleri ve repoları:** CankayaUniversity e-TurFinSAS, Eelis03, amirremirr, solakoglukoray, Salihyksel/BorsaRadar vb. En fazla 4 yıldız, benchmark yok, kanıtlanmamış.
- **HF veri setleri:** FNSPID 2023'te bitiyor. Fiyat çubukları için borsanın kendi arşivleri tercih edilmeli.

### 4.4 Broker, borsa ve veri API'leri

| Ad | Ne işe yarar | Son aktivite | Kanıt düzeyi | Bizim bota uygunluk |
|---|---|---|---|---|
| [CCXT](https://github.com/ccxt/ccxt) | Tek TypeScript API ile 104'ten fazla borsa: OHLCV, emirler, websocket. | 2026-10-01 (npm 4.5.85) ✅ | Güçlü (44,2k, MIT) | **Yüksek (kripto).** Doğrudan Moonshot'a eklenebilir. Binance, Bybit ve OKX "sertifikalı". Binance TR ve Paribu modülü yok (`binancetr.ts` ve `paribu.ts` master'da 404). Stop desteği borsadan borsaya değişiyor ve bazen yalnızca ham parametreyle kullanılabiliyor (bkz. BtcTurk). |
| [@binance/spot](https://github.com/binance/binance-connector-js) + [Spot API dokümanları](https://github.com/binance/binance-spot-api-docs) | Resmi TS konnektör. OTOCO ve OPO emir listeleri, BIPS cinsinden `trailingDelta`, Demo Mode. | 2026-10-01 (spot v34.0.0) ✅ | Güçlü (resmi) | **Yüksek.** Girişte borsa tarafında bracket kurulabilir; trail mesafesi ATR'den BIPS'e çevrilebilir. Bulunan en gerçekçi ücretsiz paper ortamı. Node ≥ 22.12 gerekiyor. Neredeyse her gün yeni major sürüm çıkıyor; `orderOco()` kullanımdan kaldırıldı. Türkiye'den binance.com erişimi ⚠️. |
| [Alpaca TS SDK](https://github.com/alpacahq/alpaca-trade-api-js) + [alpaca-py](https://github.com/alpacahq/alpaca-py) | ABD hisse ve ETF, varsayılan olarak paper. Hissede simple / oco / oto / bracket emirleri ve `trailing_stop`. Kriptoda yalnızca simple emir (market, limit, stop_limit). | 2026-10-01 (v5.0.0) ✅ | Güçlü (resmi) | **Yüksek (ABD hisse).** 2×ATR stop broker tarafında tutulabilir. v5 kırıcı değişiklik içeriyor; sürümü sabitleyin. Türkiye'den hesap açılabilirliği ⚠️; alpaca-docs reposunda ülke listesi yok. Alpaca'nın kripto tarafı çıkış merdivenimize uymuyor. |
| [IBKR via @stoqey/ib](https://github.com/stoqey/ib) (TS) ve IBind (Python) | Ayarlanabilir stop (`adjustedOrderType`, `triggerPrice`, `adjustedStopPrice`, `adjustedTrailingAmount`), bracket ve OCA grupları. | 2026-09-16 / 2026-09-06 (IBind PyPI 0.2.1: 2026-08-30) ✅ | Orta (istemciler topluluk tarafından yazılmış) | **Orta.** Çıkış merdivenimize sunucu tarafında en yakın emir seti. TS istemcisi eski bir IB API sürümünü (10.32.01, Ekim 2024) izliyor; pencere içindeki commit'leri yalnızca bağımlılık güncellemesi. TWS/Gateway sürekli çalışmalı. Türkiye'den hesap açılabilirliği ⚠️. |
| [Bybit TR, Bybit V5 API](https://github.com/bybit-exchange/docs/blob/main/docs/v5/guide.mdx). TS istemci: [sieblyio/bybit-api](https://github.com/sieblyio/bybit-api) (`apiRegion: 'TK'`) ya da CCXT `bybit` + `hostname: 'bybit.tr'` | Bybit'in Türkiye "uyumlu sitesi". Aynı V5 REST/WS API'yi Türkiye'ye özel host'larda sunuyor: `https://api.bybit.tr` ve `wss://stream.bybit.tr`. Spot'ta borsada bekleyen koşullu emirler var: `orderFilter=StopOrder` (tetiklenene kadar varlık kilitlenmez), `orderFilter=tpslOrder`, `triggerPrice`; ayrıca girişte `takeProfit`/`stopLoss` eklenebiliyor. | Docs reposu HEAD 2026-09-29 (commit 9c94ee5) ✅; TR host düzeltmesi 2026-03-31; sieblyio 2026-09-30 ✅ | Orta–güçlü (resmi borsa dokümanı; canlı test edilmedi) | **Yüksek (TR kripto, koşullu).** Doğrulanan TR seçenekleri içinde borsa tarafı stop'u en iyi belgelenen borsa: 2×ATR stop borsada durur, bot onu amend ya da cancel/replace ile yalnızca yukarı taşır. Spot'ta native trailing yok; "trailing" yalnızca spot-grid bot API'sinde geçiyor. TR testnet'i yok; testnet yalnızca global `api-testnet.bybit.com`'da. Uyumlu siteler çoğunlukla yalnızca spot destekliyor. Bybit Turkey'de SMP 2026-01-27'den beri canlı. Resmi Python SDK'sı pybit 5.17.0 hâlâ eski `bybit-tr` host'unu kullanıyor. CCXT hostname override'ı canlı test edilmedi. Ücretler, TRY çiftleri ve Türk hukukundaki lisans durumu doğrulanmadı ⚠️. |
| [BtcTurk native API](https://github.com/BTCTrader/broker-api-docs/blob/master/README-pro.md) + [CCXT `btcturk`](https://github.com/ccxt/ccxt/blob/master/ts/src/btcturk.ts) | TRY çiftleri. Dokümante edilen `POST /api/v1/order` uç noktasında `orderMethod` = `limit` / `market` / `stopLimit` / `stopMarket` ve stop emirleri için `stopPrice`. Eski README.md'deki sayısal karşılıklar: 2 = Stop limit, 3 = Stop market, ve `TriggerPrice`. CCXT'nin `has` haritasında ayrı stop/trigger metotları yok, ama `features.spot.createOrder` haritasında `triggerPrice: true` var. `createOrder` emir tipini `orderMethod` olarak aynen gönderiyor ve ham parametreleri ekliyor. | CCXT 4.5.85 2026-10-01 ✅ (yalnızca sarmalayıcı); BtcTurk doküman reposunun son commit'i 2019-12-30 ❌; güncel docs.btcturk.com açılamadı ⚠️ | Zayıf–orta | **Orta (yerel borsa zorunluysa).** Borsada bekleyen bir stop büyük olasılıkla mümkün: `createOrder(symbol, 'stopLimit', 'sell', amount, price, {stopPrice: X})`. Ancak bu güncel API'de doğrulanmadı ve canlı test edilmedi. CCXT birleşik `triggerPrice` alanını `stopPrice`'a çevirmiyor; bu alanı kendiniz verin. Sayısal enum değerleri kaynaklar arasında çelişkili, bu yüzden string değerleri kullanın. OCO ve trailing dokümante değil: Stop ile +2R kâr emri borsada birbirine bağlanamaz, bu çifti bot yönetmeli; bot çökerse çift dolum riski var. CCXT'de websocket ve sandbox yok. 2019 dokümanındaki test ortamları (pro-dev / api-dev) hâlâ çalışıyor mu belirsiz. |
| [UNICORN Binance REST](https://github.com/oliver-zehentleitner/unicorn-binance-rest-api) + [WS](https://github.com/oliver-zehentleitner/unicorn-binance-websocket-api) | Python. `exchange='trbinance.com'` modu: spot `https://www.trbinance.com/api`, ayrıca `fapi/dapi.trbinance.com`. | REST git HEAD 2026-09-30 (PyPI 2.12.0: 2026-07-02); WS 2.16.1 2026-09-21 ✅ | Zayıf (REST ~70, WS ~735 yıldız; tek bakımcı) | **Düşük.** Binance TR'yi hedefleyen ve bakımı süren az sayıdaki istemciden biri. Eski trbinance.com alan adını ve eski apidocs bağlantısını kullanıyor. Binance global tarzı yollar, Binance TR'nin kendi "open/v1" API'siyle uyuşmayabilir. Binance TR'nin emir tipleri (stop, OCO, trailing) ve testnet'i doğrulanamadı. Binance TR'nin kendi REST API'sini Node'dan doğrudan kullanmak kontrol edilmedi. |
| [Borsa MCP](https://github.com/saidsurucu/borsa-mcp) | BIST, KAP, TEFAS, BtcTurk, TCMB EVDS ve döviz verisi. 26 araç. Emir verme yok. | 2026-09-24 ✅ | Zayıf–orta (653) | **Orta (Türkiye verisi).** Claude'a KAP ve BIST bağlamı sağlar. Kendiniz host edin; yakın zamanda bir SSRF açığı ve günde ~1 GB'lık bellek sızıntısı düzeltildi. |
| [borsapy](https://github.com/saidsurucu/borsapy) | BIST veri kütüphanesi. TradingView websocket'ten yaklaşık 15 dakika gecikmeli veri. | 2026-08-07 ✅ | Orta (732) | **Düşük.** ⚠️ Lisans çelişkili: Repo lisansı Apache-2.0, ama README yalnızca kişisel ve ticari olmayan kullanıma izin verdiğini yazıyor. Ticari kullanımdan önce yazarla netleştirin. Gecikmeli olduğu için canlı işlem zamanlamasına uygun değil. |
| [yahoo-finance2](https://github.com/gadicc/yahoo-finance2) | Resmi olmayan Node/TS Yahoo Finance istemcisi (quote, quoteSummary, chart, insights). MCP sunucusu ve CLI de içeriyor. Moonshot'un kullandığı Yahoo kütüphanesi büyük olasılıkla bu. | 2026-08-09 (npm 4.0.2) ✅ | Orta (801 yıldız, ~38 katkıcı, 1.647 commit; arızalar günler içinde düzeltiliyor) | **Orta (ikincil veri ve araştırma).** Ağustos 2026'da Yahoo'nun consent yönlendirmesi quote ve quoteSummary'yi bozdu (#1025); sorun bir günde düzeltildi. v4.0.0'dan beri Node ≥ 22 gerekiyor. Yahoo'nun resmi bir API'si ve erişim garantisi yok. Borsadan çıkan hisselerin verisini geriye dönük siliyor, bu da hayatta kalma yanlılığı yaratır. ATR ve stop için broker ya da borsa beslemesini kullanın. MIT. |
| [EdgarTools](https://github.com/dgunning/edgartools) | SEC EDGAR dosyalarını yapılandırılmış nesnelere çeviren Python kütüphanesi. Form 4 insider işlemlerini DataFrame olarak verir. Yerleşik MCP sunucusu var. | 2026-09-26 (PyPI 5.59.1; Eylül'de 4 sürüm) ✅ | Orta (~2,8k yıldız, 497 fork; tek ana bakımcı) | **Orta (yalnızca ABD hisse).** Moonshot'un insider özelliği için Finnhub'dan bağımsız, point-in-time bir kaynak. İşlem tarihi yerine dosyalama ya da kabul zamanını anahtar olarak kullanın. Python yan servis olarak ya da data.sec.gov JSON'u Node'dan doğrudan çağırarak kullanılabilir; data.sec.gov bu turda ilk elden doğrulanamadı. Anahtar gerekmiyor, ama her istekte e-posta kimliği ve SEC'in adil erişim limitleri geçerli. MIT. |
| [Massive (eski Polygon) client-js](https://github.com/massive-com/client-js) | TypeScript ile ABD fiyat çubukları ve haber. | 2026-09-28 ✅ | Orta (273, MIT) | **Orta.** Yahoo kazımasına göre daha güvenilir. Gerçek zamanlı veri ücretli (fiyat doğrulanamadı). |
| [Alpha Vantage MCP](https://github.com/alphavantage/alpha_vantage_mcp) | Resmi. 100'den fazla araç: ATR, RSI, haber sentiment'i, Kongre üyelerinin işlemleri, insider işlemleri. | 2026-09-28 (README); son kod değişikliği 2026-08-25 ✅ | Zayıf–orta | **Düşük–orta.** Claude için ikincil veri kaynağı. Ücretsiz katmanın limitleri belirsiz. |
| [Alpaca Skills](https://github.com/alpacahq/alpaca-skills) | Resmi ajan becerileri. Her gözetimsiz emir yolunda paper doğrulaması zorunlu (commit tarihi 2026-08-25). | 2026-08-31 ✅ | Zayıf | **Düşük.** Onay kapısı için tasarım referansı. |

**Dışarıda bırakılanlar:**
- **Paribu:** CCXT modülü yok. Tek kanıt, resmi olmayan bir C# sarmalayıcı: [burakoner/Paribu.Api](https://github.com/burakoner/Paribu.Api) (1 yıldız, son commit 2025-10-19 ❌). Bu sarmalayıcıya göre Paribu'nun HMAC imzalı bir API'si var; limit ve market emirlerinin yanında `condition` (tetik) parametreli koşullu emir de destekleniyor. Resmi dokümanlar açılamadı. OCO, trailing ya da testnet'e dair kanıt yok. TS entegrasyonu sıfırdan yazılmalı.
- **OKX TR:** CCXT'de (`okx` ve EEA için `myokx`) ve python-okx'te (son commit 2026-09-07) Türkiye host'u yok. Doğrulanamadı.
- **pybit:** Bybit TR istemcisi olarak önerilmiyor; eski `bybit-tr` alan adını kullanıyor.
- **BtcTurk sarmalayıcıları:** btcturk-api (PyPI) son sürümü 2021-04-22, bayat. cloudQuant/bt_api_btcturk'te 2026-08-16 tarihli commit var, ama yalnızca limit ve market emri destekliyor, enum eşlemesi dokümanla çelişiyor ve 0 yıldızlı. BTCTrader'ın diğer resmi SDK'ları 2021–2022'den kalma.
- **Deniz Yatırım AlgoLab:** Platform ve API **31.12.2025 itibarıyla kapatıldı.** Kaynak: en çok yıldızlı sarmalayıcının ([atillayurtseven/AlgoLab](https://github.com/atillayurtseven/AlgoLab), 89 yıldız) 2026-01-23 tarihli README notu.
- **Matriks IQ, İdeal Data/İdeal Pro, VİOP için MT5, Midas, Gedik, İş Yatırım:** Siteleri engelliydi ve GitHub'da ilgili repo yok. Değerlendirilemediler; dışlanmaları içerikleriyle ilgili değil.
- **Finnhub:** Finnhub-API GitHub reposunun son commit'i 2021-02-14. finnhub npm SDK'sı 2.0.15 2026-06-22'de yayımlandı ❌. API changelog'u ve durum sayfası açılamadı. Bu, API'nin kendisinin sağlığı hakkında bir şey söylemiyor.
- **secedgar** (2025-05-09) ve **sec-api** (2026-04-13): Pencere dışı ❌.
- **ib_async:** Son sürüm Aralık 2025 ❌.
- **mcp_massive:** Son commit Mayıs 2026 ❌.
- **CoinGecko TS SDK:** Toplulaştırılmış fiyatlar ATR için uygun değil.
- **Twelve Data MCP:** 2026-10-01'de OAuth sağlayıcısını kaldırdı; proje değişim halinde.
- **Binance Skills Hub:** Web3 ve copy-trade odaklı.
- **Databento:** TypeScript istemcisi yok; ücretli.
- **TradingView webhook'ları:** Doğrulanamadı; ayrıca araya üçüncü taraf bir tek hata noktası ekliyor.

### 4.5 Risk ve çıkış araçları

| Ad | Ne işe yarar | Son aktivite | Kanıt düzeyi | Bizim bota uygunluk |
|---|---|---|---|---|
| [trading-signals](https://github.com/bennycode/trading-signals) | TypeScript indikatörleri: ATR, NATR, Keltner, Donchian, ChandelierExit, VSTOP, SUPERTREND, PSAR. Akış tabanlı `update` / `replace`. | 2026-10-01 commit; 8.3.0 2026-08-11 ✅ | Orta (993 yıldız, MIT, fiilen tek geliştirici) | **Yüksek.** Moonshot içinde 2×ATR stop ve Chandelier tipi trail için. Ağustos'ta `replace()` ve EMA/RMA başlangıç değerleri düzeltildi; sürümü sabitleyin ve TA-Lib ile parite testi yapın. Moonshot `technicalindicators` kullanıyorsa (son sürüm 2020) buna geçin. |
| [TA-Lib Python](https://github.com/TA-Lib/ta-lib-python) | Referans ATR (Wilder). | 2026-09-21 (v0.8.1) ✅ | Güçlü (12,3k) | **Orta.** TS ATR hesabını doğrulamak için referans. |
| [quantstats](https://github.com/ranaroussi/quantstats) | Performans raporu (tear sheet), Monte Carlo, PSR, iflas riski. | 2026-09-27 (0.0.86) ✅ | Orta (7,7k) | **Orta.** Günlük raporlama için. Monte Carlo "bust probability" değeriyle risk yüzdesi kalibre edilebilir. `goal_probability` permütasyon altında anlamsız. En az 0.0.86'ya sabitleyin. |
| [skfolio](https://github.com/skfolio/skfolio) | WalkForward ve CombinatorialPurgedCV. | 2026-09-30 (v1.4.10) ✅ | Zayıf (2,5k) | **Düşük.** Birkaç gün süren etiketlerde sızıntısız çapraz doğrulama. |
| DSR / PBO / PSR yöntemi (Bailey & López de Prado) | Backtest aşırı uyum kontrolü. | Uygulamalar pencere içinde ✅ (vectorbt 1.1.1, quantstats, skfolio) | Orta (yöntem) | **Yüksek.** 6'dan fazla çıkış parametresi ve eşik ayarlanırken zorunlu. |
| [Hummingbot TripleBarrierConfig](https://github.com/hummingbot/hummingbot/blob/master/hummingbot/strategy_v2/executors/position_executor/data_types.py) | SL, TP, time_limit ve trailing (`activation_price`, `trailing_delta`) veri modeli; bariyer başına emir tipi. | 2026-09-22 ✅ | Güçlü (proje) | **Orta.** TS PositionManager için şema. |
| NautilusTrader RiskEngine | `REDUCING` durumu: yalnızca reduce-only emirlere, iptallere ve sorgulara izin verir. | 2026-09-15 ✅ | Güçlü | **Orta.** Günlük zarar freninin doğru işleyişini gösteriyor. |
| LEAN Risk modelleri | MaximumDrawdownPercentPortfolio, TrailingStopRiskManagementModel (tepeden yüzde), yeni bracket ve OCO emirleri. | 2026-10-01 ✅ | Güçlü | **Orta.** Risk modelini alfa modelinden ayırma kalıbı. |

**Çıkış kurallarımızın araç ve borsa desteği**

"Özel kod" = callback ya da kendi yazacağımız mantık. "—" = yok ya da doğrulanmadı.

| Araç / Borsa | 2×ATR başlangıç stop | +1R'de başabaş | ATR trailing | +2R'de %50 kâr | 48 saat / +0,5R kuralı | Günlük zarar freni |
|---|---|---|---|---|---|---|
| freqtrade | `stoploss_from_absolute` (ATR'yi biz hesaplarız) | Callback ("stepped stoploss" örneği) | Callback | `adjust_trade_position` ile negatif stake | `custom_exit` | Yerleşik değil: MaxDrawdown (equity) veya StoplossGuard ile yaklaşık |
| Hummingbot | `stop_loss` (volatilite faktörüyle ölçeklenebilir; tam işleyişi ⚠️) | — | `trailing_stop` + aktivasyon fiyatı | — | `time_limit` (koşulsuz) | — |
| vectorbt | `sl_stop` (giriş fiyatına oran; ATR için bar bazında dizi) | `adjust_sl_func_nb` | `sl_trail` | `from_order_func` / Numba callback | `from_order_func` / özel kod | — |
| PyBroker | `stop_loss` (puan) / `stop_loss_pct` | Özel kod | `stop_trailing` (puan; girişte k×ATR) / `stop_trailing_pct` | Özel kod | `hold_bars` (koşulsuz; +0,5R koşulu özel kod) | — |
| LEAN | Bracket / OCO (2026-09-25'ten beri) | Özel kod | TrailingStopRiskManagementModel (yüzde) | Özel kod | Özel kod | MaximumDrawdownPercentPortfolio |
| NautilusTrader | Native emir | Özel kod | Native trailing-stop | Özel kod | Özel kod | RiskEngine REDUCING / HALTED |
| backtest-kit | ✓ (README iddiası) | ✓ (iddia) | ✓ (iddia) | ✓ (iddia) | ✓ (iddia) | — |
| Binance Spot (borsa tarafı) | OTOCO bracket | Stop emrini değiştir | `trailingDelta` (BIPS) | Ayrı emir | — | — |
| Alpaca hisse (broker tarafı) | Bracket (sabit stop bacağı) | Cancel/replace | `trailing_stop` ($ veya %). Bracket'e trailing bacak eklenemez | Ayrı miktar yönetimi | — | — |
| IBKR | Bracket (`parentId`) / OCA | Ayarlanabilir stop (`triggerPrice` → `adjustedStopPrice`) | Trailing tutar veya yüzde; ayarlanabilir stop trailing'e dönüşebilir | — | — | — |
| Bybit V5 (Bybit TR dahil) | Spot `StopOrder` / `tpslOrder` ya da girişte `stopLoss` (borsada durur) | Amend veya cancel/replace | Spot'ta native yok; bot tarafında kademeli taşıma. Türevlerde `trailingStop` + `activePrice` | Ayrı TP/limit emri (⚠️ test edilmedi) | — | — |
| BtcTurk | `stopLimit` / `stopMarket` + `stopPrice` (2019 dokümanı; güncel API ⚠️) | Cancel/replace | Bot içinde (cancel/replace) | Ayrı limit emri; OCO yok, eşlemeyi bot yapar | Bot içinde | Bot içinde |

**Ortak sonuç:**
- Hiçbir borsa ya da broker native ATR trailing sunmuyor. Binance'in `trailingDelta`'sı (BIPS) ve Alpaca'nın `trailing_stop`'u sabit mesafeli çalışıyor. Doğrulanan TR borsalarının hiçbirinde native spot trailing emri yok.
- Önerilen desen:
  - Girişte borsada 2×ATR'lik bir koruyucu stop ya da bracket kurulur.
  - Bot bu stop'u ATR'ye göre yalnızca yukarı taşır (amend ya da cancel/replace).
  - Taşıma başarısız olursa eski stop yerinde kalır.
- OCO'su olmayan borsalarda (örneğin BtcTurk) kısmi kâr emri ile stop'u bot eşler.

### 4.6 Bloomberg ve kurumsal araçlar

| Ad | Ne işe yarar | Son aktivite | Kanıt düzeyi | Bizim bota uygunluk |
|---|---|---|---|---|
| [OpenBB Platform V5](https://github.com/OpenBB-finance/OpenBB) + openbb-mcp-server 2.0 | Açık veri platformu: temel analiz, makro, SEC ve fiyat verisi; Python, REST ve MCP üzerinden erişim. | 2026-10-01 ✅ (V5 2026-09-29; MCP v2.0.0 ve v2.0.1 2026-09-28) | Güçlü (73,7k; lisans AGPL'den Apache-2.0'a geçti) | **Orta.** Claude için ücretsiz, "Bloomberg benzeri" bir veri katmanı. **V5'te yfinance, FMP, Alpha Vantage, Intrinio, Tiingo, Benzinga ve diğer bazı sağlayıcılar kaldırıldı.** Python yan servis gerekir. Sürüm yalnızca birkaç günlük; sabitleyin. |
| [FinceptTerminal](https://github.com/Fincept-Corporation/FinceptTerminal) | Açık kaynak "Bloomberg Terminal alternatifi" (C++/Qt ve Python). Claude kendi API anahtarınızla kullanılabilir. | 2026-10-01 ✅ | Orta (32,1k) | **Düşük.** Araştırma ve izleme kokpiti; bota gömülecek bir şey değil. AGPL. Son commit'lerin çoğu fiyatlandırmayla ilgili. |
| [anthropics/financial-services](https://github.com/anthropics/financial-services) | Resmi Claude finans ajanları ve becerileri. Kurumsal veri MCP'leri: FactSet, S&P Global, Morningstar, LSEG, Moody's, PitchBook, MT Newswires, Aiera, Daloopa ve diğerleri (README tablosunda 12 bağlayıcı). | 2026-09-21 ✅ | Güçlü (38,5k, resmi) | **Düşük.** Claude'u Bloomberg sınıfı veriye bağlamanın resmi kalıbı ve "insan onayı" ilkesi. Abonelikler pahalı. Tasarımı gereği işlem yapmaz, tavsiye vermez. İçerik oynak: Financial Advisors eklentisi bir hafta içinde eklendi ve kaldırıldı. |

**Doğrulanamayan Bloomberg ve basın materyali** (hepsi ⚠️, ana tabloya alınmadı):
- Bloomberg: "AI-Powered Trading Bots Help Retail Investors Take On Hedge Funds" (URL'ye göre 2026-08-02)
- Bloomberg Enterprise MCP (yaklaşık 2026-09-29)
- Bloomberg Terminal ASKB Ağustos 2026 güncellemesi
- "ExodusPoint Joins Hedge Funds Partnering With Anthropic Over AI" (2026-09-29)
- Bloomberg'in Jev haberi (2026-09-25; yalnızca tarama snippet'lerinden)
- CNBC: Bracket22
- Fortune: Robinhood Agents (yalnızca ABD'de geçerli)

**Diğer notlar:**
- **blpapi 3.26.6.1:** 2026-07-16 ❌ ve Terminal aboneliği gerektiriyor.
- **Topluluk "Bloomberg MCP" sunucuları:** Resmi değil, oturum açılmış bir Terminal gerektiriyor.
- **BloombergGPT:** Halefi yok.

### 4.7 Claude ekosistemi

| Ad | Ne işe yarar | Son aktivite | Kanıt düzeyi | Bizim bota uygunluk |
|---|---|---|---|---|
| [@anthropic-ai/sdk](https://github.com/anthropics/anthropic-sdk-typescript) (düz Claude TS SDK) | Messages API istemcisi:<br>• `client.messages.parse()` + `zodOutputFormat` (`@anthropic-ai/sdk/helpers/zod`): şemayla doğrulanan JSON<br>• `client.messages.batches.*`: asenkron Batch API<br>• `cache_control`: prompt caching | 2026-09-30 (npm 0.131.0; tag GPG ile doğrulanmış; 0.128–0.131 arası 4 sürüm 22–30 Eylül arasında) ✅ | Güçlü (resmi; ~2,1k yıldız, 415 fork, release-please otomasyonu) | **Yüksek. Önerilen LLM katmanı budur.** Express sunucusunda tek bir `messages.parse` çağrısı yeterli:<br>• Zod şeması: `{decision: approve\|veto, confidence, reasons[]}`<br>• Kurallar ve çıkış merdiveni sabit, cache'lenen bir sistem promptunda<br>• Sonuç tipli ve deterministik; ajan döngüsü gerekmez<br>Batch API gece yapılan haber ve sentiment taraması için uygun; giriş vetosu için değil (gecikme 24 saate kadar çıkabiliyor). Batch başına en fazla 100.000 istek veya 256 MB; çoğu 1 saatte biter.<br>Dikkat edilecekler:<br>• Neredeyse her gün yeni 0.x sürüm çıkıyor; sürümü sabitleyin.<br>• Opus 5.5'te `thinking: {type:'disabled'}` 400 hatası döndürür. `effort` varsayılanı `medium`; sınıflandırma için `low`'a ayarlayın.<br>• Zorunlu `tool_choice` (`any`/`tool`) 400 döndürür; structured outputs kullanın.<br>• `stop_reason: 'refusal'` gelirse veto sayın (fail-closed).<br>• Minimum cache'lenebilir önek uzunluğu modele göre değişir; daha kısa önekler sessizce cache'lenmez.<br>MIT. |
| [Claude Opus 5.5](https://www.anthropic.com/news/claude-opus-5-5) + Structured Outputs | Seçtiğiniz model; tipli JSON çıktısı. | 2026-09-22 ✅ (Sonnet 5.5: 2026-09-28) | Orta (yalnızca satıcı benchmark'ları ve müşteri yorumları; işlem P&L'i yok) | **Yüksek.** Fiyatlar (1 milyon token başına):<br>• $4 girdi, $20 çıktı<br>• Cache okuma $0,20 (girdinin %5'i)<br>• Cache yazma: 5 dakikalık $5 (1,25x), 1 saatlik $8 (2x)<br>• Batch $2/$10; cache indirimiyle birlikte uygulanır<br>Thinking kapatılamıyor; thinking token'ları çıktı olarak faturalanıyor. Sayısal kısıtlar (`minimum`, `maximum`) sunucu tarafında uygulanmıyor; Zod ile kendiniz doğrulayın. Yüksek hacimli çağrılar için Sonnet 5.5 daha ucuz. |
| [Claude Agent SDK (TS)](https://github.com/anthropics/claude-agent-sdk-typescript) | Claude Code harness'ı kütüphane olarak: ajan döngüsü, araç izinleri, PreToolUse hook'ları, `canUseTool`. | 2026-10-01 (npm 0.3.287; 0.3.283 – 0.3.287 sürümleri 2026-09-25 ile 10-01 arasında çıktı) ✅ | Güçlü (resmi) | **Orta (isteğe bağlı).** Tek bir yapılandırılmış veto çağrısı için gereğinden ağır:<br>• Lisans tescilli (LICENSE.md: "© Anthropic PBC. All rights reserved").<br>• Platforma özel native Claude Code ikili dosyalarını optionalDependencies olarak getiriyor.<br>• Neredeyse her gün yeni 0.3.x sürümü çıkıyor.<br>Çok adımlı, araç kullanan araştırma işleri için düşünülebilir. Kullanılırsa:<br>• Hook ile verilen bir ret, `bypassPermissions` modunda bile geçerli kalıyor.<br>• `requiresUserInteraction` işaretli MCP araçları her zaman `canUseTool`'a düşüyor.<br>• v0.3.286'dan beri `permissionMode` açıkça verilmeli; verilmezse oturum "auto" modunda başlayabilir.<br>Demo uygulamaları üretim için değil. |
| [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) | Kendi MCP sunucunuzu yazmak için. | 2026-09-28 (v2.2.0 / 1.31.0) ✅ | Güçlü (13,5k, resmi) | **Orta.** Moonshot'un skorlarını ve risk durumunu Claude'a, botun kullandığı sayılarla aynı şekilde açar. v1'den v2'ye geçişte paket yapısı ayrıldı; geçiş işi gerekir. |
| [typesafe-ai/system-one-adapter-python](https://github.com/typesafe-ai/system-one-adapter-python) | Jev API'sinin LLM destekli (Anthropic dahil) birebir yedeği. | 2026-09-22 ✅ | Zayıf (371) | **Düşük.** Jev ile Claude'u aynı tipli sorularla A/B testine sokmak ve Jev çökerse yedek olarak kullanmak için. |
| [beebots](https://github.com/imikerussell/beebots) | Jev ve OKX ile paper botlar. ATR stop, günlük zarar stop'u, Jev harcama tavanı. | 2026-09-27 ✅ | Zayıf (196 yıldız, 9 commit) | **Düşük.** Yalnızca tasarım referansı: model geçerli hamleler arasından seçer, R ve stop'lar kodda. Kaldıraçlı perp kullanıyor. Deploy butonunda referral bağlantısı var. |

Jesse MCP, Lumibot'un Claude desteği, claude-trading-skills ve RD-Agent ayrıca 4.1 ve 4.2'de listelendi.

**Dışarıda bırakılanlar:**
- **claude-for-financial-advisors:** README'si "bakımı yapılmıyor" diyor.
- **claude-cookbooks:** Finans not defteri yok.
- **knowledge-work-plugins "finance":** Muhasebe odaklı.
- **Massive MCP ve Financial Datasets MCP:** Bayat.
- **Claude Marketplace (2026-09-23):** Doğrulanamadı.

**Not, Anthropic Kullanım Politikası:** Finansal kararlar "yüksek riskli" kullanım sayılıyor. Bireyleri doğrudan etkileyen tavsiye ya da kararlarda nitelikli bir profesyonelin incelemesi ve AI kullanıldığının açıklanması gerekiyor. Bu, botu kendiniz için kullanırken değil, başkalarına ürün olarak sunarsanız önem kazanır.

### 4.8 Kanıt kaynakları (makaleler ve benchmark'lar)

| Ad | Ne işe yarar | Son aktivite | Kanıt düzeyi | Bizim bota uygunluk |
|---|---|---|---|---|
| [DXRG üretim kaydı](https://github.com/ProjectDXAI/continuous-record-llm-trading-agents) | LLM ajanlarının üretim ortamındaki davranışı; çıkış ve boyutlandırma deneyleri; 17 kurallı değerlendirme kanonu. | 2026-09-10 ✅ | Orta (çıkar çatışması var, hakemsiz, çoğu paper) | **Yüksek.** Mimarimizi en güçlü destekleyen kanıt. |
| [Luo 2026 sentiment (yeniden uygulama)](https://github.com/chirindaopensource/from_financial_sentiment_classification_to_return_predictability) | LLM sentiment'inin getiriyi öngörüp öngörmediği. | 2026-08-23 ✅ | Zayıf (üçüncü taraf README'si) | **Yüksek (negatif kanıt).** Sentiment'in ağırlığını düşük tutmayı destekliyor. |
| [AI Trading Arena verisi](https://github.com/ckamelhar-collab/ai-trading-arena-data) | Opus 5.5 dahil LLM'lerin ABD hissede paper sonuçları; sabit kurallı kontrol kolu. | 2026-10-01 ✅ | Zayıf | **Orta.** Kontrol kolu tasarımını kopyalayın. |
| [OpenAlpha](https://github.com/ThomasCaruso/OpenAlpha) | Kronos'un ön-kayıtlı, sıfır-atış testi. | 2026-08-20 ✅ | Zayıf | **Düşük (negatif kanıt).** Ön-kayıt yönteminin örneği. |
| [kronos-evaluation](https://github.com/imanly97/kronos-evaluation) | Kronos'un yön ve volatilite tahmininin bağımsız testi. | 2026-09-16 ✅ | Zayıf | **Düşük (negatif kanıt).** |

**Pencere dışı ya da sonuçsuz olanlar:**
- **LiveTradeBench, StockBench, Agent Market Arena, DeepFund:** Pencere dışı.
- **[pedropereira4/news-sentiment-trading-signals](https://github.com/pedropereira4/news-sentiment-trading-signals):** Moonshot ile aynı yığını kullanıyor (Finnhub, Alpaca, Claude). Ön-kayıtlı; veri toplama 2026-10-30'a kadar sürüyor ve henüz sonuç yok.
- **Eikos Arena:** 72 saatlik tek bir paper koşusu.
- **WAGMI Bench, Xitadel-QuantBench:** Claude değerlendirilmemiş ya da kapsamı dar.

---

## 5. Bizim tasarıma eşleme

| Tasarım parçası | Önerilen araç(lar) | Neden / nasıl |
|---|---|---|
| **Sinyal skoru** (RSI, momentum, sentiment, insider) | Mevcut Moonshot skor servisi ve trading-signals 8.3.0 (ATR/NATR, Keltner, Donchian).<br>Doğrulama: vectorbt 1.1.1, PyBroker 2.0.1 ve Jesse'nin kural anlamlılık testi.<br>ABD insider verisi: EdgarTools.<br>İsteğe bağlı çevrimdışı faktör araştırması: RD-Agent. | Yerleşik bir TS kütüphanesi kullanılır. Skorun gerçekten bir üstünlüğü olup olmadığı rastgele girişlere karşı test edilir. Sentiment'in ağırlığı düşük tutulur (Luo; DXRG 0/84). Insider verisinde işlem tarihi değil, dosyalama ya da kabul zamanı kullanılır; EdgarTools her Form 4'te ikisini de veriyor, TradingAgents'ın 2026-09-29 düzeltmesi de aynı mantıkta. ai-hedge-fund'ın PEAD/8-K kuralı bir fikir olarak değerlendirilebilir. RD-Agent'ın önerdiği faktörlerde ezber riski var; yalnızca LLM'in eğitim kesim tarihinden sonraki veriyle doğrulayın. |
| **LLM katmanı** | `@anthropic-ai/sdk` ile `messages.parse` + `zodOutputFormat`. Model Opus 5.5, `effort: 'low'`, kurallar ve çıkış merdiveni cache'lenen sabit bir sistem promptunda. Yüksek hacimde Sonnet 5.5. Gece taramaları için Batch API. İsteğe bağlı olarak önde Jev filtresi. Agent SDK yalnızca çok adımlı araştırma işleri için. | Claude yalnızca eşiği geçen adaylarda çağrılır; günlük çağrı ve bütçe tavanı olur. **Fail-closed:** hata, zaman aşımı ya da `refusal` durumunda giriş yapılmaz. Claude çıkışları etkilemez. Her kararı ve maliyetini loglayın, karar değiştirme oranını ölçün (DXRG: %35'e karşı %90+). Claude'a kalıcı "hafıza" verilmez. Kalıplar için TradingAgents (analist rolleri, karar günlüğü) ve dexter (structured output, araç döngüsü limiti) incelenebilir. |
| **Giriş** | Yüksek eşik, histerezis ve kovalama filtresi. Giriş, koruyucu emirle aynı anda gönderilir:<br>• Binance: OTOCO<br>• Alpaca: bracket<br>• IBKR: bracket<br>• Bybit TR: girişte `stopLoss` / `takeProfit`<br>• BtcTurk: giriş dolar dolmaz `stopLimit` / `stopMarket` (atomik değil ⚠️) | Açılış ve koruma atomik olmalı (DXRG'de 35 açılışın 24'ü korumasız kalmıştı). Boyutlandırma: `adet = özsermaye × risk% / (2×ATR)`. Kovalama filtresi (son 1 saatte +%0,75'in üstü) test edilecek bir hipotez; güven aralığı sıfırı kesiyor. |
| **2×ATR stop, başabaş, iz süren stop, kısmi kâr ve 48 saat kuralı** | Moonshot içinde bir TS PositionManager.<br>• Şema: Hummingbot TripleBarrierConfig.<br>• İndikatörler: trading-signals ATR ve ChandelierExit; TA-Lib ile parite testi.<br>• Referans kod: freqtrade callback'leri ve backtest-kit.<br>• Kanıt: vectorbt ve PyBroker ile ablasyon. | Stop borsada durur, bot onu yalnızca yukarı taşır. Trail mesafesini ATR'den türetin: Alpaca'da $/%, Binance'te BIPS cinsinden `trailingDelta`. Bybit TR ve BtcTurk'te native spot trailing olmadığı için borsadaki stop amend ya da cancel/replace ile kademeli taşınır. Alpaca bracket'e trailing bacak eklenemez; kısmi kâr ayrı miktar yönetimi gerektirir. BtcTurk'te OCO olmadığı için TP ile stop'u bot eşler. 48 saat / +0,5R kuralı koşullu olduğundan özel kod gerekir; Hummingbot `time_limit` ve PyBroker `hold_bars` koşulsuz çalışır. Karşıt sinyal çıkışı deterministik skordan hesaplanmalı ve histerezisle uygulanmalı (jev-trader'daki `FLIP_THRESHOLD` fikri). |
| **Maliyet ve işlem limiti** | Maliyeti R cinsinden hesaplayın. vectorbt ile eşik, ATR çarpanları ve günlük tavan için maliyet dahil ızgara taraması yapın. | Her aday için `maliyet_R` hesaplanmalı; R'si düşük setup'lar elenmeli. freqtrade backtest'inin iyimser varsayımlarına karşı kayma payı ekleyin. ccxt-mcp'deki `maxOrderValue` ve `maxDailyValue`, kodda tutulacak sabit sınırlara örnek. Bybit TR ve diğer borsaların ücretlerini hesap açtıktan sonra kendiniz doğrulayın. |
| **Günlük zarar freni** | Moonshot risk motorunda kendi kodunuz, NautilusTrader REDUCING modeline göre. claude-trading-skills'teki Drawdown Circuit Breaker şartnamesi. Agent SDK kullanılırsa PreToolUse hook'ları ek bir katman olur. | Fren devreye girince yeni giriş açılmaz; mevcut stop, trail ve iptal işlemleri çalışmaya devam eder. Çıkış emirleri reduce-only işaretlenmeli. freqtrade'de yerleşik değil. Risk yüzdesini kalibre etmek için quantstats Monte Carlo "bust probability" değerini kullanın. Dış emniyet olarak ayrı bir alt hesap açın ve yalnızca riske edilecek tutarı yatırın; Binance Agent OS'taki alt hesap fikri bunun bir örneği (⚠️). |
| **Paper trading** | Kripto: Binance Demo Mode; freqtrade dry-run (referans).<br>Bybit TR: TR testnet'i yok, global testnet ya da botun kendi paper simülatörü.<br>BtcTurk: kendi simülatörünüz.<br>Hisse: Alpaca paper (varsayılan). | Tam otomatik çalışır, iki kollu A/B testi yapılır (bkz. Bölüm 9). Bybit demo'da WS API yok. CCXT'de BtcTurk sandbox'ı yok; 2019 dokümanındaki test ortamları belirsiz. Paper sonuçları canlıyla aynı değil; Demo Mode'un kendi dokümanı da bunu söylüyor. |
| **Gerçek para onayı** | Emir yolunda deterministik bir kontrol ve React istemcide onay ekranı. | Kullanıcı limitini aşan emirler `pending_approval` durumuna düşer. Onay kartında Claude'un açıklaması gösterilir. Onay zaman aşımına uğrarsa emir iptal edilir. LLM'e canlı emir aracı verilmez: Alpaca MCP'de `ALPACA_TOOLSETS` trading içermez, ccxt-mcp'de yalnızca market ve read açılır. API anahtarları yalnızca işlem yetkili, para çekme kapalı ve IP whitelist'li olmalı. Alpaca Skills ve QuantDinger'deki çoklu "canlı işlem" bayrakları da bu kalıbın örnekleri. |
| **Veri** | ATR ve stop için işlem yapılan borsanın ya da broker'ın kendi OHLCV verisi (ccxt `fetchOHLCV`, Alpaca, Bybit V5).<br>Mevcut Yahoo (yahoo-finance2) ve Finnhub ikincil kaynak olarak.<br>ABD: Massive (ücretli), insider için EdgarTools.<br>Türkiye: Borsa MCP (kendiniz host edin).<br>Claude bağlamı: OpenBB V5 ve Alpha Vantage MCP. | yahoo-finance2 Ağustos 2026'da Yahoo kaynaklı bir değişiklikle bozuldu; v4 Node ≥ 22 istiyor; silinen hisseler hayatta kalma yanlılığı yaratıyor. Point-in-time disiplini için TradingAgents v0.4–v0.5 düzeltmeleri kontrol listesi olarak kullanılabilir. borsapy'nin lisansı çelişkili ve verisi gecikmeli. OpenBB V5 artık yfinance içermiyor. |

---

## 6. Önerilen mimari

### 6.1 Temel karar: TypeScript çalışma zamanı, Python yalnızca çevrimdışı

İşlem botu Moonshot (Node) içinde, TypeScript ile çalışmalı. Gerekçeler:
- Gereken her parça bugün TS'de mevcut ve pencere içinde güncellendi: CCXT, `@binance/spot`, `sieblyio/bybit-api`, Alpaca SDK, trading-signals, `@anthropic-ai/sdk` ve MCP TS SDK.
- Tek bir süreç, diller arası durum senkronizasyonu sorununu ortadan kaldırır.
- Node sürümünü kontrol edin: `@binance/spot` Node ≥ 22.12, yahoo-finance2 v4 Node ≥ 22 istiyor.

Python çevrimdışı araştırma ve doğrulama için kullanılır:
- vectorbt, PyBroker, Jesse, quantstats, skfolio
- freqtrade dry-run (paralel paper benchmark'ı olarak)
- İsteğe bağlı: EdgarTools (ABD insider verisi), RD-Agent (faktör araştırması)

**Alternatif: freqtrade'i ayrı bir servis olarak çalıştırmak.** Kripto için çalışan bir paper botuna en hızlı yol budur. Dezavantajları:
- Çıkış mantığı Python'da kalır.
- GPLv3 lisanslıdır; kodunu ticari bir TS ürününe kopyalamayın.
- Binance TR ve BtcTurk resmi destek listesinde yok.

```
Borsa/broker OHLCV (birincil) · Yahoo / Finnhub / EdgarTools (ikincil)
        │
        ▼
[Moonshot skor servisi]  RSI · momentum · sentiment · insider
        │   + trading-signals (ATR, NATR, ChandelierExit)
        ▼
[Sinyal motoru]  yüksek eşik · histerezis · kovalama filtresi · günlük işlem tavanı
        │ aday
        ▼
[LLM servisi]  @anthropic-ai/sdk messages.parse + Zod (Opus 5.5, effort: low,
        │      cache'li sabit sistem promptu; opsiyonel önce Jev tipli ön-filtre)
        │      veto/onay + gerekçe · hata/timeout/refusal ⇒ GİRİŞ YOK (fail-closed)
        ▼
[Risk motoru]  boyut = özsermaye × risk% / (2×ATR)
        │      günlük zarar freni ⇒ REDUCING (yalnız çıkış/iptal)
        │      tutar > kullanıcı limiti ⇒ onay kuyruğu (React istemci)
        ▼
[Yürütme adaptörü]  ccxt / @binance/spot / bybit-api   veya   @alpacahq/alpaca-trade-api
        │      giriş + borsa tarafı koruyucu stop (OTOCO / bracket / stopLoss) birlikte
        ▼
[PositionManager]  +1R başabaş · ATR trail (yalnız yukarı, amend/cancel-replace) · +2R'de %50
        │          48 saat / +0,5R kuralı · karşıt sinyal çıkışı
        │          kalıcı durum + heartbeat + yeniden başlatmada uzlaştırma
        ▼
[Günlük + açıklama]  Claude açıklaması · salt-okur MCP sunucusu (MCP TS SDK)

Çevrimdışı (Python): vectorbt · PyBroker · Jesse · freqtrade dry-run · quantstats · skfolio
                     (opsiyonel: EdgarTools · RD-Agent)
```

### 6.2 (a) Kripto yolu

1. **Borsa seçimi (önce doğrulayın):**
   - spk.gov.tr'deki kripto varlık hizmet sağlayıcı listesini kontrol edin.
   - Hangi hesabı gerçekten açabildiğinizi deneyin.
2. **Teknik sıralama (doğrulanmış kanıta göre, borsa tarafı stop açısından):**
   - **Binance global:**
     - Teknik olarak en uygun seçenek: OTOCO ile girişte bracket kurulabiliyor, `trailingDelta` (BIPS) destekleniyor, Demo Mode var.
     - Türkiye'den kullanılabilirliği ⚠️.
   - **Bybit TR:**
     - Güncel resmi V5 dokümanı spot'ta borsada bekleyen koşullu emirleri (`StopOrder`, `tpslOrder`) ve girişte TP/SL'yi tanımlıyor. Doğrulanan TR seçenekleri içinde çökme güvenliği en iyi belgelenen borsa bu.
     - Spot'ta native trailing yok. TR testnet'i yok. Uyumlu siteler çoğunlukla yalnızca spot.
     - TS istemcisi: `sieblyio/bybit-api` (`apiRegion: 'TK'`) ya da CCXT `hostname: 'bybit.tr'` (canlı test edilmedi). pybit'i kullanmayın; eski host'u kullanıyor.
     - Ücretler, TRY çiftleri ve lisans durumu ⚠️.
   - **BtcTurk:**
     - Kendi dokümanı `stopLimit` ve `stopMarket` emirlerini `stopPrice` ile tanımlıyor. Ancak okunabilen doküman 2019 tarihli ve güncel API'de doğrulanmadı ⚠️.
     - CCXT üzerinden ham parametreyle (`{stopPrice}`) gönderilebilmesi gerekir; canlı test edilmedi.
     - OCO ve trailing yok. CCXT'de websocket ve sandbox yok.
     - Güncel API'de stop tipleri doğrulanırsa, Bybit TR'ye yakın bir çökme güvenliği sağlar. Tek fark: TP ile stop'u bot eşlemek zorunda.
   - **Binance TR:**
     - CCXT'de modülü yok (`binancetr.ts` 404); resmi TS konnektörü de desteklemiyor.
     - Bulunan ve bakımı süren az sayıdaki istemciden biri UNICORN (Python, eski trbinance.com alan adını kullanıyor).
     - Binance TR'nin kendi REST API'sini Node'dan doğrudan kullanma seçeneği kontrol edilmedi.
     - Emir tipleri ve testnet'i doğrulanamadı.
   - **Paribu:**
     - CCXT modülü yok.
     - Tek kanıt, 2025 tarihli bir C# sarmalayıcı. Koşullu (tetik) emir olabileceğini gösteriyor ama doğrulanmadı.
   - **OKX TR:** CCXT'de ve python-okx'te Türkiye host'u bulunamadı.
3. **Kütüphaneler:**
   - CCXT v4.5.85 (sürümü sabitleyin).
   - Binance'in yerel emir listeleri için `@binance/spot` v34.0.0 (Node ≥ 22.12).
   - Bybit için `sieblyio/bybit-api`.
4. **Ürün kapsamı:** Yalnızca spot, kaldıraç yok. DXRG'de likidasyonların %62'si tek bir ayar hücresinde toplanmıştı. Passivbot, NOFX ve beebots'un kaldıraçlı perp yaklaşımı tasarımımıza uymuyor.

### 6.3 (b) ABD hisse yolu

1. **Alpaca:**
   - Paper varsayılan.
   - Hisselerde bracket, OCO, OTO ve `trailing_stop` var.
   - TS SDK v5.0.0 kırıcı değişiklik içeriyor ve yalnızca bir günlük. Yeni kodda v5'i sabitleyin ya da ilk haftalarda 4.0.4'te kalın.
   - Türkiye'den hesap açılabilirliği ⚠️ doğrulanmalı. alpaca-docs reposunda (son commit 2025-04-10) ülke listesi yok; alpaca.markets açılamadı.
2. **Alternatif IBKR:**
   - @stoqey/ib ile ayarlanabilir stop'lar, çıkış merdivenimize en yakın seçenek.
   - TWS veya Gateway sürekli çalışmalı.
   - Türkiye'den uygunluk ⚠️; interactivebrokers.com açılamadı.
3. **Veri:** Insider sinyali için EdgarTools ile point-in-time Form 4 verisi. ATR ve stop için Alpaca'nın ya da broker'ın kendi verisi.
4. **Doğrulama:** PyBroker (walk-forward, bootstrap) ya da LEAN (bracket ve OCO).
5. **LLM kararlarını backtest etmek:** Lumibot'taki replay cache yaklaşımı, Claude kararlarının deterministik olarak tekrarlanması için iyi bir fikir.
6. **Gece boşluğu riski:** Pozisyonlar gece taşınacağı için stop broker tarafında durmalı. Fiyat ertesi gün stop'un altında açılabilir; bunu R hesabında ve backtest'te hesaba katın.

### 6.4 Türkiye ve BIST notu

- **Deniz Yatırım'ın AlgoLab platformu ve API'si 31.12.2025 itibarıyla kapatıldı.** Böylece akla gelen tek açık bireysel BIST emir API'si ortadan kalktı.
- GitHub'da Türk bir aracı kurum API'si üzerinden gerçek BIST ya da VİOP emri veren herkese açık bir repo bulunamadı ("bist broker api order" ve "deniz yatırım api" aramaları 0 sonuç verdi).
- Matriks IQ ve İdeal doğrulanamadı; siteleri engelliydi ve ilgili repo yok.
- BIST'te algoritmik işlem lisanslı bir aracı kurumun API'si üzerinden yapılmak zorunda. İlgili mevzuat atfı (III-37.1) doğrulanamadı.
- Öneri: BIST'i şimdilik yalnızca veri ve araştırma için kullanın; bunun için Borsa MCP ve KAP bağlamı yeterli. BIST'te işlem yapmak ileride aracı kurumla doğrudan görüşülerek ayrı bir iş olarak ele alınmalı.
- Kripto mevzuatı:
  - 7518 sayılı Kanun (6362 sayılı SPKn'yi kripto varlık hizmet sağlayıcıları için değiştiren kanun) bu oturumda **doğrulanamadı**. Arka plan bilgisi Temmuz 2024'te yürürlüğe girdiği yönünde; resmi kaynaktan teyit edin.
  - TR borsalarının yerel olarak düzenlenen ayrı tüzel kişiler gibi çalıştığına dair dolaylı bir kanıt var: Bybit dokümanlarındaki Türkiye'ye özel uyum alanları. Çekimde `transactionPurpose` zorunlu, MASAK travel-rule verisi isteniyor ve HighValueReview durumları var.

### 6.5 Çökme güvenliği

- **Her girişle birlikte borsa tarafında bir koruyucu stop olmalı.** Bot çökse bile en kötü durum 2×ATR stop ya da başabaş stop olur.
- **Bot stop'u yalnızca yukarı taşır.** Taşıma işlemi başarısız olursa eski stop yerinde kalmalı.
- **Durum kalıcı olmalı ve heartbeat olmalı.** Bot yeniden başladığında açık pozisyonları ve emirleri borsayla karşılaştırıp uzlaştırmalı.
- **Borsa tarafı stop desteği, doğrulanmış kanıta göre:**
  1. Binance global (OTOCO, `trailingDelta`) ile Alpaca ve IBKR (bracket) en güçlü seçenekler. Ancak Türkiye'den erişimleri ⚠️.
  2. Ardından Bybit TR geliyor: güncel resmi dokümana göre spot koşullu emir ve TP/SL borsada bekleyebiliyor.
  3. Sonra BtcTurk: `stopLimit` ve `stopMarket` büyük olasılıkla var, ama yalnızca 2019 dokümanından biliniyor ve OCO yok.
  4. Binance TR ve Paribu'nun emir tipleri doğrulanamadı.
- **BtcTurk'te OCO olmadığı için stop ile +2R kâr emri borsada bağlanamaz.**
  - Seçenek 1: Kısmi kâr emrini önceden koymayın; bot +2R'de göndersin.
  - Seçenek 2: TP dolduğunda stop miktarını hemen güncelleyin.
  - Her iki durumda da bot çökerse iki emrin çakışma riski kalır.
- **Yeniden deneme mantığı dikkatli kurulmalı.** Reddedilen bir emirden sonra yeni emirleri durdurmak, sonsuz bir yeniden deneme döngüsünü önler. Bu yaklaşım beebots'un 2026-09-27 sürümünde var.

### 6.6 Claude'un yeri

- **Claude yavaş yolda çalışır, kritik yolda değil.** Görevleri:
  - Girişte veto ya da onay ve gerekçe üretmek (`@anthropic-ai/sdk`, tek `messages.parse` çağrısı).
  - Haber ve KAP özetleri hazırlamak (acil değilse Batch API ile).
  - Onay kartının metnini yazmak.
  - Günlük ve haftalık "postmortem" yorumları yazmak.
- **Claude'un hiçbir koşulda yapmayacakları:** stop, trail ve kısmi kâr kararları; risk limitlerini değiştirmek; canlı emir aracına erişmek.
- **Bağlam:**
  - Veto çağrısında bağlamı Moonshot kendisi toplar ve prompta koyar. Böylece Claude, botun kullandığı sayılarla aynı sayılar üzerinden karar ve açıklama üretir.
  - Salt-okur MCP sunucuları, insanın yürüttüğü Claude araştırma oturumları ve isteğe bağlı Agent SDK işleri için kullanılır:
    - Alpaca MCP (veri ve haber araç setleri)
    - ccxt-mcp (yalnızca market ve read katmanları)
    - Borsa MCP
    - Moonshot'un kendi MCP sunucusu
- **Araç dönüşleri ve haber metinleri prompt injection içerebilir.** Alpaca MCP v2.3.2'deki "trust-boundary envelope" kalıbını kendi LLM döngünüzde de uygulayın.

---

## 7. "jev" hakkında

**Bulunanlar:**
- **TypeSafe AI** gerçek bir GitHub organizasyonu ([github.com/typesafe-ai](https://github.com/typesafe-ai)). "Makinelerin doğrudan kullanacağı" **System One** modelleri geliştiriyor.
- Resmi SKILL.md, Jev'i "flagship System One model" olarak tanımlıyor.
  - ⚠️ Bir kaynak aynı ifadeyi "flagship and first System One model" olarak aktarıyor, ancak doğrulama turunda "first" kelimesi görülmedi.
- Jev metin üretmiyor; **tipli yanıtlar ve olasılıklar** döndürüyor. Soru tipleri:
  - **Choice:** seçenekler arasından seçim
  - **Noul:** "evet" olasılığı
  - **Score:** puan
- **SDK'lar:**
  - npm `@typesafe-ai/sdk` (MIT, Node ≥ 20)
  - Python SDK: v0.5.7 ilk açık sürüm (2026-09-12); son sürüm v0.7.2 (2026-09-26)
  - WorkflowEvals reposu "jev-1.13.0" sürümünü değerlendiriyor.
- **Çıkış tarihi:** İkincil bir kaynağa göre 2026-09-15 (bir [topluluk gist'i](https://gist.github.com/drillan/6916b16e8ea31a8ec36c8f59d6483150), 2026-09-20).
- **Doğrulanmış entegrasyonlar:**
  - TradingAgents v0.5.1 (2026-09-24): "TypeSafe's Jev reads each StockTwits and Reddit post the Sentiment Analyst fetches". Şirketle ilgisiz gönderiler eleniyor.
  - ai-hedge-fund: "Add JevLLM" commit'leri, 2026-09-18.
  - QuantDinger: Jev'i girişten önce bir kapı olarak kullanıyor; bu kapı fail-open.
- **Doğrulanamayanlar** (satıcı sayfaları engelliydi):
  - **Yalnızca topluluk README'lerinde geçenler:** fiyat ($0,042 / 1 milyon girdi token'ı), 70–500 ms gecikme, model kimliği ve API endpoint'i.
  - **Tarama snippet'lerinden ve engellenen basın sayfalarından gelenler:** $40M DCVC tohum yatırımı ve Bloomberg'in 2026-09-25 tarihli haberi.
- **Doğrulanabilir işlem kanıtı yok:**
  - Satıcının kendi benchmark'ında %67,8.
  - Rakip bir modelin benchmark'ında (JevBench) Jev 73,0, Eikos-27B 82,9.
  - laya'nın kalibrasyon tablosu, Jev için kendi ölçmediği, üçüncü taraf rakamlar kullanıyor.
  - Görülen tek sayısal işlem verisi 72 saatlik bir paper maçı: Jev +%0,87 (31 işlem). Bu yalnızca anekdot düzeyinde.
  - **Gerçek parayla çalışan bir Jev botu var, ama P&L'i görülmedi:** Gist'te listelenen [aowang-ai/jev-trade](https://github.com/aowang-ai/jev-trade) (173 yıldız, MIT) Jev'in Hyperliquid portu. "Real fills" ve jev-trade.com'da canlı bir masa iddia ediyor. Ancak P&L görülmedi ve varsayılan mod testnet.
  - jev-trader (2,7k yıldız) mock modelle dry-run modunda çalışıyor; P&L yayımlamıyor.
  - "jev" ekosistemindeki yıldız sayıları abartılı görünüyor (örneğin 2 commit'lik bir repoda 2.521 yıldız).
- **Açık replikalar:** OpenJev, laya ve kev Hugging Face'te var ve aynı API protokolünü kullandıklarını iddia ediyorlar. Performans rakamları kendi beyanları; HF sayfaları bu oturumda açılamadı.
- **Dil:** Jev esas olarak İngilizce çalışıyor. Türkçe ve KAP haberlerinde test edilmemiş.

**Kullanılacaksa, önerilen rol** (deneysel, yalnızca paper):
- Claude'dan önce çalışan ucuz, tipli bir ön filtre. Örnek sorular:
  - "Bu haber bu hisseyle ilgili mi?"
  - "Haber boğa mı, ayı mı, ilgisiz mi?"
  - "Karşıt sinyal çıkış için yeterince güçlü mü?" (evet/hayır ve olasılık)
- Güveni düşük durumlar Claude'a ya da insan onayına yönlendirilir.
- Jev hata verirse fail-closed: giriş yapılmaz.
- Çıkışlar Jev'e bağlanmaz.
- Kendi kalibrasyon testinizi yapın. Jev ile Claude'u system-one-adapter-python üzerinden aynı sorularla A/B testine sokun.

> **❓ Size sorumuz:** Bahsettiğiniz "jev", TypeSafe AI şirketinin Eylül 2026 ortasında çıkardığı **"Jev" (System One) tipli karar modeli** mi?
> - Evetse: Hangi amaçla düşünüyordunuz (haber filtresi mi, sinyal mi, başka bir şey mi)? Erken erişiminiz ya da API anahtarınız var mı? jev-trade gibi hazır bir botu mu kastediyordunuz?
> - Hayırsa: Adı tam olarak nasıl yazılıyor, nerede gördünüz (link veya ekran görüntüsü) ve ne yaptığını düşünüyorsunuz? Araştırmada bu ada başka bir trading aracı ya da modeli bulunamadı.

---

## 8. Uyarılar ve kırmızı bayraklar

- **Getiri vaat eden "AI trading bot" ürünleri:**
  - Satıcıların, YouTube kanallarının ve sitelerin getiri iddialarına asla güvenmeyin.
  - SEC'in 2026-09-30 tarihinde açtığı bildirilen sahte "AI bot" davaları (Cryptoaiml, TSAI) doğrulanamadı, ama ilke geçerli.
  - CloddsBot gibi token ve yüksek kaldıraç pazarlayan projeler dolandırıcılık riski taşıyor.
  - Üçüncü taraf bir bota API anahtarı vermeyin. Anahtarlar yalnızca işlem yetkili, para çekme kapalı ve IP whitelist'li olmalı.
- **Yıldız sayısı kanıt değildir:**
  - TradingAgents'ın 109,5k yıldızı var ama işlem kanıtı yok.
  - Qlib'in 49,1k yıldızı var ama fiilen bakım modunda.
  - Jev ekosistemindeki yıldız sayıları abartılı görünüyor.
  - QuantDinger: 12,4k yıldız, 653 commit, tek aktif geliştirici.
  - beebots birkaç günde 98 fork aldı ve deploy butonunda referral bağlantısı var.
- **Aşırı uyum ve ezber:**
  - NostalgiaForInfinity'nin "7 yılda 20 zarar → 0" commit'leri.
  - backtest-kit'in tek aylık +%67,85 getirisi, Sharpe 0,12 ile birlikte.
  - Kronos için yapılan "%93 daha iyi" iddiaları. Ayrıca Kronos'un veri sızıntısı düzeltmesi Nisan 2026'da geldi, yani önceki backtest'ler şişirilmiş olabilir.
  - FinText'teki 3'ün üzerindeki Sharpe'lar büyük olasılıkla maliyetsiz hesaplanmış.
  - RD-Agent'ın 2017–2020 test dönemi LLM eğitim verisinin içinde.
  - Her optimizasyonda deneme sayısını kaydedin ve DSR/PBO raporlayın.
- **LLM'e özgü riskler:**
  - Eğitim kesim tarihinden önceki veriyle yapılan backtest'te ezber etkisi.
  - Karar tutarsızlığı (flip rate).
  - Hafıza kaynaklı kayma (DXRG ρ = −0,200).
  - Araç dönüşleri ve haber metinleri üzerinden prompt injection.
  - Fail-open kapılar.
  - `refusal` yanıtlarının "onay" diye yanlış işlenmesi.
  - LLM'e verilen canlı emir aracının risk motorunu atlaması.
- **Kaldıraç ve martingale:** Passivbot, NOFX ve beebots bu yaklaşımları kullanıyor. DXRG'de volatiliteye kör 5x kaldıraç ağır likidasyonlara yol açtı. Spot'ta ve risk bazlı boyutlandırmada kalın.
- **Sürüm değişkenliği:**
  - alpaca-trade-api-js yaklaşık 3 ayda v3'ten v5'e çıktı.
  - `@binance/spot` v33 ve v34 bir gün arayla yayımlandı; bazı metotlar kullanımdan kaldırıldı.
  - `@anthropic-ai/sdk` neredeyse her gün yeni 0.x sürümü çıkarıyor.
  - Agent SDK v0.3.286'da varsayılan `permissionMode` değişti.
  - OpenBB V5 birçok sağlayıcıyı kaldırdı.
  - NautilusTrader v2 hâlâ RC aşamasında; PyBroker 2.0 major sürüm.
  - yahoo-finance2 v4 Node 22+ istiyor.
  - quantstats, skfolio ve vectorbt'de istatistik düzeltmeleri yayımlandı.
  - Hepsinin sürümünü sabitleyin ve test edin.
- **Lisanslar:**
  - GPL: freqtrade, Lumibot
  - AGPL: backtesting.py, FinceptTerminal
  - Apache 2.0 + Commons Clause: vectorbt, PyBroker. Değeri bunlara dayanan bir ürün satılamaz; iç kullanım serbest.
  - Ticari olmayan: TimesFM 3 ağırlıkları
  - **Çelişkili:** borsapy. Repo lisansı Apache-2.0, README ise kişisel ve ticari olmayan kullanım diyor; yazarla netleştirin.
  - Tescilli: Claude Agent SDK ("© Anthropic PBC. All rights reserved")
  - MIT: `@anthropic-ai/sdk`, CCXT, trading-signals, yahoo-finance2, EdgarTools, RD-Agent
  - Belirsiz: Chronos-2 ve Granite ağırlık lisansları (HF kartları açılamadı)
  - Lisanssız: alpaca-gatekeeper (kodu kullanılamaz)
- **Güvenlik hijyeni:**
  - AgenticTrading repoya yanlışlıkla eklenmiş bir API anahtarını sildi.
  - Borsa MCP'de bir SSRF açığı ve bellek sızıntısı düzeltildi.
  - RD-Agent'ın UI'ındaki kimlik doğrulamasız API ancak v1.0.0'da kapatıldı.
  - Üçüncü taraf MCP'leri kendiniz host edin ve sürümlerini sabitleyin.
- **Veri:**
  - Yahoo'nun resmi bir API'si yok, bozulabiliyor ve silinen hisseler hayatta kalma yanlılığı yaratıyor. Yahoo'nun kullanım koşulları geçerli.
  - SEC EDGAR'da adil erişim limitleri ve User-Agent kimlik kuralları var.
- **Regülasyon:**
  - SPK'nın kripto varlık hizmet sağlayıcı listesi, 7518 sayılı Kanun ve BIST algoritmik işlem kuralları bu araştırmada **doğrulanamadı**.
  - Borsa seçmeden önce spk.gov.tr'yi kontrol edin ve gerekirse hukuki görüş alın.
  - Botu başkalarına sunmayı düşünürseniz, Anthropic Kullanım Politikası'ndaki "yüksek riskli finans" gereklilikleri devreye girer: nitelikli profesyonel incelemesi ve AI kullanıldığının açıklanması.
- **Türkiye erişimi:**
  - Alpaca, IBKR, Binance global, OKX ve Bybit TR için uygunluk belirsiz.
  - Robinhood yalnızca ABD'de.
  - AlgoLab kapandı.
  - BtcTurk'ün güncel stop emir desteği ve güvenlik geçmişi doğrulanamadı; kendi incelemenizi yapın.
  - Bybit TR'nin TR testnet'i yok ve pybit eski host'u kullanıyor.
- **Paper sonuçları canlıyla aynı değil:**
  - Demo ve testnet verisi canlıdan farklı.
  - Kayma ve gece boşlukları paper'da olduğundan az görünür.
  - Paper'daki başarı canlıda da aynı sonucu garanti etmez.

---

## 9. Sonraki adımlar

1. **Kararlar ve erişim (hafta 0):**
   - Piyasayı seçin (kripto ya da ABD hisse).
   - spk.gov.tr listesini ve 7518 sayılı Kanun metnini kontrol edin.
   - Gerçek bir başvuruyla hangi hesapları açabildiğinizi test edin: Binance global veya TR, Bybit TR, BtcTurk, Alpaca, IBKR.
   - Kısıtsız bir makineden şunları doğrulayın:
     - docs.btcturk.com'da `stopLimit` / `stopMarket` emirleri ve alan adları
     - Bybit TR'nin ücretleri ve TRY çiftleri
     - Binance TR'nin emir tipleri
   - Moonshot'un Node sürümünü kontrol edin (≥ 22.12).
   - "jev" sorusuna (Bölüm 7) yanıt verin.
2. **Çevrimdışı doğrulama (hafta 1–2):**
   - Moonshot skor geçmişini dışa aktarın.
   - vectorbt ve PyBroker ile çıkış merdiveni ablasyonu yapın. Her parçayı ayrı ayrı açıp kapatın:
     - sabit yüzde stop ile 2×ATR stop
     - +1R başabaş
     - 2,5–3 ATR trail
     - +2R'de %50 kâr
     - 48 saat / +0,5R kuralı
   - Eşik ve günlük işlem tavanını gerçekçi maliyet ve kaymayla tarayın.
   - Walk-forward yapın. DSR ve PSR raporlayın; denenen kombinasyon sayısını kaydedin.
   - Jesse ile skoru rastgele girişlere karşı test edin.
3. **TypeScript çekirdeği (hafta 1–3, paralel):**
   - trading-signals ile ATR (TA-Lib ile parite testi).
   - PositionManager (TripleBarrier tarzı şema ve koşullu 48 saat kuralı).
   - Risk motoru: günlük tavan ve REDUCING modunda zarar freni.
   - Atomik "giriş + borsa tarafı stop" emri. Trail için amend ya da cancel/replace ile kademeli taşıma.
   - Kalıcı durum, heartbeat ve yeniden başlatmada uzlaştırma.
   - Kriz ve ralli dönemlerinin kayıtlarını yeniden oynatarak kill switch'i test edin (WAGMI Bench kalıbı).
4. **Claude katmanı (hafta 3–4):**
   - `@anthropic-ai/sdk` (sürüm sabit) ile `messages.parse` + `zodOutputFormat`.
   - Opus 5.5, `effort: 'low'`, cache'lenen sabit sistem promptu.
   - `refusal`, hata ve zaman aşımı durumlarında veto (fail-closed).
   - Günlük bütçe tavanı.
   - Her kararı, maliyetini (thinking token'ları dahil) ve karar değiştirme oranını loglayın.
   - Gece haber taraması için Batch API.
5. **Paper trading A/B (en az 4–8 hafta, tam otomatik):**
   - Ortam: Binance Demo Mode, Bybit global testnet ya da kendi simülatörünüz, veya Alpaca paper.
   - **Kol A:** yalnızca kurallar. **Kol B:** kurallar ve Claude vetosu.
   - Aynı zaman penceresi ve ortak ücret oranı.
   - P&L gerçek dolumlardan hesaplanmalı.
   - Karşılaştırma ölçütleri: al-tut, maliyet sonrası getiri ve DXRG'nin 17 kurallı kanonu (null kol, zamanlama şansı tabanı).
6. **Onay akışı ve hesap güvenliği:**
   - React istemcide limit üstü emirler için onay ekranı ve zaman aşımı.
   - API anahtarları yalnızca işlem yetkili, para çekme kapalı ve IP whitelist'li.
   - Ayrı bir alt hesap; yalnızca riske edilecek tutar yatırılır.
   - Seçilen TR borsasında borsa tarafı stop'u, en küçük tutarla canlı olarak test edin (tetiklenme, cancel/replace, yeniden başlatmada uzlaştırma).
7. **Karar kapısı ve küçük canlı pilot:**
   - Canlıya ancak şu koşullarda geçin: Kol B, maliyetler düşüldükten sonra hem Kol A'yı hem al-tut'u anlamlı biçimde geçmeli ve DSR/PSR makul olmalı.
   - En küçük tutarla başlayın, günlük zarar limitini sıkı tutun ve haftalık gözden geçirme yapın.
8. **İzleme listesi:**
   - [pedropereira4/news-sentiment-trading-signals](https://github.com/pedropereira4/news-sentiment-trading-signals): 2026-10-30'dan sonra sonuçlarına bakın; aynı yığını kullanıyor (Finnhub, Alpaca, Claude).
   - Bybit TR'nin bir TR testnet'i açıp açmadığı; BtcTurk'ün güncel API dokümanı.
   - Jev kullanılıyorsa A/B sonuçları.
   - Sabitlenmiş kütüphanelerin sürüm notları.

---

## 10. Kaynaklar

**Yürütme ve backtest framework'leri, risk araçları**
1. https://github.com/freqtrade/freqtrade
2. https://github.com/freqtrade/freqtrade/releases/tag/2026.9
3. https://github.com/nautechsystems/nautilus_trader
4. https://github.com/QuantConnect/Lean
5. https://github.com/QuantConnect/Lean/tree/master/Algorithm.Framework/Risk
6. https://github.com/Lumiwealth/lumibot
7. https://github.com/jesse-ai/jesse
8. https://github.com/hummingbot/hummingbot
9. https://github.com/hummingbot/hummingbot/blob/master/hummingbot/strategy_v2/executors/position_executor/data_types.py
10. https://github.com/kernc/backtesting.py
11. https://github.com/polakowo/vectorbt
12. https://pypi.org/pypi/vectorbt/json
13. https://github.com/edtechre/pybroker
14. https://pypi.org/pypi/lib-pybroker/json
15. https://github.com/AI4Finance-Foundation/FinRL-Trading
16. https://github.com/tripolskypetr/backtest-kit
17. https://github.com/bennycode/trading-signals
18. https://github.com/TA-Lib/ta-lib-python
19. https://github.com/ranaroussi/quantstats
20. https://github.com/skfolio/skfolio
21. https://github.com/microsoft/qlib (dışarıda bırakıldı)
22. https://github.com/microsoft/qlib/commits/main
23. https://pypi.org/pypi/pyqlib/json
24. https://github.com/iterativv/NostalgiaForInfinity (uyarı örneği)
25. https://github.com/enarjord/passivbot (dışarıda bırakıldı)

**LLM ajanları ve MCP sunucuları**

26. https://github.com/TauricResearch/TradingAgents
27. https://github.com/virattt/ai-hedge-fund
28. https://github.com/microsoft/RD-Agent
29. https://github.com/microsoft/RD-Agent/releases
30. https://raw.githubusercontent.com/microsoft/RD-Agent/main/docs/scens/quant_agent_fin.rst
31. https://pypi.org/pypi/rdagent/json
32. https://github.com/virattt/dexter
33. https://github.com/tradermonty/claude-trading-skills
34. https://github.com/OpenByteInc/QuantDinger
35. https://github.com/alpacahq/alpaca-mcp-server
36. https://github.com/okx/agent-trade-kit
37. https://github.com/Medeton/binance-agent-os
38. https://developers.binance.com/en/docs/agent-native/mcp-server (erişilemedi)
39. https://github.com/Open-Finance-Lab/AgenticTrading
40. https://github.com/matthewchung74/alpaca-gatekeeper (yalnızca kalıp)
41. https://github.com/NoFxAiOS/nofx (dışarıda bırakıldı)

**Broker, borsa ve veri**

42. https://github.com/ccxt/ccxt
43. https://github.com/ccxt/ccxt/tags
44. https://registry.npmjs.org/ccxt
45. https://github.com/ccxt/ccxt/blob/master/ts/src/btcturk.ts
46. https://raw.githubusercontent.com/ccxt/ccxt/master/ts/src/bybit.ts
47. https://raw.githubusercontent.com/ccxt/ccxt/master/ts/src/binancetr.ts (404, modül yok)
48. https://raw.githubusercontent.com/ccxt/ccxt/master/ts/src/paribu.ts (404, modül yok)
49. https://github.com/BTCTrader/broker-api-docs
50. https://github.com/BTCTrader/broker-api-docs/blob/master/README-pro.md
51. https://github.com/BTCTrader/broker-api-docs/commits/master
52. https://github.com/cloudQuant/bt_api_btcturk (dışarıda bırakıldı)
53. https://github.com/bybit-exchange/docs/blob/main/docs/v5/guide.mdx
54. https://github.com/bybit-exchange/docs/blob/main/docs/v5/order/create-order.mdx
55. https://github.com/bybit-exchange/docs/blob/main/docs/v5/smp.mdx
56. https://github.com/bybit-exchange/docs/blob/main/docs/v5/asset/withdraw/withdraw.mdx
57. https://raw.githubusercontent.com/bybit-exchange/pybit/master/pybit/_http_manager.py
58. https://github.com/sieblyio/bybit-api
59. https://github.com/binance/binance-connector-js
60. https://github.com/binance/binance-spot-api-docs
61. https://github.com/oliver-zehentleitner/unicorn-binance-rest-api
62. https://pypi.org/pypi/unicorn-binance-rest-api/json
63. https://github.com/oliver-zehentleitner/unicorn-binance-websocket-api
64. https://github.com/burakoner/Paribu.Api (pencere dışı)
65. https://github.com/alpacahq/alpaca-trade-api-js
66. https://github.com/alpacahq/alpaca-py
67. https://github.com/alpacahq/alpaca-skills
68. https://github.com/stoqey/ib
69. https://github.com/atillayurtseven/AlgoLab (AlgoLab'ın kapanış notu)
70. https://github.com/saidsurucu/borsa-mcp
71. https://github.com/saidsurucu/borsapy
72. https://github.com/gadicc/yahoo-finance2
73. https://github.com/gadicc/yahoo-finance2/issues/1025
74. https://github.com/gadicc/yahoo-finance2/commits/dev
75. https://registry.npmjs.org/yahoo-finance2
76. https://github.com/dgunning/edgartools
77. https://pypi.org/pypi/edgartools/json
78. https://github.com/massive-com/client-js
79. https://github.com/alphavantage/alpha_vantage_mcp

**Hugging Face ve modeller**

80. https://github.com/amazon-science/chronos-forecasting
81. https://github.com/ibm-granite/granite-tsfm
82. https://github.com/Alessiobrini/tsfm-rv
83. https://github.com/hariharan-brucewayne220/rv-tsfm-bench
84. https://github.com/google-research/timesfm
85. https://github.com/shiyu-coder/Kronos
86. https://github.com/SalesforceAIResearch/gift-eval
87. https://github.com/autogluon/fev

**Jev**

88. https://github.com/typesafe-ai
89. https://github.com/typesafe-ai/system-one-adapter-python
90. https://gist.github.com/drillan/6916b16e8ea31a8ec36c8f59d6483150
91. https://github.com/aowang-ai/jev-trade (gist'te listeleniyor; P&L görülmedi ⚠️)
92. https://github.com/Anil-matcha/awesome-jev-by-typesafe
93. https://github.com/razorback16/openjev
94. https://github.com/NandhaKishorM/laya
95. https://github.com/jarrodwatts/jev-trader
96. https://github.com/caiovicentino/eikos-arena
97. https://github.com/imikerussell/beebots

**Makaleler ve benchmark'lar**

98. https://github.com/ProjectDXAI/continuous-record-llm-trading-agents
99. https://github.com/chirindaopensource/from_financial_sentiment_classification_to_return_predictability
100. https://github.com/ckamelhar-collab/ai-trading-arena-data
101. https://github.com/Kantamaniprakash/trading-agents-lab
102. https://github.com/ThomasCaruso/OpenAlpha
103. https://github.com/imanly97/kronos-evaluation
104. https://github.com/pedropereira4/news-sentiment-trading-signals
105. https://github.com/David-Hedgefund/synthfin-trading-bench (pencere dışı)
106. https://github.com/Dominic789654/quantarena-clean (pencere dışı)

**Bloomberg, kurumsal ve Claude ekosistemi**

107. https://github.com/OpenBB-finance/OpenBB
108. https://github.com/OpenBB-finance/OpenBB/releases/tag/openbb-v5.0.0
109. https://github.com/Fincept-Corporation/FinceptTerminal
110. https://github.com/anthropics/financial-services
111. https://github.com/anthropics/anthropic-sdk-typescript
112. https://github.com/anthropics/anthropic-sdk-typescript/tags
113. https://registry.npmjs.org/@anthropic-ai/sdk
114. https://platform.claude.com/docs/en/about-claude/pricing.md
115. https://github.com/anthropics/claude-agent-sdk-typescript
116. https://www.anthropic.com/news/claude-opus-5-5
117. https://github.com/modelcontextprotocol/typescript-sdk
118. https://www.bloomberg.com/news/features/2026-08-02/ai-powered-trading-bots-help-retail-investors-take-on-hedge-funds (erişilemedi)
119. https://www.bloomberg.com/company/press/bloomberg-launches-enterprise-mcp-to-seamlessly-connect-bloomberg-data-with-clients-enterprise-ai-applications/ (erişilemedi)
120. https://www.bloomberg.com/news/articles/2026-09-29/exoduspoint-joins-hedge-funds-partnering-with-anthropic-over-ai (erişilemedi)

**Regülasyon ve uyarı**

121. https://spk.gov.tr/kurumlar/kripto-varlik-hizmet-saglayicilar/basvuru-surecleri (erişilemedi; kendiniz kontrol edin)
122. https://en.cryptonomist.ch/2026/09/30/sec-investment-fraud-charges/ (erişilemedi)

**Akademik arka plan** (bu oturumda yeniden doğrulanmadı)

123. https://doi.org/10.1111/0022-1082.00226 (Barber & Odean 2000)
124. https://doi.org/10.1016/j.finmar.2013.07.001 (Kaminski & Lo 2014)
125. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2407199 (Han, Zhou & Zhu)
126. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2460551 (Bailey & López de Prado, DSR)
127. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3175538 (Harvey vd., volatilite hedefleme)