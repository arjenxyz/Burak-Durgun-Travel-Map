# Kurulum Rehberi — Burak Durgun Seyahat Haritası

Bu rehber, projeyi sıfırdan canlıya almanız için gereken tüm adımları içerir.

**Hedef mimari:**

```
YouTube (@BurakDurgun)
        ↓  (RSS veya YouTube API)
   /api/sync  ← cron-job.org (periyodik)
        ↓
    Supabase (videos + video_locations)
        ↓
   Next.js / Vercel  →  3D harita (globe.gl)
```

---

## İçindekiler

1. [Gereksinimler](#1-gereksinimler)
2. [Projeyi indirme](#2-projeyi-indirme)
3. [Supabase kurulumu](#3-supabase-kurulumu)
4. [YouTube API anahtarı (önerilir)](#4-youtube-api-anahtarı-önerilir)
5. [Ortam değişkenleri (.env.local)](#5-ortam-değişkenleri-envlocal)
6. [Yerel geliştirme](#6-yerel-geliştirme)
7. [İlk veri senkronizasyonu](#7-ilk-veri-senkronizasyonu)
8. [Vercel deploy](#8-vercel-deploy)
9. [cron-job.org ile otomatik güncelleme](#9-cron-joborg-ile-otomatik-güncelleme)
10. [Doğrulama ve test](#10-doğrulama-ve-test)
11. [Sorun giderme](#11-sorun-giderme)
12. [Sık sorulan sorular](#12-sık-sorulan-sorular)

---

## 1. Gereksinimler

| Araç | Minimum sürüm | Nereden |
|------|---------------|---------|
| Node.js | 18+ (20 önerilir) | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Node ile birlikte gelir |
| Git | herhangi | [git-scm.com](https://git-scm.com) |
| Supabase hesabı | ücretsiz plan yeterli | [supabase.com](https://supabase.com) |
| Vercel hesabı | ücretsiz plan yeterli | [vercel.com](https://vercel.com) |
| cron-job.org hesabı | ücretsiz plan yeterli | [cron-job.org](https://cron-job.org) |
| Google Cloud hesabı | YouTube API için | [console.cloud.google.com](https://console.cloud.google.com) |

**Opsiyonel ama şiddetle önerilir:** YouTube Data API v3 anahtarı — olmadan yalnızca son **15 video** senkronize edilir.

---

## 2. Projeyi indirme

```bash
git clone https://github.com/arjenxyz/Burak-Durgun-Travel-Map.git
cd Burak-Durgun-Travel-Map
npm install
```

Windows PowerShell kullanıyorsanız:

```powershell
git clone https://github.com/arjenxyz/Burak-Durgun-Travel-Map.git
cd Burak-Durgun-Travel-Map
npm install
```

Kurulum birkaç dakika sürebilir (~400 paket).

---

## 3. Supabase kurulumu

### 3.1 Yeni proje oluşturma

1. [supabase.com/dashboard](https://supabase.com/dashboard) adresine gidin
2. **New Project** tıklayın
3. Proje adı: `burak-travel-map` (veya istediğiniz bir ad)
4. Güçlü bir veritabanı şifresi belirleyin — **kaydedin**
5. Region: size en yakın bölge (ör. `Frankfurt` / `eu-central-1`)
6. **Create new project** — proje hazır olana kadar 1–2 dk bekleyin

### 3.2 Veritabanı şemasını yükleme

1. Sol menüden **SQL Editor** → **New query**
2. Bu repodaki `supabase/migrations/001_initial.sql` dosyasının **tüm içeriğini** kopyalayın
3. SQL editöre yapıştırın
4. **Run** (veya `Ctrl+Enter`)

Başarılı olursa şu tablolar oluşur:

| Tablo | Amaç |
|-------|------|
| `videos` | YouTube videoları (başlık, açıklama, tarih) |
| `video_locations` | Videolardan çıkarılan ülke/şehir + koordinat |
| `sync_runs` | Cron/sync çalışma logları |

Ayrıca harita için 3 view oluşur: `map_countries`, `map_cities`, `map_stats`.

### 3.3 API anahtarlarını alma

1. Sol menü → **Project Settings** (dişli ikon) → **API**
2. Şu değerleri not edin:

| Supabase alanı | `.env.local` karşılığı |
|----------------|------------------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role | `SUPABASE_SERVICE_ROLE_KEY` |

> **Güvenlik:** `service_role` anahtarını asla tarayıcıda veya istemci kodunda kullanmayın. Sadece sunucu tarafında (`/api/sync`, `/api/map`) kullanılır. GitHub'a commit etmeyin.

### 3.4 Tabloları kontrol etme (opsiyonel)

**Table Editor** → `videos`, `video_locations`, `sync_runs` tablolarının göründüğünü doğrulayın. İlk sync'ten önce boş olmaları normal.

---

## 4. YouTube API anahtarı (önerilir)

RSS feed API key olmadan çalışır ama **yalnızca son 15 videoyu** verir. Burak Durgun'un tüm gezdiği ülkeleri göstermek için YouTube Data API v3 anahtarı gerekir.

### 4.1 Google Cloud projesi

1. [console.cloud.google.com](https://console.cloud.google.com) → giriş yapın
2. Üstten **Select a project** → **New Project**
3. Proje adı: `burak-travel-map` → **Create**

### 4.2 YouTube Data API v3'ü etkinleştirme

1. Sol menü → **APIs & Services** → **Library**
2. Arama: `YouTube Data API v3`
3. **Enable** tıklayın

### 4.3 API anahtarı oluşturma

1. **APIs & Services** → **Credentials**
2. **Create Credentials** → **API key**
3. Oluşan anahtarı kopyalayın → `.env.local` içinde `YOUTUBE_API_KEY=` olarak kaydedin

### 4.4 Anahtarı kısıtlama (önerilir)

1. Oluşturduğunuz API key'e tıklayın
2. **Application restrictions** → **HTTP referrers** veya **IP addresses** (Vercel için IP kısıtlaması zor olabilir; production'da referrer kısıtlaması düşünün)
3. **API restrictions** → **Restrict key** → yalnızca **YouTube Data API v3** seçin
4. **Save**

### 4.5 Kota bilgisi

YouTube Data API günlük **10.000 birim** ücretsiz kota verir. Bu proje için tipik kullanım:

- Kanal bilgisi: 1 birim
- Playlist sayfası (50 video): 1 birim / sayfa

~500 videolu bir kanal için ilk full sync yaklaşık **10–15 birim** harcar. Günde birkaç cron çalışması kotayı aşmaz.

### 4.6 API key olmadan devam

API key eklemezseniz proje yine çalışır; sadece RSS üzerinden son 15 video işlenir. Test için yeterli, production için yetersiz.

---

## 5. Ortam değişkenleri (.env.local)

Proje kök dizininde:

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

`.env.local` dosyasını düzenleyin:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# YouTube
YOUTUBE_API_KEY=AIzaSy...                    # Tüm geçmiş için gerekli
YOUTUBE_CHANNEL_ID=UCfIOM2FhhCPc8ap9T_NoMjQ  # Burak Durgun — değiştirmeyin
YOUTUBE_CHANNEL_HANDLE=BurakDurgun

# Cron güvenliği — uzun rastgele string
CRON_SECRET=buraya-en-az-32-karakter-rastgele-bir-sifre-yazin
```

### CRON_SECRET üretme

PowerShell:

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```

veya [1password.com/password-generator](https://1password.com/password-generator) gibi bir araçla 32+ karakter üretin.

### Değişken özeti

| Değişken | Zorunlu | Nerede kullanılır |
|----------|---------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Evet | Frontend + API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Evet | Frontend (read-only) |
| `SUPABASE_SERVICE_ROLE_KEY` | Evet | Sync + map API (yazma) |
| `YOUTUBE_CHANNEL_ID` | Evet | Video çekme |
| `YOUTUBE_API_KEY` | Hayır* | Tüm video geçmişi |
| `CRON_SECRET` | Evet (prod) | `/api/sync` koruması |
| `YOUTUBE_CHANNEL_HANDLE` | Hayır | Referans amaçlı |

\*Production için pratikte zorunlu.

---

## 6. Yerel geliştirme

```bash
npm run dev
```

Tarayıcıda açın: [http://localhost:3000](http://localhost:3000)

İlk açılışta harita boş görünür — henüz sync yapılmadıysa bu normaldir.

---

## 7. İlk veri senkronizasyonu

### 7.1 Komut satırından sync

`.env.local` hazır olduktan sonra:

```bash
npm run sync
```

Başarılı çıktı örneği:

```
Sync complete: {
  videosFetched: 342,
  videosNew: 342,
  locationsAdded: 580,
  source: 'api'
}
```

- `source: 'api'` → YouTube API kullanıldı (tüm geçmiş)
- `source: 'rss'` → RSS kullanıldı (son 15 video)

### 7.2 Sync ne yapar?

1. YouTube'dan video listesini çeker
2. Her video için başlık + açıklamadan ülke/şehir parse eder
3. Koordinatları hesaplar (preset + OpenStreetMap Nominatim)
4. Supabase'e yazar
5. `sync_runs` tablosuna log bırakır

### 7.3 Supabase'de kontrol

**Table Editor** → `videos` — videolar dolu mu?
**Table Editor** → `video_locations` — ülke/şehir kayıtları var mı?

Sonra `npm run dev` ile haritayı yenileyin; pin'ler görünmelidir.

### 7.4 Sync süresi

- RSS (15 video): ~10 saniye
- API (300+ video): 2–5 dakika (geocoding rate limit nedeniyle)

---

## 8. Vercel deploy

### 8.1 GitHub bağlantısı

Repo zaten GitHub'da: [github.com/arjenxyz/Burak-Durgun-Travel-Map](https://github.com/arjenxyz/Burak-Durgun-Travel-Map)

### 8.2 Vercel'de proje oluşturma

1. [vercel.com/new](https://vercel.com/new) → GitHub ile giriş
2. **Import** → `Burak-Durgun-Travel-Map` reposunu seçin
3. Framework Preset: **Next.js** (otomatik algılanır)
4. **Environment Variables** bölümüne `.env.local` içindeki **tüm** değişkenleri ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
YOUTUBE_API_KEY
YOUTUBE_CHANNEL_ID
YOUTUBE_CHANNEL_HANDLE
CRON_SECRET
```

5. **Deploy** — 1–3 dakika sürer

### 8.3 İlk production sync

Deploy bittikten sonra tarayıcıdan veya terminalden bir kez manuel sync tetikleyin:

```
https://burak-durgun.vercel.app/api/sync?secret=CRON_SECRET_DEGERINIZ
```

Başarılı yanıt:

```json
{
  "ok": true,
  "videosFetched": 342,
  "videosNew": 0,
  "locationsAdded": 0,
  "source": "api"
}
```

Yerel sync zaten yaptıysanız `videosNew: 0` normaldir.

### 8.4 Vercel ayarları (opsiyonel)

**Settings → Functions:**
- `/api/sync` route'u `maxDuration = 300` (5 dk) olarak ayarlı — uzun sync'ler için yeterli

**Settings → Domains:**
- Özel domain ekleyebilirsiniz (ör. `harita.burakdurgun.com`)

---

## 9. cron-job.org ile otomatik güncelleme

Burak yeni video attığında haritanın otomatik güncellenmesi için periyodik sync gerekir.

### 9.1 Hesap oluşturma

1. [cron-job.org/en/signup](https://cron-job.org/en/signup) — ücretsiz kayıt
2. E-posta doğrulaması

### 9.2 Cron job oluşturma

1. Dashboard → **Create cronjob**
2. Ayarlar:

| Alan | Değer |
|------|-------|
| **Title** | Burak Travel Map Sync |
| **URL** | `https://burak-durgun.vercel.app/api/sync?secret=CRON_SECRET` |
| **Schedule** | Every 6 hours (günde 4 kez) veya Every 3 hours |
| **Request method** | GET |
| **Enabled** | ✓ |

### 9.3 Alternatif: Authorization header

URL'de secret göstermek istemezseniz:

- **URL:** `https://burak-durgun.vercel.app/api/sync`
- **Advanced** → **Headers:**
  - Key: `Authorization`
  - Value: `Bearer CRON_SECRET_DEGERINIZ`

veya:

- Key: `x-cron-secret`
- Value: `CRON_SECRET_DEGERINIZ`

### 9.4 Cron vs full sync

| Yöntem | Ne zaman | Ne çeker |
|--------|----------|----------|
| **cron-job.org** → `/api/sync` | Otomatik, periyodik | RSS — son **15 video** (hızlı, Vercel-safe) |
| **`npm run sync`** | İlk kurulum, yerel | YouTube API — **tüm geçmiş** (API key gerekir) |

Yeni video cron ile bir sonraki çalışmada haritaya düşer. İlk kurulumda mutlaka yerelde `npm run sync` çalıştırın.

### 9.5 Önerilen zamanlama

| Sıklık | cron-job.org ifadesi | Ne zaman kullanılır |
|--------|----------------------|---------------------|
| Günde 4 kez | `0 */6 * * *` | Dengeli (önerilen) |
| Günde 2 kez | `0 */12 * * *` | Düşük trafik |
| Saatte 1 kez | `0 * * * *` | Çok hızlı güncelleme |

YouTube'da haftada birkaç video atılıyorsa günde 4 kez fazlasıyla yeterli.

### 9.6 Cron loglarını izleme

- cron-job.org dashboard → job'a tıkla → **History**
- HTTP 200 + `{"ok":true,...}` = başarılı
- HTTP 401 = `CRON_SECRET` yanlış
- HTTP 500 = Supabase veya YouTube hatası (Vercel Function Logs'a bakın)

---

## 10. Doğrulama ve test

### Kontrol listesi

- [ ] `http://localhost:3000` — 3D küre yükleniyor
- [ ] Üst sağda ülke / şehir / video sayıları görünüyor
- [ ] Turuncu pin'ler = ülkeler, mavi pin'ler = şehirler
- [ ] Pin'e tıklayınca ülke paneli açılıyor
- [ ] `GET /api/map` JSON döndürüyor
- [ ] Supabase `videos` tablosu dolu
- [ ] Supabase `video_locations` tablosu dolu
- [ ] Vercel production URL çalışıyor
- [ ] cron-job.org son çalışma yeşil (200 OK)

### API test URL'leri

```bash
# Harita verisi
curl https://burak-durgun.vercel.app/api/map

# Manuel sync (secret gerekli)
curl "https://burak-durgun.vercel.app/api/sync?secret=CRON_SECRET"
```

---

## 11. Sorun giderme

### Harita boş / "Harita verisi yüklenemedi"

**Olası nedenler:**
- Supabase env değişkenleri yanlış veya eksik
- Migration SQL çalıştırılmamış
- Henüz sync yapılmamış

**Çözüm:**
1. `.env.local` değerlerini kontrol edin
2. `npm run sync` çalıştırın
3. Supabase Table Editor'de veri var mı bakın

### Sync: `Missing NEXT_PUBLIC_SUPABASE_URL`

`.env.local` dosyası proje kökünde mi? Değişken adları doğru mu?

Yerel sync için:

```bash
npm run sync
```

(`tsx --env-file=.env.local` otomatik yüklenir)

### Sync: `YouTube channels.list failed: 403`

- YouTube Data API v3 etkin mi?
- API key doğru mu?
- API key kısıtlaması Vercel IP'sini engelliyor olabilir — kısıtlamayı geçici kaldırıp test edin

### Sync: `RSS fetch failed`

Geçici ağ sorunu veya YouTube erişim engeli. Birkaç dakika sonra tekrar deneyin.

### cron-job.org 401 Unauthorized

- Vercel'deki `CRON_SECRET` ile cron URL'deki `secret=` parametresi **birebir aynı** olmalı
- Boşluk veya URL encoding sorunu olabilir — header yöntemini deneyin

### cron-job.org 500 Internal Server Error

**1. Tanı endpoint'ini açın:**

```
https://burak-durgun.vercel.app/api/health
```

Hangi kontrol kırmızıysa onu düzeltin.

**2. En sık nedenler:**

| Neden | Çözüm |
|-------|--------|
| Supabase migration çalıştırılmamış | SQL Editor'de `001_initial.sql` çalıştır |
| `SUPABASE_SERVICE_ROLE_KEY` yanlış | **service_role** key kullanın, anon key değil |
| Supabase env Vercel'de eksik | Tüm env'leri ekleyip **Redeploy** |
| Eski kod: cron tüm kanalı API ile çekiyordu | Repoyu güncelleyin — cron artık sadece RSS (15 video) kullanır |

**3. Sync hata detayı:**

```
https://burak-durgun.vercel.app/api/sync?secret=CRON_SECRET
```

Yanıtta `"error"` ve `"hint"` alanlarına bakın.

**4. İlk full sync yerelde yapın:**

Vercel cron hızlı güncelleme içindir. Tüm geçmiş için:

```bash
npm run sync
```

(`npm run sync` = full mode, YouTube API ile tüm videolar)

### Vercel'de sync timeout

300+ video ilk sync uzun sürebilir. Yerelde `npm run sync` ile önce doldurun; cron sadece yeni videoları işler (çok daha hızlı).

### Bazı ülkeler haritada yok

Parser hashtag ve bilinen isimlerden çalışır. Eksik ülke/şehir için `src/lib/locations/location-aliases.ts` dosyasına alias ekleyin, sonra sync'i tekrar çalıştırın.

### Windows: `npm run dev` yavaş

İlk build normalde yavaştır. `--turbopack` zaten etkin.

---

## 12. Sık sorulan sorular

**S: API key olmadan canlıya alabilir miyim?**
Evet, ama sadece son 15 video görünür. Production için API key şart.

**S: Başka bir YouTuber için kullanabilir miyim?**
Evet. `YOUTUBE_CHANNEL_ID` değiştirin ve `location-aliases.ts` içindeki ülke/şehir sözlüğünü o kanalın başlık stiline göre genişletin.

**S: Yeni video ne kadar sürede haritaya düşer?**
Cron sıklığına bağlı. 6 saatlik cron ile en geç 6 saat; saatlik cron ile en geç 1 saat.

**S: Supabase ücretsiz plan yeterli mi?**
Evet. Birkaç yüz video + birkaç bin konum kaydı free tier için çok küçük.

**S: Vercel ücretsiz plan yeterli mi?**
Evet. Bu proje düşük trafikli bir harita uygulaması; hobby plan yeterli.

---

## Hızlı başlangıç özeti

```bash
# 1. Clone + install
git clone https://github.com/arjenxyz/Burak-Durgun-Travel-Map.git
cd Burak-Durgun-Travel-Map
npm install

# 2. Env dosyası
cp .env.example .env.local
# → Supabase + YouTube + CRON_SECRET doldur

# 3. Supabase SQL Editor'de 001_initial.sql çalıştır

# 4. İlk sync + dev
npm run sync
npm run dev

# 5. Vercel'e deploy + env ekle

# 6. cron-job.org → /api/sync?secret=... (6 saatte bir)
```

---

## Destek ve geliştirme

- **Kanal:** [@BurakDurgun](https://www.youtube.com/@BurakDurgun)
- **Channel ID:** `UCfIOM2FhhCPc8ap9T_NoMjQ`
- **Repo:** [github.com/arjenxyz/Burak-Durgun-Travel-Map](https://github.com/arjenxyz/Burak-Durgun-Travel-Map)

Yeni ülke/şehir alias eklemek için: `src/lib/locations/location-aliases.ts`
