# Strateji 4 botu

Bağımsız, küçük bir bot. Moonshot'a veya başka bir pakete ihtiyacı yok, bilgisayarınızda yalnızca **Node.js** olması yeterli.

**Ne yapar:** Günde bir kez, günlük kapanıştan sonra (Türkiye saatiyle 03:00'te), 10 coin'in sinyallerini hesaplar ve portföyü hedef ağırlıklara göre ayarlar:
- Coinler: BTC, ETH, SOL, BNB, XRP, TRX, DOGE, ZEC, ADA, BCH.
- Her coin'e paranın onda biri ayrılır.
- Her coin'i 9 "bekçi" izler. Bekçiler 5 ile 360 gün arasındaki farklı sürelere bakarak "yeni zirve yaptı mı, yeni dip yaptı mı?" diye kontrol eder.
- Kaç bekçi "al" diyorsa, o coin'e ayrılan payın o kadarı coin'de tutulur. Gerisi USDT olarak nakitte bekler.

**Varsayılan mod sanal hesaptır:** Fiyatlar Binance'in gerçek fiyatlarıdır, ama işlemler sahte parayla yapılır. API anahtarı gerekmez.

## Klasördeki dosyalar

| Dosya | Görevi |
|---|---|
| `bot.ts` | Botun kendisi |
| `lib/daily-strategy.ts` | Strateji: sinyaller ve hedef ağırlıklar |
| `lib/portfolio.ts` | Donchian bekçileri |
| `lib/binance.ts` | Binance bağlantısı |
| `baslat.command` | Mac'te çift tıklayarak başlatma |

## Kurulum (Mac)

1. **Node.js'i kurun.** https://nodejs.org adresinden **LTS** sürümünü (22 veya üstü) indirip kurun.
   Kontrol etmek için Terminal'i açın (⌘ + boşluk, "Terminal" yazın) ve `node -v` yazın. `v22` veya daha yüksek bir sürüm görmelisiniz.
2. **Klasörü yerleştirin.** Bu klasörü örneğin **Belgeler**'e koyun: `~/Documents/strateji4-bot`
3. **Durumu görün.** Terminal'de şunları çalıştırın. Bu adım işlem yapmaz, sadece tabloyu gösterir:
   ```bash
   cd ~/Documents/strateji4-bot
   npx --yes tsx bot.ts --status
   ```
   İlk çalıştırmada küçük bir araç (tsx) indirilir. 10–20 saniye sürebilir.
4. **Botu başlatın.**
   ```bash
   caffeinate -i npx --yes tsx bot.ts
   ```
   Ya da `baslat.command` dosyasına çift tıklayın. Mac uyarı verirse dosyaya sağ tıklayın → **Aç** → **Aç**.
   - Terminal penceresi açık kaldığı sürece bot çalışır. `caffeinate`, Mac'in uyku moduna geçmesini engeller.
   - Bot her 30 dakikada bir kontrol eder ama işlemi yalnızca günde bir kez yapar.

## Takip

Her çalışmada ekranda şunlar görünür:
- Özsermaye.
- **Başlangıçtan bu yana botun getirisi ve aynı parayla BTC alıp tutsaydınız ne olurdu.**
- Coin başına sinyal (kaç bekçinin "al" dediği), hedef ağırlık ve şu anki ağırlık.

Kayıtlar `.crypto-bot/daily-paper.json` dosyasına yazılır. Gizli klasörleri Finder'da görmek için ⌘ + Shift + . tuşlarına basın.

- **Durdurmak:** Ctrl + C.
- **Yeniden başlatmak:** Aynı komutu tekrar çalıştırın. Bot kaldığı yerden devam eder, aynı gün için ikinci kez işlem yapmaz.
- **Sanal hesabı sıfırlamak:** `.crypto-bot/daily-paper.json` dosyasını silin.

## Gerçek para (önce 2–3 ay sanal hesapta izleyin)

1. Binance'te bot için **ayrı bir alt hesap** açın. Bot, hesaptaki bu 10 coin'i kendi portföyü sayar; ana hesabınızda çalıştırırsanız kendi coin'lerinizi alıp satabilir.
2. Alt hesapta bir API anahtarı oluşturun:
   - Okuma ve spot işlem izni **açık**.
   - Para çekme izni **kapalı**.
   - IP kısıtlaması **açık**.
3. Botu şöyle başlatın. Anahtarları hiçbir yere kaydetmeyin, sadece komutta yazın:
   ```bash
   CRYPTO_BOT_MODE=live CRYPTO_BOT_LIVE_CONFIRM=yes CRYPTO_BOT_MAX_USDT=200 \
   BINANCE_API_KEY=xxx BINANCE_API_SECRET=yyy caffeinate -i npx --yes tsx bot.ts
   ```
   `CRYPTO_BOT_MAX_USDT`, botun yöneteceği en fazla tutardır ve gerçek parada zorunludur.

## Sorun giderme

| Mesaj | Çözüm |
|---|---|
| `command not found: npx` | Node.js kurulu değil. 1. adıma dönün. |
| `Eksik veri — güvenlik için işlem yapılmadı` | İnternet ya da Binance bağlantısı kesik. Bot 30 dakika sonra tekrar dener. |
| `451` / `restricted location` | Binance bulunduğunuz bağlantıdan veri vermiyor. Ağ veya VPN ayarlarınızı kontrol edin. |

## Uyarı

- Geçmiş performans geleceği garanti etmez.
- Testlerde bu strateji BTC'yi alıp tutmaktan daha az düşüş yaşadı. Ancak BTC'yi geride bırakması, büyük yükselişler yakalamasına bağlıydı.
